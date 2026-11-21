"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MagnifierIcon } from "@solar-icons/react/linear";
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
    <Card aria-hidden="true">
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
    <main className="mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-6 p-6">
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
        <div role="status" aria-label="Memuat data posko" className="grid gap-4 sm:grid-cols-2">
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
        <div className="grid gap-4 sm:grid-cols-2">
          {tampil.map((p) => (
            <Card key={p.posko_id}>
              <CardHeader>
                <CardTitle className="text-base">{p.posko_nama}</CardTitle>
                <CardDescription>{p.wilayah}</CardDescription>
              </CardHeader>
              <CardContent className="flex flex-col gap-2 text-sm">
                <p className="text-muted-foreground t-angka">
                  Butuh {p.butuh} · Dikirim {p.dikirim} · Diterima {p.diterima}
                </p>
                {p.selisih > 0 ? (
                  <Badge variant="destructive">Kurang {p.selisih}</Badge>
                ) : (
                  <Badge
                    variant="outline"
                    className="border-transparent bg-success-bg text-success-badge-fg"
                  >
                    Aman
                  </Badge>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </main>
  );
}
