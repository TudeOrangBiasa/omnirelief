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
