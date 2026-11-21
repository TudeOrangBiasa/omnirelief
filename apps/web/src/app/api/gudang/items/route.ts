import { NextResponse } from "next/server";
import { getProfil } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";
import { baris, type ItemKatalogRow } from "@/lib/supabase/baris";

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
  const { data, error } = await admin
    .from("item_pangan")
    .select("id,nama,satuan")
    .order("nama", { ascending: true });
  if (error)
    return NextResponse.json({ ok: false, galat: "gagal memuat katalog" }, { status: 500 });
  return NextResponse.json({ ok: true, items: baris<ItemKatalogRow>(data) });
}
