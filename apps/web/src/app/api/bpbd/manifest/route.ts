import { randomInt } from "node:crypto";
import { NextResponse } from "next/server";
import { getProfil } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { validasiManifestDraft } from "@/lib/validasi";
import { batchTerlewati, type BatchSisa } from "@/lib/fefo";
import { petaTerpakai } from "@/lib/stok";
import {
  baris,
  tunggal,
  type AlokasiRow,
  type BatchRow,
} from "@/lib/supabase/baris";

export function buatKodeManifest(tahun: number): string {
  return `MNF-${tahun}-${String(randomInt(0, 10000)).padStart(4, "0")}`;
}

export async function POST(request: Request) {
  const profil = await getProfil();
  if (!profil)
    return NextResponse.json({ ok: false, galat: "belum masuk" }, { status: 401 });
  if (profil.peran !== "BPBD")
    return NextResponse.json({ ok: false, galat: "khusus BPBD" }, { status: 403 });
  const body = (await request.json()) as Record<string, unknown>;
  const valid = validasiManifestDraft(body);
  if (!valid.ok) return NextResponse.json(valid, { status: 400 });

  const admin = createAdminClient();
  const { data: posko } = await admin
    .from("posko")
    .select("id")
    .eq("id", valid.posko_id)
    .single();
  if (!posko)
    return NextResponse.json({ ok: false, galat: "posko tidak dikenal" }, { status: 400 });

  const batchIds = [...new Set(valid.items.map((i) => i.batch_id))];
  const { data: batch } = await admin
    .from("stok_batch")
    .select("id,jumlah,kode_sumbangan,kedaluwarsa")
    .in("id", batchIds);
  const petaBatch = new Map(
    baris<BatchRow>(batch).map((b) => [b.id, b] as const)
  );
  for (const item of valid.items) {
    if (!petaBatch.has(item.batch_id))
      return NextResponse.json(
        { ok: false, galat: `batch ${item.batch_id} tidak dikenal` },
        { status: 400 }
      );
  }

  const { data: alokasi } = await admin
    .from("manifest_item")
    .select("batch_id,jumlah,manifest:manifest_id(status)");
  const terpakai = petaTerpakai(
    baris<AlokasiRow>(alokasi).map((a) => ({
      batch_id: a.batch_id,
      jumlah: a.jumlah,
      batal: a.manifest?.status === "DIBATALKAN",
    }))
  );
  for (const item of valid.items) {
    const b = petaBatch.get(item.batch_id)!;
    const sisa = b.jumlah - (terpakai.get(item.batch_id) ?? 0);
    if (item.jumlah > sisa)
      return NextResponse.json(
        {
          ok: false,
          galat: `stok ${b.kode_sumbangan} kurang (sisa ${sisa})`,
        },
        { status: 400 }
      );
  }

  const { data: mentahSemua } = await admin
    .from("stok_batch")
    .select("id,jumlah,kode_sumbangan,kedaluwarsa");
  const daftarSisa: BatchSisa[] = baris<BatchRow>(mentahSemua).map((b) => ({
    kode: b.kode_sumbangan,
    kedaluwarsa: b.kedaluwarsa,
    tersedia: b.jumlah,
    sisa: b.jumlah - (terpakai.get(b.id) ?? 0),
  }));
  const peringatan = batchTerlewati(
    daftarSisa,
    [...petaBatch.values()]
      .filter((b) => valid.items.some((i) => i.batch_id === b.id))
      .map((b) => b.kode_sumbangan)
  );

  const tahun = new Date().getFullYear();
  for (let coba = 0; coba < 3; coba++) {
    const kode = buatKodeManifest(tahun);
    const { data: mentahBaru, error: galatManifest } = await admin
      .from("manifest")
      .insert({
        kode,
        posko_id: valid.posko_id,
        tim: valid.tim,
        eta: valid.eta,
        batas_checkin: valid.batas_checkin,
        hash: "DRAFT",
        status: "DRAFT",
      })
      .select("id")
      .single();
    if (galatManifest) {
      if (galatManifest.code === "23505") continue;
      return NextResponse.json(
        { ok: false, galat: "gagal membuat draf" },
        { status: 500 }
      );
    }
    const baru = tunggal<{ id: number }>(mentahBaru);
    if (!baru)
      return NextResponse.json({ ok: false, galat: "gagal membuat draf" }, { status: 500 });
    const { error: galatItem } = await admin.from("manifest_item").insert(
      valid.items.map((i) => ({
        manifest_id: baru.id,
        batch_id: i.batch_id,
        jumlah: i.jumlah,
      }))
    );
    if (galatItem) {
      await admin.from("manifest").delete().eq("id", baru.id);
      return NextResponse.json(
        { ok: false, galat: "gagal menyimpan isi draf" },
        { status: 500 }
      );
    }
    return NextResponse.json({
      ok: true,
      id: baru.id,
      kode,
      peringatan,
    });
  }
  return NextResponse.json(
    { ok: false, galat: "gagal membuat kode unik" },
    { status: 500 }
  );
}
