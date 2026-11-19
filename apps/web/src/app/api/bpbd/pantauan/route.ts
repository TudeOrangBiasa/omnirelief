import { NextResponse } from "next/server";
import { getProfil } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { tambahLog } from "@/lib/riwayat";
import { baris } from "@/lib/supabase/baris";

const BERJALAN = ["DIPUBLIKASIKAN", "KELUAR_GUDANG", "DALAM_PERJALANAN", "CHECKIN"];

export async function GET() {
  const profil = await getProfil();
  if (!profil)
    return NextResponse.json({ ok: false, galat: "belum masuk" }, { status: 401 });
  if (profil.peran !== "BPBD")
    return NextResponse.json({ ok: false, galat: "khusus BPBD" }, { status: 403 });

  const admin = createAdminClient();
  const sekarang = new Date().toISOString();
  const { data: mentah } = await admin
    .from("manifest")
    .select("id,kode,tim,batas_checkin,posko:posko_id(nama)")
    .eq("status", "TERKUNCI_PUBLIK")
    .lt("batas_checkin", sekarang);
  const lewat = baris<{
    id: number;
    kode: string;
    tim: string;
    batas_checkin: string;
    posko: { nama: string } | null;
  }>(mentah);
  if (lewat.length === 0) return NextResponse.json({ ok: true, perlu_dicek: [] });

  const { data: mentahLog } = await admin
    .from("manifest_log")
    .select("manifest_id,status,dibuat_pada")
    .in("manifest_id", lewat.map((m) => m.id))
    .order("id", { ascending: false });
  const terakhir = new Map<number, { status: string; dibuat_pada: string }>();
  for (const l of baris<{ manifest_id: number; status: string; dibuat_pada: string }>(mentahLog)) {
    if (!terakhir.has(l.manifest_id))
      terakhir.set(l.manifest_id, { status: l.status, dibuat_pada: l.dibuat_pada });
  }

  const hasil: {
    id: number;
    kode: string;
    posko_nama: string;
    batas_checkin: string;
    log_terakhir: string | null;
    ditandai: boolean;
  }[] = [];
  for (const m of lewat) {
    const t = terakhir.get(m.id) ?? null;
    if (!t || !BERJALAN.includes(t.status)) continue;
    if (t.dibuat_pada >= m.batas_checkin) continue;
    let ditandai = false;
    if (t.status !== "PERLU_DICEK") {
      const catat = await tambahLog(admin, {
        manifest_id: m.id,
        manifest_kode: m.kode,
        status: "PERLU_DICEK",
        catatan: `Lewat batas check-in ${m.batas_checkin} tanpa kabar`,
        dibuat_oleh: null,
      });
      ditandai = catat.ok;
    }
    hasil.push({
      id: m.id,
      kode: m.kode,
      posko_nama: m.posko?.nama ?? "?",
      batas_checkin: m.batas_checkin,
      log_terakhir: t.status,
      ditandai,
    });
  }
  return NextResponse.json({ ok: true, perlu_dicek: hasil });
}
