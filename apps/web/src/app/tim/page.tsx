import { requireRole } from "@/lib/auth";
import TugasTim from "./tugas";
import { KepalaHalaman } from "@/components/kepala-halaman";

export default async function TimPage() {
  await requireRole(["TIM"]);
  return (
    <main className="mx-auto w-full max-w-[1400px] px-6 py-8 lg:px-10">
      <KepalaHalaman
        label="Operasional · Tim"
        judul="Tugas distribusi"
        deskripsi="Update status tiap tiba tahap baru. Check-in agar command center tahu kamu aman."
      />
      <div className="mt-6">
        <TugasTim />
      </div>
    </main>
  );
}
