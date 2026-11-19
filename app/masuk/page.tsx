import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function MasukPage({
  searchParams,
}: {
  searchParams: Promise<{ gagal?: string }>;
}) {
  const { gagal } = await searchParams;

  async function signIn(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const { error } = await supabase.auth.signInWithPassword({
      email: String(formData.get("email") ?? ""),
      password: String(formData.get("password") ?? ""),
    });
    if (error) redirect("/masuk?gagal=1");
    redirect("/beranda");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F3B5F]">Masuk OmniRelief</h1>
        <p className="mt-1 text-sm text-[#5B6B7F]">
          Masuk dengan akun peran yang dibagikan command center.
        </p>
      </div>
      {gagal && (
        <p role="alert" className="rounded bg-[#FEE2E2] p-3 text-sm text-[#B91C1C]">
          Email atau password salah. Coba lagi.
        </p>
      )}
      <form action={signIn} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          Email
          <input
            name="email"
            type="email"
            required
            autoComplete="username"
            className="min-h-12 rounded border border-gray-300 p-3"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Password
          <input
            name="password"
            type="password"
            required
            autoComplete="current-password"
            className="min-h-12 rounded border border-gray-300 p-3"
          />
        </label>
        <button
          type="submit"
          className="min-h-12 rounded bg-[#0F3B5F] font-semibold text-white"
        >
          Masuk
        </button>
      </form>
      <p className="text-xs text-[#5B6B7F]">
        Akun demo: bpbd@demo, gudang@demo, posko-a@demo, posko-b@demo,
        tim@demo. Password dibagikan internal saja.
      </p>
    </main>
  );
}
