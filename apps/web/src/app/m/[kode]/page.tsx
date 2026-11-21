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
import { Skeleton } from "@omnirelief/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@omnirelief/ui/components/table";
import { baris, tunggal } from "@/lib/supabase/baris";

type StatusMuat = "memuat" | "siap" | "kosong" | "gagal";

type BarangRow = {
  jumlah: number;
  kode_sumbangan: string;
  item_nama: string;
  satuan: string;
  kedaluwarsa: string | null;
};

type RiwayatRow = {
  status: string;
  catatan: string | null;
  dibuat_pada: string;
  aktor: string | null;
};

type BatalRow = {
  alasan: string;
  dibuat_pada: string;
};

type LaporRow = {
  jenis: string;
  keterangan: string;
  dibuat_pada: string;
};

type ManifestApi = {
  kode: string;
  status: string;
  tim: string;
  hash: string;
  dipublikasikan_pada: string;
  posko_nama: string;
  wilayah: string;
  items: unknown;
  riwayat: unknown;
  pembatalan: unknown;
  ketidaksesuaian: unknown;
};

function tanggal(t: string) {
  return new Date(t).toLocaleString("id-ID");
}

export default function ManifestPage({
  params,
}: {
  params: Promise<{ kode: string }>;
}) {
  const { kode } = use(params);
  const [status, setStatus] = useState<StatusMuat>("memuat");
  const [manifest, setManifest] = useState<ManifestApi | null>(null);
  const [qr, setQr] = useState("");

  const muat = useCallback(() => {
    setStatus("memuat");
    setManifest(null);
    fetch(`/api/publik/manifest?kode=${encodeURIComponent(kode)}`)
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
      .then((d: { ok: boolean; manifest?: unknown } | null) => {
        if (d === null) return;
        const m = tunggal<ManifestApi>(d.manifest);
        if (d.ok && m) {
          setManifest(m);
          setStatus("siap");
        } else if (!d.ok && !m) {
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
    if (status !== "siap" || !manifest) return;
    let aktif = true;
    setQr("");
    QRCode.toDataURL(`${window.location.origin}/m/${manifest.kode}`, {
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
  }, [status, manifest]);

  async function salinTautan() {
    const url = window.location.href;
    try {
      await navigator.clipboard.writeText(url);
      toast.success("Tautan disalin");
    } catch {
      toast.error("Gagal menyalin tautan");
    }
  }

  const barang = manifest ? baris<BarangRow>(manifest.items) : [];
  const riwayat = manifest ? baris<RiwayatRow>(manifest.riwayat) : [];
  const batal = manifest ? baris<BatalRow>(manifest.pembatalan) : [];
  const lapor = manifest ? baris<LaporRow>(manifest.ketidaksesuaian) : [];
  const dibatalkan = manifest?.status === "DIBATALKAN";

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
          aria-label="Memuat manifest"
          className="flex flex-col gap-4"
        >
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-32 w-full" />
          <Skeleton className="h-48 w-full" />
          <Skeleton className="h-64 w-64 self-center" />
        </div>
      )}

      {status === "gagal" && (
        <Alert variant="destructive">
          <AlertTitle>Gagal memuat manifest</AlertTitle>
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
            <EmptyTitle>Manifest tidak ditemukan</EmptyTitle>
            <EmptyDescription>
              Kode {kode} tidak dikenal. Periksa kembali kode MNF- pada
              dokumen atau QR.
            </EmptyDescription>
          </EmptyHeader>
          <Button render={<Link href="/transparansi" />} className="mt-4 min-h-12">
            Kembali ke Transparansi
          </Button>
        </Empty>
      )}

      {status === "siap" && manifest && (
        <>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              {!dibatalkan && (
                <Badge className="rounded-full border-transparent bg-success-bg text-success">
                  TERKUNCI
                </Badge>
              )}
              {dibatalkan && (
                <Badge variant="destructive" className="rounded-full">DIBATALKAN</Badge>
              )}
            </div>
            <h1 className="mt-2 font-mono text-2xl font-bold break-all">
              {manifest.kode}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              {manifest.posko_nama} · {manifest.wilayah} · Tim {manifest.tim} · {tanggal(manifest.dipublikasikan_pada)}
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="flex flex-col gap-6 lg:col-span-2">
              <Card className="bg-white rounded-xl border border-slate-200 shadow-xs">
                <CardHeader>
                  <CardTitle>Isi pengiriman</CardTitle>
                  <CardDescription>
                    {barang.length} jenis barang untuk {manifest.posko_nama}.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {barang.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Belum ada barang tercatat.
                    </p>
                  ) : (
                    <div className="overflow-x-auto">
                    <Table>
                      <TableHeader className="bg-slate-50">
                        <TableRow>
                          <TableHead>Barang</TableHead>
                          <TableHead>Jumlah</TableHead>
                          <TableHead>Batch</TableHead>
                          <TableHead>Kedaluwarsa</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {barang.map((b) => (
                          <TableRow key={b.kode_sumbangan}>
                            <TableCell>{b.item_nama}</TableCell>
                            <TableCell className="tabular-nums">
                              {b.jumlah} {b.satuan}
                            </TableCell>
                      <TableCell className="font-mono text-xs break-all">
                              {b.kode_sumbangan}
                            </TableCell>
                            <TableCell className="text-xs">
                              {b.kedaluwarsa
                                ? new Date(b.kedaluwarsa).toLocaleDateString("id-ID")
                                : "Tidak ada tanggal"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="bg-white rounded-xl border border-slate-200 shadow-xs">
                <CardHeader>
                  <CardTitle>Riwayat</CardTitle>
                  <CardDescription>
                    Catatan append-only, tidak dapat diubah.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {riwayat.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Belum ada riwayat.
                    </p>
                  ) : (
                    <ol className="flex flex-col">
                      {riwayat.map((r, i) => (
                        <li key={`${r.dibuat_pada}-${i}`} className="flex gap-3 pb-5 last:pb-0">
                          <span aria-hidden="true" className="flex flex-col items-center">
                            <span className="size-2.5 rounded-full bg-primary" />
                            {i < riwayat.length - 1 && (
                              <span className="w-px flex-1 bg-slate-200" />
                            )}
                          </span>
                          <div className="pb-1 text-sm">
                            <p className="font-semibold">{r.status}</p>
                            <p className="text-muted-foreground">
                              {r.catatan} · oleh {r.aktor ?? "sistem"} · {tanggal(r.dibuat_pada)}
                            </p>
                          </div>
                        </li>
                      ))}
                    </ol>
                  )}
                </CardContent>
              </Card>

              {(dibatalkan || batal.length > 0) && (
                <section
                  aria-labelledby="batal"
                  className="rounded-xl bg-destructive/10 p-4"
                >
                  <h2 id="batal" className="font-bold text-destructive">
                    Dokumen pembatalan
                  </h2>
                  {batal.length === 0 ? (
                    <p className="mt-1 text-sm text-destructive">
                      Manifest ini dibatalkan.
                    </p>
                  ) : (
                    <div className="mt-2 flex flex-col gap-2">
                      {batal.map((b, i) => (
                        <div key={i} className="text-sm text-destructive">
                          <p>{b.alasan}</p>
                          <p>{tanggal(b.dibuat_pada)}</p>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {lapor.length > 0 && (
                <section
                  aria-labelledby="tidak-sesuai"
                  className="rounded-xl bg-warning-bg p-4"
                >
                  <h2 id="tidak-sesuai" className="font-bold text-warning">
                    Laporan ketidaksesuaian
                  </h2>
                  <div className="mt-2 flex flex-col gap-2">
                    {lapor.map((l, i) => (
                      <div key={i} className="text-sm text-warning">
                        <p className="font-semibold">{l.jenis}</p>
                        <p>
                          {l.keterangan} · {tanggal(l.dibuat_pada)}
                        </p>
                      </div>
                    ))}
                  </div>
                </section>
              )}
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
                        alt={`QR manifest ${manifest.kode}`}
                        width={256}
                        height={256}
                        className="size-64 rounded-xl border border-slate-200"
                      />
                    ) : (
                      <Skeleton className="size-64 rounded-xl" />
                    )}
                    <Badge className="rounded-full border-transparent bg-success-bg text-success">
                      TERKUNCI dan TERVERIFIKASI
                    </Badge>
                    <p className="font-mono text-sm font-semibold">{manifest.kode}</p>
                    <p className="font-mono text-xs break-all text-muted-foreground">
                      hash {manifest.hash.slice(0, 16)}…
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
