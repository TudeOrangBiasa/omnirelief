import { NextResponse } from "next/server";
import { getProfil } from "@/lib/auth";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET() {
  const profil = await getProfil();
  if (!profil)
    return NextResponse.json({ ok: false, galat: "belum masuk" }, { status: 401 });
  if (profil.peran !== "ADMIN")
    return NextResponse.json({ ok: false, galat: "khusus admin" }, { status: 403 });
  const admin = createAdminClient();
  const [pengguna, posko, batch, manifest, log] = await Promise.all([
    admin.from("profil").select("id", { count: "exact", head: true }),
    admin.from("posko").select("id", { count: "exact", head: true }),
    admin.from("stok_batch").select("id", { count: "exact", head: true }),
    admin.from("manifest").select("id", { count: "exact", head: true }),
    admin.from("manifest_log").select("id", { count: "exact", head: true }),
  ]);
  return NextResponse.json({
    ok: true,
    ringkas: {
      pengguna: pengguna.count ?? 0,
      posko: posko.count ?? 0,
      batch: batch.count ?? 0,
      manifest: manifest.count ?? 0,
      log: log.count ?? 0,
    },
  });
}
