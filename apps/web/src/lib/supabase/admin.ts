import {
  createClient as createSbClient,
  type SupabaseClient,
} from "@supabase/supabase-js";

export type AdminClient = SupabaseClient;

export function createAdminClient(): AdminClient {
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!key) throw new Error("SUPABASE_SERVICE_ROLE_KEY belum diisi");
  return createSbClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, key, {
    auth: { persistSession: false },
  });
}
