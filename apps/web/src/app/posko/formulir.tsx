"use client";

import { useEffect, useState } from "react";

type Laporan = {
  id: number;
  bayi: number;
  balita: number;
  ibu_hamil: number;
  lansia: number;
  disabilitas: number;
  umum: number;
  status: string;
  dibuat_pada: string;
};

const MEDAN = [
  { nama: "bayi", label: "Bayi" },
  { nama: "balita", label: "Balita" },
  { nama: "ibu_hamil", label: "Ibu hamil" },
  { nama: "lansia", label: "Lansia" },
  { nama: "disabilitas", label: "Disabilitas" },
  { nama: "umum", label: "Umum" },
] as const;

export default function FormulirPosko() {
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [hasil, setHasil] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);

  async function muat() {
    const res = await fetch("/api/posko/laporan");
    const data = (await res.json()) as { ok: boolean; laporan?: Laporan[] };
    if (data.ok && data.laporan) setLaporan(data.laporan);
  }

  useEffect(() => {
    void muat();
  }, []);

  async function kirim(formData: FormData, draft: boolean) {
    setSibuk(true);
    setHasil(null);
    setGalat(null);
    try {
      const badan: Record<string, number | boolean> = { draft };
      for (const m of MEDAN) badan[m.nama] = Number(formData.get(m.nama) ?? 0);
      const res = await fetch("/api/posko/laporan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(badan),
      });
      const data = (await res.json()) as { ok: boolean; galat?: string };
      if (data.ok) {
        setHasil(
          draft ? "Draf tersimpan." : "Laporan terkirim, menunggu verifikasi BPBD."
        );
        await muat();
      } else setGalat(data.galat ?? "Gagal menyimpan.");
    } catch {
      setGalat("Jaringan bermasalah. Coba lagi.");
    } finally {
      setSibuk(false);
    }
  }

  return (
    <div className="flex flex-col gap-6">
      {hasil && (
        <p role="status" className="rounded bg-[#DCFCE7] p-3 text-sm text-[#15803D]">
          {hasil}
        </p>
      )}
      {galat && (
        <p role="alert" className="rounded bg-[#FEE2E2] p-3 text-sm text-[#B91C1C]">
          {galat}
        </p>
      )}
      <form
        action={(fd) => void kirim(fd, false)}
        className="flex flex-col gap-4"
      >
        {MEDAN.map((m) => (
          <label key={m.nama} className="flex flex-col gap-1 text-sm">
            {m.label}
            <input
              name={m.nama}
              type="number"
              min={0}
              defaultValue={0}
              required
              className="min-h-12 rounded border border-gray-300 p-3"
            />
          </label>
        ))}
        <div className="flex gap-3">
          <button
            type="submit"
            disabled={sibuk}
            className="min-h-12 flex-1 rounded bg-[#0F3B5F] font-semibold text-white disabled:opacity-50"
          >
            {sibuk ? "Mengirim..." : "Kirim data"}
          </button>
          <button
            type="button"
            disabled={sibuk}
            onClick={(e) => {
              const form = (e.target as HTMLButtonElement).closest("form");
              if (form) void kirim(new FormData(form), true);
            }}
            className="min-h-12 flex-1 rounded border border-gray-300 font-semibold disabled:opacity-50"
          >
            Simpan draf
          </button>
        </div>
      </form>
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-bold text-[#0F3B5F]">Status laporan</h2>
        {laporan.length === 0 && (
          <p className="text-sm text-[#5B6B7F]">Belum ada laporan.</p>
        )}
        {laporan.map((l) => (
          <div key={l.id} className="rounded border border-gray-200 p-3 text-sm">
            <p className="font-semibold">
              Total {l.bayi + l.balita + l.ibu_hamil + l.lansia + l.disabilitas + l.umum} jiwa
            </p>
            <p className="text-[#5B6B7F]">
              {l.status} · {new Date(l.dibuat_pada).toLocaleString("id-ID")}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
