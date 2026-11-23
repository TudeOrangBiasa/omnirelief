"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { MagnifierIcon } from "@solar-icons/react/linear";
import { Alert, AlertDescription, AlertTitle } from "@omnirelief/ui/components/alert";
import { Badge } from "@omnirelief/ui/components/badge";
import { Button } from "@omnirelief/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@omnirelief/ui/components/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@omnirelief/ui/components/empty";
import { Input } from "@omnirelief/ui/components/input";
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
import { urutFEFO } from "@/lib/fefo";
import { sisaHariKalender } from "@/lib/tanggal";
import { baris, type GudangBatchRow, type ItemKatalogRow } from "@/lib/supabase/baris";
import TombolSalin from "@/components/tombol-salin";
import { BantuanIstilah } from "@/components/bantuan-istilah";
import { PetaAlur, bukaPanduan } from "@/components/peta-alur";
import { BarisSegarkan, KepalaHalaman } from "@/components/kepala-halaman";
import { BilahHalaman, BilahSaring } from "@/components/kontrol-tabel";
import { KotakKosong } from "@/components/widget-laporan";

type GalatField = {
  item_id?: string;
  jumlah?: string;
  kedaluwarsa?: string;
  sumber?: string;
};

type FilterBatch = "semua" | "segera" | "menipis";
type KunciUrut = "kode" | "barang" | "sisa" | "kedaluwarsa";
type IntakeHariIni = {
  kode: string;
  jumlah: number;
  satuan: string;
  sumber: string;
  waktu: string;
};

type StatusBatch = "memuat" | "siap" | "gagal" | "tanpa-akses";

function validasiClient(formData: FormData): { nilai: { item_id: number; jumlah: number; kedaluwarsa: string; sumber: string; tampilkan_nama: boolean }; galat: GalatField } {
  const galat: GalatField = {};
  const item_id = Number(formData.get("item_id"));
  const jumlah = Number(formData.get("jumlah"));
  const kedaluwarsa = String(formData.get("kedaluwarsa") ?? "");
  const sumber = String(formData.get("sumber") ?? "").trim();

  if (!Number.isInteger(item_id) || item_id <= 0)
    galat.item_id = "Pilih nama barang dari daftar.";
  if (!Number.isInteger(jumlah) || jumlah <= 0)
    galat.jumlah = "Jumlah harus lebih dari 0.";
  if (sumber === "") galat.sumber = "Sumber wajib diisi.";
  if (kedaluwarsa !== "") {
    const hariIni = new Date().toISOString().slice(0, 10);
    if (kedaluwarsa < hariIni) galat.kedaluwarsa = "Kedaluwarsa tidak boleh sudah lewat.";
  }

  return {
    nilai: {
      item_id,
      jumlah,
      kedaluwarsa,
      sumber,
      tampilkan_nama: formData.get("tampilkan_nama") === "on",
    },
    galat,
  };
}

export default function GudangPage() {
  const [hasil, setHasil] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [galatField, setGalatField] = useState<GalatField>({});
  const [riwayat, setRiwayat] = useState<IntakeHariIni[]>([]);
  const [sibuk, setSibuk] = useState(false);
  const [batch, setBatch] = useState<GudangBatchRow[]>([]);
  const [statusBatch, setStatusBatch] = useState<StatusBatch>("memuat");
  const [katalog, setKatalog] = useState<ItemKatalogRow[]>([]);
  const [statusKatalog, setStatusKatalog] = useState<StatusBatch>("memuat");
  const [cariBatch, setCariBatch] = useState("");
  const [filterBatch, setFilterBatch] = useState<FilterBatch>("semua");
  const [kunciUrut, setKunciUrut] = useState<KunciUrut | null>(null);
  const [arahUrut, setArahUrut] = useState<"naik" | "turun">("naik");
  const [halaman, setHalaman] = useState(1);
  const [ukuranHalaman, setUkuranHalaman] = useState<5 | 10 | 20>(10);
  const formRef = useRef<HTMLFormElement>(null);

  const muatBatch = useCallback(() => {
    setStatusBatch("memuat");
    fetch("/api/gudang/batch")
      .then((r) => {
        if (r.status === 401 || r.status === 403) {
          setStatusBatch("tanpa-akses");
          return null;
        }
        if (!r.ok) {
          setStatusBatch("gagal");
          return null;
        }
        return r.json();
      })
      .then((d: { ok: boolean; batch?: unknown } | null) => {
        if (d === null) return;
        if (d.ok) {
          setBatch(baris<GudangBatchRow>(d.batch));
          setStatusBatch("siap");
        } else {
          setStatusBatch("gagal");
        }
      })
      .catch(() => setStatusBatch("gagal"));
  }, []);

  const muatKatalog = useCallback(() => {
    setStatusKatalog("memuat");
    fetch("/api/gudang/items")
      .then((r) => {
        if (r.status === 401 || r.status === 403) {
          setStatusKatalog("tanpa-akses");
          return null;
        }
        if (!r.ok) {
          setStatusKatalog("gagal");
          return null;
        }
        return r.json();
      })
      .then((d: { ok: boolean; items?: unknown } | null) => {
        if (d === null) return;
        if (d.ok) {
          setKatalog(baris<ItemKatalogRow>(d.items));
          setStatusKatalog("siap");
        } else {
          setStatusKatalog("gagal");
        }
      })
      .catch(() => setStatusKatalog("gagal"));
  }, []);

  useEffect(() => {
    muatBatch();
    muatKatalog();
  }, [muatBatch, muatKatalog]);

  const tampilBatch = useMemo(() => {
    const kata = cariBatch.trim().toLowerCase();
    const saring = batch.filter((b) => {
      const cocokKata =
        kata === "" ||
        b.kode_sumbangan.toLowerCase().includes(kata) ||
        b.item_nama.toLowerCase().includes(kata) ||
        b.sumber.toLowerCase().includes(kata);
      if (!cocokKata) return false;
      if (filterBatch === "segera") {
        if (b.kedaluwarsa === null) return false;
        const hari = sisaHariKalender(b.kedaluwarsa);
        return hari <= 30;
      }
      if (filterBatch === "menipis") return b.sisa <= 5;
      return true;
    });
    const fefo = urutFEFO(
      saring.map((b) => ({ ...b, kode: b.kode_sumbangan, tersedia: b.sisa }))
    );
    if (kunciUrut === null) return fefo;
    const banding = (a: (typeof fefo)[number], c: (typeof fefo)[number]) => {
      if (kunciUrut === "kode") return a.kode_sumbangan.localeCompare(c.kode_sumbangan);
      if (kunciUrut === "barang") return a.item_nama.localeCompare(c.item_nama);
      if (kunciUrut === "sisa") return a.sisa - c.sisa;
      const waktu = (tanggal: string | null) =>
        tanggal === null ? Number.POSITIVE_INFINITY : new Date(tanggal).getTime();
      return waktu(a.kedaluwarsa) - waktu(c.kedaluwarsa);
    };
    return [...fefo].sort((a, c) => (arahUrut === "naik" ? banding(a, c) : banding(c, a)));
  }, [batch, cariBatch, filterBatch, kunciUrut, arahUrut]);

  const sisaTampil = useMemo(
    () => tampilBatch.reduce((s, b) => s + b.sisa, 0),
    [tampilBatch]
  );

  const totalHalaman = Math.max(1, Math.ceil(tampilBatch.length / ukuranHalaman));
  const halamanAman = Math.min(halaman, totalHalaman);
  const awal = tampilBatch.length === 0 ? 0 : (halamanAman - 1) * ukuranHalaman + 1;
  const akhir = Math.min(halamanAman * ukuranHalaman, tampilBatch.length);
  const batchHalaman = tampilBatch.slice((halamanAman - 1) * ukuranHalaman, halamanAman * ukuranHalaman);

  function gantiUrut(kunci: KunciUrut) {
    if (kunciUrut !== kunci) {
      setKunciUrut(kunci);
      setArahUrut("naik");
    } else {
      setArahUrut((a) => (a === "naik" ? "turun" : "naik"));
    }
    setHalaman(1);
  }

  function ikonUrut(kunci: KunciUrut) {
    if (kunciUrut !== kunci) return "▲▼";
    return arahUrut === "naik" ? "▲" : "▼";
  }

  function aturUlangFilter() {
    setCariBatch("");
    setFilterBatch("semua");
    setHalaman(1);
  }

  function fokusForm() {
    formRef.current?.scrollIntoView({ block: "start" });
    document.getElementById("gudang-item")?.focus({ preventScroll: true });
  }

  async function simpan(formData: FormData) {
    setHasil(null);
    setGalat(null);
    const { nilai, galat: galatBaru } = validasiClient(formData);
    setGalatField(galatBaru);
    if (Object.keys(galatBaru).length > 0) return;
    setSibuk(true);
    try {
      const res = await fetch("/api/gudang/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: nilai.item_id,
          jumlah: nilai.jumlah,
          kedaluwarsa: nilai.kedaluwarsa === "" ? null : nilai.kedaluwarsa,
          sumber: nilai.sumber,
          tampilkan_nama: nilai.tampilkan_nama,
        }),
      });
      const data = (await res.json()) as { ok: boolean; kode_sumbangan?: string; galat?: string };
      if (data.ok && data.kode_sumbangan) {
        setHasil(data.kode_sumbangan);
        setRiwayat((r) => [
          {
            kode: data.kode_sumbangan as string,
            jumlah: nilai.jumlah,
            satuan: katalog.find((k) => k.id === nilai.item_id)?.satuan ?? "",
            sumber: nilai.sumber,
            waktu: new Date().toLocaleString("id-ID"),
          },
          ...r,
        ]);
        toast.success(`Intake tersimpan. Kode ${data.kode_sumbangan}.`);
        formRef.current?.reset();
        muatBatch();
      } else {
        setGalat(data.galat ?? "Gagal menyimpan.");
      }
    } catch {
      setGalat("Jaringan bermasalah. Coba lagi.");
    } finally {
      setSibuk(false);
    }
  }


  const diperbarui = new Date().toLocaleString("id-ID", { hour: "2-digit", minute: "2-digit" });
  return (
    <main className="mx-auto w-full max-w-[1400px] px-6 py-8 lg:px-10">
      <KepalaHalaman
        label="Operasional · Gudang"
        judul="Gudang"
        deskripsi="Catat pangan masuk. Satu pencatatan sama dengan satu kode sumbangan."
      />
      <div className="mt-4">
        <BarisSegarkan
          diperbarui={diperbarui}
          memuat={statusBatch === "memuat"}
          onMuat={() => { muatBatch(); muatKatalog(); }}
          sebaris
        />
      </div>
      <ol aria-label="Alur bantuan" className="mt-4 flex flex-wrap items-center gap-2 font-mono text-[11px] uppercase tracking-widest">
        <li className="border bg-[#0B1F2E] px-2 py-1 text-white">Gudang</li>
        <li aria-hidden="true">→</li>
        <li className="border px-2 py-1">BPBD</li>
        <li aria-hidden="true">→</li>
        <li className="border px-2 py-1">Tim</li>
        <li aria-hidden="true">→</li>
        <li className="border px-2 py-1">Posko</li>
        <li aria-hidden="true">→</li>
        <li className="border px-2 py-1">Publik</li>
        <li>
          <Button
            type="button"
            variant="outline"
            onClick={() => bukaPanduan("GUDANG", "Catat sumbangan. Satu pencatatan sama dengan satu kode sumbangan.")}
            className="min-h-12 rounded-none font-mono text-[11px] uppercase tracking-widest"
          >
            Lihat peta alur
          </Button>
        </li>
      </ol>
      <PetaAlur />
      <div className="mt-6 grid grid-cols-12 gap-6">
        <div className="col-span-12 flex flex-col gap-6 lg:col-span-8">
      {hasil && (
        <Card className="border-transparent bg-success-bg">
          <CardHeader>
            <CardTitle className="text-base text-success">Intake tersimpan</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-success">
              Kode sumbangan: <strong>{hasil}</strong>
            </p>
            <TombolSalin
              teks={hasil}
              label="Salin kode"
              pesanSukses="Kode sumbangan disalin."
              variant="outline"
            />
            <Button
              render={
                <Link href={`/s/${hasil}`}>
                  Lihat halaman publik ↗
                </Link>
              }
              variant="outline"
              className="min-h-12 w-full"
            />
          </CardContent>
        </Card>
      )}

      {galat && (
        <Alert variant="destructive" role="alert">
          <AlertTitle>Gagal menyimpan</AlertTitle>
          <AlertDescription>{galat}</AlertDescription>
        </Alert>
      )}

      <form ref={formRef} action={simpan} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1">
          <Label htmlFor="gudang-item">Nama barang</Label>
          <select
            id="gudang-item"
            name="item_id"
            defaultValue=""
            required
            disabled={statusKatalog !== "siap"}
            className="min-h-12 w-full rounded-none border border-input bg-card px-3 text-sm disabled:opacity-50"
            aria-invalid={galatField.item_id ? true : undefined}
            aria-describedby={galatField.item_id ? "gudang-item-galat" : undefined}
          >
            <option value="">
              {statusKatalog === "memuat"
                ? "Memuat daftar barang..."
                : statusKatalog === "siap"
                  ? `Pilih barang (${katalog.length} jenis)`
                  : "Daftar barang butuh akses gudang"}
            </option>
            {katalog.map((k) => (
              <option key={k.id} value={k.id}>
                {k.nama} · {k.satuan}
              </option>
            ))}
          </select>
          {galatField.item_id && (
            <p id="gudang-item-galat" role="alert" className="text-sm text-destructive">
              {galatField.item_id}
            </p>
          )}
          {statusKatalog === "gagal" && (
            <p className="text-sm text-muted-foreground">
              Gagal memuat daftar.{" "}
              <button type="button" onClick={muatKatalog} className="min-h-12 underline">
                Muat ulang
              </button>
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="gudang-jumlah">Jumlah</Label>
          <Input
            id="gudang-jumlah"
            name="jumlah"
            type="number"
            min={1}
            className="min-h-12"
            aria-invalid={galatField.jumlah ? true : undefined}
            aria-describedby={galatField.jumlah ? "gudang-jumlah-galat" : undefined}
          />
          {galatField.jumlah && (
            <p id="gudang-jumlah-galat" role="alert" className="text-sm text-destructive">
              {galatField.jumlah}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="gudang-exp">Kedaluwarsa (opsional)</Label>
          <Input
            id="gudang-exp"
            name="kedaluwarsa"
            type="date"
            className="min-h-12"
            aria-invalid={galatField.kedaluwarsa ? true : undefined}
            aria-describedby={galatField.kedaluwarsa ? "gudang-exp-galat" : undefined}
          />
          <p className="text-xs text-muted-foreground">
            Pilih lewat kalender, atau ketik lengkap tanggal-bulan-tahun.
          </p>
          {galatField.kedaluwarsa && (
            <p id="gudang-exp-galat" role="alert" className="text-sm text-destructive">
              {galatField.kedaluwarsa}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="gudang-sumber">Sumber (donatur, NGO, CSR, pemerintah)</Label>
          <Input
            id="gudang-sumber"
            name="sumber"
            type="text"
            className="min-h-12"
            aria-invalid={galatField.sumber ? true : undefined}
            aria-describedby={galatField.sumber ? "gudang-sumber-galat" : undefined}
          />
          {galatField.sumber && (
            <p id="gudang-sumber-galat" role="alert" className="text-sm text-destructive">
              {galatField.sumber}
            </p>
          )}
        </div>
        <label htmlFor="gudang-izin" className="flex min-h-12 items-center gap-2 text-sm">
          <input id="gudang-izin" name="tampilkan_nama" type="checkbox" className="h-5 w-5 accent-primary" />
          Tampilkan nama sumber ke publik
        </label>
        <Button type="submit" disabled={sibuk} className="min-h-12">
          {sibuk ? "Menyimpan..." : "Simpan batch"}
        </Button>
      </form>

      <section aria-label="Stok batch" className="flex flex-col gap-3 rounded-none border bg-[#DCE8EE] p-4">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[#0B1F2E]">Stok batch · FEFO</h2>
        <dl className="grid grid-cols-3 gap-3">
          <div className="border bg-card p-3">
            <dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Batch tercatat</dt>
            <dd className="text-4xl font-light tabular-nums text-primary">{batch.length}</dd>
          </div>
          <div className="border bg-card p-3">
            <dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Paket siap kirim</dt>
            <dd className="text-4xl font-light tabular-nums text-primary">{batch.reduce((s, b) => s + Math.max(0, b.sisa), 0)}</dd>
          </div>
          <div className="border bg-card p-3">
            <dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Kedaluwarsa &lt; 30 hari</dt>
            <dd className="text-4xl font-light tabular-nums text-primary">{batch.filter((b) => b.kedaluwarsa !== null && new Date(b.kedaluwarsa).getTime() < Date.now() + 30 * 24 * 3600 * 1000 && b.sisa > 0).length}</dd>
          </div>
        </dl>
        <p className="text-muted-foreground text-sm">
          Urutan <BantuanIstilah istilah="fefo" label="FEFO" />: kedaluwarsa paling dekat
          keluar duluan.
        </p>
        <BilahSaring
          idCari="cari-batch"
          labelCari="Cari batch"
          placeholder="Cari kode, barang, atau sumber..."
          cari={cariBatch}
          onCari={(nilai) => { setCariBatch(nilai); setHalaman(1); }}
          labelGrup="Saring batch"
          pilihan={[
            { nilai: "semua", label: "Semua" },
            { nilai: "segera", label: "Segera kedaluwarsa (<30 hari)" },
            { nilai: "menipis", label: "Stok menipis (sisa ≤ 5)" },
          ]}
          aktif={filterBatch}
          onPilih={(nilai) => {
            if (nilai === "semua" || nilai === "segera" || nilai === "menipis") {
              setFilterBatch(nilai);
              setHalaman(1);
            }
          }}
        />
        {statusBatch === "siap" && (
          <p role="status" className="text-muted-foreground text-sm tabular-nums">
            {tampilBatch.length} batch · sisa {sisaTampil}
          </p>
        )}
        {statusBatch === "memuat" && (
          <div role="status" aria-label="Memuat stok batch" className="flex flex-col gap-2">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-12 w-full" />
          </div>
        )}
        {statusBatch === "tanpa-akses" && (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <MagnifierIcon aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>Stok batch butuh akses gudang</EmptyTitle>
              <EmptyDescription>
                Masuk sebagai petugas gudang atau BPBD untuk melihat tabel batch.
              </EmptyDescription>
            </EmptyHeader>
            <Button render={<Link href="/masuk" />} className="mt-4 min-h-12">
              Masuk
            </Button>
          </Empty>
        )}
        {statusBatch === "gagal" && (
          <Alert variant="destructive">
            <AlertTitle>Gagal memuat batch</AlertTitle>
            <AlertDescription>
              Periksa koneksi lalu coba lagi.
            </AlertDescription>
            <Button onClick={muatBatch} className="mt-3 min-h-12">
              Coba lagi
            </Button>
          </Alert>
        )}
        {statusBatch === "siap" && batch.length === 0 && (
          <KotakKosong
            label="Kosong"
            judul="Belum ada intake batch hari ini"
            deskripsi="Batch muncul di sini setiap ada intake tersimpan, siap disalurkan FEFO."
            aksiLabel="Catat batch masuk"
            onAksi={fokusForm}
          />
        )}
        {statusBatch === "siap" && batch.length > 0 && tampilBatch.length === 0 && (
          <KotakKosong
            label="Kosong"
            judul="Tidak ada hasil"
            deskripsi="Tidak ada batch yang cocok dengan filter. Coba kata lain atau atur ulang filter."
            aksiLabel="Atur ulang filter"
            onAksi={aturUlangFilter}
          />
        )}
        {statusBatch === "siap" && tampilBatch.length > 0 && (
          <div className="flex flex-col gap-3">
          <div className="overflow-x-auto border bg-card">
          <Table>
            <TableHeader className="bg-[#0B1F2E]">
              <TableRow className="hover:bg-[#0B1F2E]">
                <TableHead className="font-mono text-xs uppercase tracking-widest text-white">
                  <button type="button" onClick={() => gantiUrut("kode")} aria-label="Urutkan kode" className="flex min-h-12 items-center gap-1 uppercase">
                    Kode <span aria-hidden="true">{ikonUrut("kode")}</span>
                  </button>
                </TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-widest text-white">
                  <button type="button" onClick={() => gantiUrut("barang")} aria-label="Urutkan barang" className="flex min-h-12 items-center gap-1 uppercase">
                    Barang <span aria-hidden="true">{ikonUrut("barang")}</span>
                  </button>
                </TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-widest text-white">
                  <button type="button" onClick={() => gantiUrut("sisa")} aria-label="Urutkan sisa" className="flex min-h-12 items-center gap-1 uppercase">
                    Sisa <span aria-hidden="true">{ikonUrut("sisa")}</span>
                  </button>
                </TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-widest text-white">
                  <button type="button" onClick={() => gantiUrut("kedaluwarsa")} aria-label="Urutkan kedaluwarsa" className="flex min-h-12 items-center gap-1 uppercase">
                    Kedaluwarsa <span aria-hidden="true">{ikonUrut("kedaluwarsa")}</span>
                  </button>
                </TableHead>
                <TableHead className="font-mono text-xs uppercase tracking-widest text-white">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {batchHalaman.map((b) => {
                const hari = b.kedaluwarsa ? sisaHariKalender(b.kedaluwarsa) : null;
                return (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs break-all">{b.kode_sumbangan}</TableCell>
                    <TableCell>
                      {b.item_nama}
                      <span className="text-muted-foreground block text-xs tabular-nums">
                        {b.jumlah} {b.satuan}
                      </span>
                    </TableCell>
                    <TableCell className="tabular-nums">
                      {b.sisa} {b.satuan}
                    </TableCell>
                    <TableCell className="text-xs">
                      {b.kedaluwarsa ? new Date(b.kedaluwarsa).toLocaleDateString("id-ID") : "Tanpa tanggal"}
                      {hari !== null && hari < 0 && (
                        <Badge variant="destructive" className="mt-1">
                          Kedaluwarsa
                        </Badge>
                      )}
                      {hari !== null && hari >= 0 && hari <= 7 && (
                        <Badge
                          variant="outline"
                          className="mt-1 flex w-fit items-center whitespace-nowrap border-transparent bg-warning-bg text-warning-badge-fg"
                        >
                          FEFO: {hari} hari lagi
                        </Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2">
                        <TombolSalin
                          teks={b.kode_sumbangan}
                          label="Salin kode"
                          pesanSukses="Kode sumbangan disalin."
                          variant="outline"
                          className="w-auto rounded-none"
                        />
                        <Button
                          render={<Link href={`/s/${b.kode_sumbangan}`}>Lihat publik</Link>}
                          variant="outline"
                          className="min-h-12 w-auto rounded-none"
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
          </div>
          <BilahHalaman
            awal={awal}
            akhir={akhir}
            total={tampilBatch.length}
            perHalaman={ukuranHalaman}
            onPerHalaman={(nilai) => { setUkuranHalaman(nilai); setHalaman(1); }}
            bisaMundur={halamanAman > 1}
            bisaMaju={halamanAman < totalHalaman}
            onMundur={() => setHalaman((h) => Math.max(1, h - 1))}
            onMaju={() => setHalaman((h) => Math.min(totalHalaman, h + 1))}
            idPilih="ukuran-halaman"
          />
          </div>
        )}
      </section>
        </div>
        <aside className="col-span-12 flex flex-col gap-4 lg:col-span-4">
          <div className="flex flex-col gap-2 lg:sticky lg:top-4">
      <section aria-label="Riwayat intake hari ini" className="flex flex-col gap-2 rounded-none border border-dashed p-4">
        <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[#0B1F2E]">Riwayat intake hari ini</h2>
        {riwayat.length === 0 ? (
          <div role="status" className="flex flex-col gap-2">
            <p className="text-base font-semibold">Belum ada intake batch hari ini</p>
            <p className="text-sm text-muted-foreground">
              Setiap batch yang tersimpan lewat formulir muncul di sini beserta kodenya.
            </p>
            <span aria-hidden="true" className="font-mono text-xs text-muted-foreground">┌ ──┐</span>
            <Button onClick={fokusForm} className="min-h-12 rounded-none">
              Catat batch masuk
            </Button>
            <span aria-hidden="true" className="font-mono text-xs text-muted-foreground">└ ──┘</span>
          </div>
        ) : (
          riwayat.map((r) => (
            <Card key={r.kode} className="rounded-none">
              <CardContent className="flex flex-col gap-1 p-4 text-sm">
                <p className="font-semibold">{r.kode}</p>
                <p className="text-muted-foreground">
                  {r.jumlah} {r.satuan} · {r.sumber} · {r.waktu}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </section>
          </div>
        </aside>
      </div>
    </main>
  );
}
