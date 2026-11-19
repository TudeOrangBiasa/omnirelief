import { NextResponse } from "next/server";
import { getProfil } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { baris } from "@/lib/supabase/baris";

export async function GET() {
  const profil = await getProfil();
  if (!profil)
    return NextResponse.json({ ok: false, galat: "belum masuk" }, { status: 401 });
  if (profil.peran !== "POSKO" || profil.posko_id === null)
    return NextResponse.json({ ok: false, galat: "khusus relawan posko" }, { status: 403 });
  const admin = createAdminClient();
  const { data: mentah } = await admin
    .from("manifest")
    .select("id,kode,tim,status")
    .eq("posko_id", profil.posko_id)
    .in("status", ["TERKUNCI_PUBLIK", "PUNYA_PENGGANTI", "PUNYA_LAPORAN"])
    .order("id", { ascending: false })
    .limit(20);
  const daftar = baris<{ id: number; kode: string; tim: string; status: string }>(mentah);
  const { data: mentahLog } = await admin
    .from("manifest_log")
    .select("manifest_id,status,dibuat_pada")
    .in("manifest_id", daftar.map((d) => d.id))
    .order("id", { ascending: false });
  const logTerakhir = new Map<number, { status: string; dibuat_pada: string }>();
  for (const l of baris<{ manifest_id: number; status: string; dibuat_pada: string }>(mentahLog)) {
    if (!logTerakhir.has(l.manifest_id))
      logTerakhir.set(l.manifest_id, { status: l.status, dibuat_pada: l.dibuat_pada });
  }
  return NextResponse.json({
    ok: true,
    bantuan: daftar.map((d) => ({
      id: d.id,
      kode: d.kode,
      tim: d.tim,
      status: d.status,
      log_terakhir: logTerakhir.get(d.id) ?? null,
    })),
  });
}
