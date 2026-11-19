"use client";

import { useEffect, useState } from "react";
import BannerOffline from "@/components/banner-offline";
import { kirimAntrean, tambahAntrean } from "@/lib/offline";

type Tugas = {
  id: number;
  kode: string;
  tim: string;
  eta: string | null;
  batas_checkin: string | null;
  posko_nama: string;
  log_terakhir: { status: string; dibuat_pada: string } | null;
};

const AKSI = [
  { status: "KELUAR_GUDANG", label: "Keluar gudang" },
  { status: "DALAM_PERJALANAN", label: "Dalam perjalanan" },
  { status: "CHECKIN", label: "Check-in" },
  { status: "TIBA", label: "Tiba" },
] as const;

export default function TugasTim() {
  const [tugas, setTugas] = useState<Tugas[]>([]);
  const [pilih, setPilih] = useState<number | null>(null);
  const [kendala, setKendala] = useState("");
  const [darurat, setDarurat] = useState(false);
  const [galat, setGalat] = useState<string | null>(null);
  const [pesan, setPesan] = useState<string | null>(null);

  async function muat() {
    const res = await fetch("/api/tim/tugas");
    const data = (await res.json()) as { ok: boolean; tugas?: Tugas[] };
    if (data.ok && data.tugas) setTugas(data.tugas);
  }

  useEffect(() => {
    void muat();
    if (window.navigator.onLine) {
      void kirimAntrean(window.localStorage, async (url, badan) => {
        try {
          const res = await fetch(url, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(badan),
          });
          return res.ok;
        } catch {
          return false;
        }
      }).then((sisa) => {
        if (sisa.length === 0) void muat();
      });
    }
  }, []);

  async function kirim(status: string, catatan: string | null, url: string, badan: object) {
    setGalat(null);
    setPesan(null);
    const isi = badan as Record<string, unknown>;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(badan),
      });
      const data = (await res.json()) as { ok: boolean; galat?: string };
      if (!data.ok) setGalat(data.galat ?? "Gagal.");
      else {
        setPesan(`${status} tercatat.`);
        setKendala("");
        await muat();
      }
    } catch {
      tambahAntrean(
        window.localStorage,
        url.endsWith("/kendala") ? "kendala" : "status",
        url,
        isi
      );
      setPesan("Koneksi lemah, update tersimpan dan terkirim otomatis (Menunggu Sinkronisasi).");
    }
  }

  const aktif = tugas.find((t) => t.id === pilih) ?? null;

  return (
    <div className="flex flex-col gap-4">
      <BannerOffline />
      {galat && (
        <p role="alert" className="rounded bg-[#FEE2E2] p-3 text-sm text-[#B91C1C]">
          {galat}
        </p>
      )}
      {pesan && (
        <p role="status" className="rounded bg-[#DCFCE7] p-3 text-sm text-[#15803D]">
          {pesan}
        </p>
      )}
      {tugas.map((t) => (
        <button
          key={t.id}
          onClick={() => setPilih(t.id)}
          className={`rounded border p-3 text-left text-sm ${pilih === t.id ? "border-[#0F3B5F] border-2" : "border-gray-200"}`}
        >
          <p className="font-bold">
            {t.kode} · {t.posko_nama}
          </p>
          <p className="text-[#5B6B7F]">
            Terakhir: {t.log_terakhir?.status ?? "-"}
            {t.batas_checkin ? ` · batas check-in ${new Date(t.batas_checkin).toLocaleString("id-ID")}` : ""}
          </p>
        </button>
      ))}
      {aktif && (
        <div className="rounded border border-gray-300 p-4">
          <p className="font-bold text-sm">Update {aktif.kode}</p>
          <div className="mt-2 grid grid-cols-2 gap-2">
            {AKSI.map((a) => (
              <button
                key={a.status}
                onClick={() => void kirim(a.status, null, "/api/tim/status", { manifest_id: aktif.id, status: a.status })}
                className="min-h-12 rounded bg-[#0F3B5F] font-semibold text-white text-sm"
              >
                {a.label}
              </button>
            ))}
          </div>
          <textarea
            value={kendala}
            onChange={(e) => setKendala(e.target.value)}
            placeholder="Tulis kendala di lapangan"
            className="mt-3 min-h-12 w-full rounded border border-gray-300 p-3 text-sm"
          />
          <label className="mt-2 flex min-h-12 items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={darurat}
              onChange={(e) => setDarurat(e.target.checked)}
              className="h-5 w-5"
            />
            Darurat (butuh SOP darurat BPBD)
          </label>
          <button
            onClick={() =>
              void kirim("kendala", null, "/api/tim/kendala", {
                manifest_id: aktif.id,
                kendala,
                darurat,
              })
            }
            disabled={kendala.trim() === ""}
            className="mt-2 min-h-12 w-full rounded bg-[#FEF3C7] font-semibold text-[#B45309] disabled:opacity-50"
          >
            Lapor kendala
          </button>
        </div>
      )}
    </div>
  );
}
