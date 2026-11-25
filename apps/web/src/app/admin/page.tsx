import { requireRole } from "@/lib/auth";
import { KepalaHalaman } from "@/components/kepala-halaman";
import IsiAdmin from "./isi";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  await requireRole(["ADMIN"]);
  return (
    <main className="w-full max-w-[1400px] px-6 py-8 lg:px-10">
      <KepalaHalaman
        label="Admin"
        judul="Admin sistem"
        deskripsi="Kelola pengguna, unduh bukti audit, dan pantau pemakaian."
      />
      <div className="mt-6">
        <IsiAdmin />
      </div>
    </main>
  );
}
