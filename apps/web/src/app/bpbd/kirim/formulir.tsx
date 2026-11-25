"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import QRCode from "qrcode";
import { toast } from "sonner";
import {
  DangerTriangleIcon,
  LockKeyholeMinimalisticIcon,
  QrCodeIcon,
} from "@solar-icons/react/linear";
import { Alert, AlertDescription, AlertTitle } from "@omnirelief/ui/components/alert";
import { Badge } from "@omnirelief/ui/components/badge";
import { Button } from "@omnirelief/ui/components/button";
import { Card, CardContent } from "@omnirelief/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@omnirelief/ui/components/dialog";
import { Input } from "@omnirelief/ui/components/input";
import { Label } from "@omnirelief/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@omnirelief/ui/components/select";
import { Skeleton } from "@omnirelief/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@omnirelief/ui/components/table";
import { cn } from "@omnirelief/ui/lib/utils";
import { baris } from "@/lib/supabase/baris";
import { sisaHariKalender } from "@/lib/tanggal";
import { BantuanIstilah } from "@/components/bantuan-istilah";
import { BarisSegarkan } from "@/components/kepala-halaman";
import { TombolSudut } from "@/components/widget-laporan";

type Posko = { id: number; nama: string; wilayah: string };

type Batch = {
  id: number;
  kode_sumbangan: string;
  item_nama: string;
  satuan: string;
  kedaluwarsa: string | null;
  sisa: number;
};

type Baris = { batch_id: number; jumlah: number };

type Kebutuhan = { posko_id: number; butuh: number; diterima: number; selisih: number };

function urutFefo(daftar: Batch[]): Batch[] {
  return [...daftar].sort((a, b) => {
    if (a.kedaluwarsa === b.kedaluwarsa) return 0;
    if (a.kedaluwarsa === null) return 1;
    if (b.kedaluwarsa === null) return -1;
    return a.kedaluwarsa < b.kedaluwarsa ? -1 : 1;
  });
}

function labelBatch(b: Batch): string {
  const exp = b.kedaluwarsa
    ? ` · kedaluwarsa ${new Date(b.kedaluwarsa).toLocaleDateString("id-ID")}`
    : " · tanpa tanggal kedaluwarsa";
  return `${b.kode_sumbangan} · ${b.item_nama} · sisa ${b.sisa} ${b.satuan}${exp}`;
}

function labelKedaluwarsa(b: Batch): { teks: string; lewat: boolean; dekat: boolean } {
  if (b.kedaluwarsa === null) {
    return { teks: "Tanpa tanggal kedaluwarsa", lewat: false, dekat: false };
  }
  const tgl = new Date(b.kedaluwarsa).toLocaleDateString("id-ID");
  const hari = sisaHariKalender(b.kedaluwarsa);
  if (hari < 0) return { teks: `Kedaluwarsa ${tgl}. Jangan dipakai`, lewat: true, dekat: false };
  if (hari <= 7) return { teks: `Sisa ${hari} hari (${tgl}), FEFO`, lewat: false, dekat: true };
  return { teks: `Sisa ${hari} hari (${tgl})`, lewat: false, dekat: false };
}

function IsiFormulirKirim() {
  const cariPosko = useSearchParams();
  const [posko, setPosko] = useState<Posko[]>([]);
  const [batch, setBatch] = useState<Batch[]>([]);
  const [poskoId, setPoskoId] = useState("");
  const [tim, setTim] = useState("");
  const [cariBatch, setCariBatch] = useState("");
  const [barisKirim, setBarisKirim] = useState<Baris[]>([{ batch_id: 0, jumlah: 0 }]);
  const [kebutuhan, setKebutuhan] = useState<Kebutuhan[]>([]);
  const [draf, setDraf] = useState<{ id: number; kode: string; peringatan: string[] } | null>(null);
  const [hasil, setHasil] = useState<{ kode: string; url_publik: string; qr: string } | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [sibuk, setSibuk] = useState(false);
  const [tanyaKunci, setTanyaKunci] = useState(false);
  const [poskoOtomatis, setPoskoOtomatis] = useState(false);
  const [diperbarui, setDiperbarui] = useState("");

  useEffect(() => {
    void (async () => {
      setMemuat(true);
      try {
        const [rp, rb, rk] = await Promise.all([
          fetch("/api/bpbd/posko").then((r) => r.json()),
          fetch("/api/gudang/batch").then((r) => r.json()),
          fetch("/api/bpbd/prioritas").then((r) => r.json()),
        ]);
        const dp: unknown = rp;
        const db: unknown = rb;
        const dk: unknown = rk;
        if (typeof dp === "object" && dp !== null && "ok" in dp && dp.ok === true && "posko" in dp) {
          setPosko(baris<Posko>(dp.posko));
        }
        if (typeof db === "object" && db !== null && "ok" in db && db.ok === true && "batch" in db) {
          setBatch(urutFefo(baris<Batch>(db.batch).filter((x) => x.sisa > 0)));
        }
        if (typeof dk === "object" && dk !== null && "ok" in dk && dk.ok === true && "prioritas" in dk) {
          setKebutuhan(baris<Kebutuhan>(dk.prioritas));
        }
      } catch {
        setGalat("Gagal memuat posko dan batch. Coba muat ulang halaman.");
      } finally {
        setDiperbarui(new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date()));
        setMemuat(false);
      }
    })();
  }, []);

  useEffect(() => {
    if (poskoOtomatis || posko.length === 0) return;
    const mentah = cariPosko.get("posko")?.trim().toLowerCase();
    if (!mentah) return;
    const cocok = posko.find(
      (p) => String(p.id) === mentah || p.nama.toLowerCase().includes(mentah),
    );
    if (cocok) {
      setPoskoId(String(cocok.id));
      setPoskoOtomatis(true);
    }
  }, [cariPosko, posko, poskoOtomatis]);

  const idDipilih = new Set(barisKirim.filter((r) => r.batch_id > 0).map((r) => r.batch_id));
  const expDipilih = barisKirim
    .map((r) => batch.find((b) => b.id === r.batch_id)?.kedaluwarsa ?? null)
    .filter((e): e is string => e !== null);
  const terlewat = batch.filter((b) => {
    if (b.kedaluwarsa === null || idDipilih.has(b.id)) return false;
    const exp: string = b.kedaluwarsa;
    return expDipilih.some((e) => exp < e);
  });
  const poskoTujuan = posko.find((p) => String(p.id) === poskoId) ?? null;
  const butuhTujuan = kebutuhan.find((k) => String(k.posko_id) === poskoId) ?? null;

  function isiOtomatisFefo() {
    const layak = batch.filter(
      (b) =>
        b.sisa > 0 &&
        (b.kedaluwarsa === null || sisaHariKalender(b.kedaluwarsa) >= 0) &&
        !barisKirim.some((r) => r.batch_id === b.id),
    );
    if (layak.length === 0) return;
    const ganti = [...barisKirim];
    const sisa: Baris[] = [];
    for (const b of layak) {
      const barisBaru = { batch_id: b.id, jumlah: b.sisa };
      const idx = ganti.findIndex((r) => r.batch_id === 0);
      if (idx >= 0) ganti[idx] = barisBaru;
      else sisa.push(barisBaru);
    }
    setBarisKirim([...ganti, ...sisa]);
  }
  const ringkasKirim = barisKirim
    .filter((r) => r.batch_id > 0 && r.jumlah > 0)
    .map((r) => {
      const b = batch.find((x) => x.id === r.batch_id);
      return {
        batch_id: r.batch_id,
        kode: b?.kode_sumbangan ?? `Batch ${r.batch_id}`,
        item: b?.item_nama ?? "-",
        satuan: b?.satuan ?? "",
        jumlah: r.jumlah,
      };
    });
  const totalKirim = ringkasKirim.reduce((s, r) => s + r.jumlah, 0);
  const cekMasuk = new Date(Date.now() + Math.max(30, totalKirim * 2) * 60000);
  const cekMasukTeks = new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "long",
    hour: "2-digit",
    minute: "2-digit",
  }).format(cekMasuk);

  const kataKunci = cariBatch.trim().toLowerCase();
  const batchTampil = batch.filter(
    (b) =>
      kataKunci === "" ||
      b.kode_sumbangan.toLowerCase().includes(kataKunci) ||
      b.item_nama.toLowerCase().includes(kataKunci),
  );

  function pakaiBatch(id: number) {
    if (barisKirim.some((r) => r.batch_id === id)) return;
    const kosong = barisKirim.findIndex((r) => r.batch_id === 0);
    if (kosong >= 0) {
      const ganti = [...barisKirim];
      const lama = ganti[kosong];
      if (lama) ganti[kosong] = { ...lama, batch_id: id };
      setBarisKirim(ganti);
    } else {
      setBarisKirim([...barisKirim, { batch_id: id, jumlah: 0 }]);
    }
  }

  async function buatDraf() {
    setSibuk(true);
    setGalat(null);
    try {
      const res = await fetch("/api/bpbd/manifest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          posko_id: Number(poskoId),
          tim,
          items: barisKirim.filter((r) => r.batch_id > 0 && r.jumlah > 0),
        }),
      });
      const data: unknown = await res.json();
      const ok = typeof data === "object" && data !== null && "ok" in data && data.ok === true;
      const id = ok && "id" in data && typeof data.id === "number" ? data.id : null;
      const kode = ok && "kode" in data && typeof data.kode === "string" ? data.kode : null;
      if (ok && id !== null && kode !== null) {
        const mentahPeringatan = "peringatan" in data ? data.peringatan : [];
        const peringatan = Array.isArray(mentahPeringatan)
          ? mentahPeringatan.filter((p): p is string => typeof p === "string")
          : [];
        setDraf({ id, kode, peringatan });
        toast.success(`Draf ${kode} tersimpan.`);
      } else {
        setGalat(
          typeof data === "object" && data !== null && "galat" in data
            ? String(data.galat)
            : "Gagal membuat draf.",
        );
      }
    } catch {
      setGalat("Jaringan bermasalah. Coba lagi.");
    } finally {
      setSibuk(false);
    }
  }

  async function publikasikan() {
    if (!draf) return;
    setSibuk(true);
    setGalat(null);
    try {
      const res = await fetch(`/api/bpbd/manifest/${draf.id}/publikasi`, { method: "POST" });
      const data: unknown = await res.json();
      const ok = typeof data === "object" && data !== null && "ok" in data && data.ok === true;
      const kode = ok && "kode" in data && typeof data.kode === "string" ? data.kode : null;
      const url =
        ok && "url_publik" in data && typeof data.url_publik === "string" ? data.url_publik : null;
      if (ok && kode !== null && url !== null) {
        const qr = await QRCode.toDataURL(`${window.location.origin}${url}`, {
          width: 256,
          margin: 2,
        });
        setHasil({ kode, url_publik: url, qr });
        toast.success(`Manifest ${kode} terkunci publik.`);
      } else {
        setGalat(
          typeof data === "object" && data !== null && "galat" in data
            ? String(data.galat)
            : "Gagal mempublikasikan.",
        );
      }
    } catch {
      setGalat("Jaringan bermasalah. Coba lagi.");
    } finally {
      setSibuk(false);
    }
  }

  if (memuat) {
    return (
      <div className="flex flex-col gap-4" aria-hidden="true">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Manifest · FEFO
        </p>
        <BarisSegarkan
          diperbarui={diperbarui}
          memuat={false}
          onMuat={() => window.location.reload()}
          sebaris
        />
      </div>
      <section aria-label="Ringkasan stok" className="grid grid-cols-3 gap-3 rounded-none border bg-[#DCE8EE] p-4">
        <div className="border bg-card p-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Batch tersedia</p>
          <p className="text-4xl font-light tabular-nums text-primary">{batch.length}</p>
        </div>
        <div className="border bg-card p-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Paket tersedia</p>
          <p className="text-4xl font-light tabular-nums text-primary">{batch.reduce((s, b) => s + Math.max(0, b.sisa), 0)}</p>
        </div>
        <div className="border bg-card p-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Posko tujuan</p>
          <p className="text-4xl font-light tabular-nums text-primary">{posko.length}</p>
        </div>
      </section>
      {galat && (
        <Alert variant="destructive">
          <DangerTriangleIcon aria-hidden="true" />
          <AlertTitle>Gagal</AlertTitle>
          <AlertDescription>{galat}</AlertDescription>
        </Alert>
      )}
      {hasil ? (
        <Card className="border-transparent bg-success-bg">
          <CardContent className="flex flex-col items-center gap-2 p-4 text-sm text-success">
            <Badge className="border-transparent bg-success text-white">
              <LockKeyholeMinimalisticIcon aria-hidden="true" />
              TERKUNCI
            </Badge>
            <p className="font-bold">Manifest {hasil.kode} terkunci publik.</p>
            <p className="text-muted-foreground text-xs">
              Dikunci dengan <BantuanIstilah istilah="hash-pengunci" label="hash pengunci SHA-256" />.
              Tidak bisa diubah atau dihapus.
            </p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hasil.qr} alt={`QR manifest ${hasil.kode}`} width={256} height={256} />
            <a href={hasil.url_publik} className="inline-flex min-h-12 items-center gap-1 underline">
              <QrCodeIcon aria-hidden="true" />
              Buka halaman publik manifest
            </a>
          </CardContent>
        </Card>
      ) : draf ? (
        <Card>
          <CardContent className="flex flex-col gap-2 p-4 text-sm">
            <p className="font-bold">Draf {draf.kode} tersimpan.</p>
            {draf.peringatan.length > 0 && (
              <p role="status" className="text-warning">
                Peringatan FEFO: batch {draf.peringatan.join(", ")} kedaluwarsa lebih
                dekat tapi tidak dipakai. Pakai yang terdekat dulu agar tidak kedaluwarsa
                di gudang.
              </p>
            )}
            <Button
              onClick={() => setTanyaKunci(true)}
              disabled={sibuk}
              className="min-h-12 w-full"
            >
              Publikasikan dan kunci
            </Button>
            <Dialog open={tanyaKunci} onOpenChange={(buka) => !buka && setTanyaKunci(false)}>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Periksa akhir manifest {draf.kode}</DialogTitle>
                  <DialogDescription>
                    Manifest terkunci permanen dengan hash SHA-256 dan tidak bisa diubah atau dihapus.
                    Periksa ringkasan di bawah sebelum mengunci.
                  </DialogDescription>
                </DialogHeader>
                <dl className="flex flex-col gap-2 text-sm">
                  <div className="flex flex-col gap-1 border p-3">
                    <dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Posko tujuan</dt>
                    <dd className="font-semibold">{poskoTujuan ? `${poskoTujuan.nama} (${poskoTujuan.wilayah})` : "-"}</dd>
                  </div>
                  <div className="flex flex-col gap-1 border p-3">
                    <dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Tim distribusi</dt>
                    <dd className="font-semibold">{tim.trim() === "" ? "-" : tim.trim()}</dd>
                  </div>
                  <div className="flex flex-col gap-1 border p-3">
                    <dt className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Estimasi waktu check-in</dt>
                    <dd className="font-semibold">Sekitar {cekMasukTeks}</dd>
                  </div>
                </dl>
                <div className="overflow-x-auto border">
                  <Table>
                    <TableHeader className="bg-[#0B1F2E]">
                      <TableRow className="hover:bg-[#0B1F2E]">
                        <TableHead className="font-mono text-[11px] uppercase tracking-widest text-white">Barang</TableHead>
                        <TableHead className="font-mono text-[11px] uppercase tracking-widest text-white">Kode batch</TableHead>
                        <TableHead className="font-mono text-[11px] uppercase tracking-widest text-white">Jumlah</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ringkasKirim.map((r) => (
                        <TableRow key={r.batch_id}>
                          <TableCell>{r.item}</TableCell>
                          <TableCell className="font-mono text-xs break-all">{r.kode}</TableCell>
                          <TableCell className="tabular-nums">{r.jumlah} {r.satuan}</TableCell>
                        </TableRow>
                      ))}
                      <TableRow>
                        <TableCell colSpan={2} className="font-semibold">Total</TableCell>
                        <TableCell className="font-semibold tabular-nums">{totalKirim}</TableCell>
                      </TableRow>
                    </TableBody>
                  </Table>
                </div>
                {terlewat.length > 0 ? (
                  <p role="status" className="rounded-none bg-warning-bg p-3 text-sm text-warning">
                    Peringatan FEFO: {terlewat.map((b) => `${b.kode_sumbangan} (${new Date(b.kedaluwarsa ?? "").toLocaleDateString("id-ID")})`).join(", ")} kedaluwarsanya lebih dekat tapi tidak ikut dipakai. Pakai yang terdekat dulu agar tidak kedaluwarsa di gudang.
                  </p>
                ) : (
                  <p role="status" className="rounded-none bg-success-bg p-3 text-sm text-success">
                    Aman: semua batch terdekat ikut dipakai.
                  </p>
                )}
                <DialogFooter>
                  <Button
                    variant="outline"
                    onClick={() => setTanyaKunci(false)}
                    disabled={sibuk}
                    className="min-h-12 flex-1 rounded-none"
                  >
                    Kembali untuk ubah
                  </Button>
                  <Button
                    onClick={() => {
                      setTanyaKunci(false);
                      void publikasikan();
                    }}
                    disabled={sibuk}
                    className="min-h-12 flex-1 rounded-none"
                  >
                    {sibuk ? "Mengunci..." : "Kunci permanen"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </CardContent>
        </Card>
      ) : batch.length === 0 ? (
        <div role="status" className="flex flex-col gap-2 rounded-none border border-dashed p-4">
          <p className="text-base font-semibold">Belum ada manifest perlu dicek</p>
          <p className="text-sm text-muted-foreground">
            Gudang belum mencatat batch dengan sisa stok. Isi stok dulu sebelum membuat manifest.
          </p>
          <TombolSudut>
            <Button onClick={() => window.location.reload()} variant="outline" className="min-h-12 w-full rounded-none">
              Muat ulang data
            </Button>
          </TombolSudut>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <Label htmlFor="kirim-posko">Posko tujuan</Label>
            <Select value={poskoId} onValueChange={(v) => setPoskoId(v ?? "")}>
              <SelectTrigger id="kirim-posko" className="min-h-12">
                <SelectValue placeholder="Pilih posko" />
              </SelectTrigger>
              <SelectContent>
                {posko.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.nama} ({p.wilayah})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="kirim-tim">Tim distribusi</Label>
            <Input
              id="kirim-tim"
              value={tim}
              onChange={(e) => setTim(e.target.value)}
              placeholder="Tim Antar 1"
              className="min-h-12"
            />
          </div>
          {poskoId !== "" && (
            <div
              role="status"
              aria-label="Kalkulator alokasi"
              className="flex flex-col gap-1 rounded-none garis-rambut-diam bg-white p-3 text-sm"
            >
              <p className="font-semibold">
                {poskoTujuan?.nama ?? "Posko"} butuh {butuhTujuan?.butuh ?? 0} jiwa
                {butuhTujuan ? ` · sudah diterima ${butuhTujuan.diterima}` : ""}
              </p>
              <p className="text-muted-foreground tabular-nums">
                Alokasi draf: {totalKirim} paket dari {ringkasKirim.length} batch.
                {butuhTujuan && butuhTujuan.selisih > 0
                  ? ` Kurang ${butuhTujuan.selisih} jiwa, tambah batch agar cukup.`
                  : " Cukup untuk tutup selisih."}
              </p>
            </div>
          )}
          <div className="flex flex-col gap-2">
            <h2 className="text-base font-bold text-primary">Stok batch (<BantuanIstilah istilah="fefo" label="FEFO" />)</h2>
            <p className="text-sm text-muted-foreground">
              Urut kedaluwarsa terdekat di atas. Pilih dari sini agar batch yang cepat
              kedaluwarsa keluar duluan.
            </p>
            <div className="flex flex-col gap-1">
              <Label htmlFor="cari-batch">Cari batch</Label>
              <Input
                id="cari-batch"
                value={cariBatch}
                onChange={(e) => setCariBatch(e.target.value)}
                placeholder="Cari kode sumbangan atau nama barang…"
                className="min-h-12"
              />
            </div>
            {batchTampil.length === 0 ? (
              <p className="text-sm text-muted-foreground" role="status">
                Tidak ada batch yang cocok dengan pencarian.
              </p>
            ) : (
              <div className="overflow-x-auto border">
              <Table>
                <TableHeader className="bg-[#0B1F2E]">
                  <TableRow className="hover:bg-[#0B1F2E]">
                    <TableHead className="font-mono text-[11px] uppercase tracking-widest text-white">Kode</TableHead>
                    <TableHead className="font-mono text-[11px] uppercase tracking-widest text-white">Barang</TableHead>
                    <TableHead className="font-mono text-[11px] uppercase tracking-widest text-white">Sisa</TableHead>
                    <TableHead className="font-mono text-[11px] uppercase tracking-widest text-white">Kedaluwarsa</TableHead>
                    <TableHead className="font-mono text-[11px] uppercase tracking-widest text-white">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {batchTampil.map((b) => {
                    const exp = labelKedaluwarsa(b);
                    const sudah = barisKirim.some((r) => r.batch_id === b.id);
                    return (
                      <TableRow key={b.id}>
                        <TableCell className="font-mono text-xs break-all">{b.kode_sumbangan}</TableCell>
                        <TableCell>{b.item_nama}</TableCell>
                        <TableCell className="tabular-nums">
                          {b.sisa} {b.satuan}
                        </TableCell>
                        <TableCell
                          className={cn(
                            exp.lewat
                              ? "text-destructive"
                              : exp.dekat
                                ? "text-warning"
                                : "text-muted-foreground",
                          )}
                        >
                          {exp.teks}
                        </TableCell>
                        <TableCell>
                          {sudah ? (
                            <Badge className="border-transparent bg-success-bg text-success">
                              Dipilih
                            </Badge>
                          ) : (
                            <Button
                              variant="outline"
                              onClick={() => pakaiBatch(b.id)}
                              className="min-h-12"
                            >
                              Pakai
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
              </div>
            )}
          </div>
          {terlewat.length > 0 && (
            <p role="status" className="rounded-none bg-warning-bg p-3 text-sm text-warning">
              Peringatan FEFO: {terlewat.map((b) => b.kode_sumbangan).join(", ")} kedaluwarsa
              lebih dekat tapi belum dipilih. Pakai yang terdekat dulu agar tidak kedaluwarsa
              di gudang.
            </p>
          )}
          {barisKirim.map((r, i) => (
            <div key={i} className="flex gap-2">
              <Select
                value={String(r.batch_id)}
                onValueChange={(v) => {
                  const ganti = [...barisKirim];
                  ganti[i] = { ...r, batch_id: Number(v) };
                  setBarisKirim(ganti);
                }}
              >
                <SelectTrigger className="min-h-12 flex-1" aria-label={`Batch baris ${i + 1}`}>
                  <SelectValue placeholder="Pilih batch (terdekat kedaluwarsa di atas)" />
                </SelectTrigger>
                <SelectContent>
                  {batch.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {labelBatch(b)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={1}
                value={r.jumlah || ""}
                placeholder="Jumlah"
                aria-label={`Jumlah baris ${i + 1}`}
                onChange={(e) => {
                  const ganti = [...barisKirim];
                  ganti[i] = { ...r, jumlah: Number(e.target.value) };
                  setBarisKirim(ganti);
                }}
                className="min-h-12 w-28"
              />
              {barisKirim.length > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setBarisKirim(barisKirim.filter((_, j) => j !== i))}
                  className="min-h-12"
                  aria-label={`Hapus baris ${i + 1}`}
                >
                  Hapus
                </Button>
              )}
            </div>
          ))}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              variant="outline"
              onClick={() => setBarisKirim([...barisKirim, { batch_id: 0, jumlah: 0 }])}
              className="min-h-12 flex-1 rounded-none"
            >
              Tambah batch
            </Button>
            <Button
              variant="outline"
              onClick={() => isiOtomatisFefo()}
              className="min-h-12 flex-1 rounded-none"
            >
              Isi otomatis FEFO
            </Button>
          </div>
          <div className="sticky bottom-4 z-10 flex flex-col gap-2 rounded-none border border-[#0B1F2E] bg-[#0B1F2E] p-3 text-white shadow-lg sm:flex-row sm:items-center">
            <p role="status" className="flex-1 text-sm font-semibold tabular-nums">
              {totalKirim} paket dari {ringkasKirim.length} batch
              {butuhTujuan ? ` · butuh ${butuhTujuan.butuh} jiwa` : ""}
            </p>
            <Button
              onClick={() => void buatDraf()}
              disabled={sibuk || poskoId === "" || tim.trim() === ""}
              className="min-h-12 flex-1 rounded-none bg-[#1B7FBF] text-white hover:bg-[#0B1F2E] sm:flex-none sm:px-8"
            >
              {sibuk ? "Menyimpan..." : "Simpan draf"}
            </Button>
          </div>
        </>
      )}
    </div>
  );
}

export default function FormulirKirim() {
  return (
    <Suspense>
      <IsiFormulirKirim />
    </Suspense>
  );
}
