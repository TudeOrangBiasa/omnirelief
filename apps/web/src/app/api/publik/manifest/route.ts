import { NextResponse } from "next/server";
import { normalisasiKode } from "@/lib/kode";
import {
  baris,
  tunggal,
  type ManifestItemRow,
} from "@/lib/supabase/baris";
import { createAdminClient } from "@/lib/supabase/admin";

type ManifestRow = {
  kode: string;
  status: string;
  tim: string;
  eta: string | null;
  batas_checkin: string | null;
  hash: string;
  dipublikasikan_pada: string;
  posko_nama: string;
  wilayah: string;
};

type LogRow = {
  status: string;
  catatan: string | null;
  dibuat_pada: string;
  dibuat_oleh: string | null;
  profil: { nama: string } | null;
};

export async function GET(request: Request) {
  const kode = normalisasiKode(new URL(request.url).searchParams.get("kode") ?? "");
  if (kode === "")
    return NextResponse.json({ ok: false, galat: "kode wajib diisi" }, { status: 400 });
  const admin = createAdminClient();
  const { data: mentah } = await admin
    .from("v_publik_manifest")
    .select("*")
    .eq("kode", kode)
    .single();
  const manifest = tunggal<ManifestRow>(mentah);
  if (!manifest)
    return NextResponse.json({ ok: false, galat: "manifest tidak ditemukan" }, { status: 404 });

  const { data: mentahId } = await admin
    .from("manifest")
    .select("id")
    .eq("kode", kode)
    .single();
  const manifestId = tunggal<{ id: number }>(mentahId)?.id ?? 0;

  const { data: mentahItem } = await admin
    .from("manifest_item")
    .select("jumlah,batch:batch_id(kode_sumbangan,kedaluwarsa,item:item_id(nama,satuan))")
    .eq("manifest_id", manifestId);
  const items = baris<
    ManifestItemRow & {
      batch: {
        kode_sumbangan: string;
        kedaluwarsa: string | null;
        item: { nama: string; satuan: string } | null;
      } | null;
    }
  >(mentahItem);

  const { data: mentahLog } = await admin
    .from("manifest_log")
    .select("status,catatan,dibuat_pada,dibuat_oleh,profil:dibuat_oleh(nama)")
    .eq("manifest_id", manifestId)
    .order("dibuat_pada");
  const riwayat = baris<LogRow>(mentahLog).map((l) => ({
    status: l.status,
    catatan: l.catatan,
    dibuat_pada: l.dibuat_pada,
    aktor: l.profil?.nama ?? null,
  }));

  const { data: mentahBatal } = await admin
    .from("pembatalan")
    .select("alasan,dibuat_pada")
    .eq("manifest_id", manifestId);
  const { data: mentahLapor } = await admin
    .from("ketidaksesuaian")
    .select("jenis,keterangan,dibuat_pada")
    .eq("manifest_id", manifestId);

  return NextResponse.json({
    ok: true,
    manifest: {
      kode: manifest.kode,
      status: manifest.status,
      tim: manifest.tim,
      eta: manifest.eta,
      batas_checkin: manifest.batas_checkin,
      hash: manifest.hash,
      dipublikasikan_pada: manifest.dipublikasikan_pada,
      posko_nama: manifest.posko_nama,
      wilayah: manifest.wilayah,
      items: items.map((i) => ({
        jumlah: i.jumlah,
        kode_sumbangan: i.batch?.kode_sumbangan ?? "?",
        item_nama: i.batch?.item?.nama ?? "?",
        satuan: i.batch?.item?.satuan ?? "",
        kedaluwarsa: i.batch?.kedaluwarsa ?? null,
      })),
      riwayat,
      pembatalan: mentahBatal ?? [],
      ketidaksesuaian: mentahLapor ?? [],
    },
  });
}
