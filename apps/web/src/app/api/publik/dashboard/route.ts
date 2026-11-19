import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("v_publik_dashboard")
    .select("posko_id,posko_nama,wilayah,butuh,dikirim,diterima,selisih")
    .order("selisih", { ascending: false });
  if (error)
    return NextResponse.json(
      { ok: false, galat: "gagal memuat dashboard" },
      { status: 500 }
    );
  return NextResponse.json({ ok: true, dashboard: data ?? [] });
}
