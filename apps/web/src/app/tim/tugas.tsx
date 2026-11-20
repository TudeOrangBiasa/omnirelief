"use client";

import { useEffect, useState } from "react";
import BannerOffline from "@/components/banner-offline";
import { Badge } from "@omnirelief/ui/components/badge";
import { Button } from "@omnirelief/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@omnirelief/ui/components/card";
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

const AKSI = [
  { status: "KELUAR_GUDANG", label: "Keluar gudang" },
  { status: "DALAM_PERJALANAN", label: "Dalam perjalanan" },
  { status: "CHECKIN", label: "Check-in" },
  { status: "TIBA", label: "Tiba" },
] as const;

export default function TugasTim() {
  const [tugas, setTugas] = useState<Tugas[]>([]);
  const [pilih, setPilih] = useState<number | null>(null);
  const [kendala, setKendala] = useState("");
  const [darurat, setDarurat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);

  async function muat() {
    const res = await fetch("/api/tim/tugas");
    const data = (await res.json()) as { ok: boolean; tugas?: Tugas[] };
    if (data.ok && data.tugas) setTugas(data.tugas);
  }

  useEffect(() => {
    void muat();
    if (window.navigator.onLine) {
      void kirimAntrean(window.localStorage, async (url, badan) => {
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
      }).then((sisa) => {
        if (sisa.length === 0) void muat();
      });
    }
  }, []);

  async function kirim(status: string, catatan: string | null, url: string, badan: object) {
    setGalat(null);
    setPesan(null);
    const isi = badan as Record<string, unknown>;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(badan),
      });
      const data = (await res.json()) as { ok: boolean; galat?: string };
      if (!data.ok) setGalat(data.galat ?? "Gagal.");
      else {
        setPesan(`${status} tercatat.`);
        setKendala("");
        await muat();
      }
    } catch {
      tambahAntrean(
        window.localStorage,
        url.endsWith("/kendala") ? "kendala" : "status",
        url,
        isi
      );
      setPesan("Koneksi lemah, update tersimpan dan terkirim otomatis (Menunggu Sinkronisasi).");
    }
  }

  const aktif = tugas.find((t) => t.id === pilih) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <BannerOffline />
      {galat && (
        <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          {galat}
        </p>
      )}
      {pesan && (
        <p role="status" className="rounded-xl bg-success-bg p-3 text-sm text-success">
          {pesan}
        </p>
      )}
      {tugas.map((t) => (
        <Card
          key={t.id}
          onClick={() => setPilih(t.id)}
          className={`cursor-pointer text-left ${pilih === t.id ? "border-2 border-primary" : ""}`}
        >
          <CardContent className="flex flex-col gap-1 p-4 text-sm">
            <p className="font-bold">
              {t.kode} · {t.posko_nama}
            </p>
            <p className="text-muted-foreground">
              Terakhir: {t.log_terakhir?.status ?? "-"}
              {t.batas_checkin ? ` · batas check-in ${new Date(t.batas_checkin).toLocaleString("id-ID")}` : ""}
            </p>
          </CardContent>
        </Card>
      ))}
      {aktif && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              Update {aktif.kode}
              {aktif.batas_checkin && new Date(aktif.batas_checkin) < new Date() && (
                <Badge variant="destructive">Lewat batas</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3 text-sm">
            <div className="grid grid-cols-2 gap-2">
              {AKSI.map((a) => (
                <Button
                  key={a.status}
                  onClick={() => void kirim(a.status, null, "/api/tim/status", { manifest_id: aktif.id, status: a.status })}
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
                void kirim("kendala", null, "/api/tim/kendala", {
                  manifest_id: aktif.id,
                  kendala,
                  darurat,
                })
              }
              disabled={kendala.trim() === ""}
              className="min-h-12 w-full bg-warning-bg text-warning hover:bg-warning-bg"
            >
              Lapor kendala
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
