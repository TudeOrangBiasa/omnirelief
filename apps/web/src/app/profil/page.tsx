import { redirect } from "next/navigation";
import type { Route } from "next";
import { getProfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Alert, AlertDescription, AlertTitle } from "@omnirelief/ui/components/alert";
import { Button } from "@omnirelief/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@omnirelief/ui/components/card";
import { Input } from "@omnirelief/ui/components/input";
import { Label } from "@omnirelief/ui/components/label";
import { InfoCircleIcon, LockIcon } from "@solar-icons/react/linear";

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
          Data diri kamu. Tanpa hapus akun mandiri — minta admin bila akun harus dinonaktifkan.
        </p>
      </div>

      {params.ok && (
        <p role="status" className="rounded-xl bg-success-bg p-3 text-sm text-success-badge-fg">
          Password berhasil diubah.
        </p>
      )}
      {params.gagal && (
        <Alert variant="destructive">
          <AlertTitle>Gagal mengubah password</AlertTitle>
          <AlertDescription>
            {params.gagal === "salah"
              ? "Password lama salah. Coba lagi."
              : params.gagal === "pendek"
                ? "Password baru minimal 8 karakter."
                : "Terjadi galat. Coba lagi."}
          </AlertDescription>
        </Alert>
      )}

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
          <form action={ubahPassword} className="flex flex-col gap-4 text-sm">
            <p className="text-muted-foreground">
              Demi keamanan, masukkan password lama dulu (autentikasi ulang).
            </p>
            <div className="flex flex-col gap-1">
              <Label htmlFor="password_lama">Password lama</Label>
              <Input
                id="password_lama"
                name="password_lama"
                type="password"
                required
                autoComplete="current-password"
                className="min-h-12"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="password_baru">Password baru (min. 8 karakter)</Label>
              <Input
                id="password_baru"
                name="password_baru"
                type="password"
                required
                minLength={8}
                autoComplete="new-password"
                className="min-h-12"
              />
            </div>
            <Button type="submit" className="min-h-12 w-full">
              Simpan password baru
            </Button>
          </form>
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
