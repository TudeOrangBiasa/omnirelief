import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { getProfil } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export function buatKodeSumbangan(tahun: number): string {
  return `DNT-${tahun}-${String(randomInt(0, 10000)).padStart(4, "0")}`;
}
export async function POST(request: Request) {
  const profil = await getProfil();
  if (!profil)
    return NextResponse.json({ ok: false, galat: "belum masuk" }, { status: 401 });
  if (profil.peran !== "GUDANG")
    return NextResponse.json({ ok: false, galat: "khusus petugas gudang" }, { status: 403 });
  const body = (await request.json()) as {
    item_id?: unknown;
    jumlah?: unknown;
    kedaluwarsa?: unknown;
    sumber?: unknown;
    tampilkan_nama?: unknown;
  };

  const item_id = Number(body.item_id);
  const jumlah = Number(body.jumlah);
  const kedaluwarsa =
    typeof body.kedaluwarsa === "string" && body.kedaluwarsa !== ""
      ? body.kedaluwarsa
      : null;
  const sumber = typeof body.sumber === "string" ? body.sumber.trim() : "";
  const tampilkan_nama = body.tampilkan_nama === true;

  if (!Number.isInteger(item_id) || item_id <= 0)
    return NextResponse.json({ ok: false, galat: "item_id tidak valid" }, { status: 400 });
  if (!Number.isInteger(jumlah) || jumlah <= 0)
    return NextResponse.json({ ok: false, galat: "jumlah harus lebih dari 0" }, { status: 400 });
  if (sumber === "")
    return NextResponse.json({ ok: false, galat: "sumber wajib diisi" }, { status: 400 });
  const hariIni = new Date().toISOString().slice(0, 10);
  if (kedaluwarsa !== null && kedaluwarsa < hariIni)
    return NextResponse.json({ ok: false, galat: "kedaluwarsa tidak boleh sudah lewat" }, { status: 400 });

  const admin = createAdminClient();
  const { data: item } = await admin
    .from("item_pangan")
    .select("id")
    .eq("id", item_id)
    .single();
  if (!item)
    return NextResponse.json({ ok: false, galat: "item tidak dikenal" }, { status: 400 });

  const tahun = new Date().getFullYear();
  for (let coba = 0; coba < 3; coba++) {
    const kode_sumbangan = buatKodeSumbangan(tahun);
    const { error } = await admin.from("stok_batch").insert({
      item_id,
      jumlah,
      kedaluwarsa,
      sumber,
      tampilkan_nama,
      kode_sumbangan,
      status: "TERSEDIA",
    });
    if (!error) {
      return NextResponse.json({ ok: true, kode_sumbangan });
    }
    if (error.code !== "23505") {
      return NextResponse.json({ ok: false, galat: "gagal menyimpan batch" }, { status: 500 });
    }
  }
  return NextResponse.json({ ok: false, galat: "gagal membuat kode unik" }, { status: 500 });
}
