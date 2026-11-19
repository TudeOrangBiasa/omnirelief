import { NextResponse } from "next/server";
import { getProfil } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { validasiVerifikasi } from "@/lib/validasi";
export async function POST(request: Request) {

  const profil = await getProfil();
  if (!profil)
    return NextResponse.json({ ok: false, galat: "belum masuk" }, { status: 401 });
  if (profil.peran !== "BPBD")
    return NextResponse.json({ ok: false, galat: "khusus BPBD" }, { status: 403 });
  const body = (await request.json()) as Record<string, unknown>;
  const valid = validasiVerifikasi(body);
  if (!valid.ok) return NextResponse.json(valid, { status: 400 });
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("penyintas_snapshot")
    .update({ status: valid.keputusan })
    .eq("id", valid.snapshot_id)
    .select("id")
    .single();
  if (error || !data)
    return NextResponse.json(
      { ok: false, galat: "snapshot tidak ditemukan" },
      { status: 404 }
    );
  return NextResponse.json({ ok: true, id: data.id, keputusan: valid.keputusan });
}
