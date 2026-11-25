import type { Route } from "next";
import type { Peran } from "@/lib/auth";

export type AksiItem = { label: string; href: Route; utama?: boolean };

export const AKSI_PERAN: Record<Peran, { label: string; href: Route }[]> = {
  BPBD: [{ label: "Buat manifest", href: "/bpbd/kirim" }],
  GUDANG: [{ label: "Catat batch masuk", href: "/gudang" }],
  POSKO: [{ label: "Lapor penyintas", href: "/posko" }],
  TIM: [{ label: "Buka tugas distribusi", href: "/tim" }],
  ADMIN: [{ label: "Buka admin", href: "/admin" }],
};

export function daftarAksi(peran: Peran): AksiItem[] {
  return AKSI_PERAN[peran].map((a, i) => ({ ...a, utama: i === 0 }));
}
