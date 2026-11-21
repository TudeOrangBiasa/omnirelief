"use client";

import { use, useCallback, useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeftIcon, MagnifierIcon } from "@solar-icons/react/linear";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@omnirelief/ui/components/alert";
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

  const dipakai = sumbangan ? baris<PakaiRow>(sumbangan.dipakai) : [];
  const persen =
    sumbangan && sumbangan.jumlah > 0
      ? Math.round((sumbangan.dialokasikan / sumbangan.jumlah) * 100)
      : 0;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
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
          <Card>
            <CardHeader>
              <CardTitle className="font-mono text-2xl">
                {sumbangan.kode_sumbangan}
              </CardTitle>
              <CardDescription>
                {sumbangan.jumlah} {sumbangan.satuan} {sumbangan.item_nama} ·
                masuk {tanggal(sumbangan.tgl_masuk)}
                {sumbangan.kedaluwarsa
                  ? ` · kedaluwarsa ${tanggal(sumbangan.kedaluwarsa)}`
                  : ""}
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <p className="text-muted-foreground">
                Sumber: {sumbangan.sumber}
              </p>
            </CardContent>
          </Card>

          <section aria-labelledby="alokasi">
            <h2 id="alokasi" className="text-lg font-bold text-primary">
              Alokasi
            </h2>
            <Progress value={persen} className="mt-2">
              <ProgressLabel>Terpakai</ProgressLabel>
              <span className="ml-auto text-xs text-muted-foreground tabular-nums">{persen}%</span>
            </Progress>
            <p role="status" className="mt-2 text-sm text-muted-foreground">
              Dialokasikan {sumbangan.dialokasikan} dari {sumbangan.jumlah}{" "}
              {sumbangan.satuan} · tersisa {sumbangan.tersisa}{" "}
              {sumbangan.satuan}
            </p>
          </section>

          <section aria-labelledby="pemakai">
            <h2 id="pemakai" className="text-lg font-bold text-primary">
              Dipakai di manifest
            </h2>
            {dipakai.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">
                Belum dialokasikan ke manifest mana pun.
              </p>
            ) : (
              <ul className="mt-2 flex flex-col gap-2">
                {dipakai.map((p) => (
                  <li key={p.kode}>
                    <Link
                      href={`/m/${p.kode}`}
                      className="flex min-h-12 items-center justify-between gap-2 rounded-xl border bg-card p-3 text-sm"
                    >
                      <span className="font-mono font-semibold text-primary">
                        {p.kode}
                      </span>
                      <span className="text-muted-foreground">
                        {p.jumlah} {sumbangan.satuan} untuk {p.posko_nama}
                        {p.tanggal ? ` · ${tanggal(p.tanggal)}` : ""}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </>
      )}
    </main>
  );
}
