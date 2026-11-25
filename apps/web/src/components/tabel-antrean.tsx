"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ArrowDownIcon, ArrowUpIcon, DownloadMinimalisticIcon } from "@solar-icons/react/linear";
import { Badge } from "@omnirelief/ui/components/badge";
import { Button } from "@omnirelief/ui/components/button";
import { Checkbox } from "@omnirelief/ui/components/checkbox";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@omnirelief/ui/components/table";
import { jamSejak } from "@/lib/tanggal";
import { selCsv } from "@/lib/csv";
import { BilahHalaman, PilihKolom } from "./kontrol-tabel";

export type Antrean = {
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

export type PutusanTarget = {
  id: number;
  nama: string;
  keputusan: "MINTA_REVISI" | "DITOLAK";
};

export function totalJiwa(a: Antrean): number {
  return a.bayi + a.balita + a.ibu_hamil + a.lansia + a.disabilitas + a.umum;
}

function umurDari(iso: string): string {
  const beda = Date.now() - new Date(iso).getTime();
  if (Number.isNaN(beda)) return "-";
  const menit = Math.max(0, Math.floor(beda / 60000));
  if (menit < 1) return "baru saja";
  if (menit < 60) return `${menit} mnt lalu`;
  const jam = Math.floor(menit / 60);
  if (jam < 24) return `${jam} jam lalu`;
  return `${Math.floor(jam / 24)} hari lalu`;
}

type KunciSortir = "umur" | "total";

const KOLOM = [
  { kunci: "posko", label: "Posko" },
  { kunci: "kategori", label: "Kategori rentan" },
  { kunci: "total", label: "Total" },
  { kunci: "umur", label: "Umur antrean" },
] as const;

type KunciKolom = (typeof KOLOM)[number]["kunci"];

const KUNCI_SIMPAN = "omnirelief-kolom-antrean";

function muatKolom(): Record<KunciKolom, boolean> {
  const semua = { posko: true, kategori: true, total: true, umur: true };
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
 * Tabel antrean verifikasi snapshot posko. Data via props agar bisa diuji
 * dengan fixture tanpa fetch. Sortir, paginasi, unduh CSV, dan visibilitas
 * kolom internal; seleksi massal via props.
 */
export function TabelAntrean({
  antrean,
  terpilih,
  sibuk,
  onPilih,
  onPilihSemua,
  onSetujui,
  onPutusan,
}: {
  antrean: Antrean[];
  terpilih: number[];
  sibuk: boolean;
  onPilih: (id: number, pilih: boolean) => void;
  onPilihSemua: (pilih: boolean) => void;
  onSetujui: (id: number) => void;
  onPutusan: (target: PutusanTarget) => void;
}) {
  const [kunciSortir, setKunciSortir] = useState<KunciSortir>("umur");
  const [arahSortir, setArahSortir] = useState<"naik" | "turun">("naik");
  const [halaman, setHalaman] = useState(1);
  const [perHalaman, setPerHalaman] = useState<5 | 10 | 20>(10);
  const [kolom, setKolom] = useState<Record<KunciKolom, boolean>>(muatKolom);

  useEffect(() => {
    setHalaman(1);
  }, [antrean]);

  useEffect(() => {
    try {
      window.localStorage.setItem(KUNCI_SIMPAN, JSON.stringify(kolom));
    } catch {
      /* abaikan */
    }
  }, [kolom]);

  const tampilKolom = (Object.keys(kolom) as KunciKolom[]).some((k) => kolom[k])
    ? kolom
    : { posko: true, kategori: true, total: true, umur: true };

  function alihSortir(kunci: KunciSortir) {
    if (kunci === kunciSortir) {
      setArahSortir((arah) => (arah === "naik" ? "turun" : "naik"));
    } else {
      setKunciSortir(kunci);
      setArahSortir(kunci === "umur" ? "naik" : "turun");
    }
    setHalaman(1);
  }

  function ikonSortir(kunci: KunciSortir) {
    if (kunci !== kunciSortir) return "⇅";
    return arahSortir === "naik" ? (
      <ArrowUpIcon aria-hidden="true" className="size-4" />
    ) : (
      <ArrowDownIcon aria-hidden="true" className="size-4" />
    );
  }

  const urut = [...antrean].sort((a, b) => {
    const beda =
      kunciSortir === "umur"
        ? new Date(a.dibuat_pada).getTime() - new Date(b.dibuat_pada).getTime()
        : totalJiwa(a) - totalJiwa(b);
    return arahSortir === "naik" ? beda : -beda;
  });
  const semuaTerpilih = urut.length > 0 && terpilih.length === urut.length;

  const totalHalaman = Math.max(1, Math.ceil(urut.length / perHalaman));
  const halamanAman = Math.min(halaman, totalHalaman);
  const tampil = urut.slice((halamanAman - 1) * perHalaman, halamanAman * perHalaman);

  function unduhCsv() {
    const kepala = ["posko", "bayi", "balita", "ibu_hamil", "lansia", "disabilitas", "umum", "total_jiwa", "dibuat_pada"];
    const isi = urut
      .map((a) =>
        [
          a.posko?.nama ?? "",
          a.bayi,
          a.balita,
          a.ibu_hamil,
          a.lansia,
          a.disabilitas,
          a.umum,
          totalJiwa(a),
          a.dibuat_pada,
        ]
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
    tautan.download = "antrean-verifikasi.csv";
    document.body.appendChild(tautan);
    tautan.click();
    tautan.remove();
    URL.revokeObjectURL(url);
    toast.success("Berkas CSV antrean diunduh.");
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <Button
          variant="outline"
          onClick={unduhCsv}
          disabled={urut.length === 0}
          className="min-h-12 rounded-none sm:w-auto"
          aria-label="Unduh antrean sebagai CSV"
        >
          <DownloadMinimalisticIcon aria-hidden="true" />
          Unduh CSV
        </Button>
        <PilihKolom
          id="antrean-kolom"
          kolom={KOLOM}
          tampil={tampilKolom}
          onUbah={(kunci, nilai) => setKolom((s) => ({ ...s, [kunci]: nilai }))}
        />
      </div>
      <div className="overflow-x-auto rounded-none garis-rambut-diam">
        <Table>
          <TableHeader>
            <TableRow className="bg-[#0B1F2E] hover:bg-[#0B1F2E]">
              <TableHead
                aria-label="Pilih"
                className="sticky left-0 border-r border-white/25 bg-[#0B1F2E] font-mono text-[11px] uppercase tracking-widest text-white"
              >
                <Checkbox
                  checked={semuaTerpilih}
                  onCheckedChange={(nilai) => onPilihSemua(nilai === true)}
                  aria-label="Pilih semua antrean"
                  disabled={sibuk}
                />
              </TableHead>
              {tampilKolom.posko && (
                <TableHead className="font-mono text-[11px] uppercase tracking-widest text-white">Posko</TableHead>
              )}
              {tampilKolom.kategori && (
                <TableHead className="font-mono text-[11px] uppercase tracking-widest text-white">Kategori rentan</TableHead>
              )}
              {tampilKolom.total && (
                <TableHead aria-sort={kunciSortir === "total" ? (arahSortir === "naik" ? "ascending" : "descending") : "none"} className="font-mono text-[11px] uppercase tracking-widest text-white">
                  <button
                    type="button"
                    onClick={() => alihSortir("total")}
                    className="inline-flex min-h-12 items-center gap-1 font-semibold text-white"
                    aria-label={`Urutkan total jiwa, saat ini ${kunciSortir === "total" ? arahSortir : "tidak diurutkan"}`}
                  >
                    Total {ikonSortir("total")}
                  </button>
                </TableHead>
              )}
              {tampilKolom.umur && (
                <TableHead aria-sort={kunciSortir === "umur" ? (arahSortir === "naik" ? "ascending" : "descending") : "none"} className="font-mono text-[11px] uppercase tracking-widest text-white">
                  <button
                    type="button"
                    onClick={() => alihSortir("umur")}
                    className="inline-flex min-h-12 items-center gap-1 font-semibold text-white"
                    aria-label={`Urutkan umur antrean, saat ini ${kunciSortir === "umur" ? arahSortir : "tidak diurutkan"}`}
                  >
                    Umur antrean {ikonSortir("umur")}
                  </button>
                </TableHead>
              )}
              <TableHead className="sticky right-0 border-l border-white/25 bg-[#0B1F2E] font-mono text-[11px] uppercase tracking-widest text-white">Putusan</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {tampil.map((a) => (
              <TableRow key={a.id} data-state={terpilih.includes(a.id) ? "selected" : undefined}>
                <TableCell className="sticky left-0 border-r border-[#0B1F2E]/15 bg-inherit">
                  <Checkbox
                    checked={terpilih.includes(a.id)}
                    onCheckedChange={(nilai) => onPilih(a.id, nilai === true)}
                    aria-label={`Pilih snapshot ${a.posko?.nama ?? "posko?"}`}
                    disabled={sibuk}
                  />
                </TableCell>
                {tampilKolom.posko && (
                  <TableCell className="font-semibold">{a.posko?.nama ?? "Posko?"}</TableCell>
                )}
                {tampilKolom.kategori && (
                  <TableCell className="whitespace-normal">
                    <dl className="flex flex-col gap-0.5 text-xs">
                      <div className="flex items-baseline justify-between gap-3">Bayi: <strong className="tabular-nums">{a.bayi}</strong></div>
                      <div className="flex items-baseline justify-between gap-3">Balita: <strong className="tabular-nums">{a.balita}</strong></div>
                      <div className="flex items-baseline justify-between gap-3">Ibu hamil: <strong className="tabular-nums">{a.ibu_hamil}</strong></div>
                      <div className="flex items-baseline justify-between gap-3">Lansia: <strong className="tabular-nums">{a.lansia}</strong></div>
                      <div className="flex items-baseline justify-between gap-3">Disabilitas: <strong className="tabular-nums">{a.disabilitas}</strong></div>
                      <div className="flex items-baseline justify-between gap-3">Umum: <strong className="tabular-nums">{a.umum}</strong></div>
                    </dl>
                  </TableCell>
                )}
                {tampilKolom.total && (
                  <TableCell className="tabular-nums">
                    <strong>{totalJiwa(a)}</strong> jiwa
                  </TableCell>
                )}
                {tampilKolom.umur && (
                  <TableCell className="whitespace-nowrap text-muted-foreground">
                    {umurDari(a.dibuat_pada)}
                    {jamSejak(a.dibuat_pada) >= 24 ? (
                      <Badge variant="destructive" className="mt-1 block w-fit">Lewat 24 jam</Badge>
                    ) : jamSejak(a.dibuat_pada) >= 12 ? (
                      <Badge variant="outline" className="mt-1 block w-fit border-transparent bg-warning-bg text-warning-badge-fg">Hampir 24 jam</Badge>
                    ) : null}
                  </TableCell>
                )}
                <TableCell className="sticky right-0 border-l border-[#0B1F2E]/15 bg-inherit">
                  <div className="flex min-w-32 flex-col gap-1">
                    <Button
                      onClick={() => onSetujui(a.id)}
                      disabled={sibuk}
                      className="min-h-12 w-full bg-success text-white hover:bg-success/80"
                    >
                      Setujui
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() =>
                        onPutusan({
                          id: a.id,
                          nama: a.posko?.nama ?? "Posko?",
                          keputusan: "MINTA_REVISI",
                        })
                      }
                      disabled={sibuk}
                      className="min-h-12 w-full rounded-none"
                    >
                      Minta revisi
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() =>
                        onPutusan({
                          id: a.id,
                          nama: a.posko?.nama ?? "Posko?",
                          keputusan: "DITOLAK",
                        })
                      }
                      disabled={sibuk}
                      className="min-h-12 w-full"
                    >
                      Tolak
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <BilahHalaman
        awal={tampil.length === 0 ? 0 : (halamanAman - 1) * perHalaman + 1}
        akhir={Math.min(halamanAman * perHalaman, urut.length)}
        total={urut.length}
        perHalaman={perHalaman}
        onPerHalaman={(nilai) => { setPerHalaman(nilai); setHalaman(1); }}
        bisaMundur={halamanAman > 1}
        bisaMaju={halamanAman < totalHalaman}
        onMundur={() => setHalaman((h) => Math.max(1, h - 1))}
        onMaju={() => setHalaman((h) => Math.min(totalHalaman, h + 1))}
        idPilih="antrean-per-halaman"
      />
    </div>
  );
}
