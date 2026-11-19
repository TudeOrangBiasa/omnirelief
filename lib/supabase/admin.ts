import { createClient as createSbClient } from "@supabase/supabase-js";

export function createAdminClient() {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY belum diisi");
  return createSbClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    key,
    { auth: { persistSession: false } }
  );
}
