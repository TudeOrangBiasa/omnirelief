import { requireRole } from "@/lib/auth";
import BantuanPosko from "./bantuan";
import FormulirPosko from "./formulir";

export default async function PoskoPage() {
  await requireRole(["POSKO"]);
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F3B5F]">Posko</h1>
        <p className="mt-1 text-sm text-[#5B6B7F]">
          Input data penyintas dengan angka agregat. Tanpa nama, NIK, atau
          alamat individu.
        </p>
      </div>
      <FormulirPosko />
      <BantuanPosko />
    </main>
  );
}
