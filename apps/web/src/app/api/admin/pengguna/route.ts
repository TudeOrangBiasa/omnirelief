import { NextResponse } from "next/server";
import { getProfil } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { validasiAktifPengguna, validasiPeranPengguna } from "@/lib/validasi";

function tolak(profil: { peran: string } | null) {
  if (!profil)
    return NextResponse.json({ ok: false, galat: "belum masuk" }, { status: 401 });
  if (profil.peran !== "ADMIN")
    return NextResponse.json({ ok: false, galat: "khusus admin" }, { status: 403 });
  return null;
}

export async function GET() {
  const profil = await getProfil();
  const gagal = tolak(profil);
  if (gagal) return gagal;
  const admin = createAdminClient();
  const { data, error } = await admin
    .from("profil")
    .select("id,nama,peran,posko_id,aktif,dibuat_pada,posko(nama)")
    .order("dibuat_pada", { ascending: true });
  if (error)
    return NextResponse.json({ ok: false, galat: "gagal memuat pengguna" }, { status: 500 });
  return NextResponse.json({ ok: true, pengguna: data ?? [] });
}

export async function PATCH(request: Request) {
  const profil = await getProfil();
  const gagal = tolak(profil);
  if (gagal) return gagal;
  const body = (await request.json()) as Record<string, unknown>;
  const admin = createAdminClient();
  if ("peran" in body) {
    const valid = validasiPeranPengguna(body);
    if (!valid.ok) return NextResponse.json(valid, { status: 400 });
    if (valid.id === profil?.id)
      return NextResponse.json({ ok: false, galat: "peran sendiri tidak boleh diubah" }, { status: 400 });
    const { error } = await admin.from("profil").update({ peran: valid.peran }).eq("id", valid.id);
    if (error)
      return NextResponse.json({ ok: false, galat: "gagal menyimpan peran" }, { status: 500 });
    return NextResponse.json({ ok: true, id: valid.id, peran: valid.peran });
  }
  const valid = validasiAktifPengguna(body);
  if (!valid.ok) return NextResponse.json(valid, { status: 400 });
  if (valid.id === profil?.id)
    return NextResponse.json({ ok: false, galat: "akun sendiri tidak boleh dinonaktifkan" }, { status: 400 });
  const { error } = await admin.from("profil").update({ aktif: valid.aktif }).eq("id", valid.id);
  if (error)
    return NextResponse.json({ ok: false, galat: "gagal menyimpan status" }, { status: 500 });
  return NextResponse.json({ ok: true, id: valid.id, aktif: valid.aktif });
}
