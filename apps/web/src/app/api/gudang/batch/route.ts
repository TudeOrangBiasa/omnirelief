import { NextResponse } from "next/server";
import { getProfil } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { petaTerpakai } from "@/lib/stok";
import {
  baris,
  type AlokasiRow,
  type BatchRow,
} from "@/lib/supabase/baris";

export async function GET() {
  const profil = await getProfil();
  if (!profil)
    return NextResponse.json({ ok: false, galat: "belum masuk" }, { status: 401 });
  if (profil.peran !== "BPBD" && profil.peran !== "GUDANG")
    return NextResponse.json(
      { ok: false, galat: "khusus BPBD dan gudang" },
      { status: 403 }
    );
  const admin = createAdminClient();
  const { data: mentah, error } = await admin
    .from("stok_batch")
    .select("id,kode_sumbangan,jumlah,kedaluwarsa,sumber,tampilkan_nama,status,item:item_id(nama,satuan)")
    .order("kedaluwarsa", { ascending: true, nullsFirst: false });
  if (error)
    return NextResponse.json({ ok: false, galat: "gagal memuat batch" }, { status: 500 });
  const daftar = baris<BatchRow>(mentah);
  const { data: mentahAlokasi } = await admin
    .from("manifest_item")
    .select("batch_id,jumlah,manifest:manifest_id(status)");
  const terpakai = petaTerpakai(
    baris<AlokasiRow>(mentahAlokasi).map((a) => ({
      batch_id: a.batch_id,
      jumlah: a.jumlah,
      batal: a.manifest?.status === "DIBATALKAN",
    }))
  );
  return NextResponse.json({
    ok: true,
    batch: daftar.map((b) => ({
      id: b.id,
      kode_sumbangan: b.kode_sumbangan,
      item_nama: b.item?.nama ?? "?",
      satuan: b.item?.satuan ?? "",
      jumlah: b.jumlah,
      kedaluwarsa: b.kedaluwarsa,
      sumber: b.sumber,
      tampilkan_nama: b.tampilkan_nama,
      status: b.status,
      terpakai: terpakai.get(b.id) ?? 0,
      sisa: b.jumlah - (terpakai.get(b.id) ?? 0),
    })),
  });
}
