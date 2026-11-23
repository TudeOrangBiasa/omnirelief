import { redirect } from "next/navigation";
import { getProfil } from "@/lib/auth";
import { GridAksiCepat } from "@/components/widget-laporan";
import { daftarAksi } from "@/lib/aksi";
import IsiBeranda from "./isi";
import { KepalaHalaman } from "@/components/kepala-halaman";

export const dynamic = "force-dynamic";

export default async function BerandaPage() {
  const profil = await getProfil();
  if (!profil) redirect("/masuk");


  return (
    <main className="w-full max-w-[1400px] px-6 py-8 lg:px-10">
      <KepalaHalaman
        label="Beranda"
        judul="Ringkasan operasional"
        deskripsi="Pantau angka terbaru, langkah berikutnya, dan aktivitas terakhir peran kamu."
      />
      <div className="mt-6 grid grid-cols-1 items-start gap-8 lg:grid-cols-12">
        <div className="space-y-8 lg:col-span-8">
          <IsiBeranda nama={profil.nama} peran={profil.peran} />
        </div>
        <aside className="space-y-6 lg:sticky lg:top-20 lg:col-span-4">
          <GridAksiCepat label="Aksi cepat" aksi={daftarAksi(profil.peran)} />
        </aside>
      </div>
      <IsiBeranda nama={profil.nama} peran={profil.peran} />
      <form action={signOut}>
        <Button
          type="submit"
          variant="outline"
          className="min-h-12 w-full gap-2"
        >
          <LogoutIcon aria-hidden="true" />
          Keluar
        </Button>
      </form>
    </main>
  );
}
