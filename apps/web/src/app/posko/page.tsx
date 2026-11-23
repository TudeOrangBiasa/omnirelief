import { requireRole } from "@/lib/auth";
import BantuanPosko from "./bantuan";
import FormulirPosko from "./formulir";
import { KepalaHalaman } from "@/components/kepala-halaman";

export default async function PoskoPage() {
  await requireRole(["POSKO"]);
  return (
    <main className="mx-auto w-full max-w-[1400px] px-6 py-8 lg:px-10">
      <KepalaHalaman
        label="Operasional · Posko"
        judul="Posko"
        deskripsi="Input data penyintas dengan angka agregat. Tanpa nama, NIK, atau alamat individu."
      />
      <div className="mt-6 grid grid-cols-12 gap-6">
        <div className="col-span-12 flex flex-col gap-6 lg:col-span-8">
          <FormulirPosko />
        </div>
        <aside className="col-span-12 lg:col-span-4">
          <div className="flex flex-col gap-6 lg:sticky lg:top-4">
            <BantuanPosko />
          </div>
        </aside>
      </div>
    </main>
  );
}
