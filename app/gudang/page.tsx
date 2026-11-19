"use client";

import { useState } from "react";

export default function GudangPage() {
  const [hasil, setHasil] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);

  async function simpan(formData: FormData) {
    setSibuk(true);
    setHasil(null);
    setGalat(null);
    try {
      const res = await fetch("/api/gudang/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: Number(formData.get("item_id")),
          jumlah: Number(formData.get("jumlah")),
          kedaluwarsa: String(formData.get("kedaluwarsa") ?? "") || null,
          sumber: String(formData.get("sumber") ?? ""),
          tampilkan_nama: formData.get("tampilkan_nama") === "on",
        }),
      });
      const data = (await res.json()) as { ok: boolean; kode_sumbangan?: string; galat?: string };
      if (data.ok && data.kode_sumbangan) setHasil(data.kode_sumbangan);
      else setGalat(data.galat ?? "Gagal menyimpan.");
    } catch {
      setGalat("Jaringan bermasalah. Coba lagi.");
    } finally {
      setSibuk(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-[#0F3B5F]">Gudang</h1>
        <p className="mt-1 text-sm text-[#5B6B7F]">
          Catat pangan masuk. Satu pencatatan sama dengan satu kode sumbangan.
        </p>
      </div>
      {hasil && (
        <p role="status" className="rounded bg-[#DCFCE7] p-3 text-sm text-[#15803D]">
          Tersimpan. Kode sumbangan: <strong>{hasil}</strong>
        </p>
      )}
      {galat && (
        <p role="alert" className="rounded bg-[#FEE2E2] p-3 text-sm text-[#B91C1C]">
          {galat}
        </p>
      )}
      <form action={simpan} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1 text-sm">
          ID item (lihat katalog, contoh 6 untuk Paket Sembako)
          <input
            name="item_id"
            type="number"
            min={1}
            required
            className="min-h-12 rounded border border-gray-300 p-3"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Jumlah
          <input
            name="jumlah"
            type="number"
            min={1}
            required
            className="min-h-12 rounded border border-gray-300 p-3"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Kedaluwarsa (opsional)
          <input
            name="kedaluwarsa"
            type="date"
            className="min-h-12 rounded border border-gray-300 p-3"
          />
        </label>
        <label className="flex flex-col gap-1 text-sm">
          Sumber (donatur, NGO, CSR, pemerintah)
          <input
            name="sumber"
            type="text"
            required
            className="min-h-12 rounded border border-gray-300 p-3"
          />
        </label>
        <label className="flex min-h-12 items-center gap-2 text-sm">
          <input name="tampilkan_nama" type="checkbox" className="h-5 w-5" />
          Tampilkan nama sumber ke publik
        </label>
        <button
          type="submit"
          disabled={sibuk}
          className="min-h-12 rounded bg-[#0F3B5F] font-semibold text-white disabled:opacity-50"
        >
          {sibuk ? "Menyimpan..." : "Simpan batch"}
        </button>
      </form>
    </main>
  );
}
