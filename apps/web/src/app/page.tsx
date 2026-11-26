"use client";

import { useEffect, useState } from "react";
import { CloseCircleIcon, MagnifierIcon } from "@solar-icons/react/linear";
import { Badge } from "@omnirelief/ui/components/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@omnirelief/ui/components/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@omnirelief/ui/components/dialog";
import { Input } from "@omnirelief/ui/components/input";
import TombolKeAtas from "@/components/tombol-ke-atas";
import { ShaderBackground } from "@/components/motion/shader-background";
import { normalisasiKode, ruteKode } from "@/lib/kode";
import Logo from "@/components/logo";

type Baris = {
  butuh: number;
  dikirim: number;
  diterima: number;
  selisih: number;
};

const CONTOH_KODE = "MNF-2026-0001";
const CONTOH_DNT = "DNT-2026-001";

// Padding kiri seragam tiap section agar tidak ada teks menempel sumbu border-l.
const PAD = "pl-6 pr-5 md:pl-12 md:pr-10 lg:pl-14 lg:pr-12";

function gerakKecil(): boolean {
  return (
    typeof window !== "undefined" &&
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

// Count-up rAF ~800ms ease-out dari 0 ke target.
function useAngka(target: number): number {
  const [tampil, setTampil] = useState(0);
  useEffect(() => {
    if (gerakKecil()) {
      setTampil(target);
      return;
    }
    let bingkai = 0;
    const mulai = performance.now();
    const lama = 800;
    const putar = (kini: number) => {
      const t = Math.min((kini - mulai) / lama, 1);
      const reda = 1 - Math.pow(1 - t, 3);
      setTampil(Math.round(target * reda));
      if (t < 1) bingkai = requestAnimationFrame(putar);
    };
    bingkai = requestAnimationFrame(putar);
    return () => cancelAnimationFrame(bingkai);
  }, [target]);
  return tampil;
}

// Reveal sekali-jalan: konten default terlihat; IO hanya menambah .animate-enter.
function useUngkap(): void {
  useEffect(() => {
    if (typeof IntersectionObserver === "undefined") return;
    const el = Array.from(document.querySelectorAll("[data-ungkap]"));
    if (el.length === 0) return;
    const io = new IntersectionObserver(
      (masuk) => {
        for (const m of masuk) {
          if (m.isIntersecting) {
            m.target.classList.add("animate-enter");
            io.unobserve(m.target);
          }
        }
      },
      { threshold: 0.15 },
    );
    for (const x of el) io.observe(x);
    return () => io.disconnect();
  }, []);
}
const JANJI = [
  {
    nomor: "01",
    judul: "Terdata",
    isi: "Tiap batch sumbangan tercatat dengan kode DNT, jumlah, dan kedaluwarsa.",
  },
  {
    nomor: "02",
    judul: "Terverifikasi",
    isi: "Jatah posko dihitung dari snapshot penyintas yang disetujui BPBD.",
  },
  {
    nomor: "03",
    judul: "Terkunci",
    isi: "Manifest terpublikasi dikunci hash SHA-256. Tidak ada ubah diam-diam.",
  },
  {
    nomor: "04",
    judul: "Terbuka",
    isi: "Selisih kirim lawan terima dan laporan masalah tampil publik per posko.",
  },
];

const GARDA = [
  {
    judul: "01 / Gudang Logistik",
    sub: "Intake Batch dan Antrean FEFO",
    isi: "Petugas gudang mencatat tiap sumbangan masuk menjadi batch berkode DNT lengkap dengan tanggal kedaluwarsa. Sistem menandai batch yang dekat kedaluwarsa dan menyarankan barang yang keluar duluan.",
  },
  {
    judul: "02 / Command Center BPBD",
    sub: "Alokasi dan Penguncian Manifest",
    isi: "BPBD memverifikasi angka penyintas tiap posko, menyusun paket kiriman, lalu menerbitkan manifest berkode MNF. Sekali publikasi, manifest dikunci hash SHA-256 dan tidak bisa diubah.",
  },
  {
    judul: "03 / Tim Distribusi Lapangan",
    sub: "Check-in dan Pelacakan Armada",
    isi: "Tim memperbarui empat tahap pengiriman secara berurutan dan mengirim kabar check-in berkala. Lewat batas tanpa kabar, status berubah Perlu Dicek dan BPBD menghubungi lewat jalur darurat.",
  },
  {
    judul: "04 / Relawan Posko dan Publik",
    sub: "Konfirmasi dan Audit Terbuka",
    isi: "Posko mencatat penyintas secara agregat tanpa NIK lalu mengonfirmasi penerimaan barang. Publik memantau selisih tiap posko secara terbuka dan bisa melapor ketidaksesuaian.",
  },
];

const LANGKAH = [
  {
    nomor: "01",
    isi: "Pegang kode dari QR, kertas, atau papan posko. Contoh: MNF-2026-0001.",
  },
  {
    nomor: "02",
    isi: "Buka halaman detail. Lihat isi paket, timeline riwayat, dan hash pengunci.",
  },
  {
    nomor: "03",
    isi: "Cocokkan angka paket dan tanggal dengan yang tiba di posko.",
  },
];

const ARSITEKTUR = [
  {
    nomor: "01",
    judul: "Append-Only Ledger (Hash SHA-256)",
    isi: "Dokumen manifest terkunci tidak bisa diubah atau dihapus diam-diam. Setiap koreksi membentuk jejak riwayat baru yang permanen. Ibarat segel: kalau ada yang nekat mengubah, segelnya rusak dan semua orang bisa lihat.",
  },
  {
    nomor: "02",
    judul: "Offline-First dan Sinkronisasi Otomatis",
    isi: "Pencatatan di posko dan rute distribusi tetap berjalan saat sinyal seluler terputus. Data tersimpan sebagai Menunggu Sinkronisasi lalu terkirim otomatis begitu koneksi pulih.",
  },
  {
    nomor: "03",
    judul: "Privasi Penyintas Tanpa NIK",
    isi: "Seluruh data dicatat agregat per kelompok rentan: bayi, balita, ibu hamil, lansia, disabilitas. Tidak ada nama atau NIK yang disimpan.",
  },
];

const FAQ = [
  {
    tanya: "Apakah warga atau donatur perlu mendaftar akun untuk mengecek bantuan?",
    jawab:
      "Tidak. Semua halaman transparansi terbuka tanpa login. Akun hanya untuk petugas gudang, BPBD, posko, dan tim distribusi.",
  },
  {
    tanya: "Bagaimana cara memastikan barang di posko sesuai data sistem?",
    jawab:
      "Bandingkan isi paket dengan halaman detail kode MNF. Tiap batch, jumlah, dan hash pengunci tercantum di sana. Selisih tampil sebagai angka Masih Kurang.",
  },
  {
    tanya: "Bagaimana jika sinyal internet di posko atau jalur distribusi terputus total?",
    jawab:
      "Pencatatan tetap berjalan offline dan tersimpan sebagai Menunggu Sinkronisasi. Data terkirim otomatis begitu koneksi pulih.",
  },
  {
    tanya: "Mengapa sistem tidak mencatat nama atau NIK penyintas?",
    jawab:
      "Data penyintas dicatat agregat per kelompok rentan: bayi, balita, ibu hamil, lansia, disabilitas. Privasi korban tetap terlindungi.",
  },
  {
    tanya: "Apa yang terjadi jika paket diterima tidak sesuai manifest?",
    jawab:
      "Posko melapor lewat fitur ketidaksesuaian: kurang, rusak, tidak sesuai, tidak diterima, atau kirim ulang. Laporan tampil publik di halaman manifest.",
  },
];

const LEGAL: { judul: string; isi: string }[] = [
  {
    judul: "Kebijakan Privasi",
    isi: "OmniRelief hanya mencatat data agregat penyintas tanpa nama atau NIK. Kode publik MNF dan DNT tidak memuat data pribadi. Akun petugas dilindungi kata sandi dan peran akses.",
  },
  {
    judul: "Ketentuan Layanan",
    isi: "Halaman publik untuk pantau bantuan. Data operasional hanya diubah lewat portal petugas. Manifest terpublikasi terkunci dan koreksi lewat dokumen publik baru.",
  },
  {
    judul: "Standar Keamanan Data",
    isi: "Tiap manifest dan baris riwayat terikat hash SHA-256 ke hash sebelumnya. Database menolak update dan delete pada data terkunci. Tulis hanya lewat API route dengan service role.",
  },
];

function Sudut({ terang }: { terang?: boolean }) {
  const garis = terang ? "border-[#0B1F2E]" : "border-white";
  return (
    <span aria-hidden="true">
      <span className={`absolute top-0 left-0 h-1.5 w-1.5 border-t border-l ${garis}`} />
      <span className={`absolute top-0 right-0 h-1.5 w-1.5 border-t border-r ${garis}`} />
      <span className={`absolute bottom-0 left-0 h-1.5 w-1.5 border-b border-l ${garis}`} />
      <span className={`absolute right-0 bottom-0 h-1.5 w-1.5 border-r border-b ${garis}`} />
    </span>
  );
}

function TombolSudut({
  href,
  children,
  terang,
}: {
  href: string;
  children: React.ReactNode;
  terang?: boolean;
}) {
  return (
    <a
      href={href}
      className={
        terang
          ? "tekan relative inline-flex min-h-12 items-center justify-center px-5 font-mono text-[11px] tracking-[0.15em] text-[#0B1F2E] uppercase hover:bg-[#0B1F2E]/5"
          : "tekan relative inline-flex min-h-12 items-center justify-center border border-white/40 bg-white/10 px-5 font-mono text-[11px] tracking-[0.15em] text-white uppercase backdrop-blur-sm hover:bg-white/20"
      }
    >
      <Sudut terang={terang} />
      {children}
    </a>
  );
}

function AkordeonGelap() {
  const [buka, setBuka] = useState<number | null>(0);
  return (
    <div className="divide-y divide-white/20 border-y border-white/20">
      {GARDA.map((g, i) => {
        const terbuka = buka === i;
        return (
          <div key={g.judul}>
            <button
              type="button"
              aria-expanded={terbuka}
              onClick={() => setBuka(terbuka ? null : i)}
              className="flex min-h-12 w-full items-center justify-between gap-4 py-5 text-left"
            >
              <span>
                <span className="block font-semibold text-white">{g.judul}</span>
                <span className="mt-1 block text-sm text-white/60">{g.sub}</span>
              </span>
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center border border-white/30 font-mono text-lg text-white"
              >
                {terbuka ? "−" : "+"}
              </span>
            </button>
            <div className="akor-bungkus" data-buka={terbuka} inert={!terbuka}>
              <div className="akor-dalam">
                <p className="max-w-2xl pb-6 text-sm leading-relaxed text-white/70">
                  {g.isi}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function AkordeonTerang() {
  const [buka, setBuka] = useState<number | null>(0);
  return (
    <div className="divide-y divide-[#0B1F2E]/20 border-y border-[#0B1F2E]/20">
      {FAQ.map((f, i) => {
        const terbuka = buka === i;
        return (
          <div key={f.tanya}>
            <button
              type="button"
              aria-expanded={terbuka}
              onClick={() => setBuka(terbuka ? null : i)}
              className="flex min-h-12 w-full items-center justify-between gap-4 py-5 text-left"
            >
              <span className="font-medium text-[#0B1F2E]">{f.tanya}</span>
              <span
                aria-hidden="true"
                className="flex size-8 shrink-0 items-center justify-center border border-[#0B1F2E]/30 font-mono text-lg text-[#0B1F2E]"
              >
                {terbuka ? "−" : "+"}
              </span>
            </button>
            <div className="akor-bungkus" data-buka={terbuka} inert={!terbuka}>
              <div className="akor-dalam">
                <p className="max-w-2xl pb-6 text-sm leading-relaxed opacity-70">
                  {f.jawab}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function Home() {
  const [kode, setKode] = useState("");
  const [totalPosko, setTotalPosko] = useState(0);
  const [totalDiterima, setTotalDiterima] = useState(0);
  const [totalSelisih, setTotalSelisih] = useState(0);
  const [legal, setLegal] = useState<string | null>(null);
  useUngkap();
  const angkaPosko = useAngka(totalPosko);
  const angkaDiterima = useAngka(totalDiterima);
  const angkaSelisih = useAngka(totalSelisih);

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
  const legalAktif = LEGAL.find((l) => l.judul === legal) ?? null;

  return (
    <main className="relative w-full pb-28 md:pb-0">
      <ShaderBackground
        variant="mesh-gradient"
        colors={["#030D14", "#082032", "#0F3B5F", "#0f79b8"]}
        aria-hidden
        className="pointer-events-none fixed inset-0 h-screen w-screen bg-[#030D14]"
      />

      <div className="relative ml-[calc(50%-50vw)] w-screen">
        {/* Band 1. Hero transparan di atas shader */}
        <section
          id="cek-kode"
          aria-label="Cek kode kiriman"
          className="relative ml-[3vw] w-[97vw] scroll-mt-20 md:ml-[7vw] md:w-[93vw]"
        >
          <div
            className={`grid grid-cols-1 gap-8 pt-24 pb-16 sm:pt-28 md:pb-24 lg:grid-cols-12 ${PAD}`}
          >
            <div className="relative flex flex-col justify-center gap-5 lg:col-span-6">
              <p className="t-micro font-mono text-[11px] tracking-[0.2em] text-white/70 uppercase">
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
                action={ruteKode(normalisasiKode(kodeKetik))}
                className="flex max-w-xl gap-2"
              >
                <div className="relative min-w-0 flex-1">
                  <Input
                    value={kode}
                    onChange={(e) => setKode(e.target.value.toUpperCase())}
                    placeholder="Ketik kode MNF-... atau DNT-..."
                    aria-label="Kode manifest atau sumbangan"
                    required
                    className="min-h-12 w-full border-white/30 bg-white/10 pr-12 font-mono text-white placeholder:text-white/50"
                  />
                  {kode !== "" && (
                    <button
                      type="button"
                      onClick={() => setKode("")}
                      aria-label="Hapus kode"
                      className="absolute top-1/2 right-1 inline-flex min-h-12 min-w-12 -translate-y-1/2 items-center justify-center text-white/70 hover:text-white"
                    >
                      <CloseCircleIcon aria-hidden="true" className="size-5" />
                    </button>
                  )}
                </div>
                <button
                  type="submit"
                  className="tekan relative inline-flex min-h-12 items-center gap-2 bg-white px-5 font-mono text-[11px] tracking-[0.15em] text-[#0B1F2E] uppercase hover:bg-white/90"
                >
                  <Sudut terang />
                  <MagnifierIcon aria-hidden="true" />
                  Cek
                </button>
              </form>
              <aside aria-label="Pratinjau kartu manifest terkunci">
                <Card>
                  <CardHeader>
                    <div className="flex flex-wrap items-center gap-2">
                      <Badge className="rounded-full border-transparent bg-success-bg text-success">
                        TERKUNCI
                      </Badge>
                      <Badge variant="outline" className="rounded-full">
                        {kodeKetik === ""
                          ? "Contoh tampilan"
                          : "Pratinjau kode ketikanmu"}
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
                      Kartu persis seperti ini tampil untuk tiap kode asli.
                      Riwayat append-only, tiap baris berhash.
                    </p>
                  </CardContent>
                </Card>
              </aside>
            </div>
          </div>
        </section>

        <div className="ml-[3vw] w-[97vw] md:ml-[7vw] md:w-[93vw]">
          {/* Band 2. KPI live */}
          <section
            aria-label="Ringkasan angka"
            className="relative bg-[#DCE8EE] text-[#0B1F2E]"
          >
            <div
              className={`relative grid grid-cols-1 gap-8 py-14 md:py-20 lg:grid-cols-12 ${PAD}`}
            >
              <div data-ungkap style={{ "--stagger": 0 } as React.CSSProperties} className="flex flex-col justify-center gap-2 lg:col-span-5">
                <p className="t-micro font-mono text-[11px] tracking-[0.2em] uppercase opacity-70">
                  Tanpa login
                </p>
                <h2 className="t-h2 t-balance">Transparansi pangan per posko</h2>
              </div>
              <dl data-ungkap style={{ "--stagger": 1 } as React.CSSProperties} className="relative flex flex-col divide-y divide-[#0B1F2E]/20 lg:col-span-7">
                <div className="flex items-baseline justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <dt className="text-sm">Posko Terpantau</dt>
                  <dd className="t-h2 t-angka tabular-nums">{angkaPosko}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <dt className="text-sm">Paket Diterima</dt>
                  <dd className="t-h2 t-angka tabular-nums">{angkaDiterima}</dd>
                </div>
                <div className="flex items-baseline justify-between gap-4 py-4 first:pt-0 last:pb-0">
                  <dt className="text-sm">Masih Kurang</dt>
                  <dd className="t-h2 t-angka tabular-nums">{angkaSelisih}</dd>
                </div>
              </dl>
            </div>
          </section>

          {/* Band 3. Masalah dan urgensi */}
          <section
            aria-label="Mengapa ini penting"
            className="relative border-l border-white/20"
          >
            <div
              className={`relative grid grid-cols-1 gap-8 py-16 md:py-24 lg:grid-cols-12 ${PAD}`}
            >
              <div data-ungkap style={{ "--stagger": 0 } as React.CSSProperties} className="flex flex-col justify-center gap-2 lg:col-span-5">
                <p className="t-micro font-mono text-[11px] tracking-[0.2em] text-white/70 uppercase">
                  Mengapa ini penting
                </p>
                <h2 className="t-h2 t-balance text-white">
                  Bantuan sering hilang di tengah jalan, bukan karena kurang,
                  tapi karena gelap.
                </h2>
              </div>
              <div data-ungkap style={{ "--stagger": 1 } as React.CSSProperties} className="flex flex-col gap-6 lg:col-span-7">
                <p className="max-w-2xl leading-relaxed text-white/70">
                  Saat bencana besar, bantuan menumpuk di gudang pusat
                  sementara posko terpencil kekurangan. Catatan kertas
                  berpindah tangan dan rawan selisih. Pangan kedaluwarsa karena
                  barang yang keluar bukan yang paling dekat tanggalnya.
                </p>
                <p className="max-w-2xl leading-relaxed text-white/70">
                  OmniRelief menutup tiga celah itu dengan satu rantai data.
                  Setiap batch tercatat dengan kedaluwarsa. Setiap kiriman
                  dikunci hash. Setiap angka bisa dicek publik per posko.
                </p>
                <dl className="flex flex-col gap-4 sm:flex-row sm:gap-10">
                  <div>
                    <dt className="font-mono text-[11px] tracking-[0.2em] text-white/60 uppercase">
                      Data tersembunyi
                    </dt>
                    <dd className="t-h2 t-angka mt-1 text-white">0%</dd>
                  </div>
                  <div>
                    <dt className="font-mono text-[11px] tracking-[0.2em] text-white/60 uppercase">
                      Urutan FEFO
                    </dt>
                    <dd className="t-h2 t-angka mt-1 text-white">100%</dd>
                  </div>
                </dl>
              </div>
            </div>
          </section>

          {/* Band 4. Empat janji anti-korupsi */}
          <section
            aria-label="Empat janji anti-korupsi"
            className="relative bg-[#DCE8EE] text-[#0B1F2E]"
          >
            <div
              className={`relative grid grid-cols-1 gap-8 py-16 md:py-24 lg:grid-cols-12 ${PAD}`}
            >
              <div data-ungkap style={{ "--stagger": 0 } as React.CSSProperties} className="flex flex-col justify-center gap-2 lg:col-span-5">
                <p className="t-micro font-mono text-[11px] tracking-[0.2em] uppercase opacity-70">
                  Empat janji anti-korupsi
                </p>
                <h2 className="t-h2 t-balance">
                  Uang dan barang publik harus bisa diikuti siapa saja
                </h2>
              </div>
              <div data-ungkap style={{ "--stagger": 1 } as React.CSSProperties} className="grid sm:grid-cols-2 lg:col-span-7">
                <div className="grid gap-px overflow-hidden border border-[#0B1F2E]/20 bg-[#0B1F2E]/20 sm:col-span-2 sm:grid-cols-2">
                  {JANJI.map((j) => (
                    <div key={j.nomor} className="flex flex-col gap-2 bg-[#DCE8EE] p-6 md:p-8">
                      <span className="t-micro font-mono text-[11px] tracking-[0.2em] opacity-50">
                        {j.nomor}
                      </span>
                      <span className="text-lg font-semibold">{j.judul}</span>
                      <span className="text-sm leading-relaxed opacity-70">
                        {j.isi}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>

          {/* Band 5. Cara kerja 4 garda */}
          <section
            id="cara-kerja"
            aria-label="Cara kerja ekosistem"
            className="relative scroll-mt-20 border-l border-white/20"
          >
            <div
              className={`relative grid grid-cols-1 gap-8 py-16 md:py-24 lg:grid-cols-12 ${PAD}`}
            >
              <div data-ungkap style={{ "--stagger": 0 } as React.CSSProperties} className="flex flex-col justify-center gap-2 lg:col-span-5">
                <p className="t-micro font-mono text-[11px] tracking-[0.2em] text-white/70 uppercase">
                  Alur operasional hulu ke hilir
                </p>
                <h2 className="t-h2 t-balance text-white">
                  Satu rantai data untuk empat garda terdepan
                </h2>
                <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">
                  Dari donatur masuk sampai posko terima, tiap tangan
                  mencatat di rantai yang sama. Ketuk tiap baris untuk
                  detailnya.
                </p>
              </div>
              <div data-ungkap style={{ "--stagger": 1 } as React.CSSProperties} className="lg:col-span-7">
                <AkordeonGelap />
              </div>
            </div>
          </section>

          {/* Band 6. Verifikasi publik 3 langkah */}
          <section
            aria-label="Verifikasi publik"
            className="relative bg-[#DCE8EE] text-[#0B1F2E]"
          >
            <div
              className={`relative grid grid-cols-1 gap-8 py-16 md:py-24 lg:grid-cols-12 ${PAD}`}
            >
              <div data-ungkap style={{ "--stagger": 0 } as React.CSSProperties} className="flex flex-col justify-center gap-2 lg:col-span-5">
                <p className="t-micro font-mono text-[11px] tracking-[0.2em] uppercase opacity-70">
                  Verifikasi publik
                </p>
                <h2 className="t-h2 t-balance">Cek keaslian dalam 3 langkah</h2>
              </div>
              <div data-ungkap style={{ "--stagger": 1 } as React.CSSProperties} className="flex flex-col gap-6 lg:col-span-7">
                <ol className="flex flex-col divide-y divide-[#0B1F2E]/20 border-y border-[#0B1F2E]/20">
                  {LANGKAH.map((l) => (
                    <li key={l.nomor} className="flex items-start gap-5 py-6">
                      <span
                        aria-hidden="true"
                        className="t-h2 t-angka opacity-50"
                      >
                        {l.nomor}
                      </span>
                      <p className="max-w-xl leading-relaxed">{l.isi}</p>
                    </li>
                  ))}
                </ol>
                <div>
                  <TombolSudut href={`/m/${CONTOH_KODE}`} terang>
                    Coba contoh manifest {CONTOH_KODE}
                  </TombolSudut>
                </div>
              </div>
            </div>
          </section>

          {/* Band 7. Arsitektur keamanan */}
          <section
            id="arsitektur"
            aria-label="Arsitektur keamanan"
            className="relative scroll-mt-20 border-l border-white/20"
          >
            <div
              className={`relative grid grid-cols-1 gap-8 py-16 md:py-24 lg:grid-cols-12 ${PAD}`}
            >
              <div data-ungkap style={{ "--stagger": 0 } as React.CSSProperties} className="flex flex-col justify-center gap-2 lg:col-span-5">
                <p className="t-micro font-mono text-[11px] tracking-[0.2em] text-white/70 uppercase">
                  Standar teknis dan keandalan
                </p>
                <h2 className="t-h2 t-balance text-white">
                  Dirancang untuk medan bencana yang sulit dan audit ketat.
                </h2>
              </div>
              <div data-ungkap style={{ "--stagger": 1 } as React.CSSProperties} className="flex flex-col gap-8 lg:col-span-7">
                {ARSITEKTUR.map((a) => (
                  <div key={a.nomor} className="border-t border-white/20 pt-6">
                    <p className="font-mono text-[11px] tracking-[0.2em] text-white/60">
                      {a.nomor}
                    </p>
                    <h3 className="mt-2 font-semibold text-white">{a.judul}</h3>
                    <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/70">
                      {a.isi}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* Band 8. FAQ */}
          <section
            id="faq"
            aria-label="Pertanyaan umum"
            className="relative scroll-mt-20 bg-[#DCE8EE] text-[#0B1F2E]"
          >
            <div
              className={`relative grid grid-cols-1 gap-8 py-16 md:py-24 lg:grid-cols-12 ${PAD}`}
            >
              <div data-ungkap style={{ "--stagger": 0 } as React.CSSProperties} className="flex flex-col justify-center gap-2 lg:col-span-5">
                <p className="t-micro font-mono text-[11px] tracking-[0.2em] uppercase opacity-70">
                  Pertanyaan umum (FAQ)
                </p>
                <h2 className="t-h2 t-balance">
                  Hal yang sering ditanyakan publik dan relawan
                </h2>
              </div>
              <div data-ungkap style={{ "--stagger": 1 } as React.CSSProperties} className="lg:col-span-7">
                <AkordeonTerang />
              </div>
            </div>
          </section>

          {/* Band 9. Dual-path CTA */}
          <section
            aria-label="Mulai cek atau masuk portal"
            className="relative border-l border-white/20"
          >
            <div className={`relative py-16 md:py-24 ${PAD}`}>
              <div className="border border-white/25 bg-white/[0.04] p-8 backdrop-blur-md md:p-12">
                <div className="grid grid-cols-1 gap-8 divide-y divide-white/20 lg:grid-cols-2 lg:gap-12 lg:divide-x lg:divide-y-0">
                  <div data-ungkap style={{ "--stagger": 0 } as React.CSSProperties} className="flex flex-col items-start gap-4 pb-8 lg:pb-0 lg:pr-12">
                    <h2 className="t-h2 t-balance text-white">
                      Pegang kode manifest atau sumbangan?
                    </h2>
                    <p className="max-w-md text-sm leading-relaxed text-white/70">
                      Cek alur bantuan tanpa login. Masukkan kode MNF atau DNT
                      dan lihat isi, timeline, dan hash pengunci.
                    </p>
                    <TombolSudut href="/transparansi">
                      Buka dashboard transparansi
                    </TombolSudut>
                  </div>
                  <div data-ungkap style={{ "--stagger": 1 } as React.CSSProperties} className="flex flex-col items-start gap-4 pt-8 lg:pt-0 lg:pl-12">
                    <h2 className="t-h2 t-balance text-white">
                      Bertugas di gudang, posko, atau armada?
                    </h2>
                    <p className="max-w-md text-sm leading-relaxed text-white/70">
                      Masuk ke portal operasional sesuai peran: gudang, BPBD,
                      posko, tim distribusi, atau admin.
                    </p>
                    <TombolSudut href="/masuk">
                      Masuk ke portal operasional
                    </TombolSudut>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Band 10. Footer editorial */}
          <footer className="relative border-t border-l border-white/20 pt-16 pb-28 md:pb-16">
            <div className={`relative ${PAD}`}>
              <div className="grid grid-cols-1 gap-10 border-b border-white/15 pb-12 sm:grid-cols-2 lg:grid-cols-4">
                <div className="flex flex-col gap-3">
                  <a
                    href="/"
                    className="flex items-center gap-2"
                    aria-label="OmniRelief beranda"
                  >
                    <Logo varian="putih" tinggi={24} alt="" />
                  </a>
                  <p className="text-sm leading-relaxed text-white/70">
                    Sistem logistik bantuan pangan darurat. Tercatat dari
                    gudang sampai posko, bisa dicek publik per daerah.
                  </p>
                  <p
                    role="status"
                    className="font-mono text-[11px] tracking-[0.15em] text-white/70 uppercase"
                  >
                    <span aria-hidden="true" className="text-emerald-400">
                      ●
                    </span>{" "}
                    Sistem operasional · SHA-256 aktif
                  </p>
                </div>
                <nav aria-label="Layanan publik" className="flex flex-col gap-3">
                  <p className="font-mono text-[11px] tracking-[0.2em] text-white/60 uppercase">
                    Layanan publik
                  </p>
                  <a href="/transparansi" className="min-h-12 text-sm text-white/80 hover:text-white sm:min-h-0">
                    Transparansi per Posko
                  </a>
                  <a
                    href={`/m/${CONTOH_KODE}`}
                    className="min-h-12 font-mono text-sm text-white/80 hover:text-white sm:min-h-0"
                  >
                    Contoh Manifest ({CONTOH_KODE})
                  </a>
                  <a
                    href={`/s/${CONTOH_DNT}`}
                    className="min-h-12 font-mono text-sm text-white/80 hover:text-white sm:min-h-0"
                  >
                    Contoh Sumbangan ({CONTOH_DNT})
                  </a>
                  <a href="/#faq" className="min-h-12 text-sm text-white/80 hover:text-white sm:min-h-0">
                    Pertanyaan Umum
                  </a>
                </nav>
                <nav
                  aria-label="Portal operasional"
                  className="flex flex-col gap-3"
                >
                  <p className="font-mono text-[11px] tracking-[0.2em] text-white/60 uppercase">
                    Portal operasional
                  </p>
                  <a href="/masuk" className="min-h-12 text-sm text-white/80 hover:text-white sm:min-h-0">
                    Masuk Petugas
                  </a>
                  <a href="/bpbd" className="min-h-12 text-sm text-white/80 hover:text-white sm:min-h-0">
                    BPBD Command Center
                  </a>
                  <a href="/gudang" className="min-h-12 text-sm text-white/80 hover:text-white sm:min-h-0">
                    Intake Gudang
                  </a>
                  <a href="/posko" className="min-h-12 text-sm text-white/80 hover:text-white sm:min-h-0">
                    Posko dan Tim Distribusi
                  </a>
                </nav>
                <div className="flex flex-col gap-3">
                  <p className="font-mono text-[11px] tracking-[0.2em] text-white/60 uppercase">
                    Tata kelola dan legal
                  </p>
                  <p className="text-sm leading-relaxed text-white/70">
                    Privasi data agregat tanpa NIK. Audit publik append-only.
                    Protokol pangan FEFO.
                  </p>
                  <p className="text-sm text-white/70">
                    Proyek kompetisi SEVENT X.
                  </p>
                </div>
              </div>
              <div className="flex flex-col gap-3 pt-6 sm:flex-row sm:items-center sm:justify-between">
                <p className="text-xs text-white/60">© 2026 OmniRelief</p>
                <div className="flex flex-wrap gap-2">
                  {LEGAL.map((l) => (
                    <button
                      key={l.judul}
                      type="button"
                      onClick={() => setLegal(l.judul)}
                      className="inline-flex min-h-12 items-center px-3 font-mono text-[11px] tracking-[0.15em] text-white/70 uppercase hover:text-white sm:min-h-10"
                    >
                      {l.judul}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </footer>
        </div>
      </div>

      <Dialog open={legalAktif !== null} onOpenChange={(buka) => !buka && setLegal(null)}>
        <DialogContent className="border-white/20 bg-[#0B1F2E] text-white">
          <DialogHeader>
            <DialogTitle className="text-white">{legalAktif?.judul}</DialogTitle>
            <DialogDescription className="text-sm leading-relaxed text-white/70">
              {legalAktif?.isi}
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <DialogClose className="inline-flex min-h-12 items-center justify-center border border-white/40 bg-white/10 px-5 font-mono text-[11px] tracking-[0.15em] text-white uppercase hover:bg-white/20">
              Tutup
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <TombolKeAtas />
    </main>
  );
}
