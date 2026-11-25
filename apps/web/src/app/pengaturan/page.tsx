import { redirect } from "next/navigation";
import { getProfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
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

const KARTU = "rounded-none garis-rambut-diam bg-white";
const LABEL = "font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#0f79b8]";

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
    <main className="mx-auto min-h-screen w-full max-w-[1400px] px-6 py-8 lg:px-10">
      <KepalaHalaman
        label="Operasional · BPBD"
        judul="Pengaturan"
        deskripsi="Satu tempat mengatur akun, notifikasi, dan aksesibilitas."
        bergaris
      />

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Card id="akun" className={`${KARTU} scroll-mt-20`}>
          <CardHeader>
            <p className={LABEL}>Akun dan Keamanan</p>
            <CardTitle className="flex items-center gap-2 text-base text-[#0B1F2E]">
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
              className="flex min-h-12 items-center justify-center rounded-none bg-[#0B1F2E] px-4 font-semibold text-white"
            >
              Buka profil saya
            </a>
          </CardContent>
        </Card>

        <Card id="notifikasi" className={`${KARTU} scroll-mt-20`}>
          <CardHeader>
            <p className={LABEL}>Preferensi Notifikasi</p>
            <CardTitle className="flex items-center gap-2 text-base text-[#0B1F2E]">
              <BellIcon aria-hidden="true" className="size-5" />
              Notifikasi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <NotifikasiForm />
          </CardContent>
        </Card>

        <Card id="aksesibilitas" className={`${KARTU} scroll-mt-20`}>
          <CardHeader>
            <p className={LABEL}>Aksesibilitas Tampilan</p>
            <CardTitle className="flex items-center gap-2 text-base text-[#0B1F2E]">
              <SettingsIcon aria-hidden="true" className="size-5" />
              Aksesibilitas
            </CardTitle>
          </CardHeader>
          <CardContent>
            <AksesibilitasForm />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-6">
          <Card id="bantuan" className={`${KARTU} scroll-mt-20`}>
            <CardHeader>
              <p className={LABEL}>Bantuan dan Info Sistem</p>
              <CardTitle className="flex items-center gap-2 text-base text-[#0B1F2E]">
                <BookIcon aria-hidden="true" className="size-5" />
                Bantuan
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-2 text-sm">
              <p className="text-muted-foreground">
                Butuh bantuan cepat? Hubungi command center BPBD lewat jalur yang sudah dibagikan saat
                pembekalan.
              </p>
              <details className="rounded-none garis-rambut-diam p-3">
                <summary className="flex min-h-12 cursor-pointer items-center font-semibold">
                  Apakah ribet memakai aplikasi ini?
                </summary>
                <p className="text-muted-foreground">
                  Tidak. Tiap peran hanya punya satu tugas: gudang mencatat, posko melapor, tim
                  menekan tombol status. Semua tombol setinggi 48px dan bisa dipakai offline.
                </p>
              </details>
              <details className="rounded-none garis-rambut-diam p-3">
                <summary className="flex min-h-12 cursor-pointer items-center font-semibold">
                  Data saya hilang saat sinyal putus?
                </summary>
                <p className="text-muted-foreground">
                  Tidak. Update tersimpan sebagai Menunggu Sinkronisasi dan terkirim otomatis saat
                  daring kembali.
                </p>
              </details>
              <details className="rounded-none garis-rambut-diam p-3">
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

          <Card className={KARTU}>
            <CardHeader>
              <p className={LABEL}>Bantuan dan Info Sistem</p>
              <CardTitle className="flex items-center gap-2 text-base text-[#0B1F2E]">
                <InfoCircleIcon aria-hidden="true" className="size-5" />
                Tentang
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
              <p className="tabular-nums">
                OmniRelief {VERSI} · build {HASH}
              </p>
              <p>
                Data operasional milik command center BPBD. Data penyintas hanya agregat, tanpa nama
                per orang.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>

      <section aria-label="Zona bahaya" className="mt-6 rounded-none border border-red-700/30 bg-white">
        <div className="border-t-2 border-red-700/30 p-6">
          <h2 className="flex items-center gap-2 text-base font-bold text-red-800">
            <LogoutIcon aria-hidden="true" className="size-5" />
            Zona bahaya: Keluar Akun
          </h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Perangkat ini tidak lagi bisa mencatat sampai masuk kembali.
          </p>
          <details className="mt-3">
            <summary className="flex min-h-12 cursor-pointer items-center justify-center rounded-none border border-red-700/40 px-4 font-semibold text-red-800">
              Saya yakin ingin keluar
            </summary>
            <form action={signOut} className="mt-3">
              <Button type="submit" variant="destructive" className="min-h-12 w-full rounded-none">
                Keluar
              </Button>
            </form>
          </details>
        </div>
      </section>
    </main>
  );
}
