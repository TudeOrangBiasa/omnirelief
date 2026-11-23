import type { Route } from "next";
import type { Peran } from "@/lib/auth";

export type AksiItem = { label: string; href: Route; utama?: boolean };

export const AKSI_PERAN: Record<Peran, { label: string; href: Route }[]> = {
  BPBD: [
    { label: "Buat manifest", href: "/bpbd/kirim" },
    { label: "Buka command center", href: "/bpbd" },
  ],
  GUDANG: [{ label: "Catat batch masuk", href: "/gudang" }],
  POSKO: [
    { label: "Lapor penyintas", href: "/posko" },
    { label: "Lihat kiriman posko", href: "/posko#bantuan" },
  ],
  TIM: [{ label: "Buka tugas distribusi", href: "/tim" }],
};

export function daftarAksi(peran: Peran): AksiItem[] {
  return AKSI_PERAN[peran].map((a, i) => ({ ...a, utama: i === 0 }));
}
