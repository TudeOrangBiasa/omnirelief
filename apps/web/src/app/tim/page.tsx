import { requireRole } from "@/lib/auth";
import TugasTim from "./tugas";
import { KepalaHalaman } from "@/components/kepala-halaman";

export default async function TimPage() {
  await requireRole(["TIM"]);
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Tugas distribusi</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update status tiap tiba tahap baru. Check-in agar command center tahu kamu aman.
        </p>
      </div>
      <TugasTim />
    </main>
  );
}
