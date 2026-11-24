import Link from "next/link";
import { Button, buttonVariants } from "@omnirelief/ui/components/button";
import { cn } from "@omnirelief/ui/lib/utils";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@omnirelief/ui/components/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@omnirelief/ui/components/empty";
import { Input } from "@omnirelief/ui/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@omnirelief/ui/components/table";
import { KepalaHalaman } from "@/components/kepala-halaman";
import { createAdminClient } from "@/lib/supabase/admin";
import { baris } from "@/lib/supabase/baris";
import { GENESIS_HASH, verifyLog } from "@/lib/hash";
import {
  catatanRamah,
  formatHariLokal,
  formatTanggalLokal,
  labelStatusRiwayat,
} from "@/lib/tanggal";

export const dynamic = "force-dynamic";

type LogMentah = {
  id: number;
  manifest_id: number;
  status: string;
  catatan: string | null;
  dibuat_oleh: string | null;
  dibuat_pada: string;
  hash: string;
  manifest: { kode: string; hash: string } | Array<{ kode: string; hash: string }> | null;
};

type BatchMentah = {
  id: number;
  kode_sumbangan: string;
  jumlah: number;
  tgl_masuk: string | null;
  sumber: string;
  status: string;
};

type LogSiap = {
  id: number;
  kode: string;
  status: string;
  catatan: string | null;
  pelaku: string;
  waktu: string;
  hash: string;
};

type BatchSiap = {
  kode: string;
  jumlah: number;
  masuk: string;
  sumber: string;
  status: string;
};

type FilterJenis = "semua" | "publikasi" | "perjalanan" | "penerimaan" | "selisih";
type FilterRentang = "semua" | "hari-ini" | "7-hari";

const STATUS_PUBLIKASI: Record<string, true> = {
  DIPUBLIKASIKAN: true,
  TERKUNCI_PUBLIK: true,
  TERKUNCI: true,
  DRAFT: true,
};
const STATUS_PERJALANAN: Record<string, true> = {
  KELUAR_GUDANG: true,
  DALAM_PERJALANAN: true,
  TIBA: true,
  CHECKIN: true,
  TERHAMBAT: true,
  DARURAT: true,
};
const STATUS_PENERIMAAN: Record<string, true> = { DITERIMA: true, PUNYA_LAPORAN: true };

const PILIHAN_JENIS: Array<{ nilai: FilterJenis; label: string }> = [
  { nilai: "semua", label: "Semua" },
  { nilai: "publikasi", label: "Publikasi dan Kunci" },
  { nilai: "perjalanan", label: "Perjalanan dan Check-in" },
  { nilai: "penerimaan", label: "Penerimaan Posko" },
  { nilai: "selisih", label: "Selisih dan Perlu Dicek" },
];

const PILIHAN_RENTANG: Array<{ nilai: FilterRentang; label: string }> = [
  { nilai: "semua", label: "Semua" },
  { nilai: "hari-ini", label: "Hari Ini" },
  { nilai: "7-hari", label: "7 Hari Terakhir" },
];

const PILIHAN_PER = [5, 10, 20];

/** Kelompok saring dari nilai status yang ada di data. Tak dikenal masuk selisih. */
function jenisDariStatus(status: string): Exclude<FilterJenis, "semua"> {
  if (STATUS_PUBLIKASI[status] === true) return "publikasi";
  if (STATUS_PERJALANAN[status] === true) return "perjalanan";
  if (STATUS_PENERIMAAN[status] === true) return "penerimaan";
  return "selisih";
}

function teks(param: string | string[] | undefined): string {
  return Array.isArray(param) ? (param[0] ?? "") : (param ?? "");
}

function lolosRentang(waktu: string, rentang: FilterRentang, kini: number): boolean {
  if (rentang === "semua") return true;
  const t = new Date(waktu).getTime();
  if (Number.isNaN(t)) return false;
  if (rentang === "hari-ini") {
    const hari = new Date(kini).toISOString().slice(0, 10);
    return new Date(t).toISOString().slice(0, 10) === hari;
  }
  return kini - t <= 7 * 86400000 && t <= kini;
}

function kelasStatus(status: string): string {
  const dasar =
    "inline-flex min-h-12 items-center rounded-none border px-2 font-mono text-[11px] uppercase tracking-widest tabular-nums";
  if (status === "DITERIMA") return `${dasar} border-green-700/40 bg-green-50 text-green-800`;
  if (status === "DIPUBLIKASIKAN") return `${dasar} border-[#0f79b8]/40 bg-[#DCE8EE] text-[#0B1F2E]`;
  if (status === "PERLU_DICEK" || status === "DARURAT")
    return `${dasar} border-red-700/40 bg-red-50 text-red-800`;
  if (status === "DIBATALKAN") return `${dasar} border-slate-500/40 bg-slate-100 text-slate-700`;
  if (status === "TERHAMBAT") return `${dasar} border-amber-600/40 bg-amber-50 text-amber-800`;
  if (status === "TERSEDIA") return `${dasar} border-green-700/40 bg-green-50 text-green-800`;
  if (status === "KRITIS") return `${dasar} border-amber-600/40 bg-amber-50 text-amber-800`;
  if (status === "HABIS") return `${dasar} border-slate-500/40 bg-slate-100 text-slate-700`;
  if (status === "DIALOKASIKAN" || status === "DIKIRIM")
    return `${dasar} border-[#0f79b8]/40 bg-[#DCE8EE] text-[#0B1F2E]`;
  return `${dasar} border-[#0B1F2E]/30 bg-white text-[#0B1F2E]`;
}

function kelasHalaman(aktif: boolean): string {
  return cn(
    buttonVariants({ variant: "outline" }),
    "min-h-12 rounded-none",
    aktif ? "" : "pointer-events-none opacity-50"
  );
}

function tautan(ubah: Record<string, string>, dasar: Record<string, string>): string {
  const gabung = { ...dasar, ...ubah };
  const p = new URLSearchParams();
  for (const [k, v] of Object.entries(gabung)) {
    if (v !== "") p.set(k, v);
  }
  const s = p.toString();
  return s === "" ? "/audit" : `/audit?${s}`;
}

export default async function AuditPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const param = await searchParams;
  const q = teks(param.q).trim();
  const jenisParam = teks(param.jenis);
  const rentangParam = teks(param.rentang);
  const jenis: FilterJenis = PILIHAN_JENIS.some((p) => p.nilai === jenisParam)
    ? (jenisParam as FilterJenis)
    : "semua";
  const rentang: FilterRentang = PILIHAN_RENTANG.some((p) => p.nilai === rentangParam)
    ? (rentangParam as FilterRentang)
    : "semua";
  const perRaw = Number(teks(param.per));
  const per = PILIHAN_PER.includes(perRaw) ? perRaw : 10;
  const hal = Math.max(1, Number(teks(param.hal)) || 1);
  const halb = Math.max(1, Number(teks(param.halb)) || 1);
  const dasar: Record<string, string> = {
    q,
    jenis: jenis === "semua" ? "" : jenis,
    rentang: rentang === "semua" ? "" : rentang,
    per: String(per),
    hal: String(hal),
    halb: String(halb),
  };
  const kini = Date.now();

  let logSiap: LogSiap[] = [];
  let batchSiap: BatchSiap[] = [];
  let galatMuat: string | null = null;
  let kodeRusak: string[] = [];
  let totalManifest = 0;
  let manifestTerverifikasi = 0;

  try {
    const admin = createAdminClient();
    const [hasilLog, hasilBatch] = await Promise.all([
      admin
        .from("manifest_log")
        .select("id,manifest_id,status,catatan,dibuat_oleh,dibuat_pada,hash,manifest:manifest_id(kode,hash)")
        .order("dibuat_pada", { ascending: false }),
      admin
        .from("stok_batch")
        .select("id,kode_sumbangan,jumlah,tgl_masuk,sumber,status")
        .order("tgl_masuk", { ascending: false }),
    ]);
    if (hasilLog.error) throw new Error("gagal memuat log manifest");
    if (hasilBatch.error) throw new Error("gagal memuat log sumbangan");

    const mentahLog = baris<LogMentah>(hasilLog.data);
    const perManifest = new Map<number, { kode: string; hashManifest: string; baris: LogMentah[] }>();
    for (const l of mentahLog) {
      const rel = Array.isArray(l.manifest) ? l.manifest[0] : l.manifest;
      const kode = rel?.kode ?? "?";
      const hashManifest = rel?.hash ?? GENESIS_HASH;
      const grup = perManifest.get(l.manifest_id);
      if (grup) grup.baris.push(l);
      else perManifest.set(l.manifest_id, { kode, hashManifest, baris: [l] });
    }
    totalManifest = perManifest.size;
    const rusak = new Set<string>();
    for (const { kode, hashManifest, baris: daftar } of perManifest.values()) {
      const urut = [...daftar].sort((a, b) => a.id - b.id);
      let sebelum = hashManifest;
      let ok = true;
      for (const l of urut) {
        if (!verifyLog({ manifestKode: kode, status: l.status, prevHash: sebelum, hash: l.hash })) {
          ok = false;
        }
        sebelum = l.hash;
      }
      if (!ok) rusak.add(kode);
    }
    kodeRusak = [...rusak].sort();
    manifestTerverifikasi = totalManifest - rusak.size;

    logSiap = mentahLog.map((l) => {
      const rel = Array.isArray(l.manifest) ? l.manifest[0] : l.manifest;
      return {
        id: l.id,
        kode: rel?.kode ?? "?",
        status: l.status,
        catatan: l.catatan,
        pelaku: l.dibuat_oleh ?? "Sistem",
        waktu: l.dibuat_pada,
        hash: l.hash,
      };
    });
    batchSiap = baris<BatchMentah>(hasilBatch.data).map((b) => ({
      kode: b.kode_sumbangan,
      jumlah: b.jumlah,
      masuk: b.tgl_masuk ?? "",
      sumber: b.sumber,
      status: b.status,
    }));
  } catch {
    galatMuat = "Gagal memuat audit log. Coba segarkan halaman.";
  }

  const qKecil = q.toLowerCase();
  const saringTeks = (hay: string) => qKecil === "" || hay.toLowerCase().includes(qKecil);
  const logSaring = logSiap.filter(
    (l) =>
      (jenis === "semua" || jenisDariStatus(l.status) === jenis) &&
      lolosRentang(l.waktu, rentang, kini) &&
      saringTeks(`${l.kode} ${l.status} ${labelStatusRiwayat(l.status)} ${l.catatan ?? ""} ${l.pelaku}`)
  );
  const batchSaring = batchSiap.filter(
    (b) =>
      lolosRentang(b.masuk, rentang, kini) &&
      saringTeks(`${b.kode} ${b.status} ${labelStatusRiwayat(b.status)} ${b.sumber}`)
  );

  const totalLog = logSaring.length;
  const totalBatch = batchSaring.length;
  const totalHalaman = Math.max(1, Math.ceil(totalLog / per));
  const totalHalamanBatch = Math.max(1, Math.ceil(totalBatch / per));
  const halAman = Math.min(hal, totalHalaman);
  const halbAman = Math.min(halb, totalHalamanBatch);
  const logTampil = logSaring.slice((halAman - 1) * per, halAman * per);
  const batchTampil = batchSaring.slice((halbAman - 1) * per, halbAman * per);
  const awalLog = totalLog === 0 ? 0 : (halAman - 1) * per + 1;
  const akhirLog = Math.min(totalLog, halAman * per);
  const awalBatch = totalBatch === 0 ? 0 : (halbAman - 1) * per + 1;
  const akhirBatch = Math.min(totalBatch, halbAman * per);
  const adaFilter = q !== "" || jenis !== "semua" || rentang !== "semua";
  const utuh = kodeRusak.length === 0;

  return (
    <main className="w-full max-w-[1400px] px-6 py-8 lg:px-10">
      <KepalaHalaman
        label="Pantau"
        judul="Audit log"
        deskripsi="Jejak append-only tiap status manifest dan tiap sumbangan masuk. Rantai hash membuktikan tidak ada ubah diam-diam."
        bergaris
      />

      <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card className="rounded-none border border-slate-200 bg-white shadow-xs">
          <CardHeader>
            <p className="font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E]/70">
              Total Log Tercatat
            </p>
            <CardTitle className="text-3xl font-bold tabular-nums text-[#0B1F2E]">
              {galatMuat ? "-" : logSiap.length + batchSiap.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Semua baris riwayat di rantai.</p>
          </CardContent>
        </Card>
        <Card className="rounded-none border border-slate-200 bg-white shadow-xs">
          <CardHeader>
              <p className="font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E]/70">
              Log Manifest
            </p>
            <CardTitle className="text-3xl font-bold tabular-nums text-[#0B1F2E]">
              {galatMuat ? "-" : logSiap.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Perubahan status kiriman.</p>
          </CardContent>
        </Card>
        <Card className="rounded-none border border-slate-200 bg-white shadow-xs">
          <CardHeader>
              <p className="font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E]/70">
              Log Sumbangan
            </p>
            <CardTitle className="text-3xl font-bold tabular-nums text-[#0B1F2E]">
              {galatMuat ? "-" : batchSiap.length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Batch sumbangan tercatat.</p>
          </CardContent>
        </Card>
        <Card className="rounded-none border border-slate-200 bg-white shadow-xs">
          <CardHeader>
              <p className="font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E]/70">
              Status Integritas Hash
            </p>
            <CardTitle
              className={`text-3xl font-bold tabular-nums ${utuh ? "text-green-800" : "text-red-800"}`}
            >
              {galatMuat ? "-" : utuh ? `Terverifikasi ${manifestTerverifikasi}/${totalManifest}` : `Rusak pada ${kodeRusak[0]}`}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              {galatMuat
                ? "Belum bisa diperiksa."
                : utuh
                  ? "Tiap baris terikat ke hash sebelumnya."
                  : `Rantai putus: ${kodeRusak.join(", ")}.`}
            </p>
          </CardContent>
        </Card>
      </div>

      {galatMuat ? (
        <div className="mt-6 rounded-none border border-dashed border-[#0B1F2E]/30 bg-white p-8 text-center">
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E]/70">Gagal</p>
          <p className="mt-2 font-semibold text-[#0B1F2E]">{galatMuat}</p>
          <a href="/audit" className={cn(buttonVariants(), "mt-4 min-h-12 rounded-none")}>
            Coba lagi
          </a>
        </div>
      ) : (
        <>
          <form
            method="get"
            action="/audit"
            className="mt-6 flex flex-col gap-2 rounded-none border border-[#0B1F2E]/15 bg-[#DCE8EE] p-3"
          >
            <div className="flex flex-col gap-2 sm:flex-row">
              <div className="relative flex-1">
                <label htmlFor="cari-audit" className="sr-only">
                  Cari kode atau catatan
                </label>
                <Input
                  id="cari-audit"
                  name="q"
                  type="search"
                  defaultValue={q}
                  placeholder="Cari kode atau catatan"
                  className="min-h-12 w-full rounded-none border border-[#0B1F2E]/25 bg-white pr-12 text-[#0B1F2E] placeholder:text-[#0B1F2E]/70"
                />
                {q !== "" && (
                  <a
                    href={tautan({ q: "", hal: "1", halb: "1" }, dasar)}
                    aria-label="Hapus pencarian"
                    className="absolute top-1 right-1 flex min-h-12 min-w-12 items-center justify-center rounded-none text-[#0B1F2E] hover:bg-[#0B1F2E]/10"
                  >
                    ×
                  </a>
                )}
              </div>
              <Button type="submit" className="min-h-12 rounded-none">
                Terapkan
              </Button>
            </div>
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Jenis log">
                <span className="font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E]/70">
                Jenis:
              </span>
              {PILIHAN_JENIS.map((p) => (
                <a
                  key={p.nilai}
                  href={tautan({ jenis: p.nilai === "semua" ? "" : p.nilai, hal: "1" }, dasar)}
                  aria-pressed={jenis === p.nilai}
                  className={
                    jenis === p.nilai
                      ? "inline-flex min-h-12 items-center rounded-none bg-[#0B1F2E] px-4 font-mono text-[11px] uppercase tracking-widest text-white"
                      : "inline-flex min-h-12 items-center rounded-none border border-[#0B1F2E]/30 bg-white px-4 font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E] hover:bg-white"
                  }
                >
                  {p.label}
                  </a>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2" role="group" aria-label="Rentang waktu">
                <span className="font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E]/70">
                Rentang:
              </span>
              {PILIHAN_RENTANG.map((p) => (
                <a
                  key={p.nilai}
                  href={tautan({ rentang: p.nilai === "semua" ? "" : p.nilai, hal: "1", halb: "1" }, dasar)}
                  aria-pressed={rentang === p.nilai}
                  className={
                    rentang === p.nilai
                      ? "inline-flex min-h-12 items-center rounded-none bg-[#0B1F2E] px-4 font-mono text-[11px] uppercase tracking-widest text-white"
                      : "inline-flex min-h-12 items-center rounded-none border border-[#0B1F2E]/30 bg-white px-4 font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E] hover:bg-white"
                  }
                >
                  {p.label}
                  </a>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <label
                htmlFor="per-halaman"
                className="font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E]/70"
              >
                Baris per halaman:
              </label>
              <div className="flex gap-2" role="group" aria-label="Baris per halaman">
                {PILIHAN_PER.map((n) => (
                  <a
                    key={n}
                    href={tautan({ per: String(n), hal: "1", halb: "1" }, dasar)}
                    aria-pressed={per === n}
                    className={
                      per === n
                        ? "inline-flex min-h-12 items-center rounded-none bg-[#0B1F2E] px-4 font-mono text-[11px] uppercase tracking-widest text-white tabular-nums"
                        : "inline-flex min-h-12 items-center rounded-none border border-[#0B1F2E]/30 bg-white px-4 font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E] tabular-nums hover:bg-white"
                    }
                  >
                    {n}
                  </a>
                ))}
              </div>
              <button
                id="unduh-csv"
                type="button"
                className="inline-flex min-h-12 items-center rounded-none border border-[#0B1F2E]/30 bg-white px-4 font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E] hover:bg-[#0B1F2E]/5"
              >
                Unduh CSV Audit Log
              </button>
            </div>
          </form>

          <section aria-label="Log manifest" className="mt-6">
            <h2 className="font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E]/70">
              Log Manifest
            </h2>
            {logTampil.length === 0 ? (
              <div className="mt-2 rounded-none border border-dashed border-[#0B1F2E]/30 bg-white p-8 text-center">
                <p className="font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E]/70">
                  Kosong
                </p>
                <p className="mt-2 font-semibold text-[#0B1F2E]">Tidak ada log manifest yang cocok.</p>
                {adaFilter && (
                  <a href="/audit" className={cn(buttonVariants(), "mt-4 min-h-12 rounded-none")}>
                    Atur ulang
                  </a>
                )}
              </div>
            ) : (
              <div className="mt-2 overflow-x-auto rounded-none border border-slate-200 bg-white">
                <Table id="tabel-log">
                  <TableHeader>
                    <TableRow className="bg-[#0B1F2E] hover:bg-[#0B1F2E]">
                      <TableHead className="font-mono text-[11px] uppercase tracking-widest text-white">
                        Waktu
                      </TableHead>
                      <TableHead className="font-mono text-[11px] uppercase tracking-widest text-white">
                        Kode
                      </TableHead>
                      <TableHead className="font-mono text-[11px] uppercase tracking-widest text-white">
                        Status
                      </TableHead>
                      <TableHead className="font-mono text-[11px] uppercase tracking-widest text-white">
                        Catatan
                      </TableHead>
                      <TableHead className="font-mono text-[11px] uppercase tracking-widest text-white">
                        Pelaku
                      </TableHead>
                      <TableHead className="font-mono text-[11px] uppercase tracking-widest text-white">
                        Hash
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logTampil.map((l) => (
                      <TableRow key={l.id}>
                        <TableCell className="whitespace-nowrap tabular-nums">
                          {formatTanggalLokal(l.waktu)}
                        </TableCell>
                        <TableCell>
                          <Link
                            href={`/m/${l.kode}`}
                        className="font-mono text-[13px] text-[#0f79b8] underline underline-offset-2"
                          >
                            {l.kode}
                          </Link>
                        </TableCell>
                        <TableCell>
                          <span className={kelasStatus(l.status)}>{labelStatusRiwayat(l.status)}</span>
                        </TableCell>
                        <TableCell className="max-w-64">{catatanRamah(l.catatan) ?? "-"}</TableCell>
                        <TableCell className="max-w-40 truncate font-mono text-xs" title={l.pelaku}>
                          {l.pelaku}
                        </TableCell>
                        <TableCell>
                          <span className="font-mono text-xs tabular-nums" title={l.hash}>
                            {l.hash.length > 12 ? l.hash.slice(0, 12) : l.hash}
                          </span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="mt-2 flex flex-col gap-2 pl-2 sm:flex-row sm:items-center">
              <p className="flex-1 text-sm tabular-nums text-muted-foreground" role="status">
                Menampilkan {awalLog}–{akhirLog} dari {totalLog}
              </p>
              <div className="flex gap-2">
                <a
                  href={halAman <= 1 ? undefined : tautan({ hal: String(halAman - 1) }, dasar)}
                  aria-disabled={halAman <= 1}
                  className={kelasHalaman(halAman > 1)}
                >
                  Sebelumnya
                </a>
                <a
                  href={
                    halAman >= totalHalaman ? undefined : tautan({ hal: String(halAman + 1) }, dasar)
                  }
                  aria-disabled={halAman >= totalHalaman}
                  className={kelasHalaman(halAman < totalHalaman)}
                >
                  Berikutnya
                </a>
              </div>
            </div>
          </section>

          <section aria-label="Log sumbangan" className="mt-8">
            <h2 className="font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E]/70">
              Log Sumbangan
            </h2>
            {batchTampil.length === 0 ? (
              <div className="mt-2 rounded-none border border-dashed border-[#0B1F2E]/30 bg-white p-8 text-center">
                <p className="font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E]/70">
                  Kosong
                </p>
                <p className="mt-2 font-semibold text-[#0B1F2E]">Tidak ada log sumbangan yang cocok.</p>
                {adaFilter && (
                  <a href="/audit" className={cn(buttonVariants(), "mt-4 min-h-12 rounded-none")}>
                    Atur ulang
                  </a>
                )}
              </div>
            ) : (
              <div className="mt-2 overflow-x-auto rounded-none border border-slate-200 bg-white">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-[#0B1F2E] hover:bg-[#0B1F2E]">
                      <TableHead className="font-mono text-[11px] uppercase tracking-widest text-white">
                        Kode
                      </TableHead>
                      <TableHead className="font-mono text-[11px] uppercase tracking-widest text-white">
                        Jumlah
                      </TableHead>
                      <TableHead className="font-mono text-[11px] uppercase tracking-widest text-white">
                        Tanggal Masuk
                      </TableHead>
                      <TableHead className="font-mono text-[11px] uppercase tracking-widest text-white">
                        Sumber
                      </TableHead>
                      <TableHead className="font-mono text-[11px] uppercase tracking-widest text-white">
                        Status
                      </TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {batchTampil.map((b) => (
                      <TableRow key={b.kode}>
                        <TableCell>
                          <Link
                            href={`/s/${b.kode}`}
                        className="font-mono text-[13px] text-[#0f79b8] underline underline-offset-2"
                          >
                            {b.kode}
                          </Link>
                        </TableCell>
                        <TableCell className="tabular-nums">{b.jumlah}</TableCell>
                        <TableCell className="whitespace-nowrap tabular-nums">
                          {b.masuk === "" ? "-" : formatHariLokal(b.masuk)}
                        </TableCell>
                        <TableCell>{b.sumber}</TableCell>
                        <TableCell>
                          <span className={kelasStatus(b.status)}>{labelStatusRiwayat(b.status)}</span>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
            <div className="mt-2 flex flex-col gap-2 pl-2 sm:flex-row sm:items-center">
              <p className="flex-1 text-sm tabular-nums text-muted-foreground" role="status">
                Menampilkan {awalBatch}–{akhirBatch} dari {totalBatch}
              </p>
              <div className="flex gap-2">
                <a
                  href={halbAman <= 1 ? undefined : tautan({ halb: String(halbAman - 1) }, dasar)}
                  aria-disabled={halbAman <= 1}
                  className={kelasHalaman(halbAman > 1)}
                >
                  Sebelumnya
                </a>
                <a
                  href={
                    halbAman >= totalHalamanBatch
                      ? undefined
                      : tautan({ halb: String(halbAman + 1) }, dasar)
                  }
                  aria-disabled={halbAman >= totalHalamanBatch}
                  className={kelasHalaman(halbAman < totalHalamanBatch)}
                >
                  Berikutnya
                </a>
              </div>
            </div>
          </section>

          {logSiap.length === 0 && batchSiap.length === 0 && !adaFilter ? (
            <Empty className="mt-6 rounded-none border border-dashed border-[#0B1F2E]/30">
              <EmptyHeader>
                <EmptyMedia variant="icon">
                  <span aria-hidden="true" className="font-mono text-xl text-[#0B1F2E]/50">
                    #
                  </span>
                </EmptyMedia>
                <EmptyTitle>Belum ada audit log</EmptyTitle>
                <EmptyDescription>
                  Riwayat muncul setelah manifest dipublikasikan dan sumbangan dicatat.
                </EmptyDescription>
              </EmptyHeader>
            </Empty>
          ) : null}

          <script
            dangerouslySetInnerHTML={{
              __html: `(function(){var t=document.getElementById("unduh-csv");if(!t)return;t.addEventListener("click",function(){var tabel=document.getElementById("tabel-log");if(!tabel)return;var baris=[];var kepala=Array.prototype.map.call(tabel.querySelectorAll("thead th"),function(h){return '"'+h.textContent.trim().replace(/"/g,'""')+'"';});baris.push(kepala.join(","));Array.prototype.forEach.call(tabel.querySelectorAll("tbody tr"),function(tr){var sel=Array.prototype.map.call(tr.querySelectorAll("td"),function(td){var a=td.querySelector("a");var v=a?a.textContent.trim():td.textContent.trim();return '"'+v.replace(/"/g,'""')+'"';});baris.push(sel.join(","));});var blob=new Blob([baris.join("\\n")],{type:"text/csv;charset=utf-8"});var url=URL.createObjectURL(blob);var taut=document.createElement("a");taut.href=url;taut.download="audit-log.csv";document.body.appendChild(taut);taut.click();document.body.removeChild(taut);URL.revokeObjectURL(url);});})();`,
            }}
          />
        </>
      )}
    </main>
  );
}
