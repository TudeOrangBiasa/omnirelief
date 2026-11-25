"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@omnirelief/ui/components/alert";
import { Badge } from "@omnirelief/ui/components/badge";
import { Button } from "@omnirelief/ui/components/button";
import { Input } from "@omnirelief/ui/components/input";
import { Skeleton } from "@omnirelief/ui/components/skeleton";
import { baris, type DashboardRow } from "@/lib/supabase/baris";
import { formatWaktuID, persenPemenuhan } from "@/lib/tanggal";
import { selCsv } from "@/lib/csv";
import { kulitPublik } from "@/lib/kulit";
import { CangkangPublik } from "@/components/cangkang-publik";
import TombolKeAtas from "@/components/tombol-ke-atas";
import Logo from "@/components/logo";

type StatusMuat = "memuat" | "siap" | "gagal";
type FilterStatus = "semua" | "kurang" | "aman";
type KunciUrut = "pemenuhan" | "selisih" | "nama";

function BarPemenuhan({ persen, label }: { persen: number; label: string }) {
  const kritis = persen < 50;
  return (
    <div
      className="h-2 w-full overflow-hidden rounded-full bg-muted"
      role="img"
      aria-label={label}
    >
      <div
        className={`h-2 rounded-full ${kritis ? "bg-destructive" : "bg-success"}`}
        style={{ width: `${Math.max(0, Math.min(100, persen))}%` }}
      />
    </div>
  );
}

export default function IsiDasbor({ masuk }: { masuk: boolean }) {
  const [data, setData] = useState<DashboardRow[]>([]);
  const [status, setStatus] = useState<StatusMuat>("memuat");
  const [cari, setCari] = useState("");
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("semua");
  const [kunciUrut, setKunciUrut] = useState<KunciUrut>("pemenuhan");
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

  const ringkas = useMemo(() => {
    const totalButuh = data.reduce((s, p) => s + p.butuh, 0);
    const totalDikirim = data.reduce((s, p) => s + p.dikirim, 0);
    const totalDiterima = data.reduce((s, p) => s + p.diterima, 0);
    const totalDiJalan = data.reduce((s, p) => s + Math.max(0, p.dikirim - p.diterima), 0);
    const selisihTerbuka = data.reduce((s, p) => s + Math.max(0, p.selisih), 0);
    const kurang = data.filter((p) => p.selisih > 0).length;
    const persen = data.map((p) => persenPemenuhan(p.butuh, p.diterima));
    const sebaran = {
      kritis: persen.filter((x) => x < 50).length,
      kejar: persen.filter((x) => x >= 50 && x < 100).length,
      tuntas: persen.filter((x) => x >= 100).length,
    };
    return {
      totalButuh,
      totalDikirim,
      totalDiterima,
      totalDiJalan,
      selisihTerbuka,
      kurang,
      aman: data.length - kurang,
      sebaran,
      persenGlobal: persenPemenuhan(totalButuh, totalDiterima),
    };
  }, [data]);

  const kritis = useMemo(
    () => [...data].filter((p) => p.selisih > 0).sort((a, b) => b.selisih - a.selisih).slice(0, 5),
    [data],
  );

  const tampil = useMemo(() => {
    const kata = cari.trim().toLowerCase();
    const saring = data.filter((p) => {
      if (filterStatus === "kurang" && p.selisih <= 0) return false;
      if (filterStatus === "aman" && p.selisih > 0) return false;
      if (kata === "") return true;
      return (
        p.posko_nama.toLowerCase().includes(kata) ||
        p.wilayah.toLowerCase().includes(kata)
      );
    });
    return [...saring].sort((a, b) => {
      if (kunciUrut === "nama") return a.posko_nama.localeCompare(b.posko_nama, "id");
      if (kunciUrut === "selisih") return b.selisih - a.selisih;
      return persenPemenuhan(a.butuh, a.diterima) - persenPemenuhan(b.butuh, b.diterima);
    });
  }, [data, cari, filterStatus, kunciUrut]);

  function unduhCsv() {
    const judul = ["posko", "wilayah", "butuh", "dikirim", "diterima", "di_jalan", "persen_pemenuhan", "selisih"];
    const barisData = tampil.map((p) =>
      [
        selCsv(p.posko_nama),
        selCsv(p.wilayah),
        selCsv(p.butuh),
        selCsv(p.dikirim),
        selCsv(p.diterima),
        selCsv(Math.max(0, p.dikirim - p.diterima)),
        selCsv(persenPemenuhan(p.butuh, p.diterima)),
        selCsv(p.selisih),
      ].join(","),
    );
    const isi = ["\uFEFF" + judul.join(","), ...barisData].join("\n");
    const blob = new Blob([isi], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const tautan = document.createElement("a");
    tautan.href = url;
    tautan.download = "dasbor-pemenuhan-posko.csv";
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
    tombolGhost,
    inputKelas,
    saringAktif,
  } = kulitPublik(masuk);

  const isi = (
    <>
      <div>
        <p className={`t-micro ${teksRedup}`}>{masuk ? "Sudah masuk · ringkas untuk ambil keputusan" : "Tanpa login · ringkas untuk ambil keputusan"}</p>
        <h1 className={`t-h1 t-balance mt-2 ${teksJudul}`}>Dasbor bantuan</h1>
        <p className={`t-pretty mt-2 max-w-xl ${teksRedup}`}>
          Posko paling butuh tampil paling atas, lengkap dengan arus barang dan sebaran pemenuhan. Butuh rincian per posko atau cek kode manifest, buka ledger transparansi.
        </p>
      </div>

      <section aria-label="Sumber dan masa data" className={`grid grid-cols-1 gap-2 rounded-none p-4 text-sm sm:grid-cols-2 md:items-start md:gap-x-6 lg:grid-cols-4 ${panelInfo}`}>
        <p><span className={`font-mono text-[11px] tracking-[0.15em] uppercase ${teksLabel}`}>Penerbit</span><br /><span className="font-semibold">BPBD</span></p>
        <p><span className={`font-mono text-[11px] tracking-[0.15em] uppercase ${teksLabel}`}>Periode Pemantauan</span><br /><span className="font-semibold">Aktif</span></p>
        <p><span className={`font-mono text-[11px] tracking-[0.15em] uppercase ${teksLabel}`}>Sumber Data</span><br /><span className="font-semibold">Ledger Terkunci</span></p>
        <p><span className={`font-mono text-[11px] tracking-[0.15em] uppercase ${teksLabel}`}>Waktu Pembaruan Terakhir</span><br /><span className="t-angka font-semibold tabular-nums">{status === "siap" && waktuMuat ? formatWaktuID(waktuMuat) : "Belum dimuat"}</span></p>
      </section>

        <div className="flex flex-wrap gap-2 print:hidden">
          <Button
            type="button"
            onClick={() => void muat()}
            disabled={status === "memuat"}
            className={`min-h-12 rounded-none px-6 font-semibold ${masuk ? "" : "bg-white text-[#0B1F2E] hover:bg-white/90"}`}
          >
            {status === "memuat" ? "Memuat..." : "Segarkan angka"}
          </Button>
          <Button
            type="button"
            onClick={unduhCsv}
            disabled={status !== "siap" || tampil.length === 0}
            variant="outline"
            className={`min-h-12 rounded-none border px-6 font-semibold ${tombolGhost}`}
          >
            Unduh CSV
          </Button>
        </div>

        {status === "gagal" && (
          <Alert variant="destructive" role="alert">
            <AlertTitle>Gagal memuat dasbor</AlertTitle>
            <AlertDescription>Periksa koneksi lalu tekan Segarkan angka.</AlertDescription>
          </Alert>
        )}

        {status === "memuat" && (
          <div role="status" aria-label="Memuat dasbor" className="grid grid-cols-2 gap-px lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-28 rounded-none" />
            ))}
          </div>
        )}

        {status === "siap" && (
          <>
            <section aria-label="Angka hari ini" className="grid grid-cols-2 gap-px overflow-hidden rounded-none border border-[#0B1F2E]/20 bg-[#0B1F2E]/20 text-[#0B1F2E] lg:grid-cols-4">
              <div className="flex flex-col gap-1 bg-[#DCE8EE] p-6 md:p-8">
                <span className="t-h2 t-angka text-primary tabular-nums">{data.length}</span>
                <span className="text-xs text-muted-foreground md:text-sm">Posko terpantau</span>
                {ringkas.kurang > 0 ? (
                  <Badge variant="destructive" className="mt-1 w-fit rounded-none">{ringkas.kurang} kurang</Badge>
                ) : (
                  <Badge variant="outline" className="mt-1 w-fit rounded-none border-transparent bg-success-bg text-success-badge-fg">Semua aman</Badge>
                )}
              </div>
              <div className="flex flex-col gap-1 bg-[#DCE8EE] p-6 md:p-8">
                <span className="t-h2 t-angka text-primary tabular-nums">{ringkas.totalButuh}</span>
                <span className="text-xs text-muted-foreground md:text-sm">Total butuh (jiwa)</span>
                <Badge variant="outline" className="mt-1 w-fit rounded-none">Jatah disetujui</Badge>
              </div>
              <div className="flex flex-col gap-1 bg-[#DCE8EE] p-6 md:p-8">
                <span className="t-h2 t-angka text-primary tabular-nums">{ringkas.persenGlobal}%</span>
                <span className="text-xs text-muted-foreground md:text-sm">Terpenuhi global</span>
                <BarPemenuhan persen={ringkas.persenGlobal} label={`Pemenuhan global ${ringkas.persenGlobal} persen`} />
              </div>
              <div className="flex flex-col gap-1 bg-[#DCE8EE] p-6 md:p-8">
                <span className="t-h2 t-angka text-destructive tabular-nums">{ringkas.selisihTerbuka}</span>
                <span className="text-xs text-muted-foreground md:text-sm">Selisih terbuka</span>
                {ringkas.selisihTerbuka > 0 ? (
                  <Badge variant="destructive" className="mt-1 w-fit rounded-none">Perlu kirim</Badge>
                ) : (
                  <Badge variant="outline" className="mt-1 w-fit rounded-none border-transparent bg-success-bg text-success-badge-fg">Nol, semua cukup</Badge>
                )}
              </div>
            </section>

            <section aria-label="Arus barang dan sebaran" className={`flex flex-col gap-2 rounded-none p-4 text-sm md:flex-row md:flex-wrap md:items-center md:gap-x-6 ${panelInfo}`}>
              <p><span className={`font-mono text-[11px] tracking-[0.15em] uppercase ${teksLabel}`}>Dikirim</span><br /><span className="t-angka font-semibold tabular-nums">{ringkas.totalDikirim}</span></p>
              <p><span className={`font-mono text-[11px] tracking-[0.15em] uppercase ${teksLabel}`}>Diterima</span><br /><span className="t-angka font-semibold tabular-nums">{ringkas.totalDiterima}</span></p>
              <p><span className={`font-mono text-[11px] tracking-[0.15em] uppercase ${teksLabel}`}>Di jalan</span><br /><span className="t-angka font-semibold tabular-nums">{ringkas.totalDiJalan}</span></p>
              <p><span className={`font-mono text-[11px] tracking-[0.15em] uppercase ${teksLabel}`}>Sebaran posko</span><br /><span className="font-semibold">Kritis {ringkas.sebaran.kritis} · Kejar {ringkas.sebaran.kejar} · Tuntas {ringkas.sebaran.tuntas}</span></p>
              <p><span className={`font-mono text-[11px] tracking-[0.15em] uppercase ${teksLabel}`}>Aman</span><br /><span className="font-semibold">{ringkas.aman} dari {data.length} posko</span></p>
            </section>

            <section aria-label="Butuh perhatian">
              <p className={`t-label ${teksRedup}`}>Prioritas kirim</p>
              <h2 className={`t-h2 t-balance mt-1 ${teksJudul}`}>Butuh perhatian dulu</h2>
              {kritis.length === 0 ? (
                <div role="status" className={`mt-3 rounded-none border border-dashed p-6 ${masuk ? "border-[#0B1F2E]/25 bg-white" : "border-white/30 bg-white/5"}`}>
                  <p className={`font-semibold ${masuk ? "text-foreground" : "text-white"}`}>Semua posko aman</p>
                  <p className={`mt-1 text-sm ${teksRedup}`}>Tidak ada selisih terbuka. Pantau terus lewat halaman ini.</p>
                </div>
              ) : (
                <ol className="mt-3 flex flex-col gap-3">
                  {kritis.map((p, i) => {
                    const persen = persenPemenuhan(p.butuh, p.diterima);
                    return (
                      <li key={p.posko_id} className="rounded-none bg-white p-4 md:p-5">
                        <div className="flex items-baseline gap-3">
                          <span aria-hidden="true" className="t-h2 t-angka text-[#0B1F2E]/30 tabular-nums">{String(i + 1).padStart(2, "0")}</span>
                          <div className="min-w-0 flex-1">
                            <p className="t-label text-muted-foreground">{p.wilayah}</p>
                            <p className="truncate text-base font-bold text-[#0B1F2E]">{p.posko_nama}</p>
                          </div>
                          <Badge variant="destructive" className="shrink-0 rounded-none">Kurang {p.selisih}</Badge>
                        </div>
                        <div className="mt-3">
                          <BarPemenuhan persen={persen} label={`${p.posko_nama} terpenuhi ${persen} persen`} />
                          <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                            Diterima {p.diterima} dari butuh {p.butuh} ({persen}%) · Dikirim {p.dikirim}{Math.max(0, p.dikirim - p.diterima) > 0 ? ` · Di jalan ${Math.max(0, p.dikirim - p.diterima)}` : ""}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>

            <section aria-label="Cari dan urutkan posko" className="flex flex-col gap-3">
              <div>
                <p className={`t-label ${teksRedup}`}>Semua posko</p>
                <h2 className={`t-h2 t-balance mt-1 ${teksJudul}`}>Pemenuhan tiap daerah</h2>
              </div>
              <div className="relative flex gap-2 print:hidden">
                <Input
                  id="cari-dasbor"
                  value={cari}
                  onChange={(e) => setCari(e.target.value)}
                  placeholder="Cari posko atau wilayah..."
                  aria-label="Cari posko"
                  className={`min-h-12 w-full flex-1 rounded-none border pr-12 ${inputKelas}`}
                />
              </div>
              <div className="flex flex-wrap items-center gap-2 print:hidden" role="group" aria-label="Saring status selisih">
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
                        ? `inline-flex min-h-12 items-center rounded-none px-4 t-label ${saringAktif}`
                        : `inline-flex min-h-12 items-center rounded-none border px-4 t-label ${masuk ? "border-input bg-white text-muted-foreground hover:text-foreground" : "border-white/25 bg-white/5 text-white/80 hover:bg-white/10"}`
                    }
                  >
                    {o.label}
                  </button>
                ))}
                <label htmlFor="urut-dasbor" className={`ml-auto t-label ${teksRedup}`}>
                  Urut
                </label>
                <select
                  id="urut-dasbor"
                  value={kunciUrut}
                  onChange={(e) => {
                    const v = e.target.value;
                    if (v === "pemenuhan" || v === "selisih" || v === "nama") setKunciUrut(v);
                  }}
                  className={`min-h-12 rounded-none border px-3 text-sm ${masuk ? "border-input bg-white text-foreground" : "border-white/25 bg-white/10 text-white"}`}
                >
                  <option value="pemenuhan" className="text-black">Pemenuhan terendah</option>
                  <option value="selisih" className="text-black">Selisih terbesar</option>
                  <option value="nama" className="text-black">Nama posko</option>
                </select>
              </div>
              {tampil.length === 0 ? (
                <div role="status" className={`rounded-none border border-dashed p-6 ${masuk ? "border-[#0B1F2E]/25 bg-white" : "border-white/30 bg-white/5"}`}>
                  <p className={`font-semibold ${masuk ? "text-foreground" : "text-white"}`}>Tidak ada hasil</p>
                  <p className={`mt-1 text-sm ${teksRedup}`}>Coba kata kunci lain atau ubah saringan.</p>
                  <button
                    type="button"
                    onClick={() => {
                      setCari("");
                      setFilterStatus("semua");
                    }}
                    className="mt-3 inline-flex min-h-12 items-center rounded-none bg-white px-4 text-sm font-semibold text-[#0B1F2E]"
                  >
                    Atur ulang
                  </button>
                </div>
              ) : (
                <ol className="flex flex-col gap-3">
                  {tampil.map((p) => {
                    const persen = persenPemenuhan(p.butuh, p.diterima);
                    return (
                      <li key={p.posko_id} className="rounded-none bg-white p-4 md:p-5">
                        <div className="flex flex-wrap items-center gap-2">
                          <div className="min-w-0 flex-1">
                            <p className="t-label text-muted-foreground">{p.wilayah}</p>
                            <p className="truncate text-base font-bold text-[#0B1F2E]">{p.posko_nama}</p>
                          </div>
                          {p.selisih > 0 ? (
                            <Badge variant="destructive" className="rounded-none">Kurang {p.selisih}</Badge>
                          ) : (
                            <Badge variant="outline" className="rounded-none border-transparent bg-success-bg text-success-badge-fg">Aman</Badge>
                          )}
                        </div>
                        <div className="mt-3">
                          <BarPemenuhan persen={persen} label={`${p.posko_nama} terpenuhi ${persen} persen`} />
                          <p className="mt-1 text-xs text-muted-foreground tabular-nums">
                            Diterima {p.diterima} dari butuh {p.butuh} ({persen}%) · Dikirim {p.dikirim}{Math.max(0, p.dikirim - p.diterima) > 0 ? ` · Di jalan ${Math.max(0, p.dikirim - p.diterima)}` : ""}
                          </p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              )}
            </section>

            <section aria-label="Tautan terkait" className="flex flex-col gap-2 sm:flex-row">
              <Link href="/transparansi" className={`inline-flex min-h-12 flex-1 items-center justify-center rounded-none border px-4 text-sm font-semibold ${tombolGhost}`}>
                Buka ledger transparansi
              </Link>
              <Link href="/audit" className={`inline-flex min-h-12 flex-1 items-center justify-center rounded-none border px-4 text-sm font-semibold ${tombolGhost}`}>
                Verifikasi rantai hash
              </Link>
            </section>
          </>
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
              <Link href="/transparansi" className="hidden min-h-12 items-center font-mono text-[11px] tracking-[0.15em] text-white/80 uppercase hover:text-white sm:inline-flex">
                ← Transparansi
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
