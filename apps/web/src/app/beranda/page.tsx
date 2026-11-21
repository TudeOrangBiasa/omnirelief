import { redirect } from "next/navigation";
import { LogoutIcon } from "@solar-icons/react/linear";
import { Badge } from "@omnirelief/ui/components/badge";
import { Button } from "@omnirelief/ui/components/button";
import { getProfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import IsiBeranda from "./isi";

export const dynamic = "force-dynamic";

export default async function BerandaPage() {
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
