import { getProfil } from "@/lib/auth";
import IsiTransparansi from "./isi";

export const dynamic = "force-dynamic";

export default async function TransparansiPage() {
  const profil = await getProfil().catch(() => null);
  return <IsiTransparansi masuk={profil !== null} />;
}
