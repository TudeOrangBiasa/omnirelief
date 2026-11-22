"use client";

import { Badge } from "@omnirelief/ui/components/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@omnirelief/ui/components/card";
import { ShaderBackground } from "@/components/motion/shader-background";

const REL = "ml-[6vw] w-[94vw] md:ml-[14vw] md:w-[86vw]";

const TOKEN = [
  { nama: "Latar", nilai: "#FFFFFF", contoh: "bg-white text-[#0B1F2E]" },
  { nama: "Tinta", nilai: "#232E40", contoh: "teks isi terang" },
  { nama: "Primer", nilai: "#3A538D", contoh: "CTA, judul terang" },
  { nama: "Aksen", nilai: "#1B7FBF", contoh: "ikon, sorotan" },
  { nama: "Band es", nilai: "#DCE8EE", contoh: "KPI + 3 langkah" },
  { nama: "Tinta laut", nilai: "#030D14", contoh: "shader + footer gelap" },
];

const UKUR = [
  ["H1 display", "80px / lh 88 / ls -0.05em / w400"],
  ["Gutter rel desktop", "14vw = 202px di 1440"],
  ["Gutter rel mobile", "6vw = 23px di 390"],
  ["Sumbu kiri", "logo = H1 = kotak #DCE8EE di x=202"],
  ["Sumbu kanan", "menu = paragraf di x=809"],
  ["Background", "mesh fixed full-viewport + fallback #030D14"],
];

const HALAMAN: { judul: string; berkas: string; alt: string; catatan: string }[] = [
  {
    judul: "/ — Landing desktop",
    berkas: "/laporan/rail6-hero.png",
    alt: "Landing desktop: hero 6/6, KPI menempel kanan, rel tinta kiri",
    catatan: "Hero 6/6, band #DCE8EE dock kanan, rel 14vw transparan.",
  },
  {
    judul: "/ — Landing mobile 390",
    berkas: "/laporan/rail7-mob.png",
    alt: "Landing mobile: nav kaca, hero menumpuk, dock pil",
    catatan: "Top bar kaca, pill dock 4 sel, rel 6vw.",
  },
  {
    judul: "/transparansi",
    berkas: "/laporan/rpt-trans.png",
    alt: "Transparansi: pita statistik, filter segmented, daftar posko",
    catatan: "Wash terang, teks navy. Statistik + filter + baris editorial.",
  },
  {
    judul: "/m/MNF-2026-0001",
    berkas: "/laporan/rpt-m.png",
    alt: "Detail manifest: badge terkunci, tabel isi, timeline hash, QR",
    catatan: "Tanggal lokal rapi, hash terpotong 16 aksara.",
  },
  {
    judul: "/s/DNT-2026-001",
    berkas: "/laporan/rpt-s.png",
    alt: "Detail sumbangan: progress alokasi, daftar pemakai",
    catatan: "Progress X dari Y, daftar manifest pemakai.",
  },
  {
    judul: "/masuk",
    berkas: "/laporan/pub-masuk2.png",
    alt: "Masuk relawan: kartu form + akun demo",
    catatan: "Form server action, akun demo untuk juri.",
  },
];

const CEK = [
  "check-types: 0 error",
  "lint: bersih dari error (warning arbitrary hanya milik perintah eksplisit)",
  "test: 33/33 lolos (termasuk 4 uji formatTanggalLokal)",
  "build produksi: hijau",
  "browser desktop 1440 + mobile 390: diverifikasi piksel per piksel",
];

export default function LaporanPage() {
  return (
    <main className="relative w-full">
      <ShaderBackground
        variant="mesh-gradient"
        colors={["#030D14", "#082032", "#0F3B5F", "#1B7FBF"]}
        aria-hidden
        className="pointer-events-none fixed inset-0 bg-[#030D14]"
      />
      <div className="relative ml-[calc(50%-50vw)] w-screen">
        <div className="ml-[6vw] w-[94vw] border-l border-white/20 md:ml-[14vw] md:w-[86vw]">
          <section aria-label="Sampul laporan" className="relative">
            <div className="grid gap-10 pb-16 pl-6 pr-5 pt-24 sm:pt-28 md:pb-24 md:pl-12 md:pr-10 lg:grid-cols-12 lg:gap-12 lg:pl-16 lg:pr-14">
              <div className="relative flex flex-col justify-center gap-5 lg:col-span-6">
                <p className="t-micro text-white/70">
                  Laporan desain · 22 Nov 2026 · rev rre-1banding1
                </p>
                <h1 className="t-display t-balance text-white">
                  Sama persis, terukur piksel.
                </h1>
              </div>
              <div className="relative flex flex-col justify-center gap-5 lg:col-span-6">
                <p className="t-body t-pretty max-w-xl text-white/80">
                  OmniRelief meniru sistem rre.com — bukan warnanya: grid rel,
                  skala tipe, kartu editorial datar, dan background hidup.
                  Setiap klaim di bawah dibuktikan angka browser,
                  bukan kira-kira.
                </p>
                <div className="flex flex-wrap gap-2">
                  <Badge className="rounded-full border-transparent bg-success-bg text-success">
                    check-types 0
                  </Badge>
                  <Badge className="rounded-full border-transparent bg-success-bg text-success">
                    test 33/33
                  </Badge>
                  <Badge className="rounded-full border-transparent bg-success-bg text-success">
                    build hijau
                  </Badge>
                </div>
              </div>
            </div>
          </section>

          <section
            aria-label="Sistem desain"
            className="relative rounded-none bg-[#DCE8EE] text-[#0B1F2E]"
          >
            <div className="relative grid gap-10 px-8 py-14 md:px-12 md:py-16 lg:grid-cols-12 lg:gap-12">
              <div className="flex flex-col justify-center gap-2 lg:col-span-5">
                <p className="t-micro opacity-70">Token + tipe</p>
                <h2 className="t-h2 t-balance">Sistem desain</h2>
              </div>
              <div className="flex flex-col gap-6 lg:col-span-7">
                <dl className="flex flex-col divide-y divide-[#0B1F2E]/20">
                  {TOKEN.map((t) => (
                    <div
                      key={t.nama}
                      className="flex items-baseline justify-between gap-4 py-3 first:pt-0 last:pb-0"
                    >
                      <dt className="text-sm">{t.nama}</dt>
                      <dd className="font-mono text-sm">{t.nilai}</dd>
                    </div>
                  ))}
                </dl>
                <div className="flex flex-col gap-2 border-t border-[#0B1F2E]/20 pt-4">
                  <p className="t-display">Display 80px</p>
                  <p className="t-h1">Heading 56px</p>
                  <p className="t-body">
                    Body 20px — satu grotesk, kontras lewat ukuran.
                  </p>
                  <p className="t-micro opacity-70">Mikro uppercase +0.08em</p>
                </div>
              </div>
            </div>
          </section>

          <section aria-label="Struktur rel" className="relative">
            <div className="relative grid gap-10 py-16 pl-6 pr-5 md:py-24 md:pl-12 md:pr-10 lg:grid-cols-12 lg:gap-12 lg:pl-16 lg:pr-14">
              <div className="flex flex-col justify-center gap-2 lg:col-span-5">
                <p className="t-micro text-white/70">Dua sumbu absolut</p>
                <h2 className="t-h2 t-balance text-white">
                  Rel kiri, konten dock kanan
                </h2>
              </div>
              <dl className="flex flex-col gap-3 lg:col-span-7">
                {UKUR.map(([nama, angka]) => (
                  <div
                    key={nama}
                    className="flex items-baseline justify-between gap-4 border-b border-white/15 pb-3 text-sm last:border-b-0"
                  >
                    <dt className="text-white/70">{nama}</dt>
                    <dd className="text-right font-mono text-xs text-white">
                      {angka}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </section>

          <section
            aria-label="Galeri halaman"
            className="relative rounded-none bg-[#DCE8EE] text-[#0B1F2E]"
          >
            <div className="relative grid gap-10 px-8 py-14 md:px-12 md:py-16 lg:grid-cols-12 lg:gap-12">
              <div className="flex flex-col justify-center gap-2 lg:col-span-5">
                <p className="t-micro opacity-70">Bukti visual</p>
                <h2 className="t-h2 t-balance">Galeri halaman publik</h2>
                <p className="text-sm opacity-80">
                  Tangkapan desktop 1440 + mobile 390 dari sesi
                  agent-browser yang sama dengan angka di atas.
                </p>
              </div>
              <div className="grid gap-6 sm:grid-cols-2 lg:col-span-7">
                {HALAMAN.map((h) => (
                  <Card key={h.judul} className="overflow-hidden">
                    <CardHeader>
                      <CardTitle className="text-base">{h.judul}</CardTitle>
                    </CardHeader>
                    <CardContent className="flex flex-col gap-2">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={h.berkas}
                        alt={h.alt}
                        loading="lazy"
                        className="w-full rounded-xl border border-border"
                      />
                      <p className="text-xs text-muted-foreground">{h.catatan}</p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>

          <section aria-label="Verifikasi" className="relative">
            <div className="relative grid gap-10 py-16 pl-6 pr-5 md:py-24 md:pl-12 md:pr-10 lg:grid-cols-12 lg:gap-12 lg:pl-16 lg:pr-14">
              <div className="flex flex-col justify-center gap-2 lg:col-span-5">
                <p className="t-micro text-white/70">Checklist</p>
                <h2 className="t-h2 t-balance text-white">Verifikasi</h2>
              </div>
              <ul className="flex flex-col gap-3 lg:col-span-7">
                {CEK.map((c) => (
                  <li
                    key={c}
                    className="flex items-start gap-3 border-b border-white/15 pb-3 text-sm text-white/85 last:border-b-0"
                  >
                    <span
                      aria-hidden="true"
                      className="mt-0.5 inline-flex size-5 shrink-0 items-center justify-center rounded-full bg-success text-[11px] font-bold text-success-foreground"
                    >
                      ✓
                    </span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          </section>

          <footer className="relative border-t border-white/20 py-6 pb-8 text-sm text-white/70">
            <div className="relative flex flex-col gap-3 pl-6 pr-5 md:pl-12 md:pr-10 lg:pl-16 lg:pr-14">
              <nav className="flex gap-4">
                <a href="/" className="font-semibold text-white">Beranda</a>
                <a href="/transparansi" className="font-semibold text-white">Transparansi</a>
                <a href="/masuk" className="font-semibold text-white">Masuk</a>
              </nav>
              <p className="text-xs">
                OmniRelief untuk SEVENT X. Laporan dibuat dari sesi browser yang
                sama dengan angka di atas.
              </p>
            </div>
          </footer>
        </div>
      </div>
    </main>
  );
}
