"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  ArrowDownIcon,
  ArrowUpIcon,
  DangerTriangleIcon,
  DownloadMinimalisticIcon,
  InfoCircleIcon,
  PhoneCallingRoundedIcon,
} from "@solar-icons/react/linear";
import { Alert, AlertDescription, AlertTitle } from "@omnirelief/ui/components/alert";
import { Card, CardContent, CardHeader } from "@omnirelief/ui/components/card";
import { Badge } from "@omnirelief/ui/components/badge";
import { Button, buttonVariants } from "@omnirelief/ui/components/button";
import { Checkbox } from "@omnirelief/ui/components/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@omnirelief/ui/components/dialog";
import { Label } from "@omnirelief/ui/components/label";
import { Skeleton } from "@omnirelief/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@omnirelief/ui/components/table";
import { Textarea } from "@omnirelief/ui/components/textarea";
import { cn } from "@omnirelief/ui/lib/utils";
import { baris } from "@/lib/supabase/baris";
import { BantuanIstilah } from "@/components/bantuan-istilah";
import { PetaAlur, PetaAlurRingkasan } from "@/components/peta-alur";
import { BilahHalaman, BilahMassal, BilahSaring, TombolUrut } from "@/components/kontrol-tabel";
import { BarisSegarkan } from "@/components/kepala-halaman";

import { KotakKosong, StripKpi } from "@/components/widget-laporan";
type StatusMuat = "memuat" | "siap" | "gagal";

type Antrean = {
  id: number;
  bayi: number;
  balita: number;
  ibu_hamil: number;
  lansia: number;
  disabilitas: number;
  umum: number;
  dibuat_pada: string;
  posko: { nama: string } | null;
};

type Prioritas = {
  posko_id: number;
  posko_nama: string;
  wilayah: string;
  butuh: number;
  dikirim: number;
  diterima: number;
  selisih: number;
};

type Pantau = {
  id: number;
  kode: string;
  posko_nama: string;
  batas_checkin: string;
  log_terakhir: string | null;
  ditandai: boolean;
};
type PutusanTarget = {
  id: number;
  nama: string;
  keputusan: "MINTA_REVISI" | "DITOLAK";
};

type BatalTarget = { id: number; kode: string; posko_nama: string };

type KunciSortir = "umur" | "total";

function galatDari(data: unknown, bawaan: string): string {
  if (typeof data === "object" && data !== null && "galat" in data) {
    return String(data.galat);
  }
  return bawaan;
}

function totalJiwa(a: Antrean): number {
  return a.bayi + a.balita + a.ibu_hamil + a.lansia + a.disabilitas + a.umum;
}

function umurDari(iso: string): string {
  const beda = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(beda)) return "-";
  const menit = Math.max(0, Math.floor(beda / 60000));
  if (menit < 1) return "baru saja";
  if (menit < 60) return `${menit} mnt lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  return `${Math.floor(jam / 24)} hari lalu`;
}

function selCsv(nilai: string | number): string {
  return `"${String(nilai).replace(/"/g, '""')}"`;
}

function KartuMuat() {
  return (
    <Card aria-hidden="true">
      <CardHeader>
        <Skeleton className="h-5 w-2/3" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-12 w-full" />
      </CardContent>
    </Card>
  );
}

function BarisMuatTabel({ kolom }: { kolom: number }) {
  return (
    <TableRow aria-hidden="true">
      {Array.from({ length: kolom }, (_, i) => (
        <TableCell key={i}>
          <Skeleton className="h-5 w-full" />
        </TableCell>
      ))}
    </TableRow>
  );
}

export default function DasborBpbd() {
  const [status, setStatus] = useState<StatusMuat>("memuat");
  const [antrean, setAntrean] = useState<Antrean[]>([]);
  const [prioritas, setPrioritas] = useState<Prioritas[]>([]);
  const [pantau, setPantau] = useState<Pantau[]>([]);
  const [diperbarui, setDiperbarui] = useState<string | null>(null);
  const [kunciSortir, setKunciSortir] = useState<KunciSortir>("umur");
  const [arahSortir, setArahSortir] = useState<"naik" | "turun">("naik");
  const [terpilih, setTerpilih] = useState<number[]>([]);
  const [sibukMassal, setSibukMassal] = useState(false);
  const [putusan, setPutusan] = useState<PutusanTarget | null>(null);
  const [alasanPutusan, setAlasanPutusan] = useState("");
  const [galatPutusan, setGalatPutusan] = useState<string | null>(null);
  const [sibukPutusan, setSibukPutusan] = useState(false);
  const [batal, setBatal] = useState<BatalTarget | null>(null);
  const [alasanBatal, setAlasanBatal] = useState("");
  const [galatBatal, setGalatBatal] = useState<string | null>(null);
  const [sibukBatal, setSibukBatal] = useState(false);
  const [cari, setCari] = useState("");
  const [filterButuh, setFilterButuh] = useState<"semua" | "kurang" | "aman">("semua");
  const [kunciPrioritas, setKunciPrioritas] = useState<"posko" | "wilayah" | "butuh" | "dikirim" | "diterima" | "selisih">("selisih");
  const [arahPrioritas, setArahPrioritas] = useState<"naik" | "turun">("turun");
  const [halaman, setHalaman] = useState(1);
  const [perHalaman, setPerHalaman] = useState<5 | 10 | 20>(5);

  const muat = useCallback(async () => {
    setStatus("memuat");
    try {
      const [ra, rp, rw] = await Promise.all([
        fetch("/api/bpbd/antrean").then((r) => r.json()),
        fetch("/api/bpbd/prioritas").then((r) => r.json()),
        fetch("/api/bpbd/pantauan").then((r) => r.json()),
      ]);
      const da: unknown = ra;
      const dp: unknown = rp;
      const dw: unknown = rw;
      const okA = typeof da === "object" && da !== null && "ok" in da && da.ok === true;
      const okP = typeof dp === "object" && dp !== null && "ok" in dp && dp.ok === true;
      const okW = typeof dw === "object" && dw !== null && "ok" in dw && dw.ok === true;
      setAntrean(okA && "antrean" in da ? baris<Antrean>(da.antrean) : []);
      setPrioritas(okP && "prioritas" in dp ? baris<Prioritas>(dp.prioritas) : []);
      setPantau(okW && "perlu_dicek" in dw ? baris<Pantau>(dw.perlu_dicek) : []);
      const semuaOk = okA && okP && okW;
      setStatus(semuaOk ? "siap" : "gagal");
      if (semuaOk) {
        setDiperbarui(
          new Date().toLocaleTimeString("id-ID", { hour: "2-digit", minute: "2-digit" }),
        );
      }
    } catch {
      setStatus("gagal");
    }
  }, []);

  useEffect(() => {
    void muat();
  }, [muat]);

  async function kirimPutusan(snapshot_id: number, keputusan: string, alasan?: string) {
    const res = await fetch("/api/bpbd/verifikasi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ snapshot_id, keputusan, catatan: alasan ?? "" }),
    });
    const data: unknown = await res.json();
    if (typeof data === "object" && data !== null && "ok" in data && data.ok === true) return;
    throw new Error(galatDari(data, "Keputusan gagal disimpan."));
  }

  async function setujui(snapshot_id: number) {
    try {
      await kirimPutusan(snapshot_id, "DISETUJUI");
      toast.success("Snapshot disetujui.");
      await muat();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Keputusan gagal.");
    }
  }

  async function setujuiTerpilih() {
    if (terpilih.length === 0 || sibukMassal) return;
    setSibukMassal(true);
    let lolos = 0;
    let gagal = 0;
    for (const id of terpilih) {
      try {
        await kirimPutusan(id, "DISETUJUI");
        lolos += 1;
      } catch {
        gagal += 1;
      }
    }
    setTerpilih([]);
    setSibukMassal(false);
    if (gagal === 0) {
      toast.success(`${lolos} snapshot disetujui.`);
    } else {
      toast.error(`${lolos} disetujui, ${gagal} gagal. Ulangi untuk yang gagal.`);
    }
    await muat();
  }

  function alihSortir(kunci: KunciSortir) {
    if (kunci === kunciSortir) {
      setArahSortir((arah) => (arah === "naik" ? "turun" : "naik"));
    } else {
      setKunciSortir(kunci);
      setArahSortir(kunci === "umur" ? "naik" : "turun");
    }
  }

  function alihPilih(id: number, pilih: boolean) {
    setTerpilih((sebelum) =>
      pilih ? (sebelum.includes(id) ? sebelum : [...sebelum, id]) : sebelum.filter((x) => x !== id),
    );
  }

  function alihPilihSemua(pilih: boolean) {
    setTerpilih(pilih ? antreanUrut.map((a) => a.id) : []);
  }

  function bukaPutusan(target: PutusanTarget) {
    setPutusan(target);
    setAlasanPutusan("");
    setGalatPutusan(null);
  }

  async function konfirmasiPutusan() {
    if (!putusan) return;
    if (alasanPutusan.trim().length < 5) {
      setGalatPutusan("Alasan wajib diisi (minimal 5 huruf) untuk revisi atau penolakan.");
      return;
    }
    setSibukPutusan(true);
    try {
      await kirimPutusan(putusan.id, putusan.keputusan, alasanPutusan.trim());
      toast.success(
        putusan.keputusan === "MINTA_REVISI" ? "Revisi diminta." : "Snapshot ditolak.",
      );
      setPutusan(null);
      await muat();
    } catch (e) {
      setGalatPutusan(e instanceof Error ? e.message : "Keputusan gagal.");
    } finally {
      setSibukPutusan(false);
    }
  }

  function bukaBatal(target: BatalTarget) {
    setBatal(target);
    setAlasanBatal("");
    setGalatBatal(null);
  }

  async function konfirmasiBatal() {
    if (!batal) return;
    if (alasanBatal.trim().length < 5) {
      setGalatBatal("Alasan pembatalan wajib diisi (minimal 5 huruf).");
      return;
    }
    setSibukBatal(true);
    try {
      const res = await fetch("/api/bpbd/pembatalan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manifest_id: batal.id, alasan: alasanBatal.trim() }),
      });
      const data: unknown = await res.json();
      if (typeof data !== "object" || data === null || !("ok" in data) || data.ok !== true) {
        throw new Error(galatDari(data, "Pembatalan gagal."));
      }
      toast.success(`Manifest ${batal.kode} dibatalkan.`);
      setBatal(null);
      await muat();
    } catch (e) {
      setGalatBatal(e instanceof Error ? e.message : "Pembatalan gagal.");
    } finally {
      setSibukBatal(false);
    }
  }

  function unduhCsv() {
    const kepala = ["Posko", "Wilayah", "Butuh", "Dikirim", "Diterima", "Selisih"];
    const isi = prioritasUrut
      .map((p) =>
        [p.posko_nama, p.wilayah, p.butuh, p.dikirim, p.diterima, p.selisih]
          .map(selCsv)
          .join(","),
      )
      .join("\r\n");
    const blob = new Blob([[kepala.map(selCsv).join(","), isi].join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const tautan = document.createElement("a");
    tautan.href = url;
    tautan.download = "prioritas-selisih.csv";
    document.body.appendChild(tautan);
    tautan.click();
    tautan.remove();
    URL.revokeObjectURL(url);
    toast.success("Berkas CSV prioritas diunduh.");
  }

  const antreanUrut = [...antrean].sort((a, b) => {
    const beda =
      kunciSortir === "umur"
        ? new Date(a.dibuat_pada).getTime() - new Date(b.dibuat_pada).getTime()
        : totalJiwa(a) - totalJiwa(b);
    return arahSortir === "naik" ? beda : -beda;
  });

  const prioritasUrut = [...prioritas].sort((a, b) => b.selisih - a.selisih);
  const selisihTerbuka = prioritasUrut.reduce((jumlah, p) => jumlah + Math.max(0, p.selisih), 0);
  const poskoKritis = prioritasUrut.filter((p) => p.selisih > 0).length;
  const selisihMaks = prioritasUrut.length > 0 ? Math.max(0, ...prioritasUrut.map((p) => p.selisih)) : 0;
  const semuaTerpilih = antreanUrut.length > 0 && terpilih.length === antreanUrut.length;
  const memuatAwal = status === "memuat" && antrean.length === 0 && prioritas.length === 0;

  function ikonSortir(kunci: KunciSortir) {
    if (kunci !== kunciSortir) return null;
    return arahSortir === "naik" ? (
      <ArrowUpIcon aria-hidden="true" className="size-4" />
    ) : (
      <ArrowDownIcon aria-hidden="true" className="size-4" />
    );
  }

  function alihSortirPrioritas(kunci: typeof kunciPrioritas) {
    if (kunci === kunciPrioritas) {
      setArahPrioritas((arah) => (arah === "naik" ? "turun" : "naik"));
    } else {
      setKunciPrioritas(kunci);
      setArahPrioritas(kunci === "posko" || kunci === "wilayah" ? "naik" : "turun");
    }
    setHalaman(1);
  }

  function panahPrioritas(kunci: typeof kunciPrioritas) {
    if (kunci !== kunciPrioritas) return "⇅";
    return arahPrioritas === "naik" ? "▲" : "▼";
  }

  function aturUlangFilterPrioritas() {
    setCari("");
    setFilterButuh("semua");
    setHalaman(1);
  }

  const kataCari = cari.trim().toLowerCase();
  const prioritasSaring = prioritasUrut.filter((p) => {
    if (filterButuh === "kurang" && p.selisih <= 0) return false;
    if (filterButuh === "aman" && p.selisih > 0) return false;
    if (kataCari.length > 0) {
      const cocok =
        p.posko_nama.toLowerCase().includes(kataCari) ||
        p.wilayah.toLowerCase().includes(kataCari);
      if (!cocok) return false;
    }
    return true;
  });

  const prioritasTampil = [...prioritasSaring].sort((a, b) => {
    let beda = 0;
    if (kunciPrioritas === "posko") beda = a.posko_nama.localeCompare(b.posko_nama, "id");
    else if (kunciPrioritas === "wilayah") beda = a.wilayah.localeCompare(b.wilayah, "id");
    else if (kunciPrioritas === "butuh") beda = a.butuh - b.butuh;
    else if (kunciPrioritas === "dikirim") beda = a.dikirim - b.dikirim;
    else if (kunciPrioritas === "diterima") beda = a.diterima - b.diterima;
    else beda = a.selisih - b.selisih;
    return arahPrioritas === "naik" ? beda : -beda;
  });

  const totalHalaman = Math.max(1, Math.ceil(prioritasTampil.length / perHalaman));
  const halamanAktif = Math.min(halaman, totalHalaman);
  const awalIndeks = prioritasTampil.length === 0 ? 0 : (halamanAktif - 1) * perHalaman + 1;
  const akhirIndeks = Math.min(halamanAktif * perHalaman, prioritasTampil.length);
  const prioritasHalaman = prioritasTampil.slice(
    (halamanAktif - 1) * perHalaman,
    halamanAktif * perHalaman,
  );

  return (
    <div className="flex flex-col gap-8">
      <PetaAlur />
      <PetaAlurRingkasan peran="BPBD" langkah="Verifikasi snapshot posko. Lalu buat manifest untuk posko yang kurang." />
      {status === "gagal" && (
        <Alert variant="destructive" role="status">
          <DangerTriangleIcon aria-hidden="true" />
          <AlertTitle>Gagal memuat data</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            Sebagian data tidak bisa dimuat. Periksa koneksi lalu coba lagi.
            <Button onClick={() => void muat()} className="min-h-12 w-fit">
              Muat ulang
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <section aria-label="Ringkasan" className="flex flex-col gap-3">
        <StripKpi
          label="Angka kunci"
          item={[
            { angka: String(antrean.length), label: "Menunggu verifikasi", konteks: `Dari ${prioritas.length} posko aktif` },
            { angka: String(selisihTerbuka), label: "Jiwa kurang", konteks: selisihTerbuka > 0 ? `Prioritas kirim hari ini · ${poskoKritis} posko` : "Semua posko aman" },
            { angka: String(pantau.length), label: "Perlu dicek", konteks: `Dari ${prioritas.length} posko dipantau` },
          ]}
        />
        <BarisSegarkan
          diperbarui={diperbarui ?? ""}
          memuat={status === "memuat"}
          onMuat={() => void muat()}
        />
        <p className="text-sm text-muted-foreground">
          Angka posko berupa <BantuanIstilah istilah="agregat" label="data agregat tanpa NIK" />.
          Tidak ada nama penyintas.
        </p>
      </section>

      <div className="grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">


      <section aria-label="Antrean verifikasi" className="flex flex-col gap-2">
        <p className="font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E]/60">Verifikasi</p>
        <h2 className="text-xl font-bold text-[#0B1F2E]">Antrean verifikasi ({antrean.length})</h2>
        <p className="text-sm text-muted-foreground">
          <BantuanIstilah istilah="verifikasi" label="Verifikasi" />: setujui, minta revisi, atau
          tolak. Hanya yang disetujui jadi jatah.
        </p>
        {terpilih.length > 0 && (
          <BilahMassal
            jumlah={terpilih.length}
            sibuk={sibukMassal}
            onBatal={() => setTerpilih([])}
            onSetuju={() => void setujuiTerpilih()}
          />
        )}
        {memuatAwal ? (
          <div className="overflow-x-auto rounded-none border border-[#0B1F2E]/15">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#0B1F2E] hover:bg-[#0B1F2E]">
                <TableHead aria-label="Pilih" className="font-mono text-[11px] uppercase text-white">Pilih</TableHead>
                <TableHead className="font-mono text-[11px] uppercase text-white">Posko</TableHead>
                <TableHead className="font-mono text-[11px] uppercase text-white">Kategori rentan</TableHead>
                <TableHead className="font-mono text-[11px] uppercase text-white">Total</TableHead>
                <TableHead className="font-mono text-[11px] uppercase text-white">Umur antrean</TableHead>
                <TableHead className="font-mono text-[11px] uppercase text-white">Putusan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <BarisMuatTabel kolom={6} />
              <BarisMuatTabel kolom={6} />
              <BarisMuatTabel kolom={6} />
            </TableBody>
          </Table>
          </div>
        ) : antrean.length === 0 ? (
          <KotakKosong
            label="Kosong"
            judul="Antrean sudah habis"
            deskripsi="Muncul lagi setiap ada snapshot penyintas baru dari posko yang menunggu verifikasi."
            aksiLabel="Muat ulang antrean"
            onAksi={() => void muat()}
          />
        ) : (
          <div className="overflow-x-auto rounded-none border border-[#0B1F2E]/15">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#0B1F2E] hover:bg-[#0B1F2E]">
                <TableHead>
                  <Checkbox
                    checked={semuaTerpilih}
                    onCheckedChange={(nilai) => alihPilihSemua(nilai === true)}
                    aria-label="Pilih semua antrean"
                    disabled={sibukMassal}
                  />
                </TableHead>
                <TableHead className="font-mono text-[11px] uppercase text-white">Posko</TableHead>
                <TableHead className="font-mono text-[11px] uppercase text-white">Kategori rentan</TableHead>
                <TableHead aria-sort={kunciSortir === "total" ? (arahSortir === "naik" ? "ascending" : "descending") : "none"} className="font-mono text-[11px] uppercase text-white">
                  <button
                    type="button"
                    onClick={() => alihSortir("total")}
                    className="inline-flex min-h-12 items-center gap-1 font-semibold text-white"
                    aria-label={`Urutkan total jiwa, saat ini ${kunciSortir === "total" ? arahSortir : "tidak diurutkan"}`}
                  >
                    Total {ikonSortir("total")}
                  </button>
                </TableHead>
                <TableHead aria-sort={kunciSortir === "umur" ? (arahSortir === "naik" ? "ascending" : "descending") : "none"} className="font-mono text-[11px] uppercase text-white">
                  <button
                    type="button"
                    onClick={() => alihSortir("umur")}
                    className="inline-flex min-h-12 items-center gap-1 font-semibold text-white"
                    aria-label={`Urutkan umur antrean, saat ini ${kunciSortir === "umur" ? arahSortir : "tidak diurutkan"}`}
                  >
                    Umur antrean {ikonSortir("umur")}
                  </button>
                </TableHead>
                <TableHead className="font-mono text-[11px] uppercase text-white">Putusan</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {antreanUrut.map((a) => (
                <TableRow key={a.id} data-state={terpilih.includes(a.id) ? "selected" : undefined}>
                  <TableCell>
                    <Checkbox
                      checked={terpilih.includes(a.id)}
                      onCheckedChange={(nilai) => alihPilih(a.id, nilai === true)}
                      aria-label={`Pilih snapshot ${a.posko?.nama ?? "posko?"}`}
                      disabled={sibukMassal}
                    />
                  </TableCell>
                  <TableCell className="font-semibold">{a.posko?.nama ?? "Posko?"}</TableCell>
                  <TableCell>
                    <dl className="grid grid-cols-2 gap-x-3 text-xs">
                      <div>Bayi: <strong>{a.bayi}</strong></div>
                      <div>Balita: <strong>{a.balita}</strong></div>
                      <div>Ibu hamil: <strong>{a.ibu_hamil}</strong></div>
                      <div>Lansia: <strong>{a.lansia}</strong></div>
                      <div>Disabilitas: <strong>{a.disabilitas}</strong></div>
                      <div>Umum: <strong>{a.umum}</strong></div>
                    </dl>
                  </TableCell>
                  <TableCell>
                    <strong>{totalJiwa(a)}</strong> jiwa
                  </TableCell>
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {umurDari(a.dibuat_pada)}
                  </TableCell>
                  <TableCell>
                    <div className="flex min-w-32 flex-col gap-1">
                      <Button
                        onClick={() => void setujui(a.id)}
                        disabled={sibukMassal}
                        className="min-h-12 w-full bg-success text-white hover:bg-success/80"
                      >
                        Setujui
                      </Button>
                      <Button
                        onClick={() =>
                          bukaPutusan({
                            id: a.id,
                            nama: a.posko?.nama ?? "Posko?",
                            keputusan: "MINTA_REVISI",
                          })
                        }
                        disabled={sibukMassal}
                        className="min-h-12 w-full bg-warning-bg text-warning hover:bg-warning-bg"
                      >
                        Minta revisi
                      </Button>
                      <Button
                        variant="destructive"
                        onClick={() =>
                          bukaPutusan({
                            id: a.id,
                            nama: a.posko?.nama ?? "Posko?",
                            keputusan: "DITOLAK",
                          })
                        }
                        disabled={sibukMassal}
                        className="min-h-12 w-full"
                      >
                        Tolak
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
        )}
      </section>

      <section aria-label="Prioritas kebutuhan" className="flex flex-col gap-2">
        <p className="font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E]/60">Kebutuhan</p>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <h2 className="flex-1 text-xl font-bold text-[#0B1F2E]">Prioritas kebutuhan</h2>
          {prioritas.length > 0 && (
            <Button
              variant="outline"
              onClick={unduhCsv}
              className="min-h-12 rounded-none sm:w-auto"
              aria-label="Unduh prioritas sebagai CSV"
            >
              <DownloadMinimalisticIcon aria-hidden="true" />
              Unduh CSV
            </Button>
          )}
        </div>
        {memuatAwal ? (
          <div className="overflow-x-auto rounded-none border border-[#0B1F2E]/15">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#0B1F2E] hover:bg-[#0B1F2E]">
                <TableHead className="font-mono text-[11px] uppercase text-white">Posko</TableHead>
                <TableHead className="font-mono text-[11px] uppercase text-white">Wilayah</TableHead>
                <TableHead className="font-mono text-[11px] uppercase text-white">Butuh</TableHead>
                <TableHead className="font-mono text-[11px] uppercase text-white">Dikirim</TableHead>
                <TableHead className="font-mono text-[11px] uppercase text-white">Diterima</TableHead>
                <TableHead className="font-mono text-[11px] uppercase text-white">Selisih</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <BarisMuatTabel kolom={6} />
              <BarisMuatTabel kolom={6} />
              <BarisMuatTabel kolom={6} />
            </TableBody>
          </Table>
          </div>
        ) : prioritas.length === 0 ? (
          <div className="rounded-none border border-dashed border-[#0B1F2E]/25 bg-white/60 p-8">
            <p className="font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E]/60">Kosong</p>
            <p className="mt-1 text-lg font-bold text-[#0B1F2E]">Belum ada data selisih</p>
            <p className="mt-1 text-sm text-muted-foreground">
              Tabel selisih tampil setelah ada snapshot yang disetujui dan manifest yang berjalan.
            </p>
            <Button onClick={() => void muat()} className="mt-4 min-h-12 rounded-none">
              Muat ulang data
            </Button>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
          <BilahSaring
            idCari="cari-prioritas"
            labelCari="Cari posko atau wilayah"
            placeholder="Cari posko atau wilayah..."
            cari={cari}
            onCari={(nilai) => { setCari(nilai); setHalaman(1); }}
            labelGrup="Filter status kebutuhan"
            pilihan={[
              { nilai: "semua", label: "Semua" },
              { nilai: "kurang", label: "Kurang" },
              { nilai: "aman", label: "Aman" },
            ]}
            aktif={filterButuh}
            onPilih={(nilai) => {
              if (nilai === "semua" || nilai === "kurang" || nilai === "aman") {
                setFilterButuh(nilai);
                setHalaman(1);
              }
            }}
          />
          {prioritasTampil.length === 0 ? (
            <KotakKosong
              label="Kosong"
              judul="Tidak ada hasil filter"
              deskripsi="Coba kata kunci lain atau ubah filter status kebutuhan."
              aksiLabel="Atur ulang filter"
              onAksi={aturUlangFilterPrioritas}
            />
          ) : (
          <div className="overflow-x-auto rounded-none border border-[#0B1F2E]/15">
          <Table>
            <TableHeader>
              <TableRow className="bg-[#0B1F2E] hover:bg-[#0B1F2E]">
                <TableHead className="font-mono text-[11px] uppercase text-white">
                  <TombolUrut label="Posko" tanda={panahPrioritas("posko")} labelAria={`Urutkan posko, saat ini ${kunciPrioritas === "posko" ? arahPrioritas : "tidak diurutkan"}`} onUrut={() => alihSortirPrioritas("posko")} />
                </TableHead>
                <TableHead className="font-mono text-[11px] uppercase text-white">
                  <TombolUrut label="Wilayah" tanda={panahPrioritas("wilayah")} labelAria={`Urutkan wilayah, saat ini ${kunciPrioritas === "wilayah" ? arahPrioritas : "tidak diurutkan"}`} onUrut={() => alihSortirPrioritas("wilayah")} />
                </TableHead>
                <TableHead className="font-mono text-[11px] uppercase tabular-nums text-white">
                  <TombolUrut label="Butuh" tanda={panahPrioritas("butuh")} labelAria={`Urutkan butuh, saat ini ${kunciPrioritas === "butuh" ? arahPrioritas : "tidak diurutkan"}`} onUrut={() => alihSortirPrioritas("butuh")} />
                </TableHead>
                <TableHead className="font-mono text-[11px] uppercase tabular-nums text-white">
                  <TombolUrut label="Dikirim" tanda={panahPrioritas("dikirim")} labelAria={`Urutkan dikirim, saat ini ${kunciPrioritas === "dikirim" ? arahPrioritas : "tidak diurutkan"}`} onUrut={() => alihSortirPrioritas("dikirim")} />
                </TableHead>
                <TableHead className="font-mono text-[11px] uppercase tabular-nums text-white">
                  <TombolUrut label="Diterima" tanda={panahPrioritas("diterima")} labelAria={`Urutkan diterima, saat ini ${kunciPrioritas === "diterima" ? arahPrioritas : "tidak diurutkan"}`} onUrut={() => alihSortirPrioritas("diterima")} />
                </TableHead>
                <TableHead className="font-mono text-[11px] uppercase text-white">
                  <TombolUrut label="Selisih" tanda={panahPrioritas("selisih")} labelAria={`Urutkan selisih, saat ini ${kunciPrioritas === "selisih" ? arahPrioritas : "tidak diurutkan"}`} onUrut={() => alihSortirPrioritas("selisih")} />
                </TableHead>
                <TableHead className="font-mono text-[11px] uppercase text-white">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {prioritasHalaman.map((p) => (
                <TableRow key={p.posko_id}>
                  <TableCell className="font-semibold">{p.posko_nama}</TableCell>
                  <TableCell className="text-muted-foreground">{p.wilayah}</TableCell>
                  <TableCell className="tabular-nums">{p.butuh}</TableCell>
                  <TableCell className="tabular-nums">{p.dikirim}</TableCell>
                  <TableCell className="tabular-nums">{p.diterima}</TableCell>
                  <TableCell>
                    {p.selisih > 0 ? (
                      <div className="flex min-w-40 flex-col gap-1">
                        <div
                          className="h-2 w-full rounded-full bg-muted"
                          role="img"
                          aria-label={`Kurang ${p.selisih} dari ${selisihMaks} tertinggi`}
                        >
                          <div
                            className="h-2 rounded-full bg-destructive"
                            style={{
                              width: `${selisihMaks > 0 ? Math.round((p.selisih / selisihMaks) * 100) : 0}%`,
                            }}
                          />
                        </div>
                        <Badge variant="destructive" className="w-fit">
                          Kurang {p.selisih}
                        </Badge>
                      </div>
                    ) : (
                      <Badge className="border-transparent bg-success-bg text-success">Aman</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <a
                      href={`/bpbd/kirim?posko=${encodeURIComponent(String(p.posko_id))}`}
                      className={cn(buttonVariants({ variant: "outline" }), "min-h-12 w-full rounded-none whitespace-nowrap")}
                    >
                      Buat Manifest Posko Ini
                    </a>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          </div>
          )}
          {prioritasTampil.length > 0 && (
            <BilahHalaman
              awal={awalIndeks}
              akhir={akhirIndeks}
              total={prioritasTampil.length}
              perHalaman={perHalaman}
              onPerHalaman={(nilai) => { setPerHalaman(nilai); setHalaman(1); }}
              bisaMundur={halamanAktif > 1}
              bisaMaju={halamanAktif < totalHalaman}
              onMundur={() => setHalaman((h) => Math.max(1, h - 1))}
              onMaju={() => setHalaman((h) => Math.min(totalHalaman, h + 1))}
              idPilih="per-halaman"
            />
          )}
          </div>
        )}
      </section>
        </div>
        <aside className="space-y-6 lg:sticky lg:top-20 lg:col-span-4">
          <div className="flex flex-col gap-2 rounded-none border border-[#0B1F2E]/15 bg-white p-4">
            <p className="font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E]/60">Langkah berikut</p>
            <p className="text-sm text-muted-foreground">
              Prioritas tertinggi ada di tabel kebutuhan. Buat manifest untuk posko yang kurang.
            </p>
            <a href="/bpbd/kirim" className={cn(buttonVariants(), "min-h-12 w-full rounded-none")}>
              Buat manifest
            </a>
          </div>
      <section aria-label="Perlu dicek" className="flex flex-col gap-2">
        <p className="font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E]/60">Pantau</p>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold text-destructive">Perlu Dicek ({pantau.length})</h2>
          {pantau.length > 0 && <Badge variant="destructive">Perlu Dicek</Badge>}
        </div>
        {status === "memuat" && pantau.length === 0 ? (
          <KartuMuat />
        ) : pantau.length === 0 ? (
          <KotakKosong
            label="Aman"
            judul="Semua kiriman terpantau"
            deskripsi="Kartu peringatan muncul di sini setiap ada manifest lewat batas check-in."
            aksiLabel="Buat manifest"
            href="/bpbd/kirim"
          />
        ) : (
          pantau.map((w) => (
            <Card key={w.id} className="rounded-none border-destructive">
              <CardContent className="flex flex-col gap-2 p-4 text-sm">
                <p className="font-semibold">
                  {w.kode} · {w.posko_nama}
                </p>
                <p className="text-muted-foreground">
                  Batas check-in {new Date(w.batas_checkin).toLocaleString("id-ID")} · kabar
                  terakhir {w.log_terakhir ?? "-"}
                  {w.ditandai ? " · sudah ditandai otomatis" : ""}
                </p>
                <div className="flex flex-col gap-2 sm:flex-row lg:flex-col xl:flex-row">
                  <a
                    href={`/m/${w.kode}`}
                    target="_blank"
                    rel="noreferrer"
                    className={cn(buttonVariants({ variant: "outline" }), "min-h-12 flex-1 rounded-none")}
                  >
                    Lihat halaman publik ↗
                  </a>
                  <a
                    href="tel:112"
                    className={cn(buttonVariants({ variant: "outline" }), "min-h-12 flex-1 rounded-none")}
                  >
                    <PhoneCallingRoundedIcon aria-hidden="true" />
                    Hubungi jalur darurat
                  </a>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      bukaBatal({ id: w.id, kode: w.kode, posko_nama: w.posko_nama })
                    }
                    className="min-h-12 flex-1 rounded-none"
                  >
                    Batalkan manifest ini
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>
        </aside>
      </div>

      <Dialog open={putusan !== null} onOpenChange={(buka) => !buka && setPutusan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {putusan?.keputusan === "MINTA_REVISI" ? "Minta revisi" : "Tolak snapshot"} ·{" "}
              {putusan?.nama}
            </DialogTitle>
            <DialogDescription>
              Tulis alasan yang jelas agar posko tahu apa yang harus diperbaiki. Alasan wajib
              diisi.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1">
            <Label htmlFor="alasan-putusan">Alasan</Label>
            <Textarea
              id="alasan-putusan"
              value={alasanPutusan}
              onChange={(e) => {
                setAlasanPutusan(e.target.value);
                if (galatPutusan) setGalatPutusan(null);
              }}
              placeholder="Contoh: jumlah lansia tidak cocok dengan laporan kemarin, mohon cek ulang."
              rows={3}
              maxLength={500}
            />
            {galatPutusan && (
              <p role="alert" className="flex items-center gap-1 text-sm text-destructive">
                <InfoCircleIcon aria-hidden="true" />
                {galatPutusan}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPutusan(null)}
              className="min-h-12"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => void konfirmasiPutusan()}
              disabled={sibukPutusan}
              className="min-h-12"
            >
              {sibukPutusan
                ? "Menyimpan..."
                : putusan?.keputusan === "MINTA_REVISI"
                  ? "Kirim permintaan revisi"
                  : "Tolak snapshot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={batal !== null} onOpenChange={(buka) => !buka && setBatal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batalkan manifest {batal?.kode}?</DialogTitle>
            <DialogDescription>
              Pembatalan tercatat publik dan tidak bisa dibatalkan. Manifest tujuan{" "}
              {batal?.posko_nama} tidak jadi dikirim; buat manifest pengganti bila masih
              dibutuhkan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1">
            <Label htmlFor="alasan-batal">Alasan pembatalan publik</Label>
            <Textarea
              id="alasan-batal"
              value={alasanBatal}
              onChange={(e) => {
                setAlasanBatal(e.target.value);
                if (galatBatal) setGalatBatal(null);
              }}
              placeholder="Contoh: tim tidak bisa berangkat karena akses putus, diganti manifest baru."
              rows={3}
              maxLength={500}
            />
            {galatBatal && (
              <p role="alert" className="flex items-center gap-1 text-sm text-destructive">
                <InfoCircleIcon aria-hidden="true" />
                {galatBatal}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatal(null)} className="min-h-12">
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => void konfirmasiBatal()}
              disabled={sibukBatal}
              className="min-h-12"
            >
              {sibukBatal ? "Membatalkan..." : "Ya, batalkan manifest"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
