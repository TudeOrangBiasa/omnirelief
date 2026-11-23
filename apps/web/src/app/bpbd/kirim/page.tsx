import { requireRole } from "@/lib/auth";
import FormulirKirim from "./formulir";
import { KepalaHalaman } from "@/components/kepala-halaman";

export default async function KirimPage() {
  await requireRole(["BPBD"]);
  return (
    <main className="mx-auto w-full max-w-[1400px] px-6 py-8 lg:px-10">
      <KepalaHalaman
        label="Operasional · BPBD"
        judul="Buat manifest"
        deskripsi="Pilih posko dan batch. Batch kedaluwarsa terdekat disarankan keluar duluan."
      />
      <div className="mt-6 grid grid-cols-12 gap-6">
        <div className="col-span-12 flex flex-col gap-6 lg:col-span-8">
          <FormulirKirim />
        </div>
        <aside className="col-span-12 lg:col-span-4">
          <div className="flex flex-col gap-4 lg:sticky lg:top-4">
            <section
              aria-label="Tentang manifest"
              className="flex flex-col gap-2 rounded-none border p-4"
            >
              <h2 className="font-mono text-xs uppercase tracking-[0.2em] text-[#0B1F2E]">
                Manifest terkunci
              </h2>
              <p className="text-sm text-muted-foreground">
                Manifest yang dipublikasikan dikunci dengan hash SHA-256 dan tidak bisa
                diubah atau dihapus. Periksa posko, tim, dan jumlah sebelum mengunci.
              </p>
            </section>
          </div>
        </aside>
      </div>
    </main>
  );
}
