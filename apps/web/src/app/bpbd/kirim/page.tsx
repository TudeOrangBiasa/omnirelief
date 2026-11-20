import { requireRole } from "@/lib/auth";
import FormulirKirim from "./formulir";

export default async function KirimPage() {
  await requireRole(["BPBD"]);
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Buat manifest</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Pilih posko dan batch. Batch kedaluwarsa terdekat disarankan keluar duluan.
        </p>
      </div>
      <FormulirKirim />
    </main>
  );
}
