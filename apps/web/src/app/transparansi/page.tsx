"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MagnifierIcon } from "@solar-icons/react/linear";
import { Alert, AlertDescription, AlertTitle } from "@omnirelief/ui/components/alert";
import { Badge } from "@omnirelief/ui/components/badge";
import { Button } from "@omnirelief/ui/components/button";
import { Card, CardContent, CardHeader } from "@omnirelief/ui/components/card";
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
import { ShaderBackground } from "@/components/motion/shader-background";

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
    <main className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-5 py-12 md:px-10 md:py-20">
      <ShaderBackground
        variant="mesh-gradient"
        colors={["#030D14", "#082032", "#0F3B5F", "#1B7FBF"]}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -bottom-28 h-auto w-full bg-[#030D14] md:bottom-0"
      />
      <div className="relative flex min-h-0 flex-col gap-8">
      <div>
        <p className="t-micro text-white/70">Tanpa login</p>
        <h1 className="t-h1 t-balance mt-2 text-white">Transparansi per posko</h1>
        <p className="t-pretty mt-2 max-w-xl text-white/70">
          Jatah, pengiriman, penerimaan, dan selisih tiap daerah. Angka tidak digabung antar posko.
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
            className="min-h-12 flex-1 rounded-xl border-white/30 bg-white/10 text-white placeholder:text-white/50"
          />
          <Button type="submit" className="min-h-12 rounded-xl" aria-label="Cek kode manifest">
            <MagnifierIcon aria-hidden="true" /> Cek
          </Button>
        </form>
        <form action={`/s/${kodeSumbangan.trim()}`} className="flex gap-2">
          <Input
            value={kodeSumbangan}
            onChange={(e) => setKodeSumbangan(e.target.value)}
            placeholder="Cari kode sumbangan (DNT-...)"
            aria-label="Cari kode sumbangan"
            required
            className="min-h-12 flex-1 rounded-xl border-white/30 bg-white/10 text-white placeholder:text-white/50"
          />
          <Button type="submit" className="min-h-12 rounded-xl" aria-label="Cek kode sumbangan">
            <MagnifierIcon aria-hidden="true" /> Cek
          </Button>
        </form>
      </div>

      <section aria-label="Ringkasan angka" className="grid grid-cols-2 gap-6 rounded-2xl bg-[#DCE8EE] p-6 text-[#0B1F2E] md:p-8 lg:grid-cols-4">
        <div className="flex flex-col gap-1 pr-4 md:pr-8">
          <span className="t-h2 t-angka text-primary tabular-nums">{data.length}</span>
          <span className="text-xs text-muted-foreground md:text-sm">Posko terpantau</span>
          {ringkas.kurang > 0 ? (
            <Badge variant="destructive" className="mt-1 w-fit rounded-full">{ringkas.kurang} kurang</Badge>
          ) : (
            <Badge variant="outline" className="mt-1 w-fit rounded-full border-transparent bg-success-bg text-success-badge-fg">
              Semua aman
            </Badge>
          )}
        </div>
        <div className="flex flex-col gap-1 pr-4 md:pr-8 lg:border-l lg:border-[#0B1F2E]/20 lg:pl-8">
          <span className="t-h2 t-angka text-primary tabular-nums">{ringkas.totalButuh}</span>
          <span className="text-xs text-muted-foreground md:text-sm">Total butuh</span>
          <Badge variant="outline" className="mt-1 w-fit rounded-full">Jatah disetujui</Badge>
        </div>
        <div className="flex flex-col gap-1 pr-4 md:pr-8 lg:border-l lg:border-[#0B1F2E]/20 lg:pl-8">
          <span className="t-h2 t-angka text-primary tabular-nums">{ringkas.totalDiterima}</span>
          <span className="text-xs text-muted-foreground md:text-sm">Total diterima</span>
          {ringkas.totalDiterima > 0 ? (
            <Badge variant="outline" className="mt-1 w-fit rounded-full border-transparent bg-success-bg text-success-badge-fg">
              Konfirmasi terima
            </Badge>
          ) : (
            <Badge variant="outline" className="mt-1 w-fit rounded-full">Belum ada terima</Badge>
          )}
        </div>
        <div className="flex flex-col gap-1 lg:border-l lg:border-[#0B1F2E]/20 lg:pl-8">
          <span className="t-h2 t-angka text-destructive tabular-nums">{ringkas.selisihTerbuka}</span>
          <span className="text-xs text-muted-foreground md:text-sm">Selisih terbuka</span>
          {ringkas.selisihTerbuka > 0 ? (
            <Badge variant="destructive" className="mt-1 w-fit rounded-full">Perlu kirim</Badge>
          ) : (
            <Badge variant="outline" className="mt-1 w-fit rounded-full border-transparent bg-success-bg text-success-badge-fg">
              Nol, semua cukup
            </Badge>
          )}
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
            className="min-h-12 flex-1 rounded-xl border-white/30 bg-white/10 text-white placeholder:text-white/50"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-1 rounded-full border border-white/25 p-1" role="group" aria-label="Saring status selisih">
            {(
              [
                { nilai: "semua", label: "Semua" },
                { nilai: "kurang", label: "Kurang" },
                { nilai: "aman", label: "Aman" },
              ] as const
            ).map((o) => (
              <button
                key={o.nilai}
                type="button"
                onClick={() => setFilterStatus(o.nilai)}
                aria-pressed={filterStatus === o.nilai}
                className={
                  filterStatus === o.nilai
                    ? "min-h-10 rounded-full bg-white px-4 text-sm font-semibold text-[#0B1F2E]"
                    : "min-h-10 rounded-full px-4 text-sm text-white/70 hover:text-white"
                }
              >
                {o.label}
              </button>
            ))}
          </div>
          {adaFilter && (
            <button type="button" onClick={aturUlang} className="min-h-12 text-sm text-white underline">
              Atur ulang
            </button>
          )}
        </div>
        {status === "siap" && (
          <p role="status" className="t-angka text-sm text-white/70 tabular-nums">
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
        <Empty className="rounded-2xl bg-white text-foreground">
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
        <Empty className="rounded-2xl bg-white text-foreground">
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
          <p className="t-micro text-white/70">Stok per posko</p>
          <h2 className="t-h2 t-balance mt-2 text-white">Diterima dibanding butuh</h2>
          <ul className="mt-6 flex flex-col gap-4">
            {tampil.map((p) => {
              const persen = persenTerima(p.butuh, p.diterima);
              const kurang = p.selisih > 0;
              return (
                <li
                  key={p.posko_id}
                  className="flex flex-col gap-3 rounded-2xl bg-white p-5 text-foreground md:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="t-micro text-muted-foreground">{p.wilayah}</p>
                      <p className="mt-1 text-lg font-semibold break-words">{p.posko_nama}</p>
                    </div>
                    {kurang ? (
                      <Badge variant="destructive" className="shrink-0 rounded-full">Kurang {p.selisih}</Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="shrink-0 rounded-full border-transparent bg-success-bg text-success-badge-fg"
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
                    className="h-2 w-full overflow-hidden rounded-full bg-muted"
                  >
                    <div
                      className={kurang ? "h-full rounded-full bg-destructive" : "h-full rounded-full bg-success"}
                      style={{ width: `${persen}%` }}
                    />
                  </div>
                  <p className="t-angka text-sm text-muted-foreground tabular-nums">
                    Diterima {p.diterima} dari butuh {p.butuh} ({persen}%) · Dikirim {p.dikirim}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      </div>
    </main>
  );
}
