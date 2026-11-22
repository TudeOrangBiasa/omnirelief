"use client";

import { useEffect, useState } from "react";
import {
  ClipboardCheckIcon,
  LockKeyholeMinimalisticIcon,
  MagnifierIcon,
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
import { Input } from "@omnirelief/ui/components/input";
import { cn } from "@omnirelief/ui/lib/utils";
import { ShaderBackground } from "@/components/motion/shader-background";

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

// Rel kiri: satu container viewport di bawah navbar; semua band duduk di dalamnya.

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
    <main className="relative w-full">
      <ShaderBackground
        variant="mesh-gradient"
        colors={["#030D14", "#082032", "#0F3B5F", "#1B7FBF"]}
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[#030D14]"
      />

      <div className="relative ml-[calc(50%-50vw)] w-screen">
      {/* Band 1 — Hero transparan di atas tinta */}
      <section
        id="cek-kode"
        aria-label="Cek kode kiriman"
        className="relative ml-[6vw] w-[94vw] scroll-mt-20 md:ml-[14vw] md:w-[86vw]"
      >
        <div className="grid grid-cols-1 gap-8 pb-16 pr-5 pt-24 sm:pt-28 md:pb-24 md:pr-10 lg:grid-cols-12 lg:pr-14">
          <div className="relative flex flex-col justify-center gap-5 lg:col-span-6">
            <p className="t-micro text-white/70">
              Sistem supply chain pangan darurat
            </p>
            <h1 className="t-display t-balance text-white">
              Tiap paket tercatat, tiap posko terlihat
            </h1>
          </div>
          <div className="relative flex flex-col gap-5 lg:col-span-6">
            <p className="t-body t-pretty max-w-xl text-white/80">
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
                className="min-h-12 flex-1 border-white/30 bg-white/10 font-mono text-white placeholder:text-white/50"
              />
              <Button
                type="submit"
                className="min-h-12 rounded-xl bg-white px-5 text-[#0B1F2E] hover:bg-white/90"
              >
                <MagnifierIcon aria-hidden="true" /> Cek
              </Button>
            </form>
            <aside aria-label="Pratinjau kartu manifest terkunci">
              <Card>
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
                      <dd className="t-angka font-semibold">240 karung</dd>
                    </div>
                    <div className="flex items-center justify-between gap-3 px-4 py-3">
                      <dt className="text-muted-foreground">Hash pengunci</dt>
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
          </div>
        </div>
      </section>
      <div className="ml-[6vw] w-[94vw] border-l border-white/20 md:ml-[14vw] md:w-[86vw]">

      {/* Band 2 — KPI solid biru-es menempel kanan */}
      <section
        aria-label="Ringkasan angka"
        className="relative rounded-none bg-[#DCE8EE] text-[#0B1F2E]"
      >
        <div className="relative grid grid-cols-1 gap-8 px-8 py-14 md:px-12 md:py-16 lg:grid-cols-12">
          <div className="flex flex-col justify-center gap-2 lg:col-span-5">
            <p className="t-micro opacity-70">Tanpa login</p>
            <h2 className="t-h2 t-balance">
              Transparansi pangan per posko
            </h2>
          </div>
          <dl className="relative flex flex-col divide-y divide-[#0B1F2E]/20 lg:col-span-7">
            <div className="flex items-baseline justify-between gap-4 py-4 first:pt-0 last:pb-0">
              <dt className="text-sm">Posko Terpantau</dt>
              <dd className="t-h2 t-angka tabular-nums">
                {totalPosko === null ? "…" : totalPosko}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-4 first:pt-0 last:pb-0">
              <dt className="text-sm">Paket Diterima</dt>
              <dd className="t-h2 t-angka tabular-nums">
                {totalDiterima === null ? "…" : totalDiterima}
              </dd>
            </div>
            <div className="flex items-baseline justify-between gap-4 py-4 first:pt-0 last:pb-0">
              <dt className="text-sm">Masih Kurang</dt>
              <dd className="t-h2 t-angka tabular-nums">
                {totalSelisih === null ? "…" : totalSelisih}
              </dd>
            </div>
          </dl>
        </div>
      </section>

      {/* Band 3 — Empat janji transparan di atas tinta */}
      <section
        id="janji"
        aria-label="Empat janji anti-korupsi"
        className="relative scroll-mt-20"
      >
        <div className="relative grid gap-10 py-16 pr-5 md:py-24 md:pr-10 lg:grid-cols-12 lg:gap-12 lg:pr-14">
          <div className="flex flex-col justify-center gap-2 lg:col-span-5">
            <p className="t-micro text-white/70">Empat janji anti-korupsi</p>
            <h2 className="t-h2 t-balance text-white">
              Uang dan barang publik harus bisa diikuti siapa saja
            </h2>
          </div>
          <div className="grid gap-px overflow-hidden border border-white/25 sm:grid-cols-2 lg:col-span-7">
            {JANJI.map((j, i) => (
              <a
                key={j.judul}
                href={j.href}
                className="relative flex flex-col gap-3 p-6 transition-colors hover:bg-white/10 md:p-8"
              >
                <div className="flex items-center justify-between">
                  <span className="t-micro text-white/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <j.ikon
                    aria-hidden="true"
                    className="h-6 w-6 shrink-0 text-white"
                  />
                </div>
                <span className="text-lg font-semibold text-white">{j.judul}</span>
                <span className="text-sm leading-relaxed text-white/70">{j.isi}</span>
              </a>
            ))}
          </div>
        </div>
      </section>

      {/* Band 4 — Alur 3 langkah solid biru-es menempel kanan */}
      <section
        id="cara-cek"
        aria-label="Cara cek dalam 3 langkah"
        className="relative scroll-mt-20 rounded-none bg-[#DCE8EE] text-[#0B1F2E]"
      >
        <div className="relative grid grid-cols-1 gap-8 px-8 py-14 md:px-12 md:py-16 lg:grid-cols-12">
          <div className="flex flex-col justify-center gap-2 lg:col-span-5">
            <p className="t-micro opacity-70">Verifikasi publik</p>
            <h2 className="t-h2 t-balance">
              Cek keaslian dalam 3 langkah
            </h2>
          </div>
          <ol className="flex flex-col divide-y divide-[#0B1F2E]/20 lg:col-span-7">
            {LANGKAH.map((l, i) => (
              <li key={i} className="flex items-start gap-5 py-6 first:pt-0 last:pb-0">
                <span
                  aria-hidden="true"
                  className="t-h2 t-angka opacity-50"
                >
                  {String(i + 1).padStart(2, "0")}
                </span>
                <p className="max-w-xl leading-relaxed">
                  <strong>Langkah {i + 1}.</strong> {l}
                </p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* Band 5 — Penutup transparan + CTA */}
      <section aria-label="Mulai cek sekarang" className="relative">
        <div className="relative flex flex-col items-start gap-4 py-16 pr-5 md:py-24 md:pr-10 lg:pr-14">
          <h2 className="t-h2 t-balance text-white">
            Pegang kode? Langsung cek.
          </h2>
          <p className="max-w-xl text-white/70">
            Tanpa akun, tanpa antre. Kode ada di QR, kertas, atau papan posko.
          </p>
          <div className="flex flex-wrap gap-2">
            <a
              href="/transparansi"
              className={cn(buttonVariants(), "min-h-12 rounded-xl bg-white px-6 text-sm font-semibold text-[#0B1F2E] hover:bg-white/90")}
            >
              Dashboard transparansi
            </a>
            <a
              href="/masuk"
              className={cn(buttonVariants({ variant: "outline" }), "min-h-12 rounded-xl border border-white/40 bg-white/10 px-6 text-white backdrop-blur-sm hover:bg-white/20 hover:text-white")}
            >
              Masuk relawan
            </a>
          </div>
        </div>
      </section>

      <footer className="relative border-t border-white/20 py-6 pb-8 text-sm text-white/70">
        <div className="relative flex flex-col gap-3 pr-5 md:pr-10 lg:pr-14">
          <nav className="flex gap-4">
            <a href="/" className="font-semibold text-white">Beranda</a>
            <a href="/transparansi" className="font-semibold text-white">Transparansi</a>
            <a href="/masuk" className="font-semibold text-white">Masuk</a>
          </nav>
          <p className="text-xs">
            OmniRelief untuk SEVENT X. Data demo berlabel contoh sampai project Supabase hidup.
          </p>
        </div>
      </footer>
      </div>
      </div>
    </main>
  );
}
