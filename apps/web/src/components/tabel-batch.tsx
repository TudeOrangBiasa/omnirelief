"use client";

import { useState } from "react";
import Link from "next/link";
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
import type { GudangBatchRow } from "@/lib/supabase/baris";
import TombolSalin from "./tombol-salin";

export type KunciUrutBatch = "kode" | "barang" | "sisa" | "kedaluwarsa";

/**
 * Tabel stok batch gudang. Terima baris urutan FEFO dari page, sortir kolom
 * internal. Dipakai juga harness uji-tekan dengan fixture buatan.
 */
export function TabelBatch({ rows }: { rows: GudangBatchRow[] }) {
  const [kunciUrut, setKunciUrut] = useState<KunciUrutBatch | null>(null);
  const [arahUrut, setArahUrut] = useState<"naik" | "turun">("naik");

  function gantiUrut(kunci: KunciUrutBatch) {
    if (kunciUrut !== kunci) {
      setKunciUrut(kunci);
      setArahUrut("naik");
    } else {
      setArahUrut((a) => (a === "naik" ? "turun" : "naik"));
    }
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

  const kolom: { kunci: KunciUrutBatch; label: string }[] = [
    { kunci: "kode", label: "Kode" },
    { kunci: "barang", label: "Barang" },
    { kunci: "sisa", label: "Sisa" },
    { kunci: "kedaluwarsa", label: "Kedaluwarsa" },
  ];

  return (
    <div className="overflow-x-auto border bg-card">
      <Table>
        <TableHeader className="bg-[#0B1F2E]">
          <TableRow className="hover:bg-[#0B1F2E]">
            {kolom.map((k) => (
              <TableHead
                key={k.kunci}
                aria-sort={kunciUrut === k.kunci ? (arahUrut === "naik" ? "ascending" : "descending") : "none"}
                className="font-mono text-[11px] uppercase tracking-widest text-white"
              >
                <button
                  type="button"
                  onClick={() => gantiUrut(k.kunci)}
                  aria-label={labelUrut(k.kunci, k.label.toLowerCase())}
                  className="flex min-h-12 items-center gap-1 uppercase"
                >
                  {k.label} <span aria-hidden="true">{ikonUrut(k.kunci)}</span>
                </button>
              </TableHead>
            ))}
            <TableHead className="sticky right-0 border-l border-white/25 bg-[#0B1F2E] font-mono text-[11px] uppercase tracking-widest text-white">Aksi</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tampil.map((b) => {
            const hari = b.kedaluwarsa ? sisaHariKalender(b.kedaluwarsa) : null;
            return (
              <TableRow key={b.id}>
                <TableCell className="font-mono text-xs break-all">{b.kode_sumbangan}</TableCell>
                <TableCell className="whitespace-normal">
                  {b.item_nama}
                  <span className="text-muted-foreground block text-xs tabular-nums">
                    {b.jumlah} {b.satuan}
                  </span>
                </TableCell>
                <TableCell className="tabular-nums">
                  {b.sisa} {b.satuan}
                </TableCell>
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
  );
}
