"use client";

import { useEffect, useState } from "react";
import { Badge } from "@omnirelief/ui/components/badge";
import { Button } from "@omnirelief/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@omnirelief/ui/components/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@omnirelief/ui/components/select";
import { Textarea } from "@omnirelief/ui/components/textarea";
type Bantuan = {
  id: number;
  kode: string;
  tim: string;
  log_terakhir: { status: string; dibuat_pada: string } | null;
};

const JENIS = ["KURANG", "RUSAK", "TIDAK_SESUAI", "TIDAK_DITERIMA", "KIRIM_ULANG"] as const;

export default function BantuanPosko() {
  const [bantuan, setBantuan] = useState<Bantuan[]>([]);
  const [laporId, setLaporId] = useState<number | null>(null);
  const [jenis, setJenis] = useState<string>("KURANG");
  const [keterangan, setKeterangan] = useState("");
  const [pesan, setPesan] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  async function muat() {
    const res = await fetch("/api/posko/bantuan");
    const data = (await res.json()) as { ok: boolean; bantuan?: Bantuan[] };
    if (data.ok && data.bantuan) setBantuan(data.bantuan);
  }

  useEffect(() => {
    void muat();
  }, []);

  async function konfirmasi(manifest_id: number) {
    setGalat(null);
    setPesan(null);
    try {
      const res = await fetch("/api/posko/konfirmasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manifest_id }),
      });
      const data = (await res.json()) as { ok: boolean; galat?: string };
      if (!data.ok) setGalat(data.galat ?? "Gagal.");
      else {
        setPesan("Penerimaan dikonfirmasi. Terima kasih.");
        await muat();
      }
    } catch {
      setGalat("Jaringan bermasalah. Coba lagi.");
    }
  }

  async function lapor(manifest_id: number) {
    setGalat(null);
    setPesan(null);
    try {
      const res = await fetch("/api/posko/ketidaksesuaian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manifest_id, jenis, keterangan }),
      });
      const data = (await res.json()) as { ok: boolean; galat?: string };
      if (!data.ok) setGalat(data.galat ?? "Gagal.");
      else {
        setPesan("Laporan tampil publik sebagai dokumen terbuka.");
        setLaporId(null);
        setKeterangan("");
        await muat();
      }
    } catch {
      setGalat("Jaringan bermasalah. Coba lagi.");
    }
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-bold text-primary">Bantuan untuk posko ini</h2>
      {pesan && (
        <p role="status" className="rounded-xl bg-success-bg p-3 text-sm text-success">
          {pesan}
        </p>
      )}
      {galat && (
        <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          {galat}
        </p>
      )}
      {bantuan.length === 0 && (
        <p className="text-muted-foreground text-sm">Belum ada kiriman.</p>
      )}
      {bantuan.map((b) => (
        <Card key={b.id}>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              {b.kode}
              {b.log_terakhir?.status === "DITERIMA" ? (
                <Badge className="border-transparent bg-success-bg text-success">Diterima</Badge>
              ) : (
                <Badge variant="outline">{b.log_terakhir?.status ?? "Baru"}</Badge>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-2 text-sm">
            {b.log_terakhir?.status !== "DITERIMA" && (
              <div className="flex gap-2">
                <Button
                  onClick={() => void konfirmasi(b.id)}
                  className="min-h-12 flex-1 bg-success text-white hover:bg-success/80"
                >
                  Konfirmasi terima
                </Button>
                <Button
                  variant="outline"
                  onClick={() => setLaporId(laporId === b.id ? null : b.id)}
                  className="min-h-12 flex-1"
                >
                  Lapor masalah
                </Button>
              </div>
            )}
            {laporId === b.id && (
                <Select value={jenis} onValueChange={(v) => setJenis(v ?? "KURANG")}>
                  <SelectTrigger className="min-h-12">
                    <SelectValue placeholder="Jenis masalah" />
                  </SelectTrigger>
                  <SelectContent>
                    {JENIS.map((j) => (
                      <SelectItem key={j} value={j}>
                        {j}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Textarea
                  value={keterangan}
                  onChange={(e) => setKeterangan(e.target.value)}
                  placeholder="Contoh: 10 paket rusak basah"
                  className="min-h-12"
                />
                <Button
                  variant="destructive"
                  onClick={() => void lapor(b.id)}
                  disabled={keterangan.trim() === ""}
                  className="min-h-12"
                >
                  Kirim laporan publik
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </section>
  );
}
