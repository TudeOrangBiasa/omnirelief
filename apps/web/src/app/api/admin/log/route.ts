import { NextResponse } from "next/server";
import { getProfil } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const profil = await getProfil();
  if (!profil)
    return NextResponse.json({ ok: false, galat: "belum masuk" }, { status: 401 });
  if (profil.peran !== "ADMIN")
    return NextResponse.json({ ok: false, galat: "khusus admin" }, { status: 403 });
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("manifest_log")
    .select("id,status,catatan,dibuat_pada,manifest(kode)")
    .order("dibuat_pada", { ascending: false })
    .limit(50);
  if (error)
    return NextResponse.json({ ok: false, galat: "gagal memuat log" }, { status: 500 });
  return NextResponse.json({ ok: true, log: data ?? [] });
}
