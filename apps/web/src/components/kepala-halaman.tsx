"use client";

import { RefreshIcon } from "@solar-icons/react/linear";
import { Button } from "@omnirelief/ui/components/button";

export function KepalaHalaman({
  label,
  judul,
  deskripsi,
  bergaris,
}: {
  label: string;
  judul: string;
  deskripsi?: string;
  bergaris?: boolean;
}) {
  const isi = (
    <>
      <p className="font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E]/70">
        {label}
      </p>
      <h1 className="mt-1 text-2xl font-bold text-[#0B1F2E]">{judul}</h1>
      {deskripsi ? (
        <p className="mt-1 text-sm text-muted-foreground">{deskripsi}</p>
      ) : null}
    </>
  );
  if (bergaris) {
    return <div className="border-b-2 border-[#0B1F2E] pb-4">{isi}</div>;
  }
  return <div>{isi}</div>;
}

export function BarisSegarkan({
  diperbarui,
  memuat,
  onMuat,
  sebaris,
  basi,
}: {
  diperbarui: string;
  memuat: boolean;
  onMuat: () => void;
  sebaris?: boolean;
  basi?: boolean;
}) {
  const tombol = (
    <Button
      type="button"
      variant="outline"
      onClick={onMuat}
      disabled={memuat}
      className="min-h-12 gap-2 rounded-none sm:w-auto"
    >
      <RefreshIcon aria-hidden="true" className={memuat ? "animate-spin" : undefined} />
      {memuat ? "Memuat..." : "Segarkan"}
    </Button>
  );
  const teks = diperbarui ? `Pembaruan terakhir ${diperbarui}` : "Belum pernah dimuat";
  const peringatan =
    basi && !memuat ? " · data mungkin basi, segarkan untuk angka terbaru" : "";
  if (sebaris) {
    return (
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span role="status">{diperbarui ? `Diperbarui ${diperbarui}${peringatan}` : "Memuat…"}</span>
        {tombol}
      </div>
    );
  }
  return (
    <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
      <p className="flex-1 text-sm text-muted-foreground" role="status">
        {teks}
        {peringatan}
      </p>
      {tombol}
    </div>
  );
}
