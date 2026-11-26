"use client";

import { useEffect, useRef, useState } from "react";
import { Button } from "@omnirelief/ui/components/button";


/**
 * Disclosure tampil kolom tabel. Render kondisional (bukan details/summary)
 * agar kontrol tersembunyi tidak punya kotak layout dan tidak bisa difokus.
 */
export function PilihKolom<T extends string>({
  id,
  kolom,
  tampil,
  onUbah,
}: {
  id: string;
  kolom: readonly { kunci: T; label: string }[];
  tampil: Record<T, boolean>;
  onUbah: (kunci: T, nilai: boolean) => void;
}) {
  const [buka, setBuka] = useState(false);
  const wadah = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!buka) return;
    function tutupSaatLuar(e: MouseEvent) {
      if (wadah.current && !wadah.current.contains(e.target as Node)) setBuka(false);
    }
    function tutupSaatLepas(e: KeyboardEvent) {
      if (e.key === "Escape") setBuka(false);
    }
    document.addEventListener("mousedown", tutupSaatLuar);
    document.addEventListener("keydown", tutupSaatLepas);
    return () => {
      document.removeEventListener("mousedown", tutupSaatLuar);
      document.removeEventListener("keydown", tutupSaatLepas);
    };
  }, [buka]);

  return (
    <div ref={wadah} className="relative rounded-none garis-rambut-diam bg-white sm:ml-auto">
      <Button
        type="button"
        variant="ghost"
        onClick={() => setBuka((v) => !v)}
        aria-expanded={buka}
        aria-controls={id}
        className="flex min-h-12 w-full items-center gap-2 rounded-none px-4 t-label text-[#0B1F2E]/70 sm:w-auto"
      >
        Kolom tampil
        <span aria-hidden="true" className={`text-base leading-none transition-transform ${buka ? "rotate-45" : ""}`}>+</span>
      </Button>
      {buka && (
        <div id={id} role="menu" className="absolute top-full right-0 z-30 mt-1 flex w-56 flex-col gap-2 rounded-none border border-[#0B1F2E]/15 bg-white p-2 shadow-lg">
          {kolom.map((k) => (
            <label key={k.kunci} className="flex min-h-12 cursor-pointer items-center gap-3 rounded-none px-2 text-sm hover:bg-muted">
              <input
                type="checkbox"
                checked={tampil[k.kunci]}
                onChange={(e) => onUbah(k.kunci, e.target.checked)}
                className="h-5 w-5 accent-primary"
              />
              {k.label}
            </label>
          ))}
        </div>
      )}
    </div>
  );
}
export function BilahSaring({
  idCari,
  labelCari,
  placeholder,
  cari,
  onCari,
  labelGrup,
  pilihan,
  aktif,
  onPilih,
}: {
  idCari: string;
  labelCari: string;
  placeholder: string;
  cari: string;
  onCari: (nilai: string) => void;
  labelGrup: string;
  pilihan: { nilai: string; label: string }[];
  aktif: string;
  onPilih: (nilai: string) => void;
}) {
  return (
    <div className="flex flex-col gap-2 rounded-none garis-rambut-diam bg-[#DCE8EE] p-3">
      <div className="flex flex-col gap-2 sm:flex-row">
        <div className="relative flex-1">
          <label htmlFor={idCari} className="sr-only">{labelCari}</label>
          <input
            id={idCari}
            type="search"
            value={cari}
            onChange={(e) => onCari(e.target.value)}
            placeholder={placeholder}
        className="min-h-12 w-full rounded-none border border-[#0B1F2E]/25 bg-white px-3 pr-12 text-sm text-[#0B1F2E] placeholder:text-[#0B1F2E]/70 [&::-webkit-search-cancel-button]:hidden"
          />
          {cari.length > 0 && (
            <button
              type="button"
              onClick={() => onCari("")}
              aria-label="Hapus pencarian"
              className="absolute top-1 right-1 flex min-h-12 min-w-12 items-center justify-center rounded-none text-[#0B1F2E] hover:bg-[#0B1F2E]/10"
            >
              ×
            </button>
          )}
        </div>
      </div>
      <div className="flex flex-wrap gap-2" role="group" aria-label={labelGrup}>
        {pilihan.map((p) => (
          <button
            key={p.nilai}
            type="button"
            onClick={() => onPilih(p.nilai)}
            aria-pressed={aktif === p.nilai}
            className={
              aktif === p.nilai
                ? "min-h-12 rounded-none bg-[#0B1F2E] px-4 t-label text-white"
                : "min-h-12 rounded-none border border-[#0B1F2E]/30 bg-white px-4 t-label text-[#0B1F2E] hover:bg-white"
            }
          >
            {p.label}
          </button>
        ))}
      </div>
    </div>
  );
}

export function TombolUrut({
  label,
  tanda,
  labelAria,
  onUrut,
}: {
  label: string;
  tanda: string;
  labelAria: string;
  onUrut: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onUrut}
      aria-label={labelAria}
      className="inline-flex min-h-12 items-center gap-1 font-semibold text-white"
    >
      {label} <span aria-hidden="true">{tanda}</span>
    </button>
  );
}

export function BilahHalaman({
  awal,
  akhir,
  total,
  perHalaman,
  onPerHalaman,
  bisaMundur,
  bisaMaju,
  onMundur,
  onMaju,
  idPilih,
}: {
  awal: number;
  akhir: number;
  total: number;
  perHalaman: number;
  onPerHalaman: (nilai: 5 | 10 | 20) => void;
  bisaMundur: boolean;
  bisaMaju: boolean;
  onMundur: () => void;
  onMaju: () => void;
  idPilih: string;
}) {
  function pilihUkuran(nilai: string): void {
    if (nilai === "10") onPerHalaman(10);
    else if (nilai === "20") onPerHalaman(20);
    else onPerHalaman(5);
  }

  return (
    <div className="mt-2 flex flex-col gap-2 pl-2 sm:flex-row sm:items-center">
      <p className="flex-1 text-sm tabular-nums text-muted-foreground" role="status">
        Menampilkan {awal}–{akhir} dari {total} data
      </p>
      <div className="flex items-center gap-2">
        <label htmlFor={idPilih} className="t-label text-[#0B1F2E]/70">Per halaman</label>
        <select
          id={idPilih}
          value={perHalaman}
          onChange={(e) => pilihUkuran(e.target.value)}
          className="min-h-12 rounded-none border border-[#0B1F2E]/25 bg-white px-2 text-sm text-[#0B1F2E]"
        >
          <option value={5}>5</option>
          <option value={10}>10</option>
          <option value={20}>20</option>
        </select>
      </div>
      <div className="flex gap-2">
        <Button
          variant="outline"
          onClick={onMundur}
          disabled={!bisaMundur}
          className="min-h-12 rounded-none"
        >
          Sebelumnya
        </Button>
        <Button
          variant="outline"
          onClick={onMaju}
          disabled={!bisaMaju}
          className="min-h-12 rounded-none"
        >
          Berikutnya
        </Button>
      </div>
    </div>
  );
}

export function BilahMassal({
  jumlah,
  sibuk,
  onBatal,
  onSetuju,
}: {
  jumlah: number;
  sibuk: boolean;
  onBatal: () => void;
  onSetuju: () => void;
}) {
  return (
    <div
       className="pudar-masuk sticky bottom-20 z-10 flex flex-col gap-2 rounded-none border border-[#0B1F2E] bg-[#0B1F2E] p-3 text-white shadow-lg md:bottom-4 md:flex-row md:items-center"
      role="status"
    >
      <p className="flex-1 text-sm font-semibold">{jumlah} snapshot dipilih</p>
      <div className="flex flex-col gap-2 sm:flex-row">
        <Button
          variant="outline"
          onClick={onBatal}
          disabled={sibuk}
          className="min-h-12 rounded-none border-white/60 bg-transparent text-white hover:bg-white/10 hover:text-white"
        >
          Batalkan pilihan
        </Button>
        <Button
          onClick={onSetuju}
          disabled={sibuk}
        className="min-h-12 rounded-none bg-[#0f79b8] text-white hover:bg-[#0B1F2E]"
        >
          {sibuk ? "Menyetujui..." : `Setujui ${jumlah} terpilih`}
        </Button>
      </div>
    </div>
  );
}
