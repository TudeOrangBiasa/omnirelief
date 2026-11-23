const ZONA = "Asia/Makassar";

const fmtHari = new Intl.DateTimeFormat("id-ID", {
  day: "numeric",
  month: "short",
  year: "numeric",
  timeZone: ZONA,
});

const fmtJam = new Intl.DateTimeFormat("id-ID", {
  hour: "2-digit",
  minute: "2-digit",
  hour12: false,
  timeZone: ZONA,
});

const fmtZona = new Intl.DateTimeFormat("id-ID", {
  timeZone: ZONA,
  timeZoneName: "short",
});

function namaZona(): string {
  const bagian = fmtZona.formatToParts(new Date());
  return bagian.find((b) => b.type === "timeZoneName")?.value ?? "";
}

/** "2026-11-21T09:47:00+08:00" -> "21 Nov 2026, 09.47 WITA". Murni, aman diuji tanpa Next. */
export function formatTanggalLokal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  const jam = fmtJam.format(d).replace(":", ".");
  return `${fmtHari.format(d)}, ${jam} ${namaZona()}`;
}

/** "2026-11-21" -> "21 Nov 2026". Untuk tanggal tanpa jam (kedaluwarsa). */
export function formatHariLokal(iso: string): string {
  const d = new Date(iso.length <= 10 ? `${iso}T00:00:00` : iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: ZONA,
  }).format(d);
}

/** Selisih hari kalender zona lokal: "2026-11-25" dari 23 Nov -> 2. Murni. */
export function sisaHariKalender(t: string, kini = new Date()): number {
  const potong = t.slice(0, 10).split("-").map(Number);
  const target = Date.UTC(potong[0] ?? NaN, (potong[1] ?? NaN) - 1, potong[2] ?? NaN);
  const hariIni = Date.UTC(
    kini.getFullYear(),
    kini.getMonth(),
    kini.getDate()
  );
  if (Number.isNaN(target)) return Number.NaN;
  return Math.round((target - hariIni) / 86400000);
}

const LABEL_STATUS: Record<string, string> = {
  DIPUBLIKASIKAN: "Dipublikasikan",
  DITERIMA: "Diterima",
  PERLU_DICEK: "Perlu dicek",
  TERKUNCI: "Terkunci",
  DIBATALKAN: "Dibatalkan",
  KELUAR_GUDANG: "Keluar gudang",
  DALAM_PERJALANAN: "Dalam perjalanan",
  CHECKIN: "Check-in",
  TIBA: "Tiba",
};

/** "PERLU_DICEK" -> "Perlu dicek". Kode tak dikenal kembali apa adanya. Murni. */
export function labelStatusRiwayat(status: string): string {
  return LABEL_STATUS[status] ?? status;
}

const POLA_ISO = /\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d+)?(?:Z|[+-]\d{2}:?\d{2})?/;

/** Ganti timestamp mesin di dalam catatan dengan tanggal lokal rapi. Murni. */
export function catatanRamah(catatan: string | null): string | null {
  if (catatan === null) return null;
  const cocok = catatan.match(POLA_ISO);
  if (!cocok) return catatan;
  return catatan.replace(cocok[0], formatTanggalLokal(cocok[0]));
}
