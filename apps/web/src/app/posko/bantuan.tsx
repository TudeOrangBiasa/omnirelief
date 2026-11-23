"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@omnirelief/ui/components/alert";
import { Badge } from "@omnirelief/ui/components/badge";
import { Button } from "@omnirelief/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@omnirelief/ui/components/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@omnirelief/ui/components/empty";
import { Label } from "@omnirelief/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@omnirelief/ui/components/select";
import { Skeleton } from "@omnirelief/ui/components/skeleton";
import { Textarea } from "@omnirelief/ui/components/textarea";
import { BantuanIstilah } from "@/components/bantuan-istilah";
import { PetaAlurRingkasan } from "@/components/peta-alur";

type Bantuan = {
  id: number;
  kode: string;
  tim: string;
  log_terakhir: { status: string; dibuat_pada: string } | null;
};

type StatusMuat = "memuat" | "siap" | "gagal";

const JENIS = [
  { nilai: "KURANG", label: "Jumlah kurang" },
  { nilai: "RUSAK", label: "Barang rusak" },
  { nilai: "TIDAK_SESUAI", label: "Tidak sesuai pesanan" },
  { nilai: "TIDAK_DITERIMA", label: "Tidak diterima" },
  { nilai: "KIRIM_ULANG", label: "Minta kirim ulang" },
] as const;

export default function BantuanPosko() {
  const [bantuan, setBantuan] = useState<Bantuan[]>([]);
  const [status, setStatus] = useState<StatusMuat>("memuat");
  const [laporId, setLaporId] = useState<number | null>(null);
  const [jenis, setJenis] = useState<string>("KURANG");
  const [keterangan, setKeterangan] = useState("");
  const [galatKeterangan, setGalatKeterangan] = useState<string | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [sibukKonfirmasi, setSibukKonfirmasi] = useState<number | null>(null);
  const [sibukLapor, setSibukLapor] = useState(false);

  async function muat() {
    setStatus("memuat");
    setGalat(null);
    try {
      const res = await fetch("/api/posko/bantuan");
      const data = (await res.json()) as { ok: boolean; bantuan?: Bantuan[]; galat?: string };
      if (data.ok && data.bantuan) {
        setBantuan(data.bantuan);
        setStatus("siap");
      } else {
        setGalat(data.galat ?? "Gagal memuat kiriman.");
        setStatus("gagal");
      }
    } catch {
      setGalat("Jaringan bermasalah. Coba lagi.");
      setStatus("gagal");
    }
  }

  useEffect(() => {
    void muat();
  }, []);

  async function konfirmasi(manifest_id: number) {
    setGalat(null);
    setPesan(null);
    setSibukKonfirmasi(manifest_id);
    try {
      const res = await fetch("/api/posko/konfirmasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manifest_id }),
      });
      const data = (await res.json()) as { ok: boolean; galat?: string };
      if (!data.ok) setGalat(data.galat ?? "Gagal.");
      else {
        setPesan("Penerimaan dikonfirmasi. Terima kasih.");
        toast.success("Penerimaan dikonfirmasi.");
        await muat();
      }
    } catch {
      setGalat("Jaringan bermasalah. Coba lagi.");
    } finally {
      setSibukKonfirmasi(null);
    }
  }

  async function lapor(manifest_id: number) {
    setGalat(null);
    setPesan(null);
    if (keterangan.trim() === "") {
      setGalatKeterangan("Keterangan wajib diisi. Contoh: 10 paket rusak basah.");
      return;
    }
    setGalatKeterangan(null);
    setSibukLapor(true);
    try {
      const res = await fetch("/api/posko/ketidaksesuaian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manifest_id, jenis, keterangan: keterangan.trim() }),
      });
      const data = (await res.json()) as { ok: boolean; galat?: string };
      if (!data.ok) setGalat(data.galat ?? "Gagal.");
      else {
        setPesan("Laporan tampil publik sebagai dokumen terbuka.");
        toast.success("Laporan ketidaksesuaian terkirim.");
        setLaporId(null);
        setKeterangan("");
        await muat();
      }
    } catch {
      setGalat("Jaringan bermasalah. Coba lagi.");
    } finally {
      setSibukLapor(false);
    }
  }

  return (
    <section id="bantuan" aria-label="Bantuan untuk posko ini" className="flex scroll-mt-20 flex-col gap-2">
      <h2 className="text-lg font-bold text-primary">Bantuan untuk posko ini</h2>
      <PetaAlurRingkasan peran="POSKO" langkah="Konfirmasi terima kiriman. Lapor masalah bila ada." />
      <Link href="/transparansi" className="inline-flex min-h-12 w-fit items-center gap-1 text-sm text-primary underline">
        Lihat di halaman publik
      </Link>
      {pesan && (
        <p role="status" className="rounded-xl bg-success-bg p-3 text-sm text-success">
          {pesan}
        </p>
      )}
      {galat && (
        <Alert variant="destructive" role="alert">
          <AlertTitle>Gagal</AlertTitle>
          <AlertDescription>{galat}</AlertDescription>
        </Alert>
      )}
      {status === "memuat" && (
        <div role="status" aria-label="Memuat kiriman" className="flex flex-col gap-2">
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-24 w-full" />
        </div>
      )}
      {status === "gagal" && (
        <Button onClick={() => void muat()} variant="outline" className="min-h-12">
          Coba lagi
        </Button>
      )}
      {status === "siap" && bantuan.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Belum ada kiriman</EmptyTitle>
            <EmptyDescription>
              Kiriman bantuan dari BPBD muncul di sini setelah dipublikasikan.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}
      {status === "siap" &&
        bantuan.map((b) => {
          const diterima = b.log_terakhir?.status === "DITERIMA";
          const sibuk = sibukKonfirmasi !== null || sibukLapor;
          return (
            <Card key={b.id}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  {b.kode}
                  {diterima ? (
                    <Badge className="border-transparent bg-success-bg text-success">Diterima</Badge>
                  ) : (
                    <Badge variant="outline">{b.log_terakhir?.status ?? "Baru"}</Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                {!diterima && (
                  <div className="flex gap-2">
                    <Button
                      onClick={() => void konfirmasi(b.id)}
                      disabled={sibuk}
                      className="min-h-12 flex-1 bg-success text-white hover:bg-success/80"
                    >
                      {sibukKonfirmasi === b.id ? "Mengonfirmasi..." : "Konfirmasi terima"}
                    </Button>
                    <Button
                      variant="outline"
                      disabled={sibuk}
                      onClick={() => {
                        setLaporId(laporId === b.id ? null : b.id);
                        setGalatKeterangan(null);
                      }}
                      className="min-h-12 flex-1"
                    >
                      Lapor masalah
                    </Button>
                  </div>
                )}
                {laporId === b.id && !diterima && (
                  <div className="flex flex-col gap-2">
                    <div className="flex flex-col gap-1">
                      <Label htmlFor={`lapor-jenis-${b.id}`}>Jenis masalah</Label>
                      <Select value={jenis} onValueChange={(v) => setJenis(v ?? "KURANG")}>
                        <SelectTrigger id={`lapor-jenis-${b.id}`} className="min-h-12">
                          <SelectValue placeholder="Jenis masalah" />
                        </SelectTrigger>
                        <SelectContent>
                          {JENIS.map((j) => (
                            <SelectItem key={j.nilai} value={j.nilai}>
                              {j.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="flex flex-col gap-1">
                      <Label htmlFor={`lapor-keterangan-${b.id}`}>Keterangan</Label>
                      <Textarea
                        id={`lapor-keterangan-${b.id}`}
                        value={keterangan}
                        onChange={(e) => setKeterangan(e.target.value)}
                        placeholder="Contoh: 10 paket rusak basah"
                        className="min-h-12"
                        maxLength={500}
                        aria-invalid={galatKeterangan ? true : undefined}
                        aria-describedby={galatKeterangan ? `lapor-keterangan-${b.id}-galat` : undefined}
                      />
                      {galatKeterangan && (
                        <p id={`lapor-keterangan-${b.id}-galat`} role="alert" className="text-sm text-destructive">
                          {galatKeterangan}
                        </p>
                      )}
                    </div>
                    <Button
                      variant="destructive"
                      onClick={() => void lapor(b.id)}
                      disabled={sibuk}
                      className="min-h-12"
                    >
                      {sibukLapor ? "Mengirim..." : "Kirim laporan publik"}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      <p className="text-muted-foreground text-xs">
        Laporan tersimpan <BantuanIstilah istilah="append-only" label="append-only" />. Tidak bisa
        diubah atau dihapus.
      </p>
    </section>
  );
}
