import { NextResponse } from "next/server";
import { getProfil } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { baris } from "@/lib/supabase/baris";

export async function GET() {
  const profil = await getProfil();
  if (!profil)
    return NextResponse.json({ ok: false, galat: "belum masuk" }, { status: 401 });
  if (profil.peran !== "TIM")
    return NextResponse.json({ ok: false, galat: "khusus tim distribusi" }, { status: 403 });
  const admin = createAdminClient();
  const { data: mentah } = await admin
    .from("manifest")
    .select("id,kode,tim,eta,batas_checkin,status,posko:posko_id(nama)")
    .in("status", ["TERKUNCI_PUBLIK", "PUNYA_PENGGANTI", "PUNYA_LAPORAN"])
    .order("batas_checkin", { ascending: true });
  const daftar = baris<{
    id: number;
    kode: string;
    tim: string;
    eta: string | null;
    batas_checkin: string | null;
    status: string;
    posko: { nama: string } | null;
  }>(mentah);
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
    tugas: daftar.map((d) => ({
      id: d.id,
      kode: d.kode,
      tim: d.tim,
      eta: d.eta,
      batas_checkin: d.batas_checkin,
      status: d.status,
      posko_nama: d.posko?.nama ?? "?",
      log_terakhir: logTerakhir.get(d.id) ?? null,
    })),
  });
}
