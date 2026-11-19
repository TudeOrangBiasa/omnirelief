import { NextResponse } from "next/server";
import { getProfil } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const profil = await getProfil();
  if (!profil)
    return NextResponse.json({ ok: false, galat: "belum masuk" }, { status: 401 });
  if (profil.peran !== "BPBD")
    return NextResponse.json({ ok: false, galat: "khusus BPBD" }, { status: 403 });
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("posko")
    .select("id,nama,wilayah")
    .order("nama");
  if (error)
    return NextResponse.json({ ok: false, galat: "gagal memuat posko" }, { status: 500 });
  return NextResponse.json({ ok: true, posko: data });
}
