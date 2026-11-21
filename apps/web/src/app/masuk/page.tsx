import { redirect } from "next/navigation";
import { getProfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import FormulirMasuk from "./formulir";

export const dynamic = "force-dynamic";

const PESAN_GAGAL: Record<string, string> = {
  kredensial: "Email atau password salah. Periksa kembali lalu coba lagi.",
  batas: "Terlalu sering mencoba. Tunggu sebentar lalu coba lagi.",
  jaringan: "Tidak bisa menghubungi server. Periksa koneksi lalu coba lagi.",
};

export default async function MasukPage({
  searchParams,
}: {
  searchParams: Promise<{ gagal?: string }>;
}) {
  const profil = await getProfil().catch(() => null);
  if (profil) redirect("/beranda");
  const { gagal } = await searchParams;

  async function signIn(formData: FormData) {
    "use server";
    const supabase = await createClient();
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email: String(formData.get("email") ?? ""),
        password: String(formData.get("password") ?? ""),
      });
      if (error) {
        if (error.message.toLowerCase().includes("rate")) redirect("/masuk?gagal=batas");
        redirect("/masuk?gagal=kredensial");
      }
    } catch {
      redirect("/masuk?gagal=jaringan");
    }
    redirect("/beranda");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 p-6">
      <FormulirMasuk
        aksi={signIn}
        galat={gagal ? (PESAN_GAGAL[gagal] ?? PESAN_GAGAL.kredensial) : null}
      />
    </main>
  );
}
