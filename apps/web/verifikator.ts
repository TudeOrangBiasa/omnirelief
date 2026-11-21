import { readFileSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const env = Object.fromEntries(
  readFileSync(new URL("./.env", import.meta.url), "utf8")
    .split("\n")
    .filter((l) => l.includes("="))
    .map((l) => {
      const i = l.indexOf("=");
      return [l.slice(0, i).trim(), l.slice(i + 1).trim()];
    }),
) as Record<string, string>;

const admin = createClient(env.NEXT_PUBLIC_SUPABASE_URL, env.SUPABASE_SERVICE_ROLE_KEY, {
  auth: { persistSession: false },
});

const mode = process.argv[2] ?? "buat";
const akun = [
  { email: "verifikasi-bpbd@demo", nama: "Verifikator BPBD", peran: "BPBD", posko_id: null },
  { email: "verifikasi-gudang@demo", nama: "Verifikator Gudang", peran: "GUDANG", posko_id: null },
  { email: "verifikasi-posko@demo", nama: "Verifikator Posko", peran: "POSKO", posko_id: 1 },
  { email: "verifikasi-tim@demo", nama: "Verifikator Tim", peran: "TIM", posko_id: null },
] as const;

const hasil: Record<string, string> = {};
for (const a of akun) {
  const { data: list } = await admin.auth.admin.listUsers();
  const lama = list?.users.find((u) => u.email === a.email);
  if (lama) await admin.auth.admin.deleteUser(lama.id);
  if (mode === "hapus") {
    console.log(`DELETED ${a.email}`);
    continue;
  }
  const password = `Sementara-${Math.random().toString(36).slice(2, 10)}!`;
  const { data, error } = await admin.auth.admin.createUser({ email: a.email, password, email_confirm: true });
  if (error) {
    console.error(`CREATE-ERR ${a.email} ${error.message}`);
    process.exit(1);
  }
  await admin.from("profil").upsert({ id: data.user.id, nama: a.nama, peran: a.peran, posko_id: a.posko_id });
  hasil[a.peran] = `${a.email}::${password}`;
  console.log(`CREATED ${a.email}`);
}
if (mode !== "hapus") writeFileSync("/tmp/verify-creds.json", JSON.stringify(hasil));
