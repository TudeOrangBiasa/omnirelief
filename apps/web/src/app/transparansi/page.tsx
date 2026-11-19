"use client";

import { useEffect, useState } from "react";

type Baris = {
  posko_nama: string;
  wilayah: string;
  butuh: number;
  dikirim: number;
  diterima: number;
  selisih: number;
};

export default function TransparansiPage() {
  const [data, setData] = useState<Baris[]>([]);
  const [kodeManifest, setKodeManifest] = useState("");
  const [kodeSumbangan, setKodeSumbangan] = useState("");

  useEffect(() => {
    void fetch("/api/publik/dashboard")
      .then((r) => r.json())
      .then((d: { ok: boolean; dashboard?: Baris[] }) => {
        if (d.ok && d.dashboard) setData(d.dashboard);
      });
  }, []);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F3B5F]">Transparansi per posko</h1>
        <p className="mt-1 text-sm text-[#5B6B7F]">
          Jatah, pengiriman, penerimaan, dan selisih tiap daerah. Tanpa login.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <form
          action={`/m/${kodeManifest.trim()}`}
          className="flex gap-2"
        >
          <input
            value={kodeManifest}
            onChange={(e) => setKodeManifest(e.target.value)}
            placeholder="Cari kode manifest (MNF-...)"
            className="min-h-12 flex-1 rounded border border-gray-300 p-3 text-sm"
          />
          <button className="min-h-12 rounded bg-[#0F3B5F] px-4 font-semibold text-white">
            Cek
          </button>
        </form>
        <form action={`/s/${kodeSumbangan.trim()}`} className="flex gap-2">
          <input
            value={kodeSumbangan}
            onChange={(e) => setKodeSumbangan(e.target.value)}
            placeholder="Cari kode sumbangan (DNT-...)"
            className="min-h-12 flex-1 rounded border border-gray-300 p-3 text-sm"
          />
          <button className="min-h-12 rounded bg-[#0F3B5F] px-4 font-semibold text-white">
            Cek
          </button>
        </form>
      </div>
      {data.map((p) => (
        <div key={p.posko_nama} className="rounded border border-gray-200 p-4 text-sm">
          <p className="font-bold text-[#0F3B5F]">
            {p.posko_nama} · {p.wilayah}
          </p>
          <p className="mt-1 text-[#5B6B7F]">
            Butuh {p.butuh} · Dikirim {p.dikirim} · Diterima {p.diterima}
          </p>
          <p
            className={
              p.selisih > 0
                ? "mt-1 font-bold text-[#B91C1C]"
                : "mt-1 font-bold text-[#15803D]"
            }
          >
            {p.selisih > 0 ? `Kurang ${p.selisih}` : "Aman"}
          </p>
        </div>
      ))}
    </main>
  );
}
