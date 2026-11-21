"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import {
  ChartIcon,
  ClipboardListIcon,
  DeliveryIcon,
  HospitalIcon,
  MagnifierIcon,
} from "@solar-icons/react/linear";
import { Alert, AlertDescription, AlertTitle } from "@omnirelief/ui/components/alert";
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
import { Input } from "@omnirelief/ui/components/input";
import { Skeleton } from "@omnirelief/ui/components/skeleton";
import { baris, type DashboardRow } from "@/lib/supabase/baris";

type StatusMuat = "memuat" | "siap" | "gagal";
type FilterStatus = "semua" | "kurang" | "aman";

function KartuMuat() {
  return (
    <Card aria-hidden="true" className="bg-white rounded-xl border border-slate-200 shadow-xs">
      <CardHeader>
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-5 w-24" />
      </CardContent>
    </Card>
  );
}

function persenTerima(butuh: number, diterima: number) {
  if (butuh <= 0) return diterima > 0 ? 100 : 0;
  return Math.min(100, Math.round((diterima / butuh) * 100));
}

export default function TransparansiPage() {
  const [data, setData] = useState<DashboardRow[]>([]);
  const [status, setStatus] = useState<StatusMuat>("memuat");
  const [kodeManifest, setKodeManifest] = useState("");
  const [kodeSumbangan, setKodeSumbangan] = useState("");
  const [cari, setCari] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("semua");

  const muat = useCallback(() => {
    setStatus("memuat");
    fetch("/api/publik/dashboard")
      .then((r) => r.json())
      .then((d: { ok: boolean; dashboard?: unknown }) => {
        if (d.ok) {
          setData(baris<DashboardRow>(d.dashboard));
          setStatus("siap");
        } else {
          setStatus("gagal");
        }
      })
      .catch(() => setStatus("gagal"));
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  const tampil = useMemo(() => {
    const kata = cari.trim().toLowerCase();
    return data.filter((p) => {
      if (filterStatus === "kurang" && p.selisih <= 0) return false;
      if (filterStatus === "aman" && p.selisih > 0) return false;
      if (kata === "") return true;
      return (
        p.posko_nama.toLowerCase().includes(kata) ||
        p.wilayah.toLowerCase().includes(kata)
      );
    });
  }, [data, cari, filterStatus]);

  const ringkas = useMemo(() => {
    const totalButuh = data.reduce((s, p) => s + p.butuh, 0);
    const totalDiterima = data.reduce((s, p) => s + p.diterima, 0);
    const selisihTerbuka = data.reduce((s, p) => s + Math.max(0, p.selisih), 0);
    const kurang = data.filter((p) => p.selisih > 0).length;
    return { totalButuh, totalDiterima, selisihTerbuka, kurang };
  }, [data]);

  const kurangTampil = useMemo(
    () => tampil.filter((p) => p.selisih > 0).length,
    [tampil]
  );
  const adaFilter = cari.trim() !== "" || filterStatus !== "semua";

  function aturUlang() {
    setCari("");
    setFilterStatus("semua");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Transparansi per posko</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Jatah, pengiriman, penerimaan, dan selisih tiap daerah. Tanpa login.
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <form action={`/m/${kodeManifest.trim()}`} className="flex gap-2">
          <Input
            value={kodeManifest}
            onChange={(e) => setKodeManifest(e.target.value)}
            placeholder="Cari kode manifest (MNF-...)"
            aria-label="Cari kode manifest"
            required
            className="min-h-12 flex-1"
          />
          <Button type="submit" className="min-h-12">
            Cek
          </Button>
        </form>
        <form action={`/s/${kodeSumbangan.trim()}`} className="flex gap-2">
          <Input
            value={kodeSumbangan}
            onChange={(e) => setKodeSumbangan(e.target.value)}
            placeholder="Cari kode sumbangan (DNT-...)"
            aria-label="Cari kode sumbangan"
            required
            className="min-h-12 flex-1"
          />
          <Button type="submit" className="min-h-12">
            Cek
          </Button>
        </form>
      </div>

      <section aria-label="Ringkasan angka">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Card className="bg-white rounded-xl border border-slate-200 shadow-xs">
            <CardContent className="flex flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-muted-foreground">Posko terpantau</p>
                <HospitalIcon aria-hidden="true" className="size-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold tracking-tight tabular-nums">{data.length}</p>
              {ringkas.kurang > 0 ? (
                <Badge variant="destructive" className="rounded-full">{ringkas.kurang} kurang</Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="rounded-full border-transparent bg-success-bg text-success-badge-fg"
                >
                  Semua aman
                </Badge>
              )}
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl border border-slate-200 shadow-xs">
            <CardContent className="flex flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-muted-foreground">Total butuh</p>
                <ClipboardListIcon aria-hidden="true" className="size-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold tracking-tight tabular-nums">{ringkas.totalButuh}</p>
              <Badge variant="outline" className="rounded-full">Jatah disetujui</Badge>
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl border border-slate-200 shadow-xs">
            <CardContent className="flex flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-muted-foreground">Total diterima</p>
                <DeliveryIcon aria-hidden="true" className="size-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold tracking-tight tabular-nums">{ringkas.totalDiterima}</p>
              {ringkas.totalDiterima > 0 ? (
                <Badge
                  variant="outline"
                  className="rounded-full border-transparent bg-success-bg text-success-badge-fg"
                >
                  Konfirmasi terima
                </Badge>
              ) : (
                <Badge variant="outline" className="rounded-full">Belum ada terima</Badge>
              )}
            </CardContent>
          </Card>
          <Card className="bg-white rounded-xl border border-slate-200 shadow-xs">
            <CardContent className="flex flex-col gap-2 p-4">
              <div className="flex items-start justify-between gap-2">
                <p className="text-xs text-muted-foreground">Selisih terbuka</p>
                <ChartIcon aria-hidden="true" className="size-5 text-muted-foreground" />
              </div>
              <p className="text-3xl font-bold tracking-tight tabular-nums">{ringkas.selisihTerbuka}</p>
              {ringkas.selisihTerbuka > 0 ? (
                <Badge variant="destructive" className="rounded-full">Perlu kirim</Badge>
              ) : (
                <Badge
                  variant="outline"
                  className="rounded-full border-transparent bg-success-bg text-success-badge-fg"
                >
                  Nol, semua cukup
                </Badge>
              )}
            </CardContent>
          </Card>
        </div>
      </section>

      <section aria-label="Cari dan saring posko" className="flex flex-col gap-3">
        <div className="flex gap-2">
          <Input
            id="cari-posko"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari posko atau wilayah..."
            aria-label="Cari posko"
            className="min-h-12 flex-1"
          />
        </div>
        <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Saring status selisih">
          <Button
            type="button"
            variant={filterStatus === "semua" ? "default" : "outline"}
            onClick={() => setFilterStatus("semua")}
            aria-pressed={filterStatus === "semua"}
            className="min-h-12"
          >
            Semua
          </Button>
          <Button
            type="button"
            variant={filterStatus === "kurang" ? "default" : "outline"}
            onClick={() => setFilterStatus("kurang")}
            aria-pressed={filterStatus === "kurang"}
            className="min-h-12"
          >
            Kurang
          </Button>
          <Button
            type="button"
            variant={filterStatus === "aman" ? "default" : "outline"}
            onClick={() => setFilterStatus("aman")}
            aria-pressed={filterStatus === "aman"}
            className="min-h-12"
          >
            Aman
          </Button>
          {adaFilter && (
            <Button
              type="button"
              variant="ghost"
              onClick={aturUlang}
              className="min-h-12"
            >
              Atur ulang
            </Button>
          )}
        </div>
        {status === "siap" && (
          <p role="status" className="text-muted-foreground t-angka text-sm">
            {tampil.length} posko · {kurangTampil} kurang
          </p>
        )}
      </section>
      {status === "memuat" && (
        <div role="status" aria-label="Memuat data posko" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KartuMuat />
          <KartuMuat />
          <KartuMuat />
          <KartuMuat />
        </div>
      )}
      {status === "gagal" && (
        <Alert variant="destructive">
          <AlertTitle>Gagal memuat data</AlertTitle>
          <AlertDescription>
            Periksa koneksi lalu coba lagi.
          </AlertDescription>
          <Button onClick={muat} className="mt-3 min-h-12">
            Coba lagi
          </Button>
        </Alert>
      )}
      {status === "siap" && data.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MagnifierIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Belum ada data posko</EmptyTitle>
            <EmptyDescription>
              Data muncul setelah posko melaporkan penyintas dan BPBD memverifikasinya.
            </EmptyDescription>
          </EmptyHeader>
          <Button render={<Link href="/pengaturan#bantuan" />} className="mt-4 min-h-12">
            Ke Bantuan
          </Button>
        </Empty>
      )}
      {status === "siap" && data.length > 0 && tampil.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MagnifierIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Tidak ada hasil</EmptyTitle>
            <EmptyDescription>
              Tidak ada posko yang cocok dengan pencarian atau saringan. Coba kata lain atau atur ulang.
            </EmptyDescription>
          </EmptyHeader>
          <Button onClick={aturUlang} variant="outline" className="mt-4 min-h-12">
            Atur ulang pencarian
          </Button>
        </Empty>
      )}
      {status === "siap" && tampil.length > 0 && (
        <section aria-label="Stok per posko">
          <Card className="bg-white rounded-xl border border-slate-200 shadow-xs">
            <CardHeader>
              <CardTitle>Stok per posko</CardTitle>
              <CardDescription>
                Diterima dibanding butuh, per posko. Angka tidak digabung antar posko.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ul className="flex flex-col">
                {tampil.map((p) => {
                  const persen = persenTerima(p.butuh, p.diterima);
                  const kurang = p.selisih > 0;
                  return (
                    <li
                      key={p.posko_id}
                      className="flex flex-col gap-2 border-t border-slate-200 py-4 first:border-t-0 first:pt-0 last:pb-0"
                    >
                      <div className="flex items-center justify-between gap-2">
                        <div className="min-w-0">
                          <p className="text-sm font-semibold break-words">{p.posko_nama}</p>
                          <p className="text-xs text-muted-foreground">{p.wilayah}</p>
                        </div>
                        {kurang ? (
                          <Badge variant="destructive" className="rounded-full">Kurang {p.selisih}</Badge>
                        ) : (
                          <Badge
                            variant="outline"
                            className="rounded-full border-transparent bg-success-bg text-success-badge-fg"
                          >
                            Aman
                          </Badge>
                        )}
                      </div>
                      <div
                        role="progressbar"
                        aria-valuenow={persen}
                        aria-valuemin={0}
                        aria-valuemax={100}
                        aria-label={`Penerimaan ${p.posko_nama}`}
                        className="h-2 w-full overflow-hidden rounded-full bg-slate-100"
                      >
                        <div
                          className={kurang ? "h-full rounded-full bg-destructive" : "h-full rounded-full bg-success"}
                          style={{ width: `${persen}%` }}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground tabular-nums">
                        Diterima {p.diterima} dari butuh {p.butuh} ({persen}%) · Dikirim {p.dikirim}
                      </p>
                    </li>
                  );
                })}
              </ul>
            </CardContent>
          </Card>
        </section>
      )}
    </main>
  );
}
