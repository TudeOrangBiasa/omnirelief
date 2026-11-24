export type WarnaAvatar = "#0F3B5F" | "#0f79b8" | "#0B1F2E";

export type Identitas = {
  nama: string;
  jabatan: string;
  kontak: string;
  warna: WarnaAvatar;
};

export const KUNCI_IDENTITAS = "omnirelief-identitas";

export const WARNA_AVATAR: { nilai: WarnaAvatar; label: string }[] = [
  { nilai: "#0F3B5F", label: "Biru otoritas" },
  { nilai: "#0f79b8", label: "Biru cerah" },
  { nilai: "#0B1F2E", label: "Tinta" },
];

export const IDENTITAS_BAKU: Identitas = { nama: "", jabatan: "", kontak: "", warna: "#0B1F2E" };

function potong(nilai: unknown, batas: number): string {
  if (typeof nilai !== "string") return "";
  return nilai.trim().slice(0, batas);
}

function warnaSah(nilai: unknown): WarnaAvatar {
  if (nilai === "#0F3B5F" || nilai === "#0B1F2E") return nilai;
  if (nilai === "#1B7FBF" || nilai === "#0f79b8") return "#0f79b8";
  return "#0B1F2E";
}

export function bacaIdentitas(): Identitas {
  try {
    const mentah = window.localStorage.getItem(KUNCI_IDENTITAS);
    if (!mentah) return { ...IDENTITAS_BAKU };
    const data: unknown = JSON.parse(mentah);
    if (typeof data !== "object" || data === null) return { ...IDENTITAS_BAKU };
    const r = data as Record<string, unknown>;
    return {
      nama: potong(r["nama"], 40),
      jabatan: potong(r["jabatan"], 40),
      kontak: potong(r["kontak"], 30),
      warna: warnaSah(r["warna"]),
    };
  } catch {
    return { ...IDENTITAS_BAKU };
  }
}

export function simpanIdentitas(nilai: Identitas): void {
  try {
    window.localStorage.setItem(
      KUNCI_IDENTITAS,
      JSON.stringify({
        nama: potong(nilai.nama, 40),
        jabatan: potong(nilai.jabatan, 40),
        kontak: potong(nilai.kontak, 30),
        warna: warnaSah(nilai.warna),
      }),
    );
  } catch {
    /* abaikan */
  }
}
