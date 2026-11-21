"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import BannerOffline, { hitungAntrean } from "@/components/banner-offline";
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
import { Skeleton } from "@omnirelief/ui/components/skeleton";
import { BoxIcon, WiFiOffIcon } from "@solar-icons/react/linear";
import { Textarea } from "@omnirelief/ui/components/textarea";
import { kirimAntrean, tambahAntrean } from "@/lib/offline";

type Tugas = {
  id: number;
  kode: string;
  tim: string;
  eta: string | null;
  batas_checkin: string | null;
  posko_nama: string;
  log_terakhir: { status: string; dibuat_pada: string } | null;
};

type StatusMuat = "memuat" | "siap" | "gagal";

const AKSI = [
  { status: "KELUAR_GUDANG", label: "Keluar gudang" },
  { status: "DALAM_PERJALANAN", label: "Dalam perjalanan" },
  { status: "CHECKIN", label: "Check-in" },
  { status: "TIBA", label: "Tiba" },
] as const;

function lewatBatas(t: Tugas): boolean {
  return t.batas_checkin !== null && new Date(t.batas_checkin) < new Date();
}
async function kirimNyata(url: string, badan: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(badan),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export default function TugasTim() {
  const [tugas, setTugas] = useState<Tugas[]>([]);
  const [status, setStatus] = useState<StatusMuat>("memuat");
  const [pilih, setPilih] = useState<number | null>(null);
  const [kendala, setKendala] = useState("");
  const [darurat, setDarurat] = useState(false);
  const [antre, setAntre] = useState(0);

  const muat = useCallback(async () => {
    setStatus("memuat");
    try {
      const res = await fetch("/api/tim/tugas");
      const data = (await res.json()) as { ok: boolean; tugas?: Tugas[] };
      if (!data.ok || !data.tugas) {
        setStatus("gagal");
        return;
      }
      setTugas(data.tugas);
      setStatus("siap");
    } catch {
      setStatus("gagal");
    }
  }, []);

  useEffect(() => {
    void muat();
    setAntre(hitungAntrean());
    if (window.navigator.onLine) {
      void kirimAntrean(window.localStorage, kirimNyata).then((sisa) => {
        setAntre(sisa.length);
        if (sisa.length === 0) void muat();
        else toast.info(`${sisa.length} data Menunggu Sinkronisasi.`);
      });
    }
    function saatOnline() {
      void kirimAntrean(window.localStorage, kirimNyata).then((sisa) => {
        setAntre(sisa.length);
        if (sisa.length === 0) {
          toast.success("Antrean terkirim otomatis.");
          void muat();
        }
      });
    }
    window.addEventListener("online", saatOnline);
    return () => window.removeEventListener("online", saatOnline);
  }, [muat]);

  async function kirim(label: string, url: string, badan: object) {
    const isi = badan as Record<string, unknown>;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(badan),
      });
      const data = (await res.json()) as { ok: boolean; galat?: string };
      if (!data.ok) {
        toast.error(data.galat ?? "Gagal mencatat update.");
      } else {
        toast.success(`${label} tercatat.`);
        setKendala("");
        await muat();
      }
    } catch {
      tambahAntrean(
        window.localStorage,
        url.endsWith("/kendala") ? "kendala" : "status",
        url,
        isi,
      );
      setAntre(hitungAntrean());
      toast.info("Koneksi lemah, update tersimpan dan terkirim otomatis.");
    }
  }

  const aktif = tugas.find((t) => t.id === pilih) ?? null;
  const perluDicek = tugas.filter(lewatBatas).length;

  return (
    <div className="flex flex-col gap-4">
      <BannerOffline />
      {antre > 0 && (
        <p
          role="status"
          className="flex min-h-12 items-center gap-2 rounded-xl bg-warning-bg p-3 text-sm font-semibold text-warning-badge-fg"
        >
          <WiFiOffIcon aria-hidden="true" className="size-5" />
          {antre} Menunggu Sinkronisasi — terkirim otomatis saat daring.
        </p>
      )}

      {status === "memuat" && (
        <div className="flex flex-col gap-4" aria-label="Memuat tugas">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {status === "gagal" && (
        <Alert variant="destructive">
          <AlertTitle>Gagal memuat tugas</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            Periksa koneksi lalu coba lagi.
            <Button onClick={() => void muat()} className="min-h-12 w-full">
              Muat ulang
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {status === "siap" && tugas.length === 0 && (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <BoxIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Tidak ada tugas hari ini</EmptyTitle>
            <EmptyDescription>
              Belum ada kiriman untuk tim kamu. Tetap siaga dan check-in bila diminta command
              center.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
      )}

      {status === "siap" && tugas.length > 0 && (
        <>
          <p role="status" className="text-sm text-muted-foreground">
            {tugas.length} tugas hari ini
            {perluDicek > 0 ? ` · ${perluDicek} Perlu Dicek (lewat batas check-in)` : ""}
          </p>
          {tugas.map((t) => (
            <Card
              key={t.id}
              onClick={() => setPilih(t.id)}
              className={`cursor-pointer text-left ${pilih === t.id ? "border-2 border-primary" : ""}`}
            >
              <CardContent className="flex flex-col gap-2 p-4 text-sm">
                <p className="flex flex-wrap items-center gap-2 font-bold">
                  {t.kode} · {t.posko_nama}
                  {lewatBatas(t) && <Badge variant="destructive">Perlu Dicek</Badge>}
                </p>
                <p className="text-muted-foreground">
                  Terakhir: {t.log_terakhir?.status ?? "-"}
                  {t.eta ? ` · tiba ${new Date(t.eta).toLocaleString("id-ID")}` : ""}
                  {t.batas_checkin
                    ? ` · batas check-in ${new Date(t.batas_checkin).toLocaleString("id-ID")}`
                    : ""}
                </p>
              </CardContent>
            </Card>
          ))}
        </>
      )}

      {aktif && (
        <Card id="check-in" className="scroll-mt-20">
          <CardHeader>
            <CardTitle className="flex flex-wrap items-center gap-2 text-base">
              Update {aktif.kode}
              {lewatBatas(aktif) && <Badge variant="destructive">Perlu Dicek</Badge>}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              {AKSI.map((a) => (
                <Button
                  key={a.status}
                  onClick={() =>
                    void kirim(a.label, "/api/tim/status", {
                      manifest_id: aktif.id,
                      status: a.status,
                    })
                  }
                  className="min-h-12"
                >
                  {a.label}
                </Button>
              ))}
            </div>
            <Textarea
              value={kendala}
              onChange={(e) => setKendala(e.target.value)}
              placeholder="Tulis kendala di lapangan"
              aria-label="Kendala di lapangan"
              className="min-h-12"
            />
            <label className="flex min-h-12 items-center gap-2">
              <input
                type="checkbox"
                checked={darurat}
                onChange={(e) => setDarurat(e.target.checked)}
                className="h-5 w-5 accent-destructive"
              />
              Darurat (butuh SOP darurat BPBD)
            </label>
            <Button
              onClick={() =>
                void kirim("Kendala", "/api/tim/kendala", {
                  manifest_id: aktif.id,
                  kendala,
                  darurat,
                })
              }
              disabled={kendala.trim() === ""}
              className="min-h-12 w-full bg-warning-bg text-warning-badge-fg hover:bg-warning-bg"
            >
              Lapor kendala
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
