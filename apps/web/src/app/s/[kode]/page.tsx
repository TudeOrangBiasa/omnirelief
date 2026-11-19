import { notFound } from "next/navigation";
import { createAdminClient } from "@/lib/supabase/admin";
import { baris, tunggal } from "@/lib/supabase/baris";

export default async function SumbanganPage({
  params,
}: {
  params: Promise<{ kode: string }>;
}) {
  const { kode } = await params;
  const admin = createAdminClient();
  const { data: mentah } = await admin
    .from("stok_batch")
    .select("id,kode_sumbangan,jumlah,tgl_masuk,kedaluwarsa,sumber,tampilkan_nama,status,item:item_id(nama,satuan)")
    .eq("kode_sumbangan", kode)
    .single();
  const satu = tunggal<{
    id: number;
    kode_sumbangan: string;
    jumlah: number;
    tgl_masuk: string;
    kedaluwarsa: string | null;
    sumber: string;
    tampilkan_nama: boolean;
    status: string;
    item: { nama: string; satuan: string } | null;
  }>(mentah);
  if (!satu) notFound();

  const { data: mentahPakai } = await admin
    .from("manifest_item")
    .select("jumlah,manifest:manifest_id(kode,dipublikasikan_pada,posko:posko_id(nama))")
    .eq("batch_id", satu.id);
  const dipakai = baris<{
    jumlah: number;
    manifest: { kode: string; dipublikasikan_pada: string; posko: { nama: string } | null } | null;
  }>(mentahPakai);
  const dialokasikan = dipakai.reduce((s, p) => s + p.jumlah, 0);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F3B5F]">{satu.kode_sumbangan}</h1>
        <p className="mt-1 text-sm text-[#5B6B7F]">
          {satu.jumlah} {satu.item?.satuan} {satu.item?.nama} · masuk {satu.tgl_masuk}
          {satu.kedaluwarsa ? ` · kedaluwarsa ${satu.kedaluwarsa}` : ""}
        </p>
        <p className="text-sm text-[#5B6B7F]">
          Sumber: {satu.tampilkan_nama ? satu.sumber : "Anonim"}
        </p>
      </div>
      <div className="rounded border border-gray-200 p-4">
        <div className="h-3 rounded bg-gray-200">
          <div
            className="h-3 rounded bg-[#1B7FBF]"
            style={{ width: `${satu.jumlah > 0 ? Math.round((dialokasikan / satu.jumlah) * 100) : 0}%` }}
          />
        </div>
        <p className="mt-2 text-sm">
          Dialokasikan {dialokasikan} · tersisa {satu.jumlah - dialokasikan}
        </p>
      </div>
      <section>
        <h2 className="font-bold text-[#0F3B5F]">Dipakai di manifest</h2>
        {dipakai.length === 0 && (
          <p className="text-sm text-[#5B6B7F]">Belum dialokasikan.</p>
        )}
        {dipakai.map((p) => (
          <p key={p.manifest?.kode ?? "?"} className="border-b border-gray-200 py-2 text-sm">
            <a href={`/m/${p.manifest?.kode ?? ""}`} className="text-[#1B7FBF] underline">
              {p.manifest?.kode}
            </a>{" "}
            · {p.jumlah} untuk {p.manifest?.posko?.nama}
          </p>
        ))}
      </section>
    </main>
  );
}
