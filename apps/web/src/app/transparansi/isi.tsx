"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { CloseCircleIcon, MagnifierIcon } from "@solar-icons/react/linear";
import { Alert, AlertDescription, AlertTitle } from "@omnirelief/ui/components/alert";
import { Badge } from "@omnirelief/ui/components/badge";
import { Button } from "@omnirelief/ui/components/button";
import { Card, CardContent, CardHeader } from "@omnirelief/ui/components/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@omnirelief/ui/components/empty";
import { Input } from "@omnirelief/ui/components/input";
import { Skeleton } from "@omnirelief/ui/components/skeleton";
import { baris, type DashboardRow } from "@/lib/supabase/baris";
import { selCsv } from "@/lib/csv";
import { formatWaktuID } from "@/lib/tanggal";
import { kulitPublik } from "@/lib/kulit";
import TombolKeAtas from "@/components/tombol-ke-atas";
import { CangkangPublik } from "@/components/cangkang-publik";
import { normalisasiKode, ruteKode } from "@/lib/kode";
import Logo from "@/components/logo";

type StatusMuat = "memuat" | "siap" | "gagal";
type FilterStatus = "semua" | "kurang" | "aman";

function KartuMuat() {
  return (
    <Card aria-hidden="true" className="rounded-none border border-slate-200 bg-white shadow-xs">
      <CardHeader>
        <Skeleton className="h-5 w-2/3" />
        <Skeleton className="h-4 w-1/3" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-5 w-24" />
      </CardContent>
    </Card>
  );
}

const KUNCI_RIWAYAT_CARI = "omnirelief-transparansi-cari";

function persenTerima(butuh: number, diterima: number) {
   if (butuh <= 0) return diterima > 0 ? 100 : 0;
   return Math.min(100, Math.round((diterima / butuh) * 100));
 }

export default function IsiTransparansi({ masuk }: { masuk: boolean }) {
  const [data, setData] = useState<DashboardRow[]>([]);
  const [status, setStatus] = useState<StatusMuat>("memuat");
  const [kode, setKode] = useState("");
  const [cari, setCari] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("semua");
  const [riwayat, setRiwayat] = useState<string[]>([]);
  const [waktuMuat, setWaktuMuat] = useState<Date | null>(null);

  const muat = useCallback(() => {
    setStatus("memuat");
    fetch("/api/publik/dashboard")
      .then((r) => r.json())
      .then((d: { ok: boolean; dashboard?: unknown }) => {
        if (d.ok) {
          setData(baris<DashboardRow>(d.dashboard));
          setWaktuMuat(new Date());
          setStatus("siap");
        } else {
          setStatus("gagal");
        }
      })
      .catch(() => setStatus("gagal"));
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  useEffect(() => {
    try {
      const mentah = window.localStorage.getItem(KUNCI_RIWAYAT_CARI);
      if (mentah) {
        const daftar: unknown = JSON.parse(mentah);
        if (Array.isArray(daftar)) {
          setRiwayat(daftar.filter((r): r is string => typeof r === "string").slice(0, 3));
        }
      }
    } catch {
      /* abaikan, riwayat opsional */
    }
  }, []);

  useEffect(() => {
    const kata = cari.trim();
    if (kata.length < 2) return;
    const id = window.setTimeout(() => {
      setRiwayat((sebelum) => {
        const berikutnya = [kata, ...sebelum.filter((r) => r.toLowerCase() !== kata.toLowerCase())].slice(0, 3);
        try {
          window.localStorage.setItem(KUNCI_RIWAYAT_CARI, JSON.stringify(berikutnya));
        } catch {
          /* abaikan */
        }
        return berikutnya;
      });
    }, 800);
    return () => window.clearTimeout(id);
  }, [cari]);


  const tampil = useMemo(() => {
    const kata = cari.trim().toLowerCase();
    return data.filter((p) => {
      if (filterStatus === "kurang" && p.selisih <= 0) return false;
      if (filterStatus === "aman" && p.selisih > 0) return false;
      if (kata === "") return true;
      return (
        p.posko_nama.toLowerCase().includes(kata) ||
        p.wilayah.toLowerCase().includes(kata)
      );
    });
  }, [data, cari, filterStatus]);

  const ringkas = useMemo(() => {
    const totalButuh = data.reduce((s, p) => s + p.butuh, 0);
    const totalDiterima = data.reduce((s, p) => s + p.diterima, 0);
    const selisihTerbuka = data.reduce((s, p) => s + Math.max(0, p.selisih), 0);
    const kurang = data.filter((p) => p.selisih > 0).length;
    return { totalButuh, totalDiterima, selisihTerbuka, kurang };
  }, [data]);

  const kurangTampil = useMemo(
    () => tampil.filter((p) => p.selisih > 0).length,
    [tampil]
  );
  const adaFilter = cari.trim() !== "" || filterStatus !== "semua";

  function aturUlang() {
    setCari("");
    setFilterStatus("semua");
  }

  function unduhCsv() {
    const judul = ["posko", "wilayah", "butuh", "dikirim", "diterima", "persen_pemenuhan", "selisih"];
    const barisData = tampil.map((p) =>
      [
        selCsv(p.posko_nama),
        selCsv(p.wilayah),
        selCsv(p.butuh),
        selCsv(p.dikirim),
        selCsv(p.diterima),
        selCsv(persenTerima(p.butuh, p.diterima)),
        selCsv(p.selisih),
      ].join(",")
    );
    const isi = ["\uFEFF" + judul.join(","), ...barisData].join("\n");
    const blob = new Blob([isi], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const tautan = document.createElement("a");
    tautan.href = url;
    tautan.download = "laporan-transparansi-posko.csv";
    document.body.appendChild(tautan);
    tautan.click();
    tautan.remove();
    URL.revokeObjectURL(url);
  }

  // Kulit ganda: anonim = shader gelap ikut landing, login = terang ikut dasbor.
  const {
    teksJudul,
    teksRedup,
    teksLabel,
    panelInfo,
    tombolPrimer,
    tombolGhost,
    inputKelas,
    saringAktif,
    saringMati,
  } = kulitPublik(masuk);

  const isi = (
    <>
      <div>
        <p className={`t-micro ${teksRedup}`}>{masuk ? "Sudah masuk · ringkas untuk ambil keputusan" : "Tanpa login"}</p>
        <h1 className={`t-h1 t-balance mt-2 ${teksJudul}`}>Transparansi per posko</h1>
        <p className={`t-pretty mt-2 max-w-xl ${teksRedup}`}>
          Jatah, pengiriman, penerimaan, dan selisih tiap daerah. Angka tidak digabung antar posko.
        </p>
      </div>
      <section aria-label="Sumber dan masa data" className={`grid grid-cols-1 gap-2 rounded-none p-4 text-sm md:grid-cols-3 md:items-start md:gap-x-6 ${panelInfo}`}>
        <p><span className={`font-mono text-[11px] tracking-[0.15em] uppercase ${teksLabel}`}>Periode Pemantauan</span><br /><span className="font-semibold">Aktif</span></p>
        <p><span className={`font-mono text-[11px] tracking-[0.15em] uppercase ${teksLabel}`}>Sumber Data</span><br /><span className="font-semibold">Ledger Terkunci BPBD</span></p>
        <p><span className={`font-mono text-[11px] tracking-[0.15em] uppercase ${teksLabel}`}>Waktu Pembaruan Terakhir</span><br /><span className="t-angka font-semibold tabular-nums">{status === "siap" && waktuMuat ? formatWaktuID(waktuMuat) : "Belum dimuat"}</span></p>
      </section>
      <div className="flex flex-wrap gap-2 print:hidden">
        <button
          type="button"
          onClick={unduhCsv}
          disabled={status !== "siap" || tampil.length === 0}
          className={`inline-flex min-h-12 items-center gap-2 rounded-none px-6 font-semibold disabled:cursor-not-allowed disabled:opacity-50 ${tombolPrimer}`}
        >
          Unduh Laporan CSV
        </button>
        <button
          type="button"
          onClick={() => window.print()}
          className={`inline-flex min-h-12 items-center gap-2 rounded-none border px-6 font-semibold ${tombolGhost}`}
        >
          Cetak Laporan
        </button>
      </div>
      <form action={ruteKode(normalisasiKode(kode))} className="flex gap-2 print:hidden">
        <div className="relative min-w-0 flex-1">
          <Input
            value={kode}
            onChange={(e) => setKode(e.target.value.toUpperCase())}
            placeholder="Ketik kode MNF-... atau DNT-..."
            aria-label="Cari kode manifest atau sumbangan"
            required
            className={`min-h-12 w-full rounded-none border pr-12 ${inputKelas}`}
          />
          {kode !== "" && (
            <button
              type="button"
              onClick={() => setKode("")}
              aria-label="Hapus kode"
              className={`absolute top-1/2 right-1 inline-flex min-h-12 min-w-12 -translate-y-1/2 items-center justify-center ${masuk ? "text-muted-foreground hover:text-foreground" : "text-white/70 hover:text-white"}`}
            >
              <CloseCircleIcon aria-hidden="true" className="size-5" />
            </button>
          )}
        </div>
        <button
          type="submit"
          className={`inline-flex min-h-12 items-center gap-2 rounded-none px-6 font-semibold ${tombolPrimer}`}
        >
          <MagnifierIcon aria-hidden="true" /> Cek
        </button>
      </form>

      <section aria-label="Ringkasan angka" className="grid grid-cols-2 gap-px overflow-hidden rounded-none border border-[#0B1F2E]/20 bg-[#0B1F2E]/20 text-[#0B1F2E] lg:grid-cols-4">
        <div className="flex flex-col gap-1 bg-[#DCE8EE] p-6 md:p-8">
          <span className="t-h2 t-angka text-primary tabular-nums">{data.length}</span>
          <span className="text-xs text-muted-foreground md:text-sm">Posko terpantau</span>
          {ringkas.kurang > 0 ? (
            <Badge variant="destructive" className="mt-1 w-fit rounded-none">{ringkas.kurang} kurang</Badge>
          ) : (
            <Badge variant="outline" className="mt-1 w-fit rounded-none border-transparent bg-success-bg text-success-badge-fg">
              Semua aman
            </Badge>
          )}
        </div>
        <div className="flex flex-col gap-1 bg-[#DCE8EE] p-6 md:p-8">
          <span className="t-h2 t-angka text-primary tabular-nums">{ringkas.totalButuh}</span>
          <span className="text-xs text-muted-foreground md:text-sm">Total butuh</span>
          <Badge variant="outline" className="mt-1 w-fit rounded-none">Jatah disetujui</Badge>
        </div>
        <div className="flex flex-col gap-1 bg-[#DCE8EE] p-6 md:p-8">
          <span className="t-h2 t-angka text-primary tabular-nums">{ringkas.totalDiterima}</span>
          <span className="text-xs text-muted-foreground md:text-sm">Total diterima</span>
          {ringkas.totalDiterima > 0 ? (
            <Badge variant="outline" className="mt-1 w-fit rounded-none border-transparent bg-success-bg text-success-badge-fg">
              Konfirmasi terima
            </Badge>
          ) : (
            <Badge variant="outline" className="mt-1 w-fit rounded-none">Belum ada terima</Badge>
          )}
        </div>
        <div className="flex flex-col gap-1 bg-[#DCE8EE] p-6 md:p-8">
          <span className="t-h2 t-angka text-destructive tabular-nums">{ringkas.selisihTerbuka}</span>
          <span className="text-xs text-muted-foreground md:text-sm">Selisih terbuka</span>
          {ringkas.selisihTerbuka > 0 ? (
            <Badge variant="destructive" className="mt-1 w-fit rounded-none">Perlu kirim</Badge>
          ) : (
            <Badge variant="outline" className="mt-1 w-fit rounded-none border-transparent bg-success-bg text-success-badge-fg">
              Nol, semua cukup
            </Badge>
          )}
        </div>
      </section>

      <section aria-label="Cari dan saring posko" className="flex flex-col gap-3 print:hidden">
        <div className="relative flex gap-2">
          <Input
            id="cari-posko"
            value={cari}
            onChange={(e) => setCari(e.target.value)}
            placeholder="Cari posko atau wilayah..."
            aria-label="Cari posko"
            className={`min-h-12 w-full flex-1 rounded-none border pr-12 ${inputKelas}`}
          />
          {cari !== "" && (
            <button
              type="button"
              onClick={() => setCari("")}
              aria-label="Hapus pencarian posko"
              className={`absolute top-1/2 right-1 inline-flex min-h-12 min-w-12 -translate-y-1/2 items-center justify-center ${masuk ? "text-muted-foreground hover:text-foreground" : "text-white/70 hover:text-white"}`}
            >
              <CloseCircleIcon aria-hidden="true" className="size-5" />
            </button>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-3 print:hidden">
          <div className={`flex items-center gap-1 rounded-none p-1 ${masuk ? "garis-rambut-diam bg-white" : "border border-white/25"}`} role="group" aria-label="Saring status selisih">
            {(
              [
                { nilai: "semua", label: "Semua" },
                { nilai: "kurang", label: "Kurang" },
                { nilai: "aman", label: "Aman" },
              ] as const
            ).map((o) => (
              <button
                key={o.nilai}
                type="button"
                onClick={() => setFilterStatus(o.nilai)}
                aria-pressed={filterStatus === o.nilai}
                className={
                  filterStatus === o.nilai
                    ? `min-h-10 rounded-none px-4 text-sm font-semibold ${saringAktif}`
                    : `min-h-10 rounded-none px-4 text-sm ${saringMati}`
                }
              >
                {o.label}
              </button>
            ))}
          </div>
          {adaFilter && (
            <button type="button" onClick={aturUlang} className={`min-h-12 text-sm underline ${masuk ? "text-primary" : "text-white"}`}>
              Atur ulang
            </button>
          )}
        </div>
        {riwayat.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 print:hidden">
            <span className={`font-mono text-[11px] tracking-[0.15em] uppercase ${teksLabel}`}>Terakhir dicari</span>
            {riwayat.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setCari(r)}
                aria-label={`Cari ${r}`}
                className={`inline-flex min-h-12 items-center rounded-none border px-4 text-sm ${tombolGhost}`}
              >
                {r}
              </button>
            ))}
          </div>
        )}
        {status === "siap" && (
          <p role="status" className={`t-angka text-sm tabular-nums ${teksRedup}`}>
            Menampilkan {tampil.length} posko · {kurangTampil} kurang
          </p>
        )}
      </section>
      {status === "memuat" && (
        <div role="status" aria-label="Memuat data posko" className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <KartuMuat />
          <KartuMuat />
          <KartuMuat />
          <KartuMuat />
        </div>
      )}
      {status === "gagal" && (
        <Alert variant="destructive">
          <AlertTitle>Gagal memuat data</AlertTitle>
          <AlertDescription>
            Periksa koneksi lalu coba lagi.
          </AlertDescription>
          <Button onClick={muat} className="mt-3 min-h-12">
            Coba lagi
          </Button>
        </Alert>
      )}
      {status === "siap" && data.length === 0 && (
        <Empty className="rounded-none bg-white text-foreground">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MagnifierIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Belum ada data posko</EmptyTitle>
            <EmptyDescription>
              Data muncul setelah posko melaporkan penyintas dan BPBD memverifikasinya.
            </EmptyDescription>
          </EmptyHeader>
          <Button render={<Link href="/pengaturan#bantuan" />} className="mt-4 min-h-12">
            Ke Bantuan
          </Button>
        </Empty>
      )}
      {status === "siap" && data.length > 0 && tampil.length === 0 && (
        <Empty className="rounded-none bg-white text-foreground">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              <MagnifierIcon aria-hidden="true" />
            </EmptyMedia>
            <EmptyTitle>Tidak ada hasil</EmptyTitle>
            <EmptyDescription>
              Tidak ada posko yang cocok dengan pencarian atau saringan. Coba kata lain atau atur ulang.
            </EmptyDescription>
          </EmptyHeader>
          <Button onClick={aturUlang} variant="outline" className="mt-4 min-h-12">
            Atur ulang pencarian
          </Button>
        </Empty>
      )}
      {status === "siap" && tampil.length > 0 && (
        <section aria-label="Stok per posko">
          <p className={`t-micro ${teksRedup}`}>Stok per posko</p>
          <h2 className={`t-h2 t-balance mt-2 ${teksJudul}`}>Diterima dibanding butuh</h2>
          <ul className="mt-6 flex flex-col gap-4">
            {tampil.map((p) => {
              const persen = persenTerima(p.butuh, p.diterima);
              const kurang = p.selisih > 0;
              return (
                <li
                  key={p.posko_id}
                  className={`flex flex-col gap-3 rounded-none p-5 md:p-6 ${masuk ? "garis-rambut-diam bg-white text-foreground" : "border border-white/20 bg-white/95 text-foreground"}`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <p className="t-micro text-muted-foreground">{p.wilayah}</p>
                      <p className="mt-1 text-lg font-semibold break-words">{p.posko_nama}</p>
                    </div>
                    {kurang ? (
                      <Badge variant="destructive" className="shrink-0 rounded-none">Kurang {p.selisih}</Badge>
                    ) : (
                      <Badge
                        variant="outline"
                        className="shrink-0 rounded-none border-transparent bg-success-bg text-success-badge-fg"
                      >
                        Aman
                      </Badge>
                    )}
                  </div>
                  <div
                    role="progressbar"
                    aria-valuenow={persen}
                    aria-valuemin={0}
                    aria-valuemax={100}
                    aria-label={`Penerimaan ${p.posko_nama}`}
                    className="h-2 w-full overflow-hidden rounded-none bg-muted"
                  >
                    <div
                      className={kurang ? "h-full rounded-none bg-destructive" : "h-full rounded-none bg-success"}
                      style={{ width: `${persen}%` }}
                    />
                  </div>
                  <p className="t-angka text-sm text-muted-foreground tabular-nums">
                    Diterima {p.diterima} dari butuh {p.butuh} ({persen}%) · Dikirim {p.dikirim}
                  </p>
                </li>
              );
            })}
          </ul>
        </section>
      )}
      <TombolKeAtas />
    </>
  );

  if (!masuk) {
    return (
      <CangkangPublik
        bilahAtas={
          <div className="flex w-full items-center justify-between pt-6 pb-4">
            <Link href="/" className="flex items-center gap-2" aria-label="OmniRelief beranda">
              <Logo varian="putih" tinggi={24} alt="" />
            </Link>
            <span className="flex items-center gap-5">
              <Link href="/" className="hidden min-h-12 items-center font-mono text-[11px] tracking-[0.15em] text-white/80 uppercase hover:text-white sm:inline-flex">
                ← Beranda
              </Link>
              <Link
                href="/masuk"
                className="relative inline-flex min-h-10 shrink-0 items-center justify-center border border-white/40 bg-white/10 px-3.5 font-mono text-[11px] tracking-[0.15em] whitespace-nowrap text-white uppercase backdrop-blur-sm hover:bg-white/20"
              >
                <span aria-hidden="true" className="absolute top-0 left-0 h-1.5 w-1.5 border-t border-l border-white" />
                <span aria-hidden="true" className="absolute top-0 right-0 h-1.5 w-1.5 border-t border-r border-white" />
                <span aria-hidden="true" className="absolute bottom-0 left-0 h-1.5 w-1.5 border-b border-l border-white" />
                <span aria-hidden="true" className="absolute right-0 bottom-0 h-1.5 w-1.5 border-r border-b border-white" />
                Masuk Portal
              </Link>
            </span>
          </div>
        }
      >
        {isi}
      </CangkangPublik>
    );
  }

  return <div className="flex min-w-0 flex-1 flex-col gap-8">{isi}</div>;
}
