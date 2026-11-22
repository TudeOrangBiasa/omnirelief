import { redirect } from "next/navigation";
import { getProfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import FormulirMasuk from "./formulir";
import { ShaderBackground } from "@/components/motion/shader-background";

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
    <main className="relative mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 p-6">
      <ShaderBackground
        variant="mesh-gradient"
        colors={["#030D14", "#082032", "#0F3B5F", "#1B7FBF"]}
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 -bottom-28 h-auto w-full bg-[#030D14] md:bottom-0"
      />
      <div className="relative flex min-h-0 flex-col gap-6">
      <FormulirMasuk
        aksi={signIn}
        galat={gagal ? (PESAN_GAGAL[gagal] ?? PESAN_GAGAL.kredensial) : null}
      />
      </div>
    </main>
  );
}
