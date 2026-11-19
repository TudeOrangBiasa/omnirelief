"use client";

import { useEffect, useState } from "react";

type Posko = { id: number; nama: string; wilayah: string };

type Batch = {
  id: number;
  kode_sumbangan: string;
  item_nama: string;
  satuan: string;
  kedaluwarsa: string | null;
  sisa: number;
};

type Baris = { batch_id: number; jumlah: number };

export default function FormulirKirim() {
  const [posko, setPosko] = useState<Posko[]>([]);
  const [batch, setBatch] = useState<Batch[]>([]);
  const [poskoId, setPoskoId] = useState("");
  const [tim, setTim] = useState("");
  const [baris, setBaris] = useState<Baris[]>([{ batch_id: 0, jumlah: 0 }]);
  const [draf, setDraf] = useState<{ id: number; kode: string; peringatan: string[] } | null>(null);
  const [hasil, setHasil] = useState<{ kode: string; url_publik: string } | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);

  useEffect(() => {
    void (async () => {
      const [p, b] = await Promise.all([
        fetch("/api/bpbd/posko").then((r) => r.json()) as Promise<{ ok: boolean; posko?: Posko[] }>,
        fetch("/api/gudang/batch").then((r) => r.json()) as Promise<{ ok: boolean; batch?: Batch[] }>,
      ]);
      if (p.ok && p.posko) setPosko(p.posko);
      if (b.ok && b.batch) setBatch(b.batch.filter((x) => x.sisa > 0));
    })();
  }, []);

  async function buatDraf() {
    setSibuk(true);
    setGalat(null);
    try {
      const res = await fetch("/api/bpbd/manifest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          posko_id: Number(poskoId),
          tim,
          items: baris.filter((r) => r.batch_id > 0 && r.jumlah > 0),
        }),
      });
      const data = (await res.json()) as {
        ok: boolean;
        id?: number;
        kode?: string;
        peringatan?: string[];
        galat?: string;
      };
      if (data.ok && data.id && data.kode) setDraf({ id: data.id, kode: data.kode, peringatan: data.peringatan ?? [] });
      else setGalat(data.galat ?? "Gagal membuat draf.");
    } catch {
      setGalat("Jaringan bermasalah. Coba lagi.");
    } finally {
      setSibuk(false);
    }
  }

  async function publikasikan() {
    if (!draf) return;
    setSibuk(true);
    setGalat(null);
    try {
      const res = await fetch(`/api/bpbd/manifest/${draf.id}/publikasi`, { method: "POST" });
      const data = (await res.json()) as {
        ok: boolean;
        kode?: string;
        url_publik?: string;
        galat?: string;
      };
      if (data.ok && data.kode && data.url_publik)
        setHasil({ kode: data.kode, url_publik: data.url_publik });
      else setGalat(data.galat ?? "Gagal mempublikasikan.");
    } catch {
      setGalat("Jaringan bermasalah. Coba lagi.");
    } finally {
      setSibuk(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {galat && (
        <p role="alert" className="rounded bg-[#FEE2E2] p-3 text-sm text-[#B91C1C]">
          {galat}
        </p>
      )}
      {hasil ? (
        <div className="rounded bg-[#DCFCE7] p-4 text-sm text-[#15803D]">
          <p className="font-bold">Terkunci publik: {hasil.kode}</p>
          <a href={hasil.url_publik} className="underline">
            Buka halaman publik manifest
          </a>
        </div>
      ) : draf ? (
        <div className="rounded border border-gray-300 p-4 text-sm">
          <p className="font-bold">Draf {draf.kode} tersimpan.</p>
          {draf.peringatan.length > 0 && (
            <p className="mt-1 text-[#B45309]">
              Peringatan FEFO: batch {draf.peringatan.join(", ")} kedaluwarsa lebih
              dekat tapi tidak dipakai.
            </p>
          )}
          <button
            onClick={() => void publikasikan()}
            disabled={sibuk}
            className="mt-3 min-h-12 w-full rounded bg-[#0F3B5F] font-semibold text-white disabled:opacity-50"
          >
            {sibuk ? "Mengunci..." : "Publikasikan dan kunci"}
          </button>
        </div>
      ) : (
        <>
          <label className="flex flex-col gap-1 text-sm">
            Posko tujuan
            <select
              value={poskoId}
              onChange={(e) => setPoskoId(e.target.value)}
              className="min-h-12 rounded border border-gray-300 p-3"
            >
              <option value="">Pilih posko</option>
              {posko.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.nama} ({p.wilayah})
                </option>
              ))}
            </select>
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Tim distribusi
            <input
              value={tim}
              onChange={(e) => setTim(e.target.value)}
              placeholder="Tim Antar 1"
              className="min-h-12 rounded border border-gray-300 p-3"
            />
          </label>
          {baris.map((r, i) => (
            <div key={i} className="flex gap-2">
              <select
                value={r.batch_id}
                onChange={(e) => {
                  const ganti = [...baris];
                  ganti[i] = { ...r, batch_id: Number(e.target.value) };
                  setBaris(ganti);
                }}
                className="min-h-12 flex-1 rounded border border-gray-300 p-3 text-sm"
              >
                <option value={0}>Pilih batch</option>
                {batch.map((b) => (
                  <option key={b.id} value={b.id}>
                    {b.kode_sumbangan} · {b.item_nama} · sisa {b.sisa}
                    {b.kedaluwarsa ? ` · exp ${b.kedaluwarsa}` : ""}
                  </option>
                ))}
              </select>
              <input
                type="number"
                min={1}
                value={r.jumlah || ""}
                placeholder="Jumlah"
                onChange={(e) => {
                  const ganti = [...baris];
                  ganti[i] = { ...r, jumlah: Number(e.target.value) };
                  setBaris(ganti);
                }}
                className="min-h-12 w-28 rounded border border-gray-300 p-3"
              />
            </div>
          ))}
          <button
            onClick={() => setBaris([...baris, { batch_id: 0, jumlah: 0 }])}
            className="min-h-12 rounded border border-gray-300 font-semibold"
          >
            Tambah batch
          </button>
          <button
            onClick={() => void buatDraf()}
            disabled={sibuk || poskoId === "" || tim.trim() === ""}
            className="min-h-12 rounded bg-[#0F3B5F] font-semibold text-white disabled:opacity-50"
          >
            {sibuk ? "Menyimpan..." : "Simpan draf"}
          </button>
        </>
      )}
    </div>
  );
}
