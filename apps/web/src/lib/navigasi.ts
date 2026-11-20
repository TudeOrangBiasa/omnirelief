// Konfigurasi navigasi per peran. Murni (tanpa Next) agar bisa diuji.
// Acuan: docs/desain/arsitektur-pages.md §2. Istilah ikut GLOSSARY.md.

export type NavPeran = "PUBLIK" | "BPBD" | "GUDANG" | "POSKO" | "TIM" | "ADMIN";

export type NavItem = {
  href: string;
  label: string;
  /** Nama ikon lucide, dipetakan ke komponen di bilah-nav. */
  ikon:
    | "beranda"
    | "cek"
    | "transparansi"
    | "masuk"
    | "verifikasi"
    | "kirim"
    | "catat"
    | "lapor"
    | "bantuan"
    | "tugas"
    | "checkin"
    | "admin"
    | "pengaturan"
    | "profil"
    | "keluar";
  /** Slot lencana angka: antrean (server) atau sinkron (offline lokal). */
  lencana?: "antrean" | "sinkron";
};

export const LABEL_PERAN: Record<NavPeran, string> = {
  PUBLIK: "Pengunjung",
  BPBD: "BPBD · Command center",
  GUDANG: "Gudang",
  POSKO: "Posko",
  TIM: "Tim distribusi",
  ADMIN: "Admin",
};

export function peranDariString(peran: string | null | undefined): NavPeran {
  if (
    peran === "BPBD" ||
    peran === "GUDANG" ||
    peran === "POSKO" ||
    peran === "TIM" ||
    peran === "ADMIN"
  )
    return peran;
  return "PUBLIK";
}

/** Sidebar desktop per peran, selalu diawali Beranda. */
export const NAVIGASI_SIDEBAR: Record<NavPeran, NavItem[]> = {
  PUBLIK: [
    { href: "/", label: "Beranda", ikon: "beranda" },
    { href: "/transparansi", label: "Transparansi", ikon: "transparansi" },
    { href: "/masuk", label: "Masuk", ikon: "masuk" },
  ],
  BPBD: [
    { href: "/beranda", label: "Beranda", ikon: "beranda" },
    { href: "/bpbd", label: "Verifikasi", ikon: "verifikasi", lencana: "antrean" },
    { href: "/bpbd/kirim", label: "Buat manifest", ikon: "kirim" },
    { href: "/transparansi", label: "Transparansi", ikon: "transparansi" },
    { href: "/pengaturan", label: "Pengaturan", ikon: "pengaturan" },
  ],
  GUDANG: [
    { href: "/beranda", label: "Beranda", ikon: "beranda" },
    { href: "/gudang", label: "Catat sumbangan", ikon: "catat" },
    { href: "/transparansi", label: "Transparansi", ikon: "transparansi" },
    { href: "/pengaturan", label: "Pengaturan", ikon: "pengaturan" },
  ],
  POSKO: [
    { href: "/beranda", label: "Beranda", ikon: "beranda" },
    { href: "/posko#lapor", label: "Lapor", ikon: "lapor" },
    { href: "/posko#bantuan", label: "Bantuan", ikon: "bantuan" },
    { href: "/transparansi", label: "Transparansi", ikon: "transparansi" },
    { href: "/pengaturan", label: "Pengaturan", ikon: "pengaturan" },
  ],
  TIM: [
    { href: "/beranda", label: "Beranda", ikon: "beranda" },
    { href: "/tim", label: "Tugas", ikon: "tugas", lencana: "antrean" },
    { href: "/transparansi", label: "Transparansi", ikon: "transparansi" },
    { href: "/pengaturan", label: "Pengaturan", ikon: "pengaturan" },
  ],
  ADMIN: [
    { href: "/beranda", label: "Beranda", ikon: "beranda" },
    { href: "/admin", label: "Admin", ikon: "admin" },
    { href: "/transparansi", label: "Transparansi", ikon: "transparansi" },
    { href: "/pengaturan", label: "Pengaturan", ikon: "pengaturan" },
  ],
};

/** Tab bawah mobile: maksimal 3 tab + Lainnya. */
export const NAVIGASI_TAB: Record<NavPeran, NavItem[]> = {
  PUBLIK: [
    { href: "/", label: "Beranda", ikon: "beranda" },
    { href: "/#cek-kode", label: "Cek kode", ikon: "cek" },
    { href: "/transparansi", label: "Transparansi", ikon: "transparansi" },
  ],
  BPBD: [
    { href: "/beranda", label: "Beranda", ikon: "beranda" },
    { href: "/bpbd", label: "Verifikasi", ikon: "verifikasi", lencana: "antrean" },
    { href: "/bpbd/kirim", label: "Kirim", ikon: "kirim" },
  ],
  GUDANG: [
    { href: "/beranda", label: "Beranda", ikon: "beranda" },
    { href: "/gudang", label: "Catat", ikon: "catat" },
    { href: "/transparansi", label: "Transparansi", ikon: "transparansi" },
  ],
  POSKO: [
    { href: "/beranda", label: "Beranda", ikon: "beranda" },
    { href: "/posko#lapor", label: "Lapor", ikon: "lapor" },
    { href: "/posko#bantuan", label: "Bantuan", ikon: "bantuan" },
  ],
  TIM: [
    { href: "/beranda", label: "Beranda", ikon: "beranda" },
    { href: "/tim", label: "Tugas", ikon: "tugas", lencana: "antrean" },
    { href: "/tim#check-in", label: "Check-in", ikon: "checkin" },
  ],
  ADMIN: [
    { href: "/beranda", label: "Beranda", ikon: "beranda" },
    { href: "/admin", label: "Admin", ikon: "admin" },
    { href: "/transparansi", label: "Transparansi", ikon: "transparansi" },
  ],
};

/** Isi lembar Lainnya di mobile. */
export const NAVIGASI_LAINNYA: Record<NavPeran, NavItem[]> = {
  PUBLIK: [
    { href: "/masuk", label: "Masuk", ikon: "masuk" },
    { href: "/pengaturan#bantuan", label: "Bantuan", ikon: "bantuan" },
    { href: "/transparansi", label: "Tentang", ikon: "transparansi" },
  ],
  BPBD: [
    { href: "/transparansi", label: "Transparansi", ikon: "transparansi" },
    { href: "/profil", label: "Profil", ikon: "profil" },
    { href: "/pengaturan", label: "Pengaturan", ikon: "pengaturan" },
  ],
  GUDANG: [
    { href: "/profil", label: "Profil", ikon: "profil" },
    { href: "/pengaturan", label: "Pengaturan", ikon: "pengaturan" },
  ],
  POSKO: [
    { href: "/transparansi", label: "Transparansi", ikon: "transparansi" },
    { href: "/profil", label: "Profil", ikon: "profil" },
    { href: "/pengaturan", label: "Pengaturan", ikon: "pengaturan" },
  ],
  TIM: [
    { href: "/transparansi", label: "Transparansi", ikon: "transparansi" },
    { href: "/profil", label: "Profil", ikon: "profil" },
    { href: "/pengaturan", label: "Pengaturan", ikon: "pengaturan" },
  ],
  ADMIN: [
    { href: "/profil", label: "Profil", ikon: "profil" },
    { href: "/pengaturan", label: "Pengaturan", ikon: "pengaturan" },
  ],
};

/**
 * Tab bar disembunyikan di halaman detail (/m/*, /s/*) dan alur formulir
 * dalam (/bpbd/kirim) agar tombol primer tidak tertutup.
 */
export function sembunyikanTabBar(pathname: string): boolean {
  return (
    pathname === "/m" ||
    pathname.startsWith("/m/") ||
    pathname === "/s" ||
    pathname.startsWith("/s/") ||
    pathname === "/bpbd/kirim" ||
    pathname.startsWith("/bpbd/kirim/")
  );
}

/** Tab dengan anchor (#...) hanya aktif bila hash cocok. */
export function tabAktif(pathname: string, hash: string, href: string): boolean {
  const [dasar, jangkar] = href.split("#");
  if (dasar !== pathname) return false;
  if (jangkar === undefined) return hash === "" || hash === "#";
  return hash === `#${jangkar}`;
}

/**
 * Sidebar hanya tampil di zona dasbor (work zone internal).
 * Halaman publik (landing, transparansi, detail, masuk) hanya pakai top-nav.
 */
export function zonaDasbor(pathname: string): boolean {
  return ["/beranda", "/bpbd", "/gudang", "/posko", "/tim", "/pengaturan", "/profil", "/admin"].some(
    (dasar) => pathname === dasar || pathname.startsWith(`${dasar}/`)
  );
}

const IKON_AKUN: NavItem["ikon"][] = ["profil", "pengaturan"];

/** Sidebar referensi: grup UTAMA di atas, grup AKUN di bawah pemisah. */
export function grupSidebar(peran: NavPeran): { utama: NavItem[]; akun: NavItem[] } {
  const semua = NAVIGASI_SIDEBAR[peran];
  return {
    utama: semua.filter((i) => !IKON_AKUN.includes(i.ikon)),
    akun: semua.filter((i) => IKON_AKUN.includes(i.ikon)),
  };
}
