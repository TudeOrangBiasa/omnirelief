"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { toast } from "sonner";
import { DownloadMinimalisticIcon } from "@solar-icons/react/linear";
import { Badge } from "@omnirelief/ui/components/badge";
import { Button } from "@omnirelief/ui/components/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@omnirelief/ui/components/table";
import { sisaHariKalender } from "@/lib/tanggal";
import { selCsv } from "@/lib/csv";
import type { GudangBatchRow } from "@/lib/supabase/baris";
import TombolSalin from "./tombol-salin";
import { BilahHalaman, PilihKolom } from "./kontrol-tabel";

export type KunciUrutBatch = "kode" | "barang" | "sisa" | "kedaluwarsa";
const KOLOM = [
  { kunci: "kode", label: "Kode" },
  { kunci: "barang", label: "Barang" },
  { kunci: "sisa", label: "Sisa" },
  { kunci: "kedaluwarsa", label: "Kedaluwarsa" },
] as const;

type KunciKolom = (typeof KOLOM)[number]["kunci"];

const KUNCI_SIMPAN = "omnirelief-kolom-batch";

function muatKolom(): Record<KunciKolom, boolean> {
  const semua = { kode: true, barang: true, sisa: true, kedaluwarsa: true };
  try {
    const mentah = window.localStorage.getItem(KUNCI_SIMPAN);
    if (!mentah) return semua;
    const parsed: unknown = JSON.parse(mentah);
    if (typeof parsed !== "object" || parsed === null) return semua;
    const hasil = { ...semua };
    for (const k of Object.keys(semua) as KunciKolom[]) {
      if ((parsed as Record<string, unknown>)[k] === false) hasil[k] = false;
    }
    return hasil;
  } catch {
    return semua;
  }
}

/**
 * Tabel stok batch gudang. Terima baris urutan FEFO dari page, sortir,
 * paginasi, unduh CSV, dan visibilitas kolom internal.
 */
export function TabelBatch({ rows }: { rows: GudangBatchRow[] }) {
  const [kunciUrut, setKunciUrut] = useState<KunciUrutBatch | null>(null);
  const [arahUrut, setArahUrut] = useState<"naik" | "turun">("naik");
  const [halaman, setHalaman] = useState(1);
  const [perHalaman, setPerHalaman] = useState<5 | 10 | 20>(10);
  const [kolom, setKolom] = useState<Record<KunciKolom, boolean>>(muatKolom);

  useEffect(() => {
    setHalaman(1);
  }, [rows]);

  useEffect(() => {
    try {
      window.localStorage.setItem(KUNCI_SIMPAN, JSON.stringify(kolom));
    } catch {
      /* abaikan */
    }
  }, [kolom]);

  const tampilKolom = (Object.keys(kolom) as KunciKolom[]).some((k) => kolom[k])
    ? kolom
    : { kode: true, barang: true, sisa: true, kedaluwarsa: true };

  function gantiUrut(kunci: KunciUrutBatch) {
    if (kunciUrut !== kunci) {
      setKunciUrut(kunci);
      setArahUrut("naik");
    } else {
      setArahUrut((a) => (a === "naik" ? "turun" : "naik"));
    }
    setHalaman(1);
  }

  function ikonUrut(kunci: KunciUrutBatch) {
    if (kunciUrut !== kunci) return "⇅";
    return arahUrut === "naik" ? "▲" : "▼";
  }

  function labelUrut(kunci: KunciUrutBatch, label: string): string {
    if (kunciUrut !== kunci) return `Urutkan ${label}`;
    return `Urutkan ${label}, saat ini ${arahUrut === "naik" ? "menaik" : "menurun"}`;
  }

  const tampil = (() => {
    if (kunciUrut === null) return rows;
    const banding = (a: GudangBatchRow, c: GudangBatchRow) => {
      if (kunciUrut === "kode") return a.kode_sumbangan.localeCompare(c.kode_sumbangan);
      if (kunciUrut === "barang") return a.item_nama.localeCompare(c.item_nama);
      if (kunciUrut === "sisa") return a.sisa - c.sisa;
      const waktu = (tanggal: string | null) =>
        tanggal === null ? Number.POSITIVE_INFINITY : new Date(tanggal).getTime();
      return waktu(a.kedaluwarsa) - waktu(c.kedaluwarsa);
    };
    return [...rows].sort((a, c) => (arahUrut === "naik" ? banding(a, c) : banding(c, a)));
  })();

  const totalHalaman = Math.max(1, Math.ceil(tampil.length / perHalaman));
  const halamanAman = Math.min(halaman, totalHalaman);
  const halamanBaris = tampil.slice((halamanAman - 1) * perHalaman, halamanAman * perHalaman);

  function unduhCsv() {
    const kepala = ["kode", "barang", "satuan", "jumlah", "sisa", "kedaluwarsa", "sumber"];
    const isi = tampil
      .map((b) =>
        [b.kode_sumbangan, b.item_nama, b.satuan, b.jumlah, b.sisa, b.kedaluwarsa ?? "", b.sumber]
          .map(selCsv)
          .join(","),
      )
      .join("\r\n");
    const blob = new Blob([[kepala.map(selCsv).join(","), isi].join("\r\n")], {
      type: "text/csv;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const tautan = document.createElement("a");
    tautan.href = url;
    tautan.download = "stok-batch.csv";
    document.body.appendChild(tautan);
    tautan.click();
    tautan.remove();
    URL.revokeObjectURL(url);
    toast.success("Berkas CSV stok batch diunduh.");
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          variant="outline"
          onClick={unduhCsv}
          disabled={tampil.length === 0}
          aria-label="Unduh stok batch sebagai CSV"
        >
          <DownloadMinimalisticIcon aria-hidden="true" />
          Unduh CSV
        </Button>
        <PilihKolom
          id="batch-kolom"
          kolom={KOLOM}
          tampil={tampilKolom}
          onUbah={(kunci, nilai) => setKolom((s) => ({ ...s, [kunci]: nilai }))}
        />
      </div>
      <div className="overflow-x-auto border bg-card">
        <Table className="min-w-140">
          <TableHeader className="bg-[#0B1F2E]">
            <TableRow className="hover:bg-[#0B1F2E]">
              {tampilKolom.kode && (
                <TableHead
                  aria-sort={kunciUrut === "kode" ? (arahUrut === "naik" ? "ascending" : "descending") : "none"}
                  className="sticky left-0 border-r border-white/25 bg-[#0B1F2E] t-label text-white"
                >
                  <button
                    type="button"
                    onClick={() => gantiUrut("kode")}
                    aria-label={labelUrut("kode", "kode")}
                    className="flex min-h-12 items-center gap-1 uppercase"
                  >
                    Kode <span aria-hidden="true">{ikonUrut("kode")}</span>
                  </button>
                </TableHead>
              )}
              {tampilKolom.barang && (
                <TableHead
                  aria-sort={kunciUrut === "barang" ? (arahUrut === "naik" ? "ascending" : "descending") : "none"}
                  className="t-label text-white"
                >
                  <button
                    type="button"
                    onClick={() => gantiUrut("barang")}
                    aria-label={labelUrut("barang", "barang")}
                    className="flex min-h-12 items-center gap-1 uppercase"
                  >
                    Barang <span aria-hidden="true">{ikonUrut("barang")}</span>
                  </button>
                </TableHead>
              )}
              {tampilKolom.sisa && (
                <TableHead
                  aria-sort={kunciUrut === "sisa" ? (arahUrut === "naik" ? "ascending" : "descending") : "none"}
                  className="t-label text-white"
                >
                  <button
                    type="button"
                    onClick={() => gantiUrut("sisa")}
                    aria-label={labelUrut("sisa", "sisa")}
                    className="flex min-h-12 items-center gap-1 uppercase"
                  >
                    Sisa <span aria-hidden="true">{ikonUrut("sisa")}</span>
                  </button>
                </TableHead>
              )}
              {tampilKolom.kedaluwarsa && (
                <TableHead
                  aria-sort={kunciUrut === "kedaluwarsa" ? (arahUrut === "naik" ? "ascending" : "descending") : "none"}
                  className="t-label text-white"
                >
                  <button
                    type="button"
                    onClick={() => gantiUrut("kedaluwarsa")}
                    aria-label={labelUrut("kedaluwarsa", "kedaluwarsa")}
                    className="flex min-h-12 items-center gap-1 uppercase"
                  >
                    Kedaluwarsa <span aria-hidden="true">{ikonUrut("kedaluwarsa")}</span>
                  </button>
                </TableHead>
              )}
              <TableHead className="sticky right-0 border-l border-white/25 bg-[#0B1F2E] t-label text-white">Aksi</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {halamanBaris.map((b) => {
              const hari = b.kedaluwarsa ? sisaHariKalender(b.kedaluwarsa) : null;
              return (
                <TableRow key={b.id}>
                  {tampilKolom.kode && (
                    <TableCell className="sticky left-0 border-r border-[#0B1F2E]/15 bg-inherit font-mono text-xs break-all">
                      {b.kode_sumbangan}
                    </TableCell>
                  )}
                  {tampilKolom.barang && (
                    <TableCell className="whitespace-normal">
                      {b.item_nama}
                      <span className="text-muted-foreground block text-xs tabular-nums">
                        {b.jumlah} {b.satuan}
                      </span>
                    </TableCell>
                  )}
                  {tampilKolom.sisa && (
                    <TableCell className="tabular-nums">
                      {b.sisa} {b.satuan}
                    </TableCell>
                  )}
                  {tampilKolom.kedaluwarsa && (
                    <TableCell className="text-xs">
                      {b.kedaluwarsa ? new Date(b.kedaluwarsa).toLocaleDateString("id-ID") : "Tanpa tanggal"}
                      {hari !== null && hari < 0 && (
                        <Badge variant="destructive" className="mt-1 block w-fit">
                          Kedaluwarsa
                        </Badge>
                      )}
                      {hari !== null && hari >= 0 && hari <= 7 && (
                        <Badge
                          variant="outline"
                          className="mt-1 block w-fit border-transparent bg-warning-bg text-warning-badge-fg"
                        >
                          FEFO: {hari} hari lagi
                        </Badge>
                      )}
                    </TableCell>
                  )}
                  <TableCell className="sticky right-0 border-l border-[#0B1F2E]/15 bg-inherit">
                    <div className="flex min-w-28 flex-col gap-2">
                      <TombolSalin
                        teks={b.kode_sumbangan}
                        label="Salin kode"
                        pesanSukses="Kode sumbangan disalin."
                        variant="outline"
                        className="w-auto rounded-none"
                      />
                      <Button
                        render={<Link href={`/s/${b.kode_sumbangan}`}>Lihat publik</Link>}
                        variant="outline"
                        className="min-h-12 w-auto rounded-none"
                      />
                    </div>
                  </TableCell>
              </TableRow>
            );
          })}
          </TableBody>
        </Table>
      </div>
      <BilahHalaman
        awal={halamanBaris.length === 0 ? 0 : (halamanAman - 1) * perHalaman + 1}
        akhir={Math.min(halamanAman * perHalaman, tampil.length)}
        total={tampil.length}
        perHalaman={perHalaman}
        onPerHalaman={(nilai) => { setPerHalaman(nilai); setHalaman(1); }}
        bisaMundur={halamanAman > 1}
        bisaMaju={halamanAman < totalHalaman}
        onMundur={() => setHalaman((h) => Math.max(1, h - 1))}
        onMaju={() => setHalaman((h) => Math.min(totalHalaman, h + 1))}
        idPilih="batch-per-halaman"
      />
    </div>
  );
}
