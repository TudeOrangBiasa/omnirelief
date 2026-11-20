"use client";

import { useEffect, useState } from "react";
import BannerOffline from "@/components/banner-offline";
import { Badge } from "@omnirelief/ui/components/badge";
import { Button } from "@omnirelief/ui/components/button";
import { Card, CardContent } from "@omnirelief/ui/components/card";
import { Input } from "@omnirelief/ui/components/input";
import { Label } from "@omnirelief/ui/components/label";
import { kirimAntrean, tambahAntrean } from "@/lib/offline";
type Laporan = {
  id: number;
  bayi: number;
  balita: number;
  ibu_hamil: number;
  lansia: number;
  disabilitas: number;
  umum: number;
  status: string;
  dibuat_pada: string;
};

const MEDAN = [
  { nama: "bayi", label: "Bayi" },
  { nama: "balita", label: "Balita" },
  { nama: "ibu_hamil", label: "Ibu hamil" },
  { nama: "lansia", label: "Lansia" },
  { nama: "disabilitas", label: "Disabilitas" },
  { nama: "umum", label: "Umum" },
] as const;

export default function FormulirPosko() {
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [hasil, setHasil] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);

  async function muat() {
    const res = await fetch("/api/posko/laporan");
    const data = (await res.json()) as { ok: boolean; laporan?: Laporan[] };
    if (data.ok && data.laporan) setLaporan(data.laporan);
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

  async function kirim(formData: FormData, draft: boolean) {
    setSibuk(true);
    setHasil(null);
    setGalat(null);
    const badan: Record<string, number | boolean> = { draft };
    for (const m of MEDAN) badan[m.nama] = Number(formData.get(m.nama) ?? 0);
    try {
      const res = await fetch("/api/posko/laporan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(badan),
      });
      const data = (await res.json()) as { ok: boolean; galat?: string };
      if (data.ok) {
        setHasil(
          draft ? "Draf tersimpan." : "Laporan terkirim, menunggu verifikasi BPBD."
        );
        await muat();
      } else setGalat(data.galat ?? "Gagal menyimpan.");
    } catch {
      tambahAntrean(window.localStorage, "laporan", "/api/posko/laporan", badan);
      setHasil("Koneksi lemah, laporan tersimpan dan terkirim otomatis (Menunggu Sinkronisasi).");
    } finally {
      setSibuk(false);
    }
  }

  return (
    <div id="lapor" className="flex scroll-mt-20 flex-col gap-6">
      <BannerOffline />
      {hasil && (
        <p role="status" className="rounded-xl bg-success-bg p-3 text-sm text-success">
          {hasil}
        </p>
      )}
      {galat && (
        <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          {galat}
        </p>
      )}
      <form
        action={(fd) => void kirim(fd, false)}
        className="flex flex-col gap-4"
      >
        {MEDAN.map((m) => (
          <div key={m.nama} className="flex flex-col gap-1">
            <Label htmlFor={`posko-${m.nama}`}>{m.label}</Label>
            <Input
              id={`posko-${m.nama}`}
              name={m.nama}
              type="number"
              min={0}
              defaultValue={0}
              required
              className="min-h-12"
            />
          </div>
        ))}
        <div className="flex gap-3">
          <Button type="submit" disabled={sibuk} className="min-h-12 flex-1">
            {sibuk ? "Mengirim..." : "Kirim data"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={sibuk}
            onClick={(e) => {
              const form = (e.target as HTMLButtonElement).closest("form");
              if (form) void kirim(new FormData(form), true);
            }}
            className="min-h-12 flex-1"
          >
            Simpan draf
          </Button>
        </div>
      </form>
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-bold text-primary">Status laporan</h2>
        {laporan.length === 0 && (
          <p className="text-muted-foreground text-sm">Belum ada laporan.</p>
        )}
        {laporan.map((l) => (
          <Card key={l.id}>
            <CardContent className="flex flex-col gap-1 p-4 text-sm">
              <p className="font-semibold">
                Total {l.bayi + l.balita + l.ibu_hamil + l.lansia + l.disabilitas + l.umum} jiwa
              </p>
              <p className="text-muted-foreground">
                {new Date(l.dibuat_pada).toLocaleString("id-ID")}
              </p>
              {l.status === "DISETUJUI" ? (
                <Badge className="w-fit border-transparent bg-success-bg text-success">Disetujui</Badge>
              ) : l.status === "MINTA_REVISI" ? (
                <Badge className="w-fit border-transparent bg-warning-bg text-warning">Minta revisi</Badge>
              ) : l.status === "DITOLAK" ? (
                <Badge variant="destructive" className="w-fit">Ditolak</Badge>
              ) : (
                <Badge variant="outline" className="w-fit">{l.status}</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
