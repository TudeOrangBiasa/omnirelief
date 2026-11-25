import { getProfil } from "@/lib/auth";
import IsiSumbangan from "./isi";

export const dynamic = "force-dynamic";

export default async function SumbanganPage({
  params,
}: {
  params: Promise<{ kode: string }>;
}) {
  const { kode } = await params;
  const profil = await getProfil().catch(() => null);
  return <IsiSumbangan kode={kode} masuk={profil !== null} />;
}
