"use client";

import { useEffect, useState } from "react";
import QRCode from "qrcode";
import { toast } from "sonner";
import {
  DangerTriangleIcon,
  LockKeyholeMinimalisticIcon,
  QrCodeIcon,
} from "@solar-icons/react/linear";
import { Alert, AlertDescription, AlertTitle } from "@omnirelief/ui/components/alert";
import { Badge } from "@omnirelief/ui/components/badge";
import { Button } from "@omnirelief/ui/components/button";
import { Card, CardContent } from "@omnirelief/ui/components/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@omnirelief/ui/components/empty";
import { Input } from "@omnirelief/ui/components/input";
import { Label } from "@omnirelief/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@omnirelief/ui/components/select";
import { Skeleton } from "@omnirelief/ui/components/skeleton";
import { baris } from "@/lib/supabase/baris";

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

function urutFefo(daftar: Batch[]): Batch[] {
  return [...daftar].sort((a, b) => {
    if (a.kedaluwarsa === b.kedaluwarsa) return 0;
    if (a.kedaluwarsa === null) return 1;
    if (b.kedaluwarsa === null) return -1;
    return a.kedaluwarsa < b.kedaluwarsa ? -1 : 1;
  });
}

function labelBatch(b: Batch): string {
  const exp = b.kedaluwarsa
    ? ` · kedaluwarsa ${new Date(b.kedaluwarsa).toLocaleDateString("id-ID")}`
    : " · tanpa tanggal kedaluwarsa";
  return `${b.kode_sumbangan} · ${b.item_nama} · sisa ${b.sisa} ${b.satuan}${exp}`;
}

export default function FormulirKirim() {
  const [posko, setPosko] = useState<Posko[]>([]);
  const [batch, setBatch] = useState<Batch[]>([]);
  const [poskoId, setPoskoId] = useState("");
  const [tim, setTim] = useState("");
  const [barisKirim, setBarisKirim] = useState<Baris[]>([{ batch_id: 0, jumlah: 0 }]);
  const [draf, setDraf] = useState<{ id: number; kode: string; peringatan: string[] } | null>(null);
  const [hasil, setHasil] = useState<{ kode: string; url_publik: string; qr: string } | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [memuat, setMemuat] = useState(true);
  const [sibuk, setSibuk] = useState(false);

  useEffect(() => {
    void (async () => {
      setMemuat(true);
      try {
        const [rp, rb] = await Promise.all([
          fetch("/api/bpbd/posko").then((r) => r.json()),
          fetch("/api/gudang/batch").then((r) => r.json()),
        ]);
        const dp: unknown = rp;
        const db: unknown = rb;
        if (typeof dp === "object" && dp !== null && "ok" in dp && dp.ok === true && "posko" in dp) {
          setPosko(baris<Posko>(dp.posko));
        }
        if (typeof db === "object" && db !== null && "ok" in db && db.ok === true && "batch" in db) {
          setBatch(urutFefo(baris<Batch>(db.batch).filter((x) => x.sisa > 0)));
        }
      } catch {
        setGalat("Gagal memuat posko dan batch. Coba muat ulang halaman.");
      } finally {
        setMemuat(false);
      }
    })();
  }, []);

  const idDipilih = new Set(barisKirim.filter((r) => r.batch_id > 0).map((r) => r.batch_id));
  const expDipilih = barisKirim
    .map((r) => batch.find((b) => b.id === r.batch_id)?.kedaluwarsa ?? null)
    .filter((e): e is string => e !== null);
  const terlewat = batch.filter((b) => {
    if (b.kedaluwarsa === null || idDipilih.has(b.id)) return false;
    const exp: string = b.kedaluwarsa;
    return expDipilih.some((e) => exp < e);
  });

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
          items: barisKirim.filter((r) => r.batch_id > 0 && r.jumlah > 0),
        }),
      });
      const data: unknown = await res.json();
      const ok = typeof data === "object" && data !== null && "ok" in data && data.ok === true;
      const id = ok && "id" in data && typeof data.id === "number" ? data.id : null;
      const kode = ok && "kode" in data && typeof data.kode === "string" ? data.kode : null;
      if (ok && id !== null && kode !== null) {
        const peringatan = "peringatan" in data ? baris<string>(data.peringatan) : [];
        setDraf({ id, kode, peringatan });
        toast.success(`Draf ${kode} tersimpan.`);
      } else {
        setGalat(
          typeof data === "object" && data !== null && "galat" in data
            ? String(data.galat)
            : "Gagal membuat draf.",
        );
      }
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
      const data: unknown = await res.json();
      const ok = typeof data === "object" && data !== null && "ok" in data && data.ok === true;
      const kode = ok && "kode" in data && typeof data.kode === "string" ? data.kode : null;
      const url =
        ok && "url_publik" in data && typeof data.url_publik === "string" ? data.url_publik : null;
      if (ok && kode !== null && url !== null) {
        const qr = await QRCode.toDataURL(`${window.location.origin}${url}`, {
          width: 256,
          margin: 2,
        });
        setHasil({ kode, url_publik: url, qr });
        toast.success(`Manifest ${kode} terkunci publik.`);
      } else {
        setGalat(
          typeof data === "object" && data !== null && "galat" in data
            ? String(data.galat)
            : "Gagal mempublikasikan.",
        );
      }
    } catch {
      setGalat("Jaringan bermasalah. Coba lagi.");
    } finally {
      setSibuk(false);
    }
  }

  if (memuat) {
    return (
      <div className="flex flex-col gap-4" aria-hidden="true">
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
        <Skeleton className="h-12 w-full" />
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      {galat && (
        <Alert variant="destructive">
          <DangerTriangleIcon aria-hidden="true" />
          <AlertTitle>Gagal</AlertTitle>
          <AlertDescription>{galat}</AlertDescription>
        </Alert>
      )}
      {hasil ? (
        <Card className="border-transparent bg-success-bg">
          <CardContent className="flex flex-col items-center gap-2 p-4 text-sm text-success">
            <Badge className="border-transparent bg-success text-white">
              <LockKeyholeMinimalisticIcon aria-hidden="true" />
              TERKUNCI
            </Badge>
            <p className="font-bold">Manifest {hasil.kode} terkunci publik.</p>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={hasil.qr} alt={`QR manifest ${hasil.kode}`} width={256} height={256} />
            <a href={hasil.url_publik} className="inline-flex min-h-12 items-center gap-1 underline">
              <QrCodeIcon aria-hidden="true" />
              Buka halaman publik manifest
            </a>
          </CardContent>
        </Card>
      ) : draf ? (
        <Card>
          <CardContent className="flex flex-col gap-2 p-4 text-sm">
            <p className="font-bold">Draf {draf.kode} tersimpan.</p>
            {draf.peringatan.length > 0 && (
              <p role="status" className="text-warning">
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
      ) : batch.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyTitle>Belum ada stok batch</EmptyTitle>
            <EmptyDescription>
              Gudang belum mencatat batch dengan sisa stok. Isi stok dulu sebelum membuat
              manifest.
            </EmptyDescription>
          </EmptyHeader>
        </Empty>
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
          {terlewat.length > 0 && (
            <p role="status" className="rounded-xl bg-warning-bg p-3 text-sm text-warning">
              Peringatan FEFO: {terlewat.map((b) => b.kode_sumbangan).join(", ")} kedaluwarsa
              lebih dekat tapi belum dipilih.
            </p>
          )}
          {barisKirim.map((r, i) => (
            <div key={i} className="flex gap-2">
              <Select
                value={String(r.batch_id)}
                onValueChange={(v) => {
                  const ganti = [...barisKirim];
                  ganti[i] = { ...r, batch_id: Number(v) };
                  setBarisKirim(ganti);
                }}
              >
                <SelectTrigger className="min-h-12 flex-1" aria-label={`Batch baris ${i + 1}`}>
                  <SelectValue placeholder="Pilih batch (terdekat kedaluwarsa di atas)" />
                </SelectTrigger>
                <SelectContent>
                  {batch.map((b) => (
                    <SelectItem key={b.id} value={String(b.id)}>
                      {labelBatch(b)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <Input
                type="number"
                min={1}
                value={r.jumlah || ""}
                placeholder="Jumlah"
                aria-label={`Jumlah baris ${i + 1}`}
                onChange={(e) => {
                  const ganti = [...barisKirim];
                  ganti[i] = { ...r, jumlah: Number(e.target.value) };
                  setBarisKirim(ganti);
                }}
                className="min-h-12 w-28"
              />
              {barisKirim.length > 1 && (
                <Button
                  variant="outline"
                  onClick={() => setBarisKirim(barisKirim.filter((_, j) => j !== i))}
                  className="min-h-12"
                  aria-label={`Hapus baris ${i + 1}`}
                >
                  Hapus
                </Button>
              )}
            </div>
          ))}
          <Button
            variant="outline"
            onClick={() => setBarisKirim([...barisKirim, { batch_id: 0, jumlah: 0 }])}
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
