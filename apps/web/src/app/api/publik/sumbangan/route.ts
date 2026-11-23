import { NextResponse } from "next/server";
import { normalisasiKode } from "@/lib/kode";
import { baris, tunggal } from "@/lib/supabase/baris";
import { createAdminClient } from "@/lib/supabase/admin";

type BatchRow = {
  id: number;
  kode_sumbangan: string;
  jumlah: number;
  tgl_masuk: string;
  kedaluwarsa: string | null;
  sumber: string;
  tampilkan_nama: boolean;
  status: string;
  item_nama: string;
  satuan: string;
};

export async function GET(request: Request) {
  const kode = normalisasiKode(new URL(request.url).searchParams.get("kode") ?? "");
  if (kode === "")
    return NextResponse.json({ ok: false, galat: "kode wajib diisi" }, { status: 400 });
  const admin = createAdminClient();
  const { data: mentah } = await admin
    .from("stok_batch")
    .select("id,kode_sumbangan,jumlah,tgl_masuk,kedaluwarsa,sumber,tampilkan_nama,status,item:item_id(nama,satuan)")
    .eq("kode_sumbangan", kode)
    .single();
  const satu = tunggal<
    Omit<BatchRow, "item_nama" | "satuan"> & {
      item: { nama: string; satuan: string } | null;
    }
  >(mentah);
  if (!satu)
    return NextResponse.json({ ok: false, galat: "sumbangan tidak ditemukan" }, { status: 404 });

  const { data: mentahPakai } = await admin
    .from("manifest_item")
    .select("jumlah,manifest:manifest_id(kode,dipublikasikan_pada,posko:posko_id(nama))")
    .eq("batch_id", satu.id);
  const dipakai = baris<{
    jumlah: number;
    manifest: {
      kode: string;
      dipublikasikan_pada: string;
      posko: { nama: string } | null;
    } | null;
  }>(mentahPakai);

  const dialokasikan = dipakai.reduce((s, p) => s + p.jumlah, 0);
  return NextResponse.json({
    ok: true,
    sumbangan: {
      kode_sumbangan: satu.kode_sumbangan,
      item_nama: satu.item?.nama ?? "?",
      satuan: satu.item?.satuan ?? "",
      jumlah: satu.jumlah,
      tgl_masuk: satu.tgl_masuk,
      kedaluwarsa: satu.kedaluwarsa,
      sumber: satu.tampilkan_nama ? satu.sumber : "Anonim",
      status: satu.status,
      dialokasikan,
      tersisa: satu.jumlah - dialokasikan,
      dipakai: dipakai.map((p) => ({
        jumlah: p.jumlah,
        kode: p.manifest?.kode ?? "?",
        posko_nama: p.manifest?.posko?.nama ?? "?",
        tanggal: p.manifest?.dipublikasikan_pada ?? null,
      })),
    },
  });
}
