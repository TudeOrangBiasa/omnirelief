import { headers } from "next/headers";
import { notFound } from "next/navigation";
import QRCode from "qrcode";
import { createAdminClient } from "@/lib/supabase/admin";
import { baris, tunggal } from "@/lib/supabase/baris";

export default async function ManifestPage({
  params,
}: {
  params: Promise<{ kode: string }>;
}) {
  const { kode } = await params;
  const admin = createAdminClient();
  const { data: mentah } = await admin
    .from("v_publik_manifest")
    .select("*")
    .eq("kode", kode)
    .single();
  const manifest = tunggal<{
    kode: string;
    status: string;
    tim: string;
    eta: string | null;
    hash: string;
    dipublikasikan_pada: string;
    posko_nama: string;
    wilayah: string;
  }>(mentah);
  if (!manifest) notFound();

  const { data: mentahId } = await admin
    .from("manifest")
    .select("id")
    .eq("kode", kode)
    .single();
  const manifestId = tunggal<{ id: number }>(mentahId)?.id ?? 0;

  const { data: mentahItem } = await admin
    .from("manifest_item")
    .select("jumlah,batch:batch_id(kode_sumbangan,item:item_id(nama,satuan))")
    .eq("manifest_id", manifestId);
  const items = baris<{
    jumlah: number;
    batch: { kode_sumbangan: string; item: { nama: string; satuan: string } | null } | null;
  }>(mentahItem);

  const { data: mentahLog } = await admin
    .from("manifest_log")
    .select("status,catatan,dibuat_pada")
    .eq("manifest_id", manifestId)
    .order("dibuat_pada");
  const riwayat = baris<{ status: string; catatan: string | null; dibuat_pada: string }>(mentahLog);

  const { data: mentahBatal } = await admin
    .from("pembatalan")
    .select("alasan,dibuat_pada")
    .eq("manifest_id", manifestId);
  const batal = baris<{ alasan: string; dibuat_pada: string }>(mentahBatal);

  const { data: mentahLapor } = await admin
    .from("ketidaksesuaian")
    .select("jenis,keterangan,dibuat_pada")
    .eq("manifest_id", manifestId);
  const lapor = baris<{ jenis: string; keterangan: string; dibuat_pada: string }>(mentahLapor);

  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "";
  const proto = h.get("x-forwarded-proto") ?? "https";
  const url = `${proto}://${host}/m/${manifest.kode}`;
  const qr = await QRCode.toDataURL(url, { width: 256, margin: 2 });

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
      <div className="rounded border-2 border-[#0F3B5F] p-4">
        <p className="font-bold text-[#0F3B5F]">
          {manifest.status === "TERKUNCI_PUBLIK"
            ? "TERKUNCI PUBLIK · tidak dapat diubah"
            : manifest.status === "DIBATALKAN"
              ? "DIBATALKAN · lihat dokumen pembatalan"
              : `${manifest.status} · lihat dokumen terkait`}
        </p>
        <h1 className="mt-1 text-2xl font-bold">{manifest.kode}</h1>
        <p className="text-sm text-[#5B6B7F]">
          {manifest.posko_nama} · {manifest.wilayah}
        </p>
        <p className="text-sm text-[#5B6B7F]">
          Tim {manifest.tim} · {new Date(manifest.dipublikasikan_pada).toLocaleString("id-ID")}
        </p>
        <p className="mt-1 font-mono text-xs text-[#5B6B7F]">
          hash {manifest.hash.slice(0, 16)}…
        </p>
      </div>
      <section>
        <h2 className="font-bold text-[#0F3B5F]">Isi pengiriman</h2>
        {items.map((i) => (
          <p key={i.batch?.kode_sumbangan ?? "?"} className="border-b border-gray-200 py-2 text-sm">
            {i.jumlah} {i.batch?.item?.satuan} {i.batch?.item?.nama} ({i.batch?.kode_sumbangan})
          </p>
        ))}
      </section>
      <section>
        <h2 className="font-bold text-[#0F3B5F]">Riwayat</h2>
        <ol className="flex flex-col gap-2">
          {riwayat.map((r, i) => (
            <li key={i} className="border-l-4 border-[#1B7FBF] pl-3 text-sm">
              <p className="font-semibold">{r.status}</p>
              <p className="text-[#5B6B7F]">
                {r.catatan} · {new Date(r.dibuat_pada).toLocaleString("id-ID")}
              </p>
            </li>
          ))}
        </ol>
      </section>
      {batal.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="font-bold text-[#B91C1C]">Dokumen pembatalan</h2>
          {batal.map((b, i) => (
            <div key={i} className="rounded bg-[#FEE2E2] p-3 text-sm text-[#B91C1C]">
              <p>{b.alasan}</p>
              <p>{new Date(b.dibuat_pada).toLocaleString("id-ID")}</p>
            </div>
          ))}
        </section>
      )}
      {lapor.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="font-bold text-[#B45309]">Laporan ketidaksesuaian</h2>
          {lapor.map((l, i) => (
            <div key={i} className="rounded bg-[#FEF3C7] p-3 text-sm text-[#B45309]">
              <p className="font-semibold">{l.jenis}</p>
              <p>
                {l.keterangan} · {new Date(l.dibuat_pada).toLocaleString("id-ID")}
              </p>
            </div>
          ))}
        </section>
      )}
      <section className="flex flex-col items-center gap-2">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={qr} alt={`QR manifest ${manifest.kode}`} width={256} height={256} />
        <a href={url} className="text-sm text-[#1B7FBF] underline">
          Salin tautan halaman ini
        </a>
      </section>
    </main>
  );
}
