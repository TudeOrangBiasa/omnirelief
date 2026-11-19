import { NextResponse } from "next/server";
import { getProfil } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { validasiStatusTim } from "@/lib/validasi";
import { LOG_FINAL, statusTerakhir, tambahLog } from "@/lib/riwayat";
import { tunggal, type ManifestRow } from "@/lib/supabase/baris";

export async function POST(request: Request) {
  const profil = await getProfil();
  if (!profil)
    return NextResponse.json({ ok: false, galat: "belum masuk" }, { status: 401 });
  if (profil.peran !== "TIM")
    return NextResponse.json({ ok: false, galat: "khusus tim distribusi" }, { status: 403 });
  const body = (await request.json()) as Record<string, unknown>;
  const valid = validasiStatusTim(body);
  if (!valid.ok) return NextResponse.json(valid, { status: 400 });

  const admin = createAdminClient();
  const { data: mentah } = await admin
    .from("manifest")
    .select("id,kode,posko_id,tim,status")
    .eq("id", valid.manifest_id)
    .single();
  const manifest = tunggal<ManifestRow>(mentah);
  if (!manifest || manifest.status === "DIBATALKAN")
    return NextResponse.json({ ok: false, galat: "manifest tidak aktif" }, { status: 404 });
  const terakhir = await statusTerakhir(admin, valid.manifest_id);
  if (terakhir && LOG_FINAL.includes(terakhir))
    return NextResponse.json({ ok: false, galat: "pengiriman sudah selesai" }, { status: 409 });

  const hasil = await tambahLog(admin, {
    manifest_id: valid.manifest_id,
    manifest_kode: manifest.kode,
    status: valid.status,
    catatan: valid.catatan,
    dibuat_oleh: profil.id,
  });
  if (!hasil.ok) return NextResponse.json(hasil, { status: 500 });
  return NextResponse.json({ ok: true, hash: hasil.hash });
}
