import { redirect } from "next/navigation";
import { getProfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
export const dynamic = "force-dynamic";


const TAUTAN: Record<string, { href: string; label: string }[]> = {
  BPBD: [{ href: "/bpbd", label: "Buka dashboard BPBD" }],
  GUDANG: [{ href: "/gudang", label: "Buka gudang" }],
  POSKO: [{ href: "/posko", label: "Buka halaman posko" }],
  TIM: [{ href: "/tim", label: "Buka tugas distribusi" }],
};

export default async function BerandaPage() {
  const profil = await getProfil();
  if (!profil) redirect("/masuk");

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/masuk");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F3B5F]">
          Halo, {profil.nama}
        </h1>
        <p className="mt-1 text-sm text-[#5B6B7F]">
          Peran: {profil.peran}
        </p>
      </div>
      <div className="flex flex-col gap-3">
        {(TAUTAN[profil.peran] ?? []).map((t) => (
          <a
            key={t.href}
            href={t.href}
            className="block min-h-12 rounded bg-[#0F3B5F] p-3 text-center font-semibold text-white"
          >
            {t.label}
          </a>
        ))}
      </div>
      <form action={signOut}>
        <button
          type="submit"
          className="min-h-12 w-full rounded border border-gray-300 font-semibold"
        >
          Keluar
        </button>
      </form>
    </main>
  );
}
