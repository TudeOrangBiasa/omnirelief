import { NextResponse } from "next/server";
import { getProfil } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { validasiUndang } from "@/lib/validasi";

export async function POST(request: Request) {
  const profil = await getProfil();
  if (!profil)
    return NextResponse.json({ ok: false, galat: "belum masuk" }, { status: 401 });
  if (profil.peran !== "ADMIN")
    return NextResponse.json({ ok: false, galat: "khusus admin" }, { status: 403 });
  const body = (await request.json()) as Record<string, unknown>;
  const valid = validasiUndang(body);
  if (!valid.ok) return NextResponse.json(valid, { status: 400 });
  const admin = createAdminClient();
  const { data, error } = await admin.auth.admin.inviteUserByEmail(valid.email);
  if (error || !data.user)
    return NextResponse.json({ ok: false, galat: "gagal mengirim undangan" }, { status: 500 });
  const { error: salahProfil } = await admin
    .from("profil")
    .upsert({ id: data.user.id, nama: valid.nama, peran: valid.peran, posko_id: null }, { onConflict: "id" });
  if (salahProfil)
    return NextResponse.json({ ok: false, galat: "undangan terkirim, profil gagal disimpan" }, { status: 500 });
  return NextResponse.json({ ok: true, email: valid.email, peran: valid.peran });
}
