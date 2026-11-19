import { requireRole } from "@/lib/auth";
import DasborBpbd from "./dasbor";

export default async function BpbdPage() {
  await requireRole(["BPBD"]);
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F3B5F]">BPBD Command Center</h1>
        <p className="mt-1 text-sm text-[#5B6B7F]">
          Verifikasi data posko dan pantau prioritas kebutuhan.
        </p>
      </div>
      <DasborBpbd />
    </main>
  );
}
