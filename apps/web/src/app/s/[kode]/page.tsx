"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import QRCode from "qrcode";
import { toast } from "sonner";
import {
  ArrowLeftIcon,
  CopyIcon,
  MagnifierIcon,
} from "@solar-icons/react/linear";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@omnirelief/ui/components/alert";
import { Badge } from "@omnirelief/ui/components/badge";
import { Button } from "@omnirelief/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@omnirelief/ui/components/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@omnirelief/ui/components/empty";
import {
  Progress,
  ProgressLabel,
} from "@omnirelief/ui/components/progress";
import { Skeleton } from "@omnirelief/ui/components/skeleton";
import { baris, tunggal } from "@/lib/supabase/baris";

type StatusMuat = "memuat" | "siap" | "kosong" | "gagal";
type PakaiRow = {
  jumlah: number;
  kode: string;
  posko_nama: string;
  tanggal: string | null;
};

type SumbanganApi = {
  kode_sumbangan: string;
  item_nama: string;
  satuan: string;
  jumlah: number;
  tgl_masuk: string;
  kedaluwarsa: string | null;
  sumber: string;
  dialokasikan: number;
  tersisa: number;
  dipakai: unknown;
};

function tanggal(t: string) {
  return new Date(t).toLocaleDateString("id-ID");
}

export default function SumbanganPage({
  params,
}: {
  params: Promise<{ kode: string }>;
}) {
  const { kode } = use(params);
  const [status, setStatus] = useState<StatusMuat>("memuat");
  const [sumbangan, setSumbangan] = useState<SumbanganApi | null>(null);
  const [qr, setQr] = useState("");

  const muat = useCallback(() => {
    setStatus("memuat");
    setSumbangan(null);
    fetch(`/api/publik/sumbangan?kode=${encodeURIComponent(kode)}`)
      .then((r) => {
        if (r.status === 404) {
          setStatus("kosong");
          return null;
        }
        if (!r.ok) {
          setStatus("gagal");
          return null;
        }
        return r.json();
      })
      .then((d: { ok: boolean; sumbangan?: unknown } | null) => {
        if (d === null) return;
        const s = tunggal<SumbanganApi>(d.sumbangan);
        if (d.ok && s) {
          setSumbangan(s);
          setStatus("siap");
        } else if (!d.ok && !s) {
          setStatus("kosong");
        } else {
          setStatus("gagal");
        }
      })
      .catch(() => setStatus("gagal"));
  }, [kode]);

  useEffect(() => {
    muat();
  }, [muat]);

  useEffect(() => {
    if (status !== "siap" || !sumbangan) return;
    let aktif = true;
    setQr("");
    QRCode.toDataURL(`${window.location.origin}/s/${sumbangan.kode_sumbangan}`, {
      width: 256,
      margin: 2,
    })
      .then((u) => {
        if (aktif) setQr(u);
      })
      .catch(() => {
        if (aktif) setQr("");
      });
    return () => {
      aktif = false;
    };
  }, [status, sumbangan]);

  async function salinTautan() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Tautan disalin");
    } catch {
      toast.error("Gagal menyalin tautan");
    }
  }

  const dipakai = sumbangan ? baris<PakaiRow>(sumbangan.dipakai) : [];
  const persen =
    sumbangan && sumbangan.jumlah > 0
      ? Math.round((sumbangan.dialokasikan / sumbangan.jumlah) * 100)
      : 0;
  const penuh = !!sumbangan && sumbangan.jumlah > 0 && sumbangan.tersisa <= 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 p-6">
      <Link
        href="/transparansi"
        className="inline-flex min-h-12 items-center gap-2 text-sm text-primary underline"
      >
        <ArrowLeftIcon aria-hidden="true" />
        Kembali ke Transparansi
      </Link>

      {status === "memuat" && (
        <div
          role="status"
          aria-label="Memuat sumbangan"
          className="flex flex-col gap-4"
        >
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-24 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
      )}

      {status === "gagal" && (
        <Alert variant="destructive">
          <AlertTitle>Gagal memuat sumbangan</AlertTitle>
          <AlertDescription>
            Periksa koneksi lalu coba lagi.
          </AlertDescription>
          <Button onClick={muat} className="mt-3 min-h-12 w-fit">
            Coba lagi
          </Button>
        </Alert>
      )}

      {status === "kosong" && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MagnifierIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Sumbangan tidak ditemukan</EmptyTitle>
            <EmptyDescription>
              Kode {kode} tidak dikenal. Periksa kembali kode DNT- pada
              dokumen serah terima.
            </EmptyDescription>
          </EmptyHeader>
          <Button render={<Link href="/transparansi" />} className="mt-4 min-h-12">
            Kembali ke Transparansi
          </Button>
        </Empty>
      )}

      {status === "siap" && sumbangan && (
        <>
          <div>
            <h1 className="font-mono text-2xl font-bold">
              {sumbangan.kode_sumbangan}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {sumbangan.jumlah} {sumbangan.satuan} {sumbangan.item_nama} ·
              masuk {tanggal(sumbangan.tgl_masuk)}
              {sumbangan.kedaluwarsa
                ? ` · kedaluwarsa ${tanggal(sumbangan.kedaluwarsa)}`
                : ""}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-6 lg:col-span-2">
              <Card className="bg-white rounded-xl border border-slate-200 shadow-xs">
                <CardHeader>
                  <CardTitle>Alokasi</CardTitle>
                  <CardDescription>
                    Terpakai {sumbangan.dialokasikan} dari {sumbangan.jumlah} {sumbangan.satuan}.
                  </CardDescription>
                </CardHeader>
                <CardContent className="flex flex-col gap-2">
                  {penuh ? (
                    <Badge className="rounded-full border-transparent bg-success-bg text-success-badge-fg">
                      Penuh · 100%
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="rounded-full">
                      Terpakai {persen}%
                    </Badge>
                  )}
                  <Progress value={persen} indicatorClassName={penuh ? "bg-success" : undefined}>
                    <ProgressLabel>Terpakai</ProgressLabel>
                    <span className="ml-auto text-xs text-muted-foreground tabular-nums">{persen}%</span>
                  </Progress>
                  <p role="status" className="text-sm text-muted-foreground tabular-nums">
                    Dialokasikan {sumbangan.dialokasikan} dari {sumbangan.jumlah}{" "}
                    {sumbangan.satuan} · tersisa {sumbangan.tersisa}{" "}
                    {sumbangan.satuan}
                  </p>
                </CardContent>
              </Card>

              <Card className="bg-white rounded-xl border border-slate-200 shadow-xs">
                <CardHeader>
                  <CardTitle>Dipakai di manifest ({dipakai.length})</CardTitle>
                  <CardDescription>
                    Daftar manifest yang memakai batch ini, dari hash chain.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {dipakai.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Belum dialokasikan ke manifest mana pun.
                    </p>
                  ) : (
                    <ul className="flex flex-col gap-2">
                      {dipakai.map((p) => (
                        <li key={p.kode}>
                          <Link
                            href={`/m/${p.kode}`}
                            className="flex min-h-12 items-center justify-between gap-2 rounded-xl border border-slate-200 bg-white p-3 text-sm shadow-xs"
                          >
                            <span className="font-mono font-semibold text-primary">
                              {p.kode}
                            </span>
                            <span className="text-right text-muted-foreground tabular-nums">
                              {p.jumlah} {sumbangan.satuan} untuk {p.posko_nama}
                              {p.tanggal ? ` · ${tanggal(p.tanggal)}` : ""}
                            </span>
                          </Link>
                        </li>
                      ))}
                    </ul>
                  )}
                </CardContent>
              </Card>
            </div>

            <aside aria-label="Verifikasi publik" className="lg:col-span-1">
              <div className="flex flex-col gap-6 lg:sticky lg:top-24">
                <Card className="bg-white rounded-xl border border-slate-200 shadow-xs">
                  <CardHeader className="items-center text-center">
                    <CardTitle>Verifikasi Publik</CardTitle>
                    <CardDescription>
                      Pindai QR untuk membuka halaman ini
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="flex flex-col items-center gap-3 text-center">
                    {qr ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={qr}
                        alt={`QR sumbangan ${sumbangan.kode_sumbangan}`}
                        width={256}
                        height={256}
                        className="size-64 rounded-xl border border-slate-200"
                      />
                    ) : (
                      <Skeleton className="size-64 rounded-xl" />
                    )}
                    <Badge className="rounded-full border-transparent bg-success-bg text-success">
                      TERCATAT dan TERLACAK
                    </Badge>
                    <p className="font-mono text-sm font-semibold">{sumbangan.kode_sumbangan}</p>
                    <p className="text-xs text-muted-foreground">
                      Sumber: {sumbangan.sumber}
                    </p>
                    <Button onClick={salinTautan} className="min-h-12 w-full">
                      <CopyIcon aria-hidden="true" />
                      Salin Tautan
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </aside>
          </div>
        </>
      )}
    </main>
  );
}
