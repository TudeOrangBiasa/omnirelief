"use client";

import { useEffect, useState } from "react";
import { Badge } from "@omnirelief/ui/components/badge";
import { Button } from "@omnirelief/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@omnirelief/ui/components/card";

type Antrean = {
  id: number;
  bayi: number;
  balita: number;
  ibu_hamil: number;
  lansia: number;
  disabilitas: number;
  umum: number;
  dibuat_pada: string;
  posko: { nama: string } | null;
};

type Prioritas = {
  posko_id: number;
  posko_nama: string;
  wilayah: string;
  butuh: number;
  dikirim: number;
  diterima: number;
  selisih: number;
};

type Pantau = {
  id: number;
  kode: string;
  posko_nama: string;
  batas_checkin: string;
  log_terakhir: string | null;
  ditandai: boolean;
};

export default function DasborBpbd() {
  const [antrean, setAntrean] = useState<Antrean[]>([]);
  const [prioritas, setPrioritas] = useState<Prioritas[]>([]);
  const [pantau, setPantau] = useState<Pantau[]>([]);
  const [galat, setGalat] = useState<string | null>(null);

  async function muat() {
    const [a, p, w] = await Promise.all([
      fetch("/api/bpbd/antrean").then((r) => r.json()) as Promise<{
        ok: boolean;
        antrean?: Antrean[];
      }>,
      fetch("/api/bpbd/prioritas").then((r) => r.json()) as Promise<{
        ok: boolean;
        prioritas?: Prioritas[];
      }>,
      fetch("/api/bpbd/pantauan").then((r) => r.json()) as Promise<{
        ok: boolean;
        perlu_dicek?: Pantau[];
      }>,
    ]);
    if (a.ok && a.antrean) setAntrean(a.antrean);
    if (p.ok && p.prioritas) setPrioritas(p.prioritas);
    if (w.ok && w.perlu_dicek) setPantau(w.perlu_dicek);
    if (!a.ok || !p.ok || !w.ok) setGalat("Sebagian data gagal dimuat.");
  }

  useEffect(() => {
    void muat();
  }, []);

  async function putuskan(snapshot_id: number, keputusan: string) {
    const res = await fetch("/api/bpbd/verifikasi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ snapshot_id, keputusan }),
    });
    const data = (await res.json()) as { ok: boolean; galat?: string };
    if (!data.ok) setGalat(data.galat ?? "Keputusan gagal.");
    await muat();
  }

  async function batalkan(manifest_id: number) {
    const alasan = window.prompt("Alasan pembatalan publik:");
    if (!alasan) return;
    const res = await fetch("/api/bpbd/pembatalan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ manifest_id, alasan }),
    });
    const data = (await res.json()) as { ok: boolean; galat?: string };
    if (!data.ok) setGalat(data.galat ?? "Pembatalan gagal.");
    await muat();
  }

  return (
    <div className="flex flex-col gap-8">
      {galat && (
        <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          {galat}
        </p>
      )}
      {pantau.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-destructive">
            Perlu dicek ({pantau.length})
          </h2>
          {pantau.map((w) => (
            <Card key={w.id} className="border-destructive">
              <CardContent className="flex flex-col gap-2 p-4 text-sm">
                <p className="font-semibold">
                  {w.kode} · {w.posko_nama}
                </p>
                <p className="text-muted-foreground">
                  Batas check-in lewat · terakhir {w.log_terakhir ?? "-"}
                  {w.ditandai ? " · sudah ditandai otomatis" : ""}
                </p>
                <Button
                  variant="destructive"
                  onClick={() => void batalkan(w.id)}
                  className="min-h-12 w-full"
                >
                  Batalkan manifest ini
                </Button>
              </CardContent>
            </Card>
          ))}
        </section>
      )}
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-bold text-primary">
          Antrean verifikasi ({antrean.length})
        </h2>
        {antrean.length === 0 && (
          <p className="text-muted-foreground text-sm">Tidak ada antrean.</p>
        )}
        {antrean.map((a) => (
          <Card key={a.id}>
            <CardHeader>
              <CardTitle className="text-base">{a.posko?.nama ?? "Posko?"}</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <p className="text-muted-foreground">
                Total {a.bayi + a.balita + a.ibu_hamil + a.lansia + a.disabilitas + a.umum} jiwa ·{" "}
                {new Date(a.dibuat_pada).toLocaleString("id-ID")}
              </p>
              <div className="flex gap-2">
                <Button
                  onClick={() => void putuskan(a.id, "DISETUJUI")}
                  className="min-h-12 flex-1 bg-success text-white hover:bg-success/80"
                >
                  Setujui
                </Button>
                <Button
                  onClick={() => void putuskan(a.id, "MINTA_REVISI")}
                  className="min-h-12 flex-1 bg-warning-bg text-warning hover:bg-warning-bg"
                >
                  Minta revisi
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => void putuskan(a.id, "DITOLAK")}
                  className="min-h-12 flex-1"
                >
                  Tolak
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-bold text-primary">Prioritas kebutuhan</h2>
        {prioritas.map((p) => (
          <Card key={p.posko_id}>
            <CardContent className="flex flex-col gap-2 p-4 text-sm">
              <p className="font-semibold">{p.posko_nama}</p>
              <p className="text-muted-foreground">
                Butuh {p.butuh} · Dikirim {p.dikirim} · Diterima {p.diterima}
              </p>
              {p.selisih > 0 ? (
                <Badge variant="destructive">Kurang {p.selisih}</Badge>
              ) : (
                <Badge className="border-transparent bg-success-bg text-success">Aman</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
