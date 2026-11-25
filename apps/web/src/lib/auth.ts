import { redirect } from "next/navigation";
import { createClient } from "./supabase/server";

export type Peran = "BPBD" | "GUDANG" | "POSKO" | "TIM" | "ADMIN";

export type Profil = {
  id: string;
  nama: string;
  peran: Peran;
  posko_id: number | null;
};

export async function getProfil(): Promise<Profil | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("profil")
    .select("id,nama,peran,posko_id")
    .eq("id", user.id)
    .single();
  return (data as Profil | null) ?? null;
}

export async function requireRole(boleh: Peran[]): Promise<Profil> {
  const profil = await getProfil();
  if (!profil) redirect("/masuk");
  if (!boleh.includes(profil.peran)) redirect("/beranda");
  return profil;
}
