import { requireRole } from "@/lib/auth";
import FormulirKirim from "./formulir";

export default async function KirimPage() {
  await requireRole(["BPBD"]);
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F3B5F]">Buat manifest</h1>
        <p className="mt-1 text-sm text-[#5B6B7F]">
          Pilih posko dan batch. Batch kedaluwarsa terdekat disarankan keluar duluan.
        </p>
      </div>
      <FormulirKirim />
    </main>
  );
}
