import { redirect } from "next/navigation";
import type { Route } from "next";
import { getProfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sha256Hex } from "@/lib/hash";
import FormulirMasuk from "./formulir";
import { ShaderBackground } from "@/components/motion/shader-background";

export const dynamic = "force-dynamic";

const PESAN_GAGAL: Record<string, string> = {
  kredensial: "Email atau password salah. Periksa kembali lalu coba lagi.",
  batas: "Terlalu sering mencoba. Tunggu sebentar lalu coba lagi.",
  jaringan: "Tidak bisa menghubungi server. Periksa koneksi lalu coba lagi.",
  pin: "Kode otorisasi salah atau kedaluwarsa.",
};

export default async function MasukPage({
  searchParams,
}: {
  searchParams: Promise<{ gagal?: string }>;
}) {
  const profil = await getProfil().catch(() => null);
  if (profil) redirect("/beranda");
  const { gagal } = await searchParams;

  async function tahapSatu(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    let gagalMasuk: string | null = null;
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) gagalMasuk = error.message.toLowerCase().includes("rate") ? "batas" : "kredensial";
    } catch {
      gagalMasuk = "jaringan";
    }
    if (gagalMasuk === "batas") redirect("/masuk?gagal=batas" as Route);
    if (gagalMasuk) redirect("/masuk?gagal=kredensial" as Route);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const meta: Record<string, unknown> = user?.user_metadata ?? {};
    const tersimpan = meta["pin_hash"];
    if (typeof tersimpan === "string" && tersimpan.length > 0) {
      await supabase.auth.signOut();
      return { perluPin: true as const };
    }
    redirect("/beranda" as Route);
  }

  async function tahapDua(formData: FormData) {
    "use server";
    const supabase = await createClient();
    const email = String(formData.get("email") ?? "");
    const password = String(formData.get("password") ?? "");
    let gagalMasuk: string | null = null;
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) gagalMasuk = error.message.toLowerCase().includes("rate") ? "batas" : "kredensial";
    } catch {
      gagalMasuk = "jaringan";
    }
    if (gagalMasuk === "batas") redirect("/masuk?gagal=batas" as Route);
    if (gagalMasuk) redirect("/masuk?gagal=kredensial" as Route);
    const {
      data: { user },
    } = await supabase.auth.getUser();
    const meta: Record<string, unknown> = user?.user_metadata ?? {};
    const tersimpan = meta["pin_hash"];
    const pin = String(formData.get("pin") ?? "");
    if (typeof tersimpan !== "string" || tersimpan.length === 0 || sha256Hex("pin|" + pin) !== tersimpan) {
      await supabase.auth.signOut();
      redirect("/masuk?gagal=pin" as Route);
    }
    redirect("/beranda" as Route);
  }

  return (
    <div className="relative ml-[calc(50%-50vw)] min-h-screen w-screen overflow-x-hidden">
      <ShaderBackground
        variant="mesh-gradient"
        colors={["#030D14", "#082032", "#0F3B5F", "#1B7FBF"]}
        aria-hidden
        className="pointer-events-none absolute inset-0 h-full w-full bg-[#030D14]"
      />
      <main className="relative z-10 mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-6 p-6 pb-28 md:pb-6">
      <nav aria-label="Kembali" className="flex items-center justify-between">
        <a href="/" className="inline-flex min-h-12 items-center text-sm font-medium text-white hover:text-white/80">
          ← Kembali ke Beranda
        </a>
        <a href="/transparansi" className="inline-flex min-h-12 items-center text-sm font-medium text-white hover:text-white/80">
          Lihat Transparansi
        </a>
      </nav>
      <div className="relative flex min-h-0 flex-col gap-6">
      <FormulirMasuk
        tahapSatu={tahapSatu}
        tahapDua={tahapDua}
        galat={gagal ? (PESAN_GAGAL[gagal] ?? PESAN_GAGAL.kredensial) : null}
      />
      </div>
      </main>
    </div>
  );
}
