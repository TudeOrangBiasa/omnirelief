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
    .from("v_publik_dashboard")
    .select("posko_id,posko_nama,wilayah,butuh,dikirim,diterima,selisih")
    .order("selisih", { ascending: false });
  if (error)
    return NextResponse.json(
      { ok: false, galat: "gagal memuat prioritas" },
      { status: 500 }
    );
  return NextResponse.json({ ok: true, prioritas: data });
}
