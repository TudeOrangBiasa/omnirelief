"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@omnirelief/ui/components/alert";
import { Badge } from "@omnirelief/ui/components/badge";
import { Button } from "@omnirelief/ui/components/button";
import { Input } from "@omnirelief/ui/components/input";
import { Skeleton } from "@omnirelief/ui/components/skeleton";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@omnirelief/ui/components/table";
import { baris } from "@/lib/supabase/baris";
import { selCsv } from "@/lib/csv";

type StatusMuat = "memuat" | "siap" | "gagal";

type PenggunaRow = {
  id: string;
  nama: string;
  peran: string;
  posko_id: number | null;
  aktif: boolean | null;
  dibuat_pada: string;
  posko: { nama: string } | null;
};

type LogRow = {
  id: number;
  status: string;
  catatan: string | null;
  dibuat_pada: string;
  manifest: { kode: string } | Array<{ kode: string }> | null;
};

type Ringkas = {
  pengguna: number;
  posko: number;
  batch: number;
  manifest: number;
  log: number;
};

const PERAN_OPSI = ["BPBD", "GUDANG", "POSKO", "TIM", "ADMIN"] as const;

function kodeLog(manifest: LogRow["manifest"]): string {
  if (!manifest) return "-";
  if (Array.isArray(manifest)) return manifest[0]?.kode ?? "-";
  return manifest.kode;
}

function unduh(namaFile: string, judul: string[], isi: string[][]) {
  const teks = ["\uFEFF" + judul.join(","), ...isi.map((b) => b.join(","))].join("\n");
  const blob = new Blob([teks], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const tautan = document.createElement("a");
  tautan.href = url;
  tautan.download = namaFile;
  document.body.appendChild(tautan);
  tautan.click();
  tautan.remove();
  URL.revokeObjectURL(url);
}

export default function IsiAdmin() {
  const [pengguna, setPengguna] = useState<PenggunaRow[]>([]);
  const [log, setLog] = useState<LogRow[]>([]);
  const [ringkas, setRingkas] = useState<Ringkas | null>(null);
  const [status, setStatus] = useState<StatusMuat>("memuat");
  const [galat, setGalat] = useState("");
  const [sibuk, setSibuk] = useState(false);
  const [pesan, setPesan] = useState("");

  const [namaUndang, setNamaUndang] = useState("");
  const [emailUndang, setEmailUndang] = useState("");
  const [peranUndang, setPeranUndang] = useState<string>("POSKO");

  const [calonNonaktif, setCalonNonaktif] = useState<PenggunaRow | null>(null);
  const [ketikNama, setKetikNama] = useState("");

  const muat = useCallback(() => {
    setStatus("memuat");
    setGalat("");
    Promise.all([
      fetch("/api/admin/pengguna").then((r) => r.json()),
      fetch("/api/admin/ringkas").then((r) => r.json()),
      fetch("/api/admin/log").then((r) => r.json()),
    ])
      .then(([p, r, l]: [{ ok: boolean; pengguna?: unknown }, { ok: boolean; ringkas?: unknown }, { ok: boolean; log?: unknown }]) => {
        if (!p.ok || !r.ok || !l.ok) throw new Error("gagal");
        setPengguna(baris<PenggunaRow>(p.pengguna));
        setRingkas((r.ringkas ?? null) as Ringkas | null);
        setLog(baris<LogRow>(l.log));
        setStatus("siap");
      })
      .catch(() => {
        setStatus("gagal");
        setGalat("Gagal memuat data admin. Periksa koneksi lalu coba lagi.");
      });
  }, []);

  useEffect(() => {
    muat();
  }, [muat]);

  const metrik = useMemo(() => {
    if (!ringkas) return [];
    return [
      { angka: String(ringkas.pengguna), label: "Pengguna" },
      { angka: String(ringkas.posko), label: "Posko" },
      { angka: String(ringkas.batch), label: "Batch sumbangan" },
      { angka: String(ringkas.manifest), label: "Manifest" },
      { angka: String(ringkas.log), label: "Baris log" },
    ];
  }, [ringkas]);

  function unduhPemakaian() {
    if (!ringkas) return;
    unduh("pemakaian-omnirelief.csv", ["metrik", "jumlah"], [
      ["pengguna", selCsv(ringkas.pengguna)],
      ["posko", selCsv(ringkas.posko)],
      ["batch", selCsv(ringkas.batch)],
      ["manifest", selCsv(ringkas.manifest)],
      ["log", selCsv(ringkas.log)],
    ]);
  }

  function unduhPengguna() {
    unduh(
      "pengguna-omnirelief.csv",
      ["nama", "peran", "posko", "aktif", "dibuat"],
      pengguna.map((p) => [
        selCsv(p.nama),
        selCsv(p.peran),
        selCsv(p.posko?.nama ?? "-"),
        selCsv(p.aktif === false ? "nonaktif" : "aktif"),
        selCsv(p.dibuat_pada),
      ])
    );
  }

  function unduhLog() {
    unduh(
      "log-audit-omnirelief.csv",
      ["id", "kode", "status", "catatan", "waktu"],
      log.map((l) => [
        selCsv(l.id),
        selCsv(kodeLog(l.manifest)),
        selCsv(l.status),
        selCsv(l.catatan ?? ""),
        selCsv(l.dibuat_pada),
      ])
    );
  }

  async function kirimUndang(e: React.FormEvent) {
    e.preventDefault();
    if (sibuk) return;
    setSibuk(true);
    setPesan("");
    try {
      const res = await fetch("/api/admin/undang", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ nama: namaUndang, email: emailUndang, peran: peranUndang }),
      });
      const data = (await res.json()) as { ok: boolean; galat?: string; email?: string };
      if (!data.ok) throw new Error(data.galat ?? "gagal mengundang");
      setPesan(`Undangan terkirim ke ${data.email}.`);
      setNamaUndang("");
      setEmailUndang("");
      muat();
    } catch (err) {
      setPesan(err instanceof Error ? err.message : "Gagal mengundang.");
    } finally {
      setSibuk(false);
    }
  }

  async function ubahPeran(p: PenggunaRow, peran: string) {
    setPesan("");
    try {
      const res = await fetch("/api/admin/pengguna", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, peran }),
      });
      const data = (await res.json()) as { ok: boolean; galat?: string };
      if (!data.ok) throw new Error(data.galat ?? "gagal menyimpan peran");
      setPesan(`Peran ${p.nama} jadi ${peran}.`);
      muat();
    } catch (err) {
      setPesan(err instanceof Error ? err.message : "Gagal menyimpan peran.");
    }
  }

  async function ubahAktif(p: PenggunaRow, aktif: boolean) {
    setPesan("");
    try {
      const res = await fetch("/api/admin/pengguna", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: p.id, aktif }),
      });
      const data = (await res.json()) as { ok: boolean; galat?: string };
      if (!data.ok) throw new Error(data.galat ?? "gagal menyimpan status");
      setPesan(`${p.nama} ${aktif ? "diaktifkan" : "dinonaktifkan"}.`);
      setCalonNonaktif(null);
      setKetikNama("");
      muat();
    } catch (err) {
      setPesan(err instanceof Error ? err.message : "Gagal menyimpan status.");
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {status === "gagal" && (
        <Alert variant="destructive" role="alert">
          <AlertTitle>Gagal memuat admin</AlertTitle>
          <AlertDescription>{galat}</AlertDescription>
          <Button onClick={muat} className="mt-3 min-h-12 w-fit">
            Coba lagi
          </Button>
        </Alert>
      )}

      <section aria-label="Pemakaian">
        <p className="font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E]/70">Pemakaian</p>
        <h2 className="mt-1 text-xl font-bold text-[#0B1F2E]">Angka sistem</h2>
        {status === "memuat" ? (
          <div role="status" aria-label="Memuat angka" className="mt-3 grid grid-cols-2 gap-px lg:grid-cols-5">
            {[0, 1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-24 rounded-none" />
            ))}
          </div>
        ) : (
          <div className="mt-3 grid grid-cols-2 gap-px overflow-hidden rounded-none border border-[#0B1F2E]/20 bg-[#0B1F2E]/20 lg:grid-cols-5">
            {metrik.map((m) => (
              <div key={m.label} className="flex flex-col gap-1 bg-[#DCE8EE] p-5">
                <span className="t-angka text-2xl font-bold text-primary tabular-nums">{m.angka}</span>
                <span className="text-xs text-muted-foreground">{m.label}</span>
              </div>
            ))}
          </div>
        )}
        <div className="mt-3 flex flex-wrap gap-2">
          <Button type="button" onClick={unduhPemakaian} disabled={status !== "siap"} variant="outline" className="min-h-12 rounded-none">
            Unduh CSV pemakaian
          </Button>
          <Button type="button" onClick={unduhPengguna} disabled={status !== "siap"} variant="outline" className="min-h-12 rounded-none">
            Unduh CSV pengguna
          </Button>
          <Button type="button" onClick={unduhLog} disabled={status !== "siap"} variant="outline" className="min-h-12 rounded-none">
            Unduh CSV log audit
          </Button>
        </div>
      </section>

      {pesan !== "" && (
        <p role="status" className="rounded-none garis-rambut-diam bg-white p-3 text-sm">
          {pesan}
        </p>
      )}

      <section aria-label="Undang pengguna">
        <p className="font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E]/70">Akses baru</p>
        <h2 className="mt-1 text-xl font-bold text-[#0B1F2E]">Undang pengguna</h2>
        <form onSubmit={kirimUndang} className="mt-3 flex flex-col gap-2 rounded-none garis-rambut-diam bg-white p-4 sm:flex-row sm:items-end">
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
            Nama
            <Input value={namaUndang} onChange={(e) => setNamaUndang(e.target.value)} required maxLength={40} placeholder="Nama lengkap" className="min-h-12 rounded-none" />
          </label>
          <label className="flex min-w-0 flex-1 flex-col gap-1 text-sm">
            Email
            <Input type="email" value={emailUndang} onChange={(e) => setEmailUndang(e.target.value)} required placeholder="nama@contoh.id" className="min-h-12 rounded-none" />
          </label>
          <label className="flex flex-col gap-1 text-sm">
            Peran
            <select
              value={peranUndang}
              onChange={(e) => setPeranUndang(e.target.value)}
              className="min-h-12 rounded-none border border-input bg-white px-3 text-sm"
            >
              {PERAN_OPSI.map((r) => (
                <option key={r} value={r}>{r}</option>
              ))}
            </select>
          </label>
          <Button type="submit" disabled={sibuk} className="min-h-12 rounded-none sm:w-auto">
            {sibuk ? "Mengirim..." : "Kirim undangan"}
          </Button>
        </form>
      </section>

      <section aria-label="Daftar pengguna">
        <p className="font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E]/70">Akses</p>
        <h2 className="mt-1 text-xl font-bold text-[#0B1F2E]">Pengguna ({pengguna.length})</h2>
        {status === "memuat" ? (
          <div role="status" aria-label="Memuat pengguna" className="mt-3 flex flex-col gap-2">
            <Skeleton className="h-12 w-full rounded-none" />
            <Skeleton className="h-12 w-full rounded-none" />
          </div>
        ) : pengguna.length === 0 ? (
          <div role="status" className="mt-3 rounded-none border border-dashed border-[#0B1F2E]/25 bg-white p-6">
            <p className="font-semibold text-foreground">Belum ada pengguna</p>
            <p className="mt-1 text-sm text-muted-foreground">Undang pengguna pertama lewat formulir di atas.</p>
          </div>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-none garis-rambut-diam bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama</TableHead>
                  <TableHead>Peran</TableHead>
                  <TableHead>Posko</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>
                    <span className="sr-only">Aksi</span>
                  </TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {pengguna.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="font-semibold">{p.nama}</TableCell>
                    <TableCell>
                      <select
                        value={p.peran}
                        onChange={(e) => void ubahPeran(p, e.target.value)}
                        aria-label={`Peran ${p.nama}`}
                        className="min-h-12 rounded-none border border-input bg-white px-2 text-sm"
                      >
                        {PERAN_OPSI.map((r) => (
                          <option key={r} value={r}>{r}</option>
                        ))}
                      </select>
                    </TableCell>
                    <TableCell>{p.posko?.nama ?? "-"}</TableCell>
                    <TableCell>
                      {p.aktif === false ? (
                        <Badge variant="destructive" className="rounded-none">Nonaktif</Badge>
                      ) : (
                        <Badge variant="outline" className="rounded-none border-transparent bg-success-bg text-success-badge-fg">Aktif</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      {p.aktif === false ? (
                        <Button type="button" variant="outline" onClick={() => void ubahAktif(p, true)} className="min-h-12 rounded-none">
                          Aktifkan
                        </Button>
                      ) : (
                        <Button type="button" variant="outline" onClick={() => { setCalonNonaktif(p); setKetikNama(""); }} className="min-h-12 rounded-none">
                          Nonaktifkan
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>

      {calonNonaktif && (
        <section aria-label="Zona berbahaya" className="rounded-none border-2 border-destructive bg-destructive/5 p-4">
          <h2 className="font-bold text-destructive">Nonaktifkan {calonNonaktif.nama}?</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Akun langsung kehilangan akses. Tindakan ini tercatat. Ketik nama persis untuk lanjut.
          </p>
          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <Input
              value={ketikNama}
              onChange={(e) => setKetikNama(e.target.value)}
              placeholder={calonNonaktif.nama}
              aria-label="Ketik nama pengguna untuk konfirmasi"
              className="min-h-12 flex-1 rounded-none"
            />
            <Button
              type="button"
              variant="destructive"
              disabled={ketikNama.trim() !== calonNonaktif.nama}
              onClick={() => void ubahAktif(calonNonaktif, false)}
              className="min-h-12 rounded-none"
            >
              Nonaktifkan sekarang
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => { setCalonNonaktif(null); setKetikNama(""); }}
              className="min-h-12 rounded-none"
            >
              Batal
            </Button>
          </div>
        </section>
      )}

      <section aria-label="Log audit">
        <p className="font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E]/70">Jejak</p>
        <h2 className="mt-1 text-xl font-bold text-[#0B1F2E]">Log audit terbaru</h2>
        {status === "memuat" ? (
          <div role="status" aria-label="Memuat log" className="mt-3 flex flex-col gap-2">
            <Skeleton className="h-12 w-full rounded-none" />
            <Skeleton className="h-12 w-full rounded-none" />
          </div>
        ) : log.length === 0 ? (
          <p role="status" className="mt-3 text-sm text-muted-foreground">Belum ada baris log.</p>
        ) : (
          <div className="mt-3 overflow-x-auto rounded-none garis-rambut-diam bg-white">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Kode</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Catatan</TableHead>
                  <TableHead>Waktu</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {log.map((l) => (
                  <TableRow key={l.id}>
                    <TableCell className="font-mono text-xs">{kodeLog(l.manifest)}</TableCell>
                    <TableCell>{l.status}</TableCell>
                    <TableCell className="max-w-60 truncate">{l.catatan ?? "-"}</TableCell>
                    <TableCell className="t-angka text-xs tabular-nums">{l.dibuat_pada}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </section>
    </div>
  );
}
