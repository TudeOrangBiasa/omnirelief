import { redirect } from "next/navigation";
import { getProfil } from "@/lib/auth";
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
      <div className="mt-6">
        <IsiBeranda nama={profil.nama} peran={profil.peran} />
      </div>
    </main>
  );
}
