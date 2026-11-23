import { requireRole } from "@/lib/auth";
import DasborBpbd from "./dasbor";
import { KepalaHalaman } from "@/components/kepala-halaman";

export default async function BpbdPage() {
  await requireRole(["BPBD"]);
  return (
    <main className="w-full max-w-[1400px] px-6 py-8 lg:px-10">
      <KepalaHalaman
        label="BPBD · Command center"
        judul="BPBD Command Center"
        deskripsi="Verifikasi data posko dan pantau prioritas kebutuhan."
      />
      <div className="mt-6">
        <DasborBpbd />
      </div>
    </main>
  );
}
