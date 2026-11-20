"use client";

import { useEffect, useState } from "react";
import { Badge } from "@omnirelief/ui/components/badge";
import { Button } from "@omnirelief/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@omnirelief/ui/components/card";
import { Input } from "@omnirelief/ui/components/input";

type Baris = {
  posko_nama: string;
  wilayah: string;
  butuh: number;
  dikirim: number;
  diterima: number;
  selisih: number;
};

export default function TransparansiPage() {
  const [data, setData] = useState<Baris[]>([]);
  const [kodeManifest, setKodeManifest] = useState("");
  const [kodeSumbangan, setKodeSumbangan] = useState("");

  useEffect(() => {
    void fetch("/api/publik/dashboard")
      .then((r) => r.json())
      .then((d: { ok: boolean; dashboard?: Baris[] }) => {
        if (d.ok && d.dashboard) setData(d.dashboard);
      });
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Transparansi per posko</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Jatah, pengiriman, penerimaan, dan selisih tiap daerah. Tanpa login.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <form action={`/m/${kodeManifest.trim()}`} className="flex gap-2">
          <Input
            value={kodeManifest}
            onChange={(e) => setKodeManifest(e.target.value)}
            placeholder="Cari kode manifest (MNF-...)"
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
            required
            className="min-h-12 flex-1"
          />
          <Button type="submit" className="min-h-12">
            Cek
          </Button>
        </form>
      </div>
      {data.map((p) => (
        <Card key={p.posko_nama}>
          <CardHeader>
            <CardTitle className="text-base">
              {p.posko_nama} · {p.wilayah}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            <p className="text-muted-foreground">
              Butuh {p.butuh} · Dikirim {p.dikirim} · Diterima {p.diterima}
            </p>
            {p.selisih > 0 ? (
              <Badge variant="destructive">Kurang {p.selisih}</Badge>
            ) : (
              <Badge className="bg-success-bg text-success border-transparent">Aman</Badge>
            )}
          </CardContent>
        </Card>
      ))}
    </main>
  );
}
