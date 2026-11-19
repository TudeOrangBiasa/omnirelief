"use client";

import { useEffect, useState } from "react";

type Bantuan = {
  id: number;
  kode: string;
  tim: string;
  log_terakhir: { status: string; dibuat_pada: string } | null;
};

const JENIS = ["KURANG", "RUSAK", "TIDAK_SESUAI", "TIDAK_DITERIMA", "KIRIM_ULANG"] as const;

export default function BantuanPosko() {
  const [bantuan, setBantuan] = useState<Bantuan[]>([]);
  const [laporId, setLaporId] = useState<number | null>(null);
  const [jenis, setJenis] = useState<string>("KURANG");
  const [keterangan, setKeterangan] = useState("");
  const [pesan, setPesan] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);

  async function muat() {
    const res = await fetch("/api/posko/bantuan");
    const data = (await res.json()) as { ok: boolean; bantuan?: Bantuan[] };
    if (data.ok && data.bantuan) setBantuan(data.bantuan);
  }

  useEffect(() => {
    void muat();
  }, []);

  async function konfirmasi(manifest_id: number) {
    setGalat(null);
    setPesan(null);
    try {
      const res = await fetch("/api/posko/konfirmasi", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manifest_id }),
      });
      const data = (await res.json()) as { ok: boolean; galat?: string };
      if (!data.ok) setGalat(data.galat ?? "Gagal.");
      else {
        setPesan("Penerimaan dikonfirmasi. Terima kasih.");
        await muat();
      }
    } catch {
      setGalat("Jaringan bermasalah. Coba lagi.");
    }
  }

  async function lapor(manifest_id: number) {
    setGalat(null);
    setPesan(null);
    try {
      const res = await fetch("/api/posko/ketidaksesuaian", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manifest_id, jenis, keterangan }),
      });
      const data = (await res.json()) as { ok: boolean; galat?: string };
      if (!data.ok) setGalat(data.galat ?? "Gagal.");
      else {
        setPesan("Laporan tampil publik sebagai dokumen terbuka.");
        setLaporId(null);
        setKeterangan("");
        await muat();
      }
    } catch {
      setGalat("Jaringan bermasalah. Coba lagi.");
    }
  }

  return (
    <section className="flex flex-col gap-2">
      <h2 className="text-lg font-bold text-[#0F3B5F]">Bantuan untuk posko ini</h2>
      {pesan && (
        <p role="status" className="rounded bg-[#DCFCE7] p-3 text-sm text-[#15803D]">
          {pesan}
        </p>
      )}
      {galat && (
        <p role="alert" className="rounded bg-[#FEE2E2] p-3 text-sm text-[#B91C1C]">
          {galat}
        </p>
      )}
      {bantuan.length === 0 && (
        <p className="text-sm text-[#5B6B7F]">Belum ada kiriman.</p>
      )}
      {bantuan.map((b) => (
        <div key={b.id} className="rounded border border-gray-200 p-3 text-sm">
          <p className="font-semibold">{b.kode}</p>
          <p className="text-[#5B6B7F]">Terakhir: {b.log_terakhir?.status ?? "-"}</p>
          {b.log_terakhir?.status !== "DITERIMA" && (
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => void konfirmasi(b.id)}
                className="min-h-12 flex-1 rounded bg-[#15803D] font-semibold text-white"
              >
                Konfirmasi terima
              </button>
              <button
                onClick={() => setLaporId(laporId === b.id ? null : b.id)}
                className="min-h-12 flex-1 rounded border border-gray-300 font-semibold"
              >
                Lapor masalah
              </button>
            </div>
          )}
          {laporId === b.id && (
            <div className="mt-2 flex flex-col gap-2">
              <select
                value={jenis}
                onChange={(e) => setJenis(e.target.value)}
                className="min-h-12 rounded border border-gray-300 p-3"
              >
                {JENIS.map((j) => (
                  <option key={j} value={j}>
                    {j}
                  </option>
                ))}
              </select>
              <textarea
                value={keterangan}
                onChange={(e) => setKeterangan(e.target.value)}
                placeholder="Contoh: 10 paket rusak basah"
                className="min-h-12 rounded border border-gray-300 p-3"
              />
              <button
                onClick={() => void lapor(b.id)}
                disabled={keterangan.trim() === ""}
                className="min-h-12 rounded bg-[#FEE2E2] font-semibold text-[#B91C1C] disabled:opacity-50"
              >
                Kirim laporan publik
              </button>
            </div>
          )}
        </div>
      ))}
    </section>
  );
}
