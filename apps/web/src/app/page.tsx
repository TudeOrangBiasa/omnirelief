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
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@omnirelief/ui/components/card";
import { AuroraBackground } from "@omnirelief/ui/components/velora/aurora-background";
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

const CONTOH_KODE = "MNF-2026-0001";

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

  const kodeKetik = kode.trim();
  const kodePratinjau = kodeKetik === "" ? CONTOH_KODE : kodeKetik;

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 md:px-10">
      <section
        id="cek-kode"
        aria-label="Cek kode kiriman"
        className="relative grid scroll-mt-20 gap-10 section-napas lg:grid-cols-12 lg:gap-12"
      >
        <AuroraBackground intensity="subtle" className="fixed inset-0" />
        <div className="relative flex flex-col gap-5 lg:col-span-7">
          <p className="t-micro text-primary">
            Sistem supply chain pangan darurat
          </p>
          <h1 className="t-display t-balance text-primary">
            Tiap paket tercatat, tiap posko terlihat
          </h1>
          <p className="t-body t-pretty max-w-xl text-muted-foreground">
            OmniRelief mencatat bantuan pangan dari gudang sampai posko.
            Publik bisa cek tanpa login, data terkunci tidak bisa diubah
            diam-diam.
          </p>
          <form
            action={`/${jenis === "MNF" ? "m" : "s"}/${kodeKetik}`}
            className="flex max-w-xl gap-2"
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
              aria-label="Kode manifest atau sumbangan"
              required
              className="min-h-12 flex-1 font-mono"
            />
            <Button type="submit" className="min-h-12 rounded-xl px-5">
              <MagnifierIcon aria-hidden="true" /> Cek
            </Button>
          </form>
          <div className="flex max-w-xl gap-2">
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
        </div>

        <aside
          aria-label="Pratinjau kartu manifest terkunci"
          className="relative lg:col-span-5"
        >
          <Card className="lg:sticky lg:top-24">
            <CardHeader>
              <div className="flex flex-wrap items-center gap-2">
                <Badge className="rounded-full border-transparent bg-success-bg text-success">
                  TERKUNCI
                </Badge>
                <Badge variant="outline" className="rounded-full">
                  {kodeKetik === "" ? "Contoh tampilan" : "Pratinjau kode ketikanmu"}
                </Badge>
              </div>
              <CardTitle className="mt-3 font-mono text-xl font-bold break-all">
                {kodePratinjau}
              </CardTitle>
              <CardDescription>
                Posko Balikpapan Utara · Tim A · 21 Nov 2026, 09.47 WITA
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <dl className="flex flex-col divide-y divide-border rounded-xl border border-border text-sm">
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <dt className="text-muted-foreground">Paket Sembako</dt>
                  <dd className="t-angka font-semibold">120 paket</dd>
                </div>
                <div className="flex items-center justify-between gap-3 px-4 py-3">
                  <dt className="text-muted-foreground">Beras 5 kg</dt>
                  <dd className="font-mono text-xs text-muted-foreground">
                    9f2c…41ad
                  </dd>
                </div>
              </dl>
              <p className="text-xs text-muted-foreground">
                Kartu persis seperti ini tampil untuk tiap kode asli. Riwayat
                append-only, tiap baris berhash.
              </p>
            </CardContent>
          </Card>
        </aside>
      </section>

      <section
        aria-label="Angka pantauan"
        className="grid grid-cols-3 divide-x divide-border border-y border-border py-8"
      >
        <div className="flex flex-col gap-1 px-4 first:pl-0 md:px-8">
          <span className="t-h2 t-angka text-primary">
            {totalPosko === null ? "…" : totalPosko}
          </span>
          <span className="text-xs text-muted-foreground md:text-sm">
            Posko terpantau
          </span>
        </div>
        <div className="flex flex-col gap-1 px-4 md:px-8">
          <span className="t-h2 t-angka text-primary">
            {totalDiterima === null ? "…" : totalDiterima}
          </span>
          <span className="text-xs text-muted-foreground md:text-sm">
            Paket diterima
          </span>
        </div>
        <div className="flex flex-col gap-1 px-4 md:px-8">
          <span className="t-h2 t-angka text-destructive">
            {totalSelisih === null ? "…" : totalSelisih}
          </span>
          <span className="text-xs text-muted-foreground md:text-sm">
            Masih kurang
          </span>
        </div>
      </section>

      <section aria-label="Empat janji anti-korupsi" className="section-napas">
        <p className="t-micro text-primary">Empat janji anti-korupsi</p>
        <h2 className="t-h2 t-balance mt-2 max-w-2xl text-primary">
          Uang dan barang publik harus bisa diikuti siapa saja
        </h2>
        <div className="mt-8 grid gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-2">
          {JANJI.map((j, i) => (
            <a
              key={j.judul}
              href={j.href}
              className="flex flex-col gap-3 bg-card p-6 transition-colors hover:bg-muted md:p-8"
            >
              <div className="flex items-center justify-between">
                <span className="t-micro text-muted-foreground">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <j.ikon
                  aria-hidden="true"
                  className="h-6 w-6 shrink-0 text-accent"
                />
              </div>
              <span className="text-lg font-semibold">{j.judul}</span>
              <span className="text-sm leading-relaxed text-muted-foreground">
                {j.isi}
              </span>
            </a>
          ))}
        </div>
      </section>

      <section
        aria-label="Cara cek dalam 3 langkah"
        className="-mx-5 bg-primary text-primary-foreground md:-mx-10"
      >
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-5 py-16 md:px-10 md:py-24">
          <div>
            <p className="t-micro opacity-80">Verifikasi publik</p>
            <h2 className="t-h2 t-balance mt-2 max-w-2xl">
              Cek keaslian bantuan dalam 3 langkah
            </h2>
          </div>
          <ol className="flex flex-col divide-y divide-primary-foreground/15">
            {LANGKAH.map((l, i) => (
              <li key={i} className="flex items-start gap-5 py-6">
                <span
                  aria-hidden="true"
                  className="t-h2 t-angka opacity-60"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <div className="flex items-start gap-3">
                  <QrCodeIcon
                    aria-hidden="true"
                    className="mt-1 h-5 w-5 shrink-0"
                  />
                  <p className="max-w-xl leading-relaxed">
                    <strong>Langkah {i + 1}.</strong> {l}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section aria-label="Mulai cek sekarang" className="section-napas">
        <Card>
          <CardContent className="flex flex-col items-start gap-4 p-6 md:flex-row md:items-center md:justify-between md:p-8">
            <div>
              <h2 className="t-h2 text-primary">
                Pegang kode? Langsung cek.
              </h2>
              <p className="mt-1 text-sm text-muted-foreground">
                Tanpa akun, tanpa antre. Kode ada di QR, kertas, atau papan posko.
              </p>
            </div>
            <a
              href="#cek-kode"
              className={cn(buttonVariants(), "min-h-12 rounded-xl px-6")}
            >
              <MagnifierIcon aria-hidden="true" /> Cek kode
            </a>
          </CardContent>
        </Card>
      </section>

      <footer className="flex flex-col gap-3 border-t border-border py-6 pb-8 text-sm">
        <nav className="flex gap-4">
          <a href="/" className="font-semibold">Beranda</a>
          <a href="/transparansi" className="font-semibold">Transparansi</a>
          <a href="/masuk" className="font-semibold">Masuk</a>
        </nav>
        <p className="text-xs text-muted-foreground">
          OmniRelief untuk SEVENT X. Data demo berlabel contoh sampai project Supabase hidup.
        </p>
      </footer>
    </main>
  );
}
