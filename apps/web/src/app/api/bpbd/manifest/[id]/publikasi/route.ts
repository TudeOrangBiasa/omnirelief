import { NextResponse } from "next/server";
import { getProfil } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { GENESIS_HASH, hashLog, hashManifest } from "@/lib/hash";
import { petaTerpakai } from "@/lib/stok";
import {
  baris,
  tunggal,
  type AlokasiRow,
  type BatchRow,
  type ManifestItemRow,
  type ManifestRow,
} from "@/lib/supabase/baris";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const profil = await getProfil();
  if (!profil)
    return NextResponse.json({ ok: false, galat: "belum masuk" }, { status: 401 });
  if (profil.peran !== "BPBD")
    return NextResponse.json({ ok: false, galat: "khusus BPBD" }, { status: 403 });

  const { id } = await params;
  const manifestId = Number(id);
  if (!Number.isInteger(manifestId) || manifestId <= 0)
    return NextResponse.json({ ok: false, galat: "id tidak valid" }, { status: 400 });

  const admin = createAdminClient();
  const { data: mentahManifest } = await admin
    .from("manifest")
    .select("id,kode,posko_id,tim,eta,batas_checkin,status")
    .eq("id", manifestId)
    .single();
  const manifest = tunggal<ManifestRow>(mentahManifest);
  if (!manifest)
    return NextResponse.json({ ok: false, galat: "draf tidak ditemukan" }, { status: 404 });
  if (manifest.status !== "DRAFT")
    return NextResponse.json(
      { ok: false, galat: "hanya draf yang bisa dipublikasikan" },
      { status: 409 }
    );

  const { data: mentahItem } = await admin
    .from("manifest_item")
    .select("batch_id,jumlah")
    .eq("manifest_id", manifestId);
  const items = baris<ManifestItemRow>(mentahItem);
  if (items.length === 0)
    return NextResponse.json(
      { ok: false, galat: "draf kosong, tambah batch dulu" },
      { status: 400 }
    );

  const batchIds = items.map((i) => i.batch_id);
  const { data: mentahBatch } = await admin
    .from("stok_batch")
    .select("id,jumlah,kode_sumbangan")
    .in("id", batchIds);
  const petaBatch = new Map(
    baris<BatchRow>(mentahBatch).map((b) => [b.id, b] as const)
  );

  // Reservasi draf sendiri tidak dihitung sebagai stok terpakai,
  // kalau tidak publikasi selalu gagal saat draf memakai sisa terakhir.
  const { data: mentahAlokasi } = await admin
    .from("manifest_item")
    .select("batch_id,jumlah,manifest:manifest_id(status)")
    .neq("manifest_id", manifestId);
  const terpakai = petaTerpakai(
    baris<AlokasiRow>(mentahAlokasi).map((a) => ({
      batch_id: a.batch_id,
      jumlah: a.jumlah,
      batal: a.manifest?.status === "DIBATALKAN",
    }))
  );
  for (const item of items) {
    const b = petaBatch.get(item.batch_id);
    if (!b)
      return NextResponse.json(
        { ok: false, galat: "satu batch sudah tidak ada" },
        { status: 400 }
      );
    const sisa = b.jumlah - (terpakai.get(item.batch_id) ?? 0);
    if (item.jumlah > sisa)
      return NextResponse.json(
        { ok: false, galat: `stok ${b.kode_sumbangan} kurang (sisa ${sisa})` },
        { status: 400 }
      );
  }

  const { data: mentahTerakhir } = await admin
    .from("manifest")
    .select("hash")
    .neq("status", "DRAFT")
    .order("id", { ascending: false })
    .limit(1)
    .single();
  const prevHash = tunggal<{ hash: string }>(mentahTerakhir)?.hash ?? GENESIS_HASH;

  const hash = hashManifest({
    kode: manifest.kode,
    poskoKode: String(manifest.posko_id),
    items: items.map((i) => ({
      batchKode: petaBatch.get(i.batch_id)!.kode_sumbangan,
      jumlah: i.jumlah,
    })),
    prevHash,
  });

  const { error: galatKunci } = await admin
    .from("manifest")
    .update({
      status: "TERKUNCI_PUBLIK",
      hash,
      dipublikasikan_pada: new Date().toISOString(),
    })
    .eq("id", manifestId);
  if (galatKunci)
    return NextResponse.json({ ok: false, galat: "gagal mengunci" }, { status: 500 });

  const logHash = hashLog({
    manifestKode: manifest.kode,
    status: "DIPUBLIKASIKAN",
    prevHash: hash,
  });
  const { error: galatLog } = await admin.from("manifest_log").insert({
    manifest_id: manifestId,
    status: "DIPUBLIKASIKAN",
    catatan: `Dipublikasikan untuk tim ${manifest.tim}`,
    dibuat_oleh: profil.id,
    hash: logHash,
  });
  if (galatLog)
    return NextResponse.json(
      { ok: false, galat: "terkunci tapi log gagal, hubungi admin" },
      { status: 500 }
    );

  return NextResponse.json({
    ok: true,
    kode: manifest.kode,
    hash,
    url_publik: `/m/${manifest.kode}`,
  });
}
