"use client";

import { useEffect, useState } from "react";

type Antrean = {
  id: number;
  bayi: number;
  balita: number;
  ibu_hamil: number;
  lansia: number;
  disabilitas: number;
  umum: number;
  dibuat_pada: string;
  posko: { nama: string } | null;
};

type Prioritas = {
  posko_id: number;
  posko_nama: string;
  wilayah: string;
  butuh: number;
  dikirim: number;
  diterima: number;
  selisih: number;
};

type Pantau = {
  id: number;
  kode: string;
  posko_nama: string;
  batas_checkin: string;
  log_terakhir: string | null;
  ditandai: boolean;
};

export default function DasborBpbd() {
  const [antrean, setAntrean] = useState<Antrean[]>([]);
  const [prioritas, setPrioritas] = useState<Prioritas[]>([]);
  const [pantau, setPantau] = useState<Pantau[]>([]);
  const [galat, setGalat] = useState<string | null>(null);

  async function muat() {
    const [a, p, w] = await Promise.all([
      fetch("/api/bpbd/antrean").then((r) => r.json()) as Promise<{
        ok: boolean;
        antrean?: Antrean[];
      }>,
      fetch("/api/bpbd/prioritas").then((r) => r.json()) as Promise<{
        ok: boolean;
        prioritas?: Prioritas[];
      }>,
      fetch("/api/bpbd/pantauan").then((r) => r.json()) as Promise<{
        ok: boolean;
        perlu_dicek?: Pantau[];
      }>,
    ]);
    if (a.ok && a.antrean) setAntrean(a.antrean);
    if (p.ok && p.prioritas) setPrioritas(p.prioritas);
    if (w.ok && w.perlu_dicek) setPantau(w.perlu_dicek);
    if (!a.ok || !p.ok || !w.ok) setGalat("Sebagian data gagal dimuat.");
  }

  useEffect(() => {
    void muat();
  }, []);

  async function putuskan(snapshot_id: number, keputusan: string) {
    const res = await fetch("/api/bpbd/verifikasi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ snapshot_id, keputusan }),
    });
    const data = (await res.json()) as { ok: boolean; galat?: string };
    if (!data.ok) setGalat(data.galat ?? "Keputusan gagal.");
    await muat();
  }

  async function batalkan(manifest_id: number) {
    const alasan = window.prompt("Alasan pembatalan publik:");
    if (!alasan) return;
    const res = await fetch("/api/bpbd/pembatalan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ manifest_id, alasan }),
    });
    const data = (await res.json()) as { ok: boolean; galat?: string };
    if (!data.ok) setGalat(data.galat ?? "Pembatalan gagal.");
    await muat();
  }

  return (
    <div className="flex flex-col gap-8">
      {galat && (
        <p role="alert" className="rounded bg-[#FEE2E2] p-3 text-sm text-[#B91C1C]">
          {galat}
        </p>
      )}
      {pantau.length > 0 && (
        <section className="flex flex-col gap-2">
          <h2 className="text-lg font-bold text-[#B91C1C]">
            Perlu dicek ({pantau.length})
          </h2>
          {pantau.map((w) => (
            <div key={w.id} className="rounded border border-[#B91C1C] p-3 text-sm">
              <p className="font-semibold">
                {w.kode} · {w.posko_nama}
              </p>
              <p className="text-[#5B6B7F]">
                Batas check-in lewat · terakhir {w.log_terakhir ?? "-"}
                {w.ditandai ? " · sudah ditandai otomatis" : ""}
              </p>
              <button
                onClick={() => void batalkan(w.id)}
                className="mt-2 min-h-12 w-full rounded bg-[#FEE2E2] font-semibold text-[#B91C1C]"
              >
                Batalkan manifest ini
              </button>
            </div>
          ))}
        </section>
      )}
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-bold text-[#0F3B5F]">
          Antrean verifikasi ({antrean.length})
        </h2>
        {antrean.length === 0 && (
          <p className="text-sm text-[#5B6B7F]">Tidak ada antrean.</p>
        )}
        {antrean.map((a) => (
          <div key={a.id} className="rounded border border-gray-200 p-3 text-sm">
            <p className="font-semibold">{a.posko?.nama ?? "Posko?"}</p>
            <p className="text-[#5B6B7F]">
              Total {a.bayi + a.balita + a.ibu_hamil + a.lansia + a.disabilitas + a.umum} jiwa ·{" "}
              {new Date(a.dibuat_pada).toLocaleString("id-ID")}
            </p>
            <div className="mt-2 flex gap-2">
              <button
                onClick={() => void putuskan(a.id, "DISETUJUI")}
                className="min-h-12 flex-1 rounded bg-[#15803D] font-semibold text-white"
              >
                Setujui
              </button>
              <button
                onClick={() => void putuskan(a.id, "MINTA_REVISI")}
                className="min-h-12 flex-1 rounded bg-[#FEF3C7] font-semibold text-[#B45309]"
              >
                Minta revisi
              </button>
              <button
                onClick={() => void putuskan(a.id, "DITOLAK")}
                className="min-h-12 flex-1 rounded bg-[#FEE2E2] font-semibold text-[#B91C1C]"
              >
                Tolak
              </button>
            </div>
          </div>
        ))}
      </section>
      <section className="flex flex-col gap-2">
        <h2 className="text-lg font-bold text-[#0F3B5F]">Prioritas kebutuhan</h2>
        {prioritas.map((p) => (
          <div key={p.posko_id} className="rounded border border-gray-200 p-3 text-sm">
            <p className="font-semibold">{p.posko_nama}</p>
            <p className="text-[#5B6B7F]">
              Butuh {p.butuh} · Dikirim {p.dikirim} · Diterima {p.diterima}
            </p>
            <p className={p.selisih > 0 ? "font-bold text-[#B91C1C]" : "font-bold text-[#15803D]"}>
              {p.selisih > 0 ? `Kurang ${p.selisih}` : "Aman"}
            </p>
          </div>
        ))}
      </section>
    </div>
  );
}
