"use client";

import { useEffect, useState } from "react";
import { Button } from "@omnirelief/ui/components/button";
import { Card, CardContent } from "@omnirelief/ui/components/card";
import { Input } from "@omnirelief/ui/components/input";
import { Label } from "@omnirelief/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@omnirelief/ui/components/select";
type Posko = { id: number; nama: string; wilayah: string };

type Batch = {
  id: number;
  kode_sumbangan: string;
  item_nama: string;
  satuan: string;
  kedaluwarsa: string | null;
  sisa: number;
};

type Baris = { batch_id: number; jumlah: number };

export default function FormulirKirim() {
  const [posko, setPosko] = useState<Posko[]>([]);
  const [batch, setBatch] = useState<Batch[]>([]);
  const [poskoId, setPoskoId] = useState("");
  const [tim, setTim] = useState("");
  const [baris, setBaris] = useState<Baris[]>([{ batch_id: 0, jumlah: 0 }]);
  const [draf, setDraf] = useState<{ id: number; kode: string; peringatan: string[] } | null>(null);
  const [hasil, setHasil] = useState<{ kode: string; url_publik: string } | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);

  useEffect(() => {
    void (async () => {
      const [p, b] = await Promise.all([
        fetch("/api/bpbd/posko").then((r) => r.json()) as Promise<{ ok: boolean; posko?: Posko[] }>,
        fetch("/api/gudang/batch").then((r) => r.json()) as Promise<{ ok: boolean; batch?: Batch[] }>,
      ]);
      if (p.ok && p.posko) setPosko(p.posko);
      if (b.ok && b.batch) setBatch(b.batch.filter((x) => x.sisa > 0));
    })();
  }, []);

  async function buatDraf() {
    setSibuk(true);
    setGalat(null);
    try {
      const res = await fetch("/api/bpbd/manifest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          posko_id: Number(poskoId),
          tim,
          items: baris.filter((r) => r.batch_id > 0 && r.jumlah > 0),
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        id?: number;
        kode?: string;
        peringatan?: string[];
        galat?: string;
      };
      if (data.ok && data.id && data.kode) setDraf({ id: data.id, kode: data.kode, peringatan: data.peringatan ?? [] });
      else setGalat(data.galat ?? "Gagal membuat draf.");
    } catch {
      setGalat("Jaringan bermasalah. Coba lagi.");
    } finally {
      setSibuk(false);
    }
  }

  async function publikasikan() {
    if (!draf) return;
    setSibuk(true);
    setGalat(null);
    try {
      const res = await fetch(`/api/bpbd/manifest/${draf.id}/publikasi`, { method: "POST" });
      const data = (await res.json()) as {
        ok: boolean;
        kode?: string;
        url_publik?: string;
        galat?: string;
      };
      if (data.ok && data.kode && data.url_publik)
        setHasil({ kode: data.kode, url_publik: data.url_publik });
      else setGalat(data.galat ?? "Gagal mempublikasikan.");
    } catch {
      setGalat("Jaringan bermasalah. Coba lagi.");
    } finally {
      setSibuk(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {galat && (
        <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          {galat}
        </p>
      )}
      {hasil ? (
        <Card className="border-transparent bg-success-bg">
          <CardContent className="flex flex-col gap-1 p-4 text-sm text-success">
            <p className="font-bold">Terkunci publik: {hasil.kode}</p>
            <a href={hasil.url_publik} className="underline">
              Buka halaman publik manifest
            </a>
          </CardContent>
        </Card>
      ) : draf ? (
        <Card>
          <CardContent className="flex flex-col gap-2 p-4 text-sm">
            <p className="font-bold">Draf {draf.kode} tersimpan.</p>
            {draf.peringatan.length > 0 && (
              <p className="text-warning">
                Peringatan FEFO: batch {draf.peringatan.join(", ")} kedaluwarsa lebih
                dekat tapi tidak dipakai.
              </p>
            )}
            <Button
              onClick={() => void publikasikan()}
              disabled={sibuk}
              className="min-h-12 w-full"
            >
              {sibuk ? "Mengunci..." : "Publikasikan dan kunci"}
            </Button>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="flex flex-col gap-1">
            <Label htmlFor="kirim-posko">Posko tujuan</Label>
            <Select value={poskoId} onValueChange={(v) => setPoskoId(v ?? "")}>
              <SelectTrigger id="kirim-posko" className="min-h-12">
                <SelectValue placeholder="Pilih posko" />
              </SelectTrigger>
              <SelectContent>
                {posko.map((p) => (
                  <SelectItem key={p.id} value={String(p.id)}>
                    {p.nama} ({p.wilayah})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="kirim-tim">Tim distribusi</Label>
            <Input
              id="kirim-tim"
              value={tim}
              onChange={(e) => setTim(e.target.value)}
              placeholder="Tim Antar 1"
              className="min-h-12"
            />
          </div>
          {baris.map((r, i) => (
            <div key={i} className="flex gap-2">
              <Select
                value={String(r.batch_id)}
                onValueChange={(v) => {
                  const ganti = [...baris];
                  ganti[i] = { ...r, batch_id: Number(v) };
                  setBaris(ganti);
                }}
              >
                <SelectTrigger className="min-h-12 flex-1">
                  <SelectValue placeholder="Pilih batch" />
                </SelectTrigger>
                <SelectContent>
                  {batch.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {b.kode_sumbangan} · {b.item_nama} · sisa {b.sisa}
                      {b.kedaluwarsa ? ` · exp ${b.kedaluwarsa}` : ""}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={1}
                value={r.jumlah || ""}
                placeholder="Jumlah"
                onChange={(e) => {
                  const ganti = [...baris];
                  ganti[i] = { ...r, jumlah: Number(e.target.value) };
                  setBaris(ganti);
                }}
                className="min-h-12 w-28"
              />
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => setBaris([...baris, { batch_id: 0, jumlah: 0 }])}
            className="min-h-12"
          >
            Tambah batch
          </Button>
          <Button
            onClick={() => void buatDraf()}
            disabled={sibuk || poskoId === "" || tim.trim() === ""}
            className="min-h-12"
          >
            {sibuk ? "Menyimpan..." : "Simpan draf"}
          </Button>
        </>
      )}
    </div>
  );
}
