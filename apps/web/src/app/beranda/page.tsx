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
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
      <div>
        <p className="text-muted-foreground text-sm">
          Peran: <Badge variant="outline">{profil.peran}</Badge>
        </p>
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
