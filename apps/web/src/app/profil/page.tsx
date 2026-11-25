import { redirect } from "next/navigation";
import type { Route } from "next";
import { getProfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { sha256Hex } from "@/lib/hash";
import { Card, CardContent, CardHeader, CardTitle } from "@omnirelief/ui/components/card";
import { InfoCircleIcon, LockIcon, UserIcon } from "@solar-icons/react/linear";
import FormulirPassword from "./formulir-password";
import DuaFaktorForm from "./dua-faktor";
import IdentitasForm from "./identitas";
import { KepalaHalaman } from "@/components/kepala-halaman";

export const dynamic = "force-dynamic";

const KARTU = "rounded-none garis-rambut-diam bg-white";
const LABEL = "font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#0f79b8]";

export default async function ProfilPage({
  searchParams,
}: {
  searchParams: Promise<{ ok?: string; gagal?: string }>;
}) {
  const profil = await getProfil();
  if (!profil) redirect("/masuk");
  const params = await searchParams;
  const namaProfil = profil.nama;
  const peranProfil = profil.peran;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const email = user?.email ?? "-";
  const inisial = namaProfil.trim().charAt(0).toUpperCase() || "?";
  const meta: Record<string, unknown> = user?.user_metadata ?? {};
  const mentahPin = meta["pin_hash"];
  const hasPin = typeof mentahPin === "string" && mentahPin.length > 0;

  async function aturPin(formData: FormData) {
    "use server";
    const pin = String(formData.get("pin") ?? "");
    if (!/^[0-9]{6}$/.test(pin)) return { ok: false, pesan: "PIN harus 6 digit angka." };
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ data: { pin_hash: sha256Hex("pin|" + pin) } });
    if (error) return { ok: false, pesan: "Gagal menyimpan PIN. Coba lagi." };
    return { ok: true, pesan: "PIN otorisasi aktif." };
  }

  async function matikanPin() {
    "use server";
    const supabase = await createClient();
    const { error } = await supabase.auth.updateUser({ data: { pin_hash: null } });
    if (error) return { ok: false, pesan: "Gagal mematikan PIN. Coba lagi." };
    return { ok: true, pesan: "PIN otorisasi dimatikan." };
  }

  async function ubahPassword(formData: FormData) {
    "use server";
    const lama = String(formData.get("password_lama") ?? "");
    const baru = String(formData.get("password_baru") ?? "");
    if (baru.length < 8) redirect("/profil?gagal=pendek" as Route);
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) redirect("/masuk");
    const ulang = await supabase.auth.signInWithPassword({ email: user.email, password: lama });
    if (ulang.error) redirect("/profil?gagal=salah" as Route);
    const { error } = await supabase.auth.updateUser({ password: baru });
    if (error) redirect("/profil?gagal=gagal" as Route);
    redirect("/profil?ok=1" as Route);
  }
  return (

    <main className="mx-auto min-h-screen w-full max-w-[1400px] px-6 py-8 lg:px-10">
      <KepalaHalaman
        label="Akun dan Keamanan"
        judul="Profil"
        deskripsi="Data diri kamu. Tanpa hapus akun mandiri. Minta admin bila akun harus dinonaktifkan."
        bergaris
      />

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card className={KARTU}>
          <CardHeader>
            <p className={LABEL}>Akun dan Keamanan</p>
            <CardTitle className="flex items-center gap-2 text-base text-[#0B1F2E]">
              <UserIcon aria-hidden="true" className="size-5" />
              Data diri
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4 text-sm">
            <span
              aria-hidden="true"
              className="flex size-14 items-center justify-center rounded-none bg-[#DCE8EE] text-xl font-bold text-[#0B1F2E]"
            >
              {inisial}
            </span>
            <dl className="flex flex-col gap-1 tabular-nums">
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Nama:</dt>
                <dd className="font-semibold">{namaProfil}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Email:</dt>
                <dd className="font-semibold">{email}</dd>
              </div>
              <div className="flex gap-2">
                <dt className="text-muted-foreground">Peran:</dt>
                <dd className="font-semibold">{peranProfil}</dd>
              </div>
            </dl>
          </CardContent>
        </Card>

        <Card className={KARTU}>
          <CardHeader>
            <p className={LABEL}>Profil Lapangan</p>
            <CardTitle className="flex items-center gap-2 text-base text-[#0B1F2E]">
              <UserIcon aria-hidden="true" className="size-5" />
              Jabatan dan kontak
            </CardTitle>
          </CardHeader>
          <CardContent>
            <IdentitasForm />
          </CardContent>
        </Card>

        {peranProfil === "BPBD" && (
          <Card className={KARTU}>
            <CardHeader>
              <p className={LABEL}>Keamanan</p>
              <CardTitle className="flex items-center gap-2 text-base text-[#0B1F2E]">
                <LockIcon aria-hidden="true" className="size-5" />
                Kode otorisasi PIN
              </CardTitle>
            </CardHeader>
            <CardContent>
              <DuaFaktorForm hasPin={hasPin} aksiAtur={aturPin} aksiMatikan={matikanPin} />
            </CardContent>
          </Card>
        )}
      </div>

      <section aria-label="Zona bahaya" className="mt-6 rounded-none border border-red-700/30 bg-white">
        <div className="border-t-2 border-red-700/30 p-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-red-800">
            <InfoCircleIcon aria-hidden="true" className="size-5" />
            Zona bahaya: tanpa hapus akun mandiri
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Akun hanya bisa dinonaktifkan oleh admin. Hubungi command center bila kamu berhenti
            bertugas.
          </p>
        </div>
      </section>
    </main>
  );
}
