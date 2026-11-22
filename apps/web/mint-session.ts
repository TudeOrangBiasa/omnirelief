import { createClient } from "@supabase/supabase-js";

const url = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const email = process.argv[2];
if (!email) throw new Error("pakai: mint-session.ts <email>");
const ref = new URL(url).hostname.split(".")[0];

const admin = createClient(url, serviceKey, { auth: { persistSession: false } });
const { data: link, error: e1 } = await admin.auth.admin.generateLink({
  type: "magiclink",
  email,
  options: { redirectTo: "http://localhost:3000/beranda" },
});
const hashed = (link as unknown as { properties?: { hashed_token?: string } } | null)?.properties?.hashed_token;
if (e1 || !hashed) throw new Error(`generateLink gagal: ${e1?.message}`);

const anon = createClient(url, anonKey, { auth: { persistSession: false } });
const { data, error: e2 } = await anon.auth.verifyOtp({
  token_hash: hashed,
  type: "magiclink",
});
const key = `sb-${ref}-auth-token`;
const raw = "base64-" + Buffer.from(JSON.stringify(data.session)).toString("base64url");
const chunks: { name: string; value: string }[] = [];
if (raw.length <= 3180) {
  chunks.push({ name: key, value: raw });
} else {
  let i = 0;
  for (let p = 0; p < raw.length; p += 3180) {
    chunks.push({ name: `${key}.${i++}`, value: raw.slice(p, p + 3180) });
  }
}
console.log(JSON.stringify({ email, key, chunks }));
