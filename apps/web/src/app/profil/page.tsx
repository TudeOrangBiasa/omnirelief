import { redirect } from "next/navigation";
import type { Route } from "next";
import { getProfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Alert, AlertDescription, AlertTitle } from "@omnirelief/ui/components/alert";
import { Card, CardContent, CardHeader, CardTitle } from "@omnirelief/ui/components/card";
import { InfoCircleIcon, LockIcon } from "@solar-icons/react/linear";
import FormulirPassword from "./formulir-password";

export const dynamic = "force-dynamic";

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
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Profil</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Data diri kamu. Tanpa hapus akun mandiri. Minta admin bila akun harus dinonaktifkan.
        </p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Data diri</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4 text-sm">
          <span
            aria-hidden="true"
            className="flex size-14 items-center justify-center rounded-full bg-secondary text-xl font-bold text-secondary-foreground"
          >
            {inisial}
          </span>
          <dl className="flex flex-col gap-1">
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

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <LockIcon aria-hidden="true" className="size-5" />
            Ubah password
          </CardTitle>
        </CardHeader>
        <CardContent>
          <FormulirPassword
            aksi={ubahPassword}
            ok={params.ok === "1"}
            gagal={
              params.gagal === "salah" || params.gagal === "pendek" || params.gagal === "gagal"
                ? params.gagal
                : null
            }
          />
        </CardContent>
      </Card>

      <Alert>
        <InfoCircleIcon aria-hidden="true" />
        <AlertTitle>Tanpa hapus akun mandiri</AlertTitle>
        <AlertDescription>
          Akun hanya bisa dinonaktifkan oleh admin. Hubungi command center bila kamu berhenti
          bertugas.
        </AlertDescription>
      </Alert>
    </main>
  );
}
