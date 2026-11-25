"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { Route } from "next";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@omnirelief/ui/components/dialog";
import { Input } from "@omnirelief/ui/components/input";

export const ACARA_PINTASAN = "omnirelief:pintasan";

type DetailPintasan = {
  buka?: boolean;
};

type BarisPintasan = {
  tombol: string[];
  guna: string;
};

type BarisPeran = {
  peran: string;
  guna: string;
};

const DAFTAR_PINTASAN: BarisPintasan[] = [
  { tombol: ["/"], guna: "Fokus ke kolom pencarian kode atau posko" },
  { tombol: ["?"], guna: "Buka panduan ini" },
  { tombol: ["Ctrl", "K"], guna: "Buka atau tutup panduan ini" },
  { tombol: ["g", "lalu", "b"], guna: "Ke Beranda" },
  { tombol: ["g", "lalu", "t"], guna: "Ke Transparansi" },
  { tombol: ["↑", "↓", "Enter"], guna: "Pilih dan buka hasil cari" },
  { tombol: ["Esc"], guna: "Tutup dialog" },
];

const DAFTAR_PERAN: BarisPeran[] = [
  { peran: "Gudang", guna: "Catat sumbangan masuk jadi batch berkode DNT." },
  { peran: "BPBD", guna: "Verifikasi snapshot posko lalu terbitkan manifest." },
  { peran: "Tim", guna: "Antar paket, kirim kabar check-in, tandai tiap tahap." },
  { peran: "Posko", guna: "Catat penyintas lalu konfirmasi barang diterima." },
];

type EntriFitur = {
  judul: string;
  deskripsi: string;
  href: Route;
  kataKunci: string;
};

const DAFTAR_FITUR: EntriFitur[] = [
  { judul: "Beranda", deskripsi: "Ringkasan operasional peran kamu", href: "/beranda", kataKunci: "home dashboard ringkasan" },
  { judul: "Verifikasi BPBD", deskripsi: "Setujui snapshot posko", href: "/bpbd", kataKunci: "command center antrean putusan" },
  { judul: "Buat manifest", deskripsi: "Susun batch FEFO jadi kiriman", href: "/bpbd/kirim", kataKunci: "kirim alokasi draf publikasi qr" },
  { judul: "Gudang", deskripsi: "Catat batch sumbangan masuk", href: "/gudang", kataKunci: "intake stok fefo kedaluwarsa salin" },
  { judul: "Posko lapor", deskripsi: "Input angka penyintas", href: "/posko", kataKunci: "lapor snapshot agregat" },
  { judul: "Bantuan posko", deskripsi: "Konfirmasi terima dan lapor masalah", href: "/posko#bantuan", kataKunci: "terima konfirmasi rusak kurang kirim" },
  { judul: "Tugas tim", deskripsi: "Update status dan check-in", href: "/tim", kataKunci: "distribusi checkin kendala darurat" },
  { judul: "Transparansi", deskripsi: "Ledger per posko untuk publik", href: "/transparansi", kataKunci: "publik unduh csv cetak ledger kode" },
  { judul: "Dasbor", deskripsi: "Prioritas kirim, arus barang, sebaran", href: "/dasbor", kataKunci: "dashboard prioritas arus jalan sebaran urut" },
  { judul: "Audit log", deskripsi: "Jejak hash rantai status", href: "/audit", kataKunci: "riwayat hash verifikasi export" },
  { judul: "Pusat bantuan", deskripsi: "Panduan lengkap semua peran", href: "/bantuan", kataKunci: "help faq panduan" },
  { judul: "Profil", deskripsi: "Identitas, password, dan PIN", href: "/profil", kataKunci: "akun password pin keamanan" },
  { judul: "Pengaturan akun", deskripsi: "Akun dan profil", href: "/pengaturan#akun", kataKunci: "akun profil keluar" },
  { judul: "Pengaturan notifikasi", deskripsi: "Bunyi, spanduk, dan frekuensi", href: "/pengaturan#notifikasi", kataKunci: "notif bunyi suara spanduk frekuensi bisu" },
  { judul: "Pengaturan aksesibilitas", deskripsi: "Ukuran teks, kontras, gerak", href: "/pengaturan#aksesibilitas", kataKunci: "teks besar kontras tinggi gerak akses" },
  { judul: "Pengaturan bantuan", deskripsi: "Bantuan dan legal", href: "/pengaturan#bantuan", kataKunci: "bantuan legal versi" },
];

type AksiCepat = {
  judul: string;
  deskripsi: string;
  href: Route;
  fokus?: string;
  kataKunci: string;
};

/**
 * Aksi kerja instan per rute aktif. Entri tanpa href tujuan tetap di halaman
 * ini dan langsung fokus ke kolom kerja (tanpa pindah halaman).
 */
const AKSI_KONTEKS: Record<string, AksiCepat[]> = {
  "/gudang": [
    { judul: "Catat batch baru", deskripsi: "Fokus ke kolom nama barang", href: "/gudang", fokus: "#gudang-item", kataKunci: "catat tambah intake barang baru" },
    { judul: "Cari batch", deskripsi: "Fokus ke kolom cari stok", href: "/gudang", fokus: "#cari-batch", kataKunci: "cari saring stok" },
  ],
  "/posko": [
    { judul: "Isi laporan penyintas", deskripsi: "Fokus ke kolom angka bayi", href: "/posko", fokus: "#posko-bayi", kataKunci: "isi lapor angka input" },
    { judul: "Lihat kiriman", deskripsi: "Lompat ke daftar bantuan posko", href: "/posko#bantuan", kataKunci: "kiriman terima konfirmasi" },
  ],
  "/tim": [
    { judul: "Buka panel check-in", deskripsi: "Lompat ke kartu update tugas", href: "/tim", fokus: "#check-in", kataKunci: "checkin update status tahap" },
  ],
  "/bpbd": [
    { judul: "Buat manifest", deskripsi: "Susun batch jadi kiriman baru", href: "/bpbd/kirim", kataKunci: "buat manifest kirim baru" },
    { judul: "Lihat antrean", deskripsi: "Lompat ke tabel verifikasi", href: "/bpbd", fokus: "#antrean", kataKunci: "antrean verifikasi tabel" },
  ],
  "/bpbd/kirim": [
    { judul: "Pilih posko tujuan", deskripsi: "Fokus ke pilihan posko", href: "/bpbd/kirim", fokus: "#kirim-posko", kataKunci: "posko tujuan pilih" },
    { judul: "Cari batch FEFO", deskripsi: "Fokus ke kolom cari batch", href: "/bpbd/kirim", fokus: "#cari-batch", kataKunci: "cari batch fefo" },
  ],
  "/transparansi": [
    { judul: "Cari posko", deskripsi: "Fokus ke kolom cari publik", href: "/transparansi", fokus: "#cari-posko", kataKunci: "cari posko publik" },
  ],
  "/dasbor": [
    { judul: "Cari posko", deskripsi: "Fokus ke kolom cari dasbor", href: "/dasbor", fokus: "#cari-dasbor", kataKunci: "cari posko dasbor prioritas" },
  ],
};

/** Potong teks jadi potongan biasa + cocok, untuk highlight <mark>. */
function sorot(teks: string, kata: string): ReactNode {
  const cari = kata.trim().toLowerCase();
  if (cari === "") return teks;
  const kecil = teks.toLowerCase();
  const bagian: ReactNode[] = [];
  let sisa = 0;
  let kunci = 0;
  for (;;) {
    const ketemu = kecil.indexOf(cari, sisa);
    if (ketemu < 0) {
      bagian.push(teks.slice(sisa));
      break;
    }
    if (ketemu > sisa) bagian.push(teks.slice(sisa, ketemu));
    bagian.push(
        <mark key={kunci} className="rounded-none bg-[#0B1F2E] px-0.5 text-white">
        {teks.slice(ketemu, ketemu + cari.length)}
      </mark>,
    );
    kunci += 1;
    sisa = ketemu + cari.length;
  }
  return <>{bagian}</>;
}

const SELECTOR_CARI = [
  "#cek-kode input",
  "#cari-posko",
  "#cari-batch",
  'input[type="search"]',
];

export function mintaBukaPintasan(): void {
  window.dispatchEvent(
    new CustomEvent<DetailPintasan>(ACARA_PINTASAN, { detail: { buka: true } }),
  );
}

function isDetailPintasan(nilai: unknown): nilai is DetailPintasan {
  if (typeof nilai !== "object" || nilai === null) return false;
  if (!("buka" in nilai)) return true;
  const buka = nilai.buka;
  return buka === undefined || typeof buka === "boolean";
}

function targetIsiFormulir(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const nama = target.tagName;
  if (nama === "INPUT" || nama === "TEXTAREA" || nama === "SELECT") return true;
  return target.isContentEditable;
}

function fokusPencarian(): boolean {
  for (const selector of SELECTOR_CARI) {
    const el = document.querySelector(selector);
    if (el instanceof HTMLInputElement && !el.disabled) {
      el.focus();
      el.select();
      return true;
    }
  }
  return false;
}

export default function PintasanKeyboard({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const [buka, setBuka] = useState(false);
  const [cari, setCari] = useState("");
  const [aktif, setAktif] = useState(0);
  const menungguG = useRef<number | null>(null);

  useEffect(() => {
    if (buka) {
      setCari("");
      setAktif(0);
    }
  }, [buka]);

  useEffect(() => {
    function bersihkanG(): void {
      if (menungguG.current !== null) {
        window.clearTimeout(menungguG.current);
        menungguG.current = null;
      }
    }

    function tandaiG(): void {
      bersihkanG();
      menungguG.current = window.setTimeout(bersihkanG, 900);
    }

    function padaAcara(event: Event): void {
      if (event instanceof CustomEvent && isDetailPintasan(event.detail)) {
        setBuka(event.detail.buka ?? true);
        return;
      }
      setBuka(true);
    }

    function padaTombol(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        bersihkanG();
        setBuka(false);
        return;
      }
      if ((event.ctrlKey || event.metaKey) && event.key.toLowerCase() === "k") {
        event.preventDefault();
        setBuka((s) => !s);
        return;
      }
      if (buka || event.ctrlKey || event.metaKey || event.altKey) return;
      if (targetIsiFormulir(event.target)) return;

      if (event.key === "/") {
        event.preventDefault();
        fokusPencarian();
        return;
      }
      if (event.key === "?") {
        event.preventDefault();
        setBuka(true);
        return;
      }
      if (menungguG.current !== null) {
        bersihkanG();
        if (event.key === "b") {
          event.preventDefault();
          router.push("/beranda");
        } else if (event.key === "t") {
          event.preventDefault();
          router.push("/transparansi");
        } else if (event.key === "g") {
          tandaiG();
        }
        return;
      }
      if (event.key === "g") {
        tandaiG();
      }
    }

    window.addEventListener(ACARA_PINTASAN, padaAcara);
    window.addEventListener("keydown", padaTombol);
    return () => {
      bersihkanG();
      window.removeEventListener(ACARA_PINTASAN, padaAcara);
      window.removeEventListener("keydown", padaTombol);
    };
  }, [buka, router]);

  const kata = cari.trim().toLowerCase();
  const kunciRute = Object.keys(AKSI_KONTEKS)
    .filter((k) => pathname === k || pathname.startsWith(`${k}/`))
    .sort((a, b) => b.length - a.length)[0];
  const aksiRute = (kunciRute ? (AKSI_KONTEKS[kunciRute] ?? []) : []).filter(
    (a) =>
      kata === "" ||
      `${a.judul} ${a.deskripsi} ${a.kataKunci}`.toLowerCase().includes(kata),
  );
  const cocokFitur =
    kata === ""
      ? []
      : DAFTAR_FITUR.filter((f) =>
          `${f.judul} ${f.deskripsi} ${f.kataKunci}`.toLowerCase().includes(kata),
        ).slice(0, 7);
  const cocokPintasan =
    kata === ""
      ? DAFTAR_PINTASAN
      : DAFTAR_PINTASAN.filter((b) =>
          `${b.guna} ${b.tombol.join(" ")}`.toLowerCase().includes(kata),
        );
  const cocokPeran =
    kata === ""
      ? DAFTAR_PERAN
      : DAFTAR_PERAN.filter((b) =>
          `${b.peran} ${b.guna}`.toLowerCase().includes(kata),
        );
  const gabung: { kunci: string; judul: string; deskripsi: string; aksi: boolean; lari: () => void }[] = [
    ...aksiRute.map((a) => ({
      kunci: `aksi-${a.judul}`,
      judul: a.judul,
      deskripsi: a.deskripsi,
      aksi: true,
      lari: () => jalankanAksi(a.href, a.fokus),
    })),
    ...cocokFitur.map((f) => ({
      kunci: `fitur-${f.href}`,
      judul: f.judul,
      deskripsi: f.deskripsi,
      aksi: false,
      lari: () => bukaHasil(f.href),
    })),
  ];
  const aktifAman = gabung.length === 0 ? 0 : Math.min(aktif, gabung.length - 1);

  function fokusSelektor(selector: string) {
    let coba = 0;
    const id = window.setInterval(() => {
      coba += 1;
      const el = document.querySelector(selector);
      if (el instanceof HTMLElement && el.offsetParent !== null) {
        window.clearInterval(id);
        el.scrollIntoView({ block: "center" });
        el.focus({ preventScroll: true });
        return;
      }
      if (coba >= 20) window.clearInterval(id);
    }, 100);
  }

  function jalankanAksi(href: Route, fokus?: string) {
    const tujuan = String(href);
    const kini = window.location.pathname + window.location.hash;
    setBuka(false);
    setAktif(0);
    if (fokus && (tujuan === kini || tujuan.split("#")[0] === window.location.pathname)) {
      fokusSelektor(fokus);
      return;
    }
    router.push(href);
    if (fokus) fokusSelektor(fokus);
  }

  function bukaHasil(href: Route) {
    setBuka(false);
    setAktif(0);
    router.push(href);
  }

  return (
    <>
      {children}
      <Dialog open={buka} onOpenChange={setBuka}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pintasan dan panduan cepat</DialogTitle>
            <DialogDescription>
              Tombol cepat keyboard dan ringkasan tugas tiap peran.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1">
            <label htmlFor="cari-bantuan" className="t-label text-muted-foreground">
              Cari fitur atau pengaturan
            </label>
            <Input
              id="cari-bantuan"
              type="search"
              value={cari}
              onChange={(e) => {
                setCari(e.target.value);
                setAktif(0);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  const target = gabung[aktifAman];
                  if (target) {
                    e.preventDefault();
                    target.lari();
                  }
                } else if (e.key === "ArrowDown") {
                  e.preventDefault();
                  setAktif((s) => (gabung.length === 0 ? 0 : (s + 1) % gabung.length));
                } else if (e.key === "ArrowUp") {
                  e.preventDefault();
                  setAktif((s) => (gabung.length === 0 ? 0 : (s - 1 + gabung.length) % gabung.length));
                }
              }}
              placeholder="Ketik misal: notifikasi, manifest, PIN…"
              autoComplete="off"
              className="min-h-12"
            />
          </div>
          {kata === "" ? (
            aksiRute.length > 0 && (
              <section aria-label="Aksi cepat">
                <h3 className="text-sm font-semibold">Aksi cepat di halaman ini</h3>
                <ul className="mt-2 flex flex-col gap-1">
                  {aksiRute.map((a) => (
                    <li key={a.judul}>
                      <button
                        type="button"
                        onClick={() => jalankanAksi(a.href, a.fokus)}
                        className="flex min-h-12 w-full flex-col items-start justify-center gap-0.5 rounded-none bg-[#0B1F2E] px-3 py-2 text-left text-white"
                      >
                        <span className="text-sm font-semibold">{a.judul}</span>
                        <span className="text-xs text-white/70">{a.deskripsi}</span>
                      </button>
                    </li>
                  ))}
                </ul>
              </section>
            )
          ) : (
            <section aria-label="Hasil cepat" aria-live="polite">
              <h3 className="text-sm font-semibold">
                Hasil cepat{gabung.length > 0 ? ` (${gabung.length})` : ""}
              </h3>
              {gabung.length === 0 ? (
                <p className="mt-2 text-sm text-muted-foreground">
                  Tidak ketemu. Coba kata lain, misal nama halaman atau peran.
                </p>
              ) : (
                <ul className="mt-2 flex flex-col gap-1" role="listbox" aria-label="Hasil pencarian">
                  {gabung.map((g, i) => (
                    <li key={g.kunci} role="option" aria-selected={i === aktifAman}>
                      <button
                        type="button"
                        onClick={() => g.lari()}
                        onMouseEnter={() => setAktif(i)}
                        className={`flex min-h-12 w-full flex-col items-start justify-center gap-0.5 rounded-none border px-3 py-2 text-left ${i === aktifAman ? "border-[#0B1F2E] bg-[#DCE8EE] text-[#0B1F2E]" : "border-transparent hover:border-[#0B1F2E]/15 hover:bg-muted"}`}
                      >
                        <span className="text-sm font-semibold">
                          {sorot(g.judul, kata)}
                          {g.aksi && <span className="ml-2 t-label opacity-70">Aksi</span>}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {sorot(g.deskripsi, kata)}
                        </span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
              <p className="mt-1 text-xs text-muted-foreground">↑↓ pilih · Enter buka · Esc tutup.</p>
            </section>
          )}
          {cocokPintasan.length > 0 && (
            <section aria-label="Daftar pintasan keyboard">
            <h3 className="text-sm font-semibold">Pintasan keyboard</h3>
            <ul className="mt-2 flex flex-col gap-2">
              {cocokPintasan.map((baris) => (
                <li
                  key={baris.guna}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span>{sorot(baris.guna, kata)}</span>
                  <span className="flex shrink-0 items-center gap-1">
                    {baris.tombol.map((t) => (
                      <kbd
                        key={t}
                        className="min-h-6 min-w-6 rounded-none bg-white px-1.5 py-0.5 text-center font-mono text-xs text-[#0B1F2E] garis-rambut-diam"
                      >
                        {t}
                      </kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
            </section>
          )}
          {cocokPeran.length > 0 && (
          <section aria-label="Ringkasan tugas peran">
            <h3 className="text-sm font-semibold">Ringkasan tugas peran</h3>
            <ul className="mt-2 flex flex-col gap-2">
              {cocokPeran.map((baris) => (
                <li key={baris.peran} className="text-sm">
                  <span className="font-semibold">{sorot(baris.peran, kata)}: </span>
                  <span>{sorot(baris.guna, kata)}</span>
                </li>
              ))}
            </ul>
          </section>
          )}
          <section aria-label="Pusat bantuan" className="mt-4">
            <Link
              href="/bantuan"
              onClick={() => setBuka(false)}
              className="flex min-h-12 items-center justify-center rounded-none bg-[#0B1F2E] px-4 text-sm font-semibold text-white"
            >
              Buka Pusat Bantuan Lengkap
            </Link>
          </section>
        </DialogContent>
      </Dialog>
    </>
  );
}
