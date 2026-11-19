import { NextResponse } from "next/server";
import { getProfil } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { validasiKetidaksesuaian } from "@/lib/validasi";
import { LOG_FINAL, statusTerakhir, tambahLog } from "@/lib/riwayat";
import { tunggal, type ManifestRow } from "@/lib/supabase/baris";

export async function POST(request: Request) {
  const profil = await getProfil();
  if (!profil)
    return NextResponse.json({ ok: false, galat: "belum masuk" }, { status: 401 });
  if (profil.peran !== "POSKO" || profil.posko_id === null)
    return NextResponse.json({ ok: false, galat: "khusus relawan posko" }, { status: 403 });
  const body = (await request.json()) as Record<string, unknown>;
  const valid = validasiKetidaksesuaian(body);
  if (!valid.ok) return NextResponse.json(valid, { status: 400 });

  const admin = createAdminClient();
  const { data: mentah } = await admin
    .from("manifest")
    .select("id,kode,posko_id,tim,status")
    .eq("id", valid.manifest_id)
    .single();
  const manifest = tunggal<ManifestRow>(mentah);
  if (!manifest || manifest.posko_id !== profil.posko_id)
    return NextResponse.json({ ok: false, galat: "bukan kiriman posko ini" }, { status: 404 });
  const terakhir = await statusTerakhir(admin, valid.manifest_id);
  if (!terakhir || terakhir === "DIPUBLIKASIKAN")
    return NextResponse.json(
      { ok: false, galat: "truk belum berangkat, hubungi BPBD untuk pembatalan" },
      { status: 409 }
    );
  if (LOG_FINAL.includes(terakhir))
    return NextResponse.json({ ok: false, galat: "pengiriman sudah selesai" }, { status: 409 });

  const { error: galatLapor } = await admin.from("ketidaksesuaian").insert({
    manifest_id: valid.manifest_id,
    jenis: valid.jenis,
    keterangan: valid.keterangan,
    dibuat_oleh: profil.id,
  });
  if (galatLapor)
    return NextResponse.json({ ok: false, galat: "gagal menyimpan laporan" }, { status: 500 });
  await admin.from("manifest").update({ status: "PUNYA_LAPORAN" }).eq("id", valid.manifest_id);
  const hasil = await tambahLog(admin, {
    manifest_id: valid.manifest_id,
    manifest_kode: manifest.kode,
    status: valid.jenis,
    catatan: valid.keterangan,
    dibuat_oleh: profil.id,
  });
  if (!hasil.ok) return NextResponse.json(hasil, { status: 500 });
  return NextResponse.json({ ok: true, hash: hasil.hash });
}
