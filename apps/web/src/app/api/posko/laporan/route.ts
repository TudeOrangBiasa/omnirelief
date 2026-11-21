import { NextResponse } from "next/server";
import { getProfil } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { validasiLaporan } from "@/lib/validasi";


export async function POST(request: Request) {
  const profil = await getProfil();
  if (!profil)
    return NextResponse.json({ ok: false, galat: "belum masuk" }, { status: 401 });
  if (profil.peran !== "POSKO" || profil.posko_id === null)
    return NextResponse.json(
      { ok: false, galat: "khusus relawan posko" },
      { status: 403 }
    );
  const body = (await request.json()) as Record<string, unknown>;
  const valid = validasiLaporan(body);
  if (!valid.ok) return NextResponse.json(valid, { status: 400 });
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("penyintas_snapshot")
    .insert({
      posko_id: profil.posko_id,
      ...valid.angka,
      status: valid.status,
      dibuat_oleh: profil.id,
    })
    .select("id")
    .single();
  if (error || !data)
    return NextResponse.json(
      { ok: false, galat: "gagal menyimpan laporan" },
      { status: 500 }
    );
  return NextResponse.json({ ok: true, id: data.id });
}

export async function GET() {
  const profil = await getProfil();
  if (!profil)
    return NextResponse.json({ ok: false, galat: "belum masuk" }, { status: 401 });
  if (profil.peran !== "POSKO" || profil.posko_id === null)
    return NextResponse.json(
      { ok: false, galat: "khusus relawan posko" },
      { status: 403 }
    );
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("penyintas_snapshot")
    .select("id,bayi,balita,ibu_hamil,lansia,disabilitas,umum,status,alasan,dibuat_pada")
    .eq("posko_id", profil.posko_id)
    .order("dibuat_pada", { ascending: false })
    .limit(20);
  if (error)
    return NextResponse.json(
      { ok: false, galat: "gagal memuat laporan" },
      { status: 500 }
    );
  return NextResponse.json({ ok: true, laporan: data });
}
