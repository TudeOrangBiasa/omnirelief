import { getProfil } from "@/lib/auth";
import IsiDasbor from "./isi";

export const dynamic = "force-dynamic";

export default async function DasborPage() {
  const profil = await getProfil().catch(() => null);
  return <IsiDasbor masuk={profil !== null} />;
}
