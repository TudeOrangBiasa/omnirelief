import { redirect } from "next/navigation";
import { getProfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Alert, AlertDescription, AlertTitle } from "@omnirelief/ui/components/alert";
import { Button } from "@omnirelief/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@omnirelief/ui/components/card";
import {
  BellIcon,
  BookIcon,
  InfoCircleIcon,
  LogoutIcon,
  SettingsIcon,
  UserIcon,
} from "@solar-icons/react/linear";
import AksesibilitasForm from "./aksesibilitas";
import NotifikasiForm from "./notifikasi";
import { KepalaHalaman } from "@/components/kepala-halaman";

export const dynamic = "force-dynamic";

const VERSI = process.env.NEXT_PUBLIC_APP_VERSION ?? "dev";
const HASH = (process.env.VERCEL_GIT_COMMIT_SHA ?? "").slice(0, 7) || "lokal";

export default async function PengaturanPage() {
  const profil = await getProfil();
  if (!profil) redirect("/masuk");

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/masuk");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Pengaturan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Satu tempat mengatur akun, notifikasi, dan aksesibilitas.
        </p>
      </div>


      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserIcon aria-hidden="true" className="size-5" />
            Akun
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <p>
            Masuk sebagai <span className="font-bold">{profil.nama}</span> ({profil.peran}).
          </p>
          <a
            href="/profil"
            className="flex min-h-12 items-center justify-center rounded-xl bg-primary px-4 font-semibold text-primary-foreground"
          >
            Buka profil saya
          </a>
        </CardContent>
      </Card>

      <Card id="notifikasi" className="scroll-mt-20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BellIcon aria-hidden="true" className="size-5" />
            Notifikasi
          </CardTitle>
        </CardHeader>
        <CardContent>
          <NotifikasiForm />
        </CardContent>
      </Card>

      <Card id="aksesibilitas" className="scroll-mt-20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <SettingsIcon aria-hidden="true" className="size-5" />
            Aksesibilitas
          </CardTitle>
        </CardHeader>
        <CardContent>
          <AksesibilitasForm />
        </CardContent>
      </Card>

      <Card id="bantuan">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookIcon aria-hidden="true" className="size-5" />
            Bantuan
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <p className="text-muted-foreground">
            Butuh bantuan cepat? Hubungi command center BPBD lewat jalur yang sudah dibagikan saat
            pembekalan.
          </p>
          <details className="rounded-xl border border-border p-3">
            <summary className="flex min-h-12 cursor-pointer items-center font-semibold">
              Apakah ribet memakai aplikasi ini?
            </summary>
            <p className="text-muted-foreground">
              Tidak. Tiap peran hanya punya satu tugas: gudang mencatat, posko melapor, tim
              menekan tombol status. Semua tombol setinggi 48px dan bisa dipakai offline.
            </p>
          </details>
          <details className="rounded-xl border border-border p-3">
            <summary className="flex min-h-12 cursor-pointer items-center font-semibold">
              Data saya hilang saat sinyal putus?
            </summary>
            <p className="text-muted-foreground">
              Tidak. Update tersimpan sebagai Menunggu Sinkronisasi dan terkirim otomatis saat
              daring kembali.
            </p>
          </details>
          <details className="rounded-xl border border-border p-3">
            <summary className="flex min-h-12 cursor-pointer items-center font-semibold">
              Lupa password?
            </summary>
            <p className="text-muted-foreground">
              Ubah sendiri di halaman profil, atau minta admin mengatur ulang bila tidak bisa
              masuk sama sekali.
            </p>
          </details>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <InfoCircleIcon aria-hidden="true" className="size-5" />
            Tentang
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
          <p>
            OmniRelief {VERSI} · build {HASH}
          </p>
          <p>
            Data operasional milik command center BPBD. Data penyintas hanya agregat, tanpa nama
            per orang.
          </p>
        </CardContent>
      </Card>

      <Alert>
        <LogoutIcon aria-hidden="true" />
        <AlertTitle>Keluar akun</AlertTitle>
        <AlertDescription className="flex flex-col gap-3">
          Perangkat ini tidak lagi bisa mencatat sampai masuk kembali.
          <form action={signOut}>
            <Button type="submit" variant="destructive" className="min-h-12 w-full">
              Keluar
            </Button>
          </form>
        </AlertDescription>
      </Alert>

    </main>
  );
}
