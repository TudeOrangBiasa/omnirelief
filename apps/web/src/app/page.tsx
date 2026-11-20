"use client";

import { useEffect, useState } from "react";
import {
  ClipboardCheckIcon,
  LockKeyholeMinimalisticIcon,
  MagnifierIcon,
  QrCodeIcon,
  ShieldWarningIcon,
  TruckIcon,
} from "@solar-icons/react/linear";
import { Badge } from "@omnirelief/ui/components/badge";
import { Button, buttonVariants } from "@omnirelief/ui/components/button";
import { Card, CardContent } from "@omnirelief/ui/components/card";
import { Input } from "@omnirelief/ui/components/input";
import { cn } from "@omnirelief/ui/lib/utils";

type Baris = {
  butuh: number;
  dikirim: number;
  diterima: number;
  selisih: number;
};

const JANJI = [
  {
    ikon: ClipboardCheckIcon,
    judul: "Terdata",
    isi: "Tiap paket tercatat dari gudang sampai posko, per batch plus kedaluwarsa.",
    href: "/transparansi",
  },
  {
    ikon: TruckIcon,
    judul: "Terverifikasi",
    isi: "Kebutuhan dari data penyintas terverifikasi, alokasi keluar duluan yang dekat kedaluwarsa.",
    href: "/transparansi",
  },
  {
    ikon: LockKeyholeMinimalisticIcon,
    judul: "Terkunci",
    isi: "Manifest terpublikasi tidak bisa diubah. Koreksi hanya lewat dokumen publik baru.",
    href: "/transparansi",
  },
  {
    ikon: ShieldWarningIcon,
    judul: "Terbuka",
    isi: "Selisih kirim lawan terima dan laporan masalah tampil publik per posko.",
    href: "/transparansi",
  },
];

const LANGKAH = [
  "Ketik kode manifest atau kode sumbangan dari QR atau kertas.",
  "Buka detail: isi, timeline riwayat, dan hash pengunci.",
  "Cocokkan angka dan tanggal dengan yang kamu terima di lapangan.",
];

export default function Home() {
  const [kode, setKode] = useState("");
  const [jenis, setJenis] = useState<"MNF" | "DNT">("MNF");
  const [totalPosko, setTotalPosko] = useState<number | null>(null);
  const [totalDiterima, setTotalDiterima] = useState<number | null>(null);
  const [totalSelisih, setTotalSelisih] = useState<number | null>(null);

  useEffect(() => {
    void fetch("/api/publik/dashboard")
      .then((r) => r.json())
      .then((d: { ok: boolean; dashboard?: Baris[] }) => {
        if (d.ok && d.dashboard) {
          setTotalPosko(d.dashboard.length);
          setTotalDiterima(d.dashboard.reduce((s, p) => s + p.diterima, 0));
          setTotalSelisih(d.dashboard.reduce((s, p) => s + p.selisih, 0));
        }
      })
      .catch(() => {});
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-10 p-6">
      <section id="cek-kode" aria-label="Cek kode kiriman" className="flex scroll-mt-20 flex-col gap-4 pt-6">
        <Badge className="w-fit" variant="outline">
          Sistem supply chain pangan darurat
        </Badge>
        <h1 className="text-4xl font-bold leading-tight text-primary">
          Tiap paket tercatat, tiap posko terlihat
        </h1>
        <p className="text-muted-foreground">
          OmniRelief mencatat bantuan pangan dari gudang sampai posko. Publik
          bisa cek tanpa login, data terkunci tidak bisa diubah diam-diam.
        </p>
        <form
          action={`/${jenis === "MNF" ? "m" : "s"}/${kode.trim()}`}
          className="flex gap-2"
        >
          <Input
            value={kode}
            onChange={(e) => {
              const v = e.target.value.toUpperCase();
              setKode(v);
              if (v.startsWith("DNT")) setJenis("DNT");
              else setJenis("MNF");
            }}
            placeholder="Ketik kode MNF-... atau DNT-..."
            required
            className="min-h-12 flex-1"
          />
          <Button type="submit" className="min-h-12 rounded-xl">
            <MagnifierIcon /> Cek
          </Button>
        </form>
        <div className="flex gap-2">
          <a
            href="/transparansi"
            className={cn(buttonVariants({ variant: "outline" }), "min-h-12 flex-1 rounded-xl")}
          >
            Dashboard transparansi
          </a>
          <a
            href="/masuk"
            className={cn(buttonVariants({ variant: "outline" }), "min-h-12 flex-1 rounded-xl")}
          >
            Masuk relawan
          </a>
        </div>
      </section>

      <section className="grid grid-cols-3 gap-3">
        <Card>
          <CardContent className="flex flex-col p-4">
            <span className="text-3xl font-bold text-primary">
              {totalPosko === null ? "…" : totalPosko}
            </span>
            <span className="text-muted-foreground text-xs">Posko terpantau</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col p-4">
            <span className="text-3xl font-bold text-primary">
              {totalDiterima === null ? "…" : totalDiterima}
            </span>
            <span className="text-muted-foreground text-xs">Paket diterima</span>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col p-4">
            <span className="text-3xl font-bold text-destructive">
              {totalSelisih === null ? "…" : totalSelisih}
            </span>
            <span className="text-muted-foreground text-xs">Masih kurang</span>
          </CardContent>
        </Card>
      </section>

      <section className="flex flex-col">
        <h2 className="mb-2 text-lg font-bold text-primary">Empat janji kami</h2>
        {JANJI.map((j, i) => (
          <a
            key={j.judul}
            href={j.href}
            className="flex items-start gap-3 border-t py-4 last:border-b"
          >
            <span className="text-muted-foreground mt-0.5 text-sm font-bold">
              {String(i + 1).padStart(2, "0")}
            </span>
            <j.ikon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <span>
              <span className="block font-semibold">{j.judul}</span>
              <span className="text-muted-foreground block text-sm">{j.isi}</span>
            </span>
          </a>
        ))}
      </section>

      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-bold text-primary">Cara cek dalam 3 langkah</h2>
        {LANGKAH.map((l, i) => (
          <div key={i} className="flex items-start gap-3 text-sm">
            <QrCodeIcon className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
            <p>
              <strong>Langkah {i + 1}.</strong> {l}
            </p>
          </div>
        ))}
      </section>

      <footer className="flex flex-col gap-3 border-t pt-6 pb-4 text-sm">
        <nav className="flex gap-4">
          <a href="/" className="font-semibold">Beranda</a>
          <a href="/transparansi" className="font-semibold">Transparansi</a>
          <a href="/masuk" className="font-semibold">Masuk</a>
        </nav>
        <p className="text-muted-foreground text-xs">
          OmniRelief untuk SEVENT X. Data demo berlabel contoh sampai project Supabase hidup.
        </p>
      </footer>
    </main>
  );
}
