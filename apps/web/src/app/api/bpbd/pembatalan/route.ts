import { NextResponse } from "next/server";
import { getProfil } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { validasiPembatalan } from "@/lib/validasi";
import { tambahLog } from "@/lib/riwayat";
import { baris, tunggal, type ManifestRow } from "@/lib/supabase/baris";

const SUDAH_BERANGKAT = [
  "KELUAR_GUDANG",
  "DALAM_PERJALANAN",
  "TIBA",
  "DITERIMA",
  "TERHAMBAT",
  "DARURAT",
  "CHECKIN",
];

export async function POST(request: Request) {
  const profil = await getProfil();
  if (!profil)
    return NextResponse.json({ ok: false, galat: "belum masuk" }, { status: 401 });
  if (profil.peran !== "BPBD")
    return NextResponse.json({ ok: false, galat: "khusus BPBD" }, { status: 403 });
  const body = (await request.json()) as Record<string, unknown>;
  const valid = validasiPembatalan(body);
  if (!valid.ok) return NextResponse.json(valid, { status: 400 });

  const admin = createAdminClient();
  const { data: mentah } = await admin
    .from("manifest")
    .select("id,kode,posko_id,tim,status")
    .eq("id", valid.manifest_id)
    .single();
  const manifest = tunggal<ManifestRow>(mentah);
  if (!manifest || manifest.status !== "TERKUNCI_PUBLIK")
    return NextResponse.json(
      { ok: false, galat: "hanya manifest terkunci yang bisa dibatalkan" },
      { status: 409 }
    );
  const { data: mentahLog } = await admin
    .from("manifest_log")
    .select("status")
    .eq("manifest_id", valid.manifest_id);
  const jalan = baris<{ status: string }>(mentahLog).some((l) =>
    SUDAH_BERANGKAT.includes(l.status)
  );
  if (jalan)
    return NextResponse.json(
      { ok: false, galat: "sudah berangkat, pakai laporan ketidaksesuaian" },
      { status: 409 }
    );

  const { error: galatBatal } = await admin.from("pembatalan").insert({
    manifest_id: valid.manifest_id,
    alasan: valid.alasan,
    manifest_pengganti_id: valid.manifest_pengganti_id,
  });
  if (galatBatal)
    return NextResponse.json({ ok: false, galat: "gagal mencatat pembatalan" }, { status: 500 });
  await admin
    .from("manifest")
    .update({
      status: valid.manifest_pengganti_id ? "PUNYA_PENGGANTI" : "DIBATALKAN",
    })
    .eq("id", valid.manifest_id);
  const hasil = await tambahLog(admin, {
    manifest_id: valid.manifest_id,
    manifest_kode: manifest.kode,
    status: "DIBATALKAN",
    catatan: valid.alasan,
    dibuat_oleh: profil.id,
  });
  if (!hasil.ok) return NextResponse.json(hasil, { status: 500 });
  return NextResponse.json({ ok: true, hash: hasil.hash });
}
