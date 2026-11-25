import { getProfil } from "@/lib/auth";
import IsiManifest from "./isi";

export const dynamic = "force-dynamic";

export default async function ManifestPage({
  params,
}: {
  params: Promise<{ kode: string }>;
}) {
  const { kode } = await params;
  const profil = await getProfil().catch(() => null);
  return <IsiManifest kode={kode} masuk={profil !== null} />;
}
