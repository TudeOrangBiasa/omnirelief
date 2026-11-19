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
    .from("penyintas_snapshot")
    .select(
      "id,bayi,balita,ibu_hamil,lansia,disabilitas,umum,status,dibuat_pada,posko:posko_id(nama)"
    )
    .eq("status", "MENUNGGU_VERIFIKASI")
    .order("dibuat_pada", { ascending: true })
    .limit(50);
  if (error)
    return NextResponse.json(
      { ok: false, galat: "gagal memuat antrean" },
      { status: 500 }
    );
  return NextResponse.json({ ok: true, antrean: data });
}
