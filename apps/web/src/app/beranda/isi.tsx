"use client";

import type { Route } from "next";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { HistoryIcon } from "@solar-icons/react/linear";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@omnirelief/ui/components/alert";
import { Badge } from "@omnirelief/ui/components/badge";
import { Button } from "@omnirelief/ui/components/button";
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
import { Skeleton } from "@omnirelief/ui/components/skeleton";
import type { Peran } from "@/lib/auth";
import {
  baris,
  type AntreanRow,
  type BantuanRow,
  type BatchLihatRow,
  type LaporanRow,
  type PantauRow,
  type PrioritasRow,
  type TugasRow,
} from "@/lib/supabase/baris";

type StatusMuat = "memuat" | "siap" | "gagal";

type Aktivitas = {
  id: string;
  judul: string;
  sub: string;
  href: Route;
  badge: { teks: string; varian: "default" | "destructive" | "outline" | "success" };
  waktu: string;
};

type Ringkasan = { angka: string; label: string }[];

const KUNCI_KUNJUNGAN = "omnirelief-kunjungan-terakhir";

const PRIMER: Record<Peran, { label: string; href: Route; kedua?: { label: string; href: Route } }> = {
  BPBD: {
    label: "Buat manifest",
    href: "/bpbd/kirim",
    kedua: { label: "Buka command center", href: "/bpbd" },
  },
  GUDANG: { label: "Catat batch masuk", href: "/gudang" },
  POSKO: {
    label: "Lapor penyintas",
    href: "/posko",
    kedua: { label: "Lihat kiriman posko", href: "/posko#bantuan" },
  },
  TIM: { label: "Buka tugas distribusi", href: "/tim" },
};

function formatTanggal(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("id-ID", {
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function Lencana({ badge }: { badge: Aktivitas["badge"] }) {
  if (badge.varian === "success") {
    return (
      <Badge className="border-transparent bg-success-bg text-success">
        {badge.teks}
      </Badge>
    );
  }
  return <Badge variant={badge.varian}>{badge.teks}</Badge>;
}

export default function IsiBeranda({
  nama,
  peran,
}: {
  nama: string;
  peran: Peran;
}) {
  const router = useRouter();
  const [status, setStatus] = useState<StatusMuat>("memuat");
  const [ringkasan, setRingkasan] = useState<Ringkasan>([]);
  const [aktivitas, setAktivitas] = useState<Aktivitas[]>([]);
  const [baru, setBaru] = useState(0);
  const [diperbarui, setDiperbarui] = useState("");
  const hitungBaru = useCallback((waktu: string[]) => {
    let terakhir: string | null = null;
    try {
      terakhir = window.localStorage.getItem(KUNCI_KUNJUNGAN);
    } catch {
      terakhir = null;
    }
    if (terakhir) {
      setBaru(waktu.filter((w) => w > terakhir).length);
    }
    try {
      window.localStorage.setItem(KUNCI_KUNJUNGAN, new Date().toISOString());
    } catch {
      /* abaikan */
    }
  }, []);

  const muat = useCallback(async () => {
    setStatus("memuat");
    try {
      if (peran === "BPBD") {
        const [a, p, w] = await Promise.all([
          fetch("/api/bpbd/antrean").then((r) => r.json()) as Promise<{
            ok: boolean;
            antrean?: unknown;
          }>,
          fetch("/api/bpbd/prioritas").then((r) => r.json()) as Promise<{
            ok: boolean;
            prioritas?: unknown;
          }>,
          fetch("/api/bpbd/pantauan").then((r) => r.json()) as Promise<{
            ok: boolean;
            perlu_dicek?: unknown;
          }>,
        ]);
        if (!a.ok || !p.ok || !w.ok) throw new Error("gagal");
        const antrean = baris<AntreanRow>(a.antrean);
        const prioritas = baris<PrioritasRow>(p.prioritas);
        const pantau = baris<PantauRow>(w.perlu_dicek);
        const kritis = prioritas.filter((x) => x.selisih > 0);
        setRingkasan([
          { angka: String(pantau.length), label: "Perlu Dicek" },
          { angka: String(antrean.length), label: "Menunggu verifikasi" },
          { angka: String(kritis.length), label: "Posko kurang" },
        ]);
        const daftar: Aktivitas[] = [
          ...pantau.map((x) => ({
            id: `pantau-${x.id}`,
            judul: `${x.kode} · ${x.posko_nama}`,
            sub: "Perlu Dicek. Hubungi tim lewat jalur darurat.",
            href: `/m/${x.kode}` as Route,
            badge: {
              teks: "Perlu Dicek",
              varian: "destructive",
            } as Aktivitas["badge"],
            waktu: x.batas_checkin,
          })),
          ...[...antrean]
            .sort((x, y) => (x.dibuat_pada < y.dibuat_pada ? 1 : -1))
            .slice(0, 5)
            .map((x) => ({
              id: `antrean-${x.id}`,
              judul: `Snapshot ${x.posko?.nama ?? "posko"}`,
              sub: `Menunggu verifikasi sejak ${formatTanggal(x.dibuat_pada)}.`,
              href: "/bpbd" as Route,
              badge: {
                teks: "Menunggu",
                varian: "outline",
              } as Aktivitas["badge"],
              waktu: x.dibuat_pada,
            })),
        ].slice(0, 5);
        setAktivitas(daftar);
        hitungBaru([
          ...antrean.map((x) => x.dibuat_pada),
          ...pantau.map((x) => x.batas_checkin),
        ]);
      } else if (peran === "GUDANG") {
        const res = await fetch("/api/gudang/batch");
        const data = (await res.json()) as { ok: boolean; batch?: unknown };
        if (!data.ok) throw new Error("gagal");
        const batch = baris<BatchLihatRow>(data.batch);
        const ambang = Date.now() + 30 * 24 * 3600 * 1000;
        const hampir = batch.filter(
          (b) =>
            b.kedaluwarsa !== null &&
            new Date(b.kedaluwarsa).getTime() < ambang &&
            b.sisa > 0,
        );
        const totalSisa = batch.reduce((s, b) => s + Math.max(0, b.sisa), 0);
        setRingkasan([
          { angka: String(batch.length), label: "Batch tercatat" },
          { angka: String(totalSisa), label: "Paket siap kirim" },
          { angka: String(hampir.length), label: "Kedaluwarsa < 30 hari" },
        ]);
        const daftar = [...batch]
          .sort((x, y) => x.id - y.id)
          .slice(-5)
          .reverse()
          .map((b) => ({
            id: `batch-${b.id}`,
            judul: `${b.kode_sumbangan} · ${b.item_nama}`,
            sub: `Sisa ${b.sisa} ${b.satuan}${b.kedaluwarsa ? ` · kedaluwarsa ${formatTanggal(b.kedaluwarsa)}` : ""}.`,
            href: `/s/${b.kode_sumbangan}` as Route,
            badge: {
              teks: b.sisa > 0 ? "Tersedia" : "Habis",
              varian: b.sisa > 0 ? "outline" : "default",
            } as Aktivitas["badge"],
            waktu: b.kedaluwarsa ?? "",
          }));
        setAktivitas(daftar);
        hitungBaru(batch.map((b) => b.kedaluwarsa ?? "").filter(Boolean));
      } else if (peran === "POSKO") {
        const [l, b] = await Promise.all([
          fetch("/api/posko/laporan").then((r) => r.json()) as Promise<{
            ok: boolean;
            laporan?: unknown;
          }>,
          fetch("/api/posko/bantuan").then((r) => r.json()) as Promise<{
            ok: boolean;
            bantuan?: unknown;
          }>,
        ]);
        if (!l.ok || !b.ok) throw new Error("gagal");
        const laporan = baris<LaporanRow>(l.laporan);
        const bantuan = baris<BantuanRow>(b.bantuan);
        const berjalan = bantuan.filter(
          (x) => x.log_terakhir?.status !== "DITERIMA",
        );
        const menunggu = laporan.filter((x) => x.status !== "DISETUJUI").length;
        setRingkasan([
          { angka: String(berjalan.length), label: "Kiriman berjalan" },
          { angka: String(menunggu), label: "Laporan menunggu verifikasi" },
          { angka: String(laporan.length), label: "Laporan terkirim" },
        ]);
        const daftar: Aktivitas[] = [
          ...bantuan.slice(0, 5).map((x) => ({
            id: `bantuan-${x.id}`,
            judul: `${x.kode} · tim ${x.tim}`,
            sub:
              x.log_terakhir?.status === "DITERIMA"
                ? `Dikonfirmasi terima ${formatTanggal(x.log_terakhir.dibuat_pada)}.`
                : `Status terakhir: ${x.log_terakhir?.status ?? "baru dikirim"}.`,
            href: `/m/${x.kode}` as Route,
            badge: {
              teks:
                x.log_terakhir?.status === "DITERIMA" ? "Diterima" : "Berjalan",
              varian:
                x.log_terakhir?.status === "DITERIMA" ? "success" : "outline",
            } as Aktivitas["badge"],
            waktu: x.log_terakhir?.dibuat_pada ?? "",
          })),
          ...laporan.slice(0, 5).map((x) => ({
            id: `laporan-${x.id}`,
            judul: `Laporan penyintas #${x.id}`,
            sub: `Status verifikasi: ${x.status}.`,
            href: "/posko" as Route,
            badge: {
              teks: x.status === "DISETUJUI" ? "Disetujui" : "Menunggu",
              varian: x.status === "DISETUJUI" ? "success" : "outline",
            } as Aktivitas["badge"],
            waktu: x.dibuat_pada,
          })),
        ].slice(0, 5);
        setAktivitas(daftar);
        hitungBaru([
          ...laporan.map((x) => x.dibuat_pada),
          ...bantuan.map((x) => x.log_terakhir?.dibuat_pada ?? ""),
        ]);
      } else {
        const res = await fetch("/api/tim/tugas");
        const data = (await res.json()) as { ok: boolean; tugas?: unknown };
        if (!data.ok) throw new Error("gagal");
        const tugas = baris<TugasRow>(data.tugas);
        const sekarang = new Date().toISOString();
        const dicek = tugas.filter(
          (t) => t.batas_checkin !== null && t.batas_checkin < sekarang,
        );
        setRingkasan([
          { angka: String(tugas.length), label: "Tugas aktif" },
          { angka: String(dicek.length), label: "Perlu check-in" },
          {
            angka: String(
              tugas.filter((t) => t.log_terakhir?.status === "TIBA").length,
            ),
            label: "Sudah tiba",
          },
        ]);
        const daftar = tugas.slice(0, 5).map((t) => ({
          id: `tugas-${t.id}`,
          judul: `${t.kode} · ${t.posko_nama}`,
          sub: `Status terakhir: ${t.log_terakhir?.status ?? "baru ditugaskan"}.`,
          href: `/m/${t.kode}` as Route,
          badge: {
            teks:
              t.batas_checkin !== null && t.batas_checkin < sekarang
                ? "Perlu Dicek"
                : (t.log_terakhir?.status ?? "Baru"),
            varian:
              t.batas_checkin !== null && t.batas_checkin < sekarang
                ? "destructive"
                : "outline",
          } as Aktivitas["badge"],
          waktu: t.log_terakhir?.dibuat_pada ?? "",
        }));
        setAktivitas(daftar);
        hitungBaru(tugas.map((t) => t.log_terakhir?.dibuat_pada ?? ""));
      }
      setDiperbarui(
        new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date()),
      );
      setStatus("siap");
    } catch {
      setStatus("gagal");
    }
  }, [peran, hitungBaru]);

  useEffect(() => {
    void muat();
  }, [muat]);

  const aksi = PRIMER[peran];
  const kedua = aksi.kedua;

  return (
    <div className="flex flex-col gap-6">
      <section aria-label="Ringkasan sejak kunjungan terakhir">
        <h1 className="text-lg font-bold text-primary">
          Halo, {nama}. Rangkuman kunjungan terakhir
          {baru > 0 ? `: ${baru} pembaruan baru` : ""}
        </h1>
        <p className="text-muted-foreground mt-1 text-xs">
          Angka hari ini{diperbarui ? ` · diperbarui ${diperbarui}` : ""}
        </p>
        {status === "memuat" && (
          <div role="status" aria-label="Memuat ringkasan" className="mt-3 grid grid-cols-3 gap-3">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-20" />
            ))}
          </div>
        )}
        {status === "gagal" && (
          <Alert variant="destructive" className="mt-3">
            <AlertTitle>Gagal memuat ringkasan</AlertTitle>
            <AlertDescription>
              Periksa koneksi lalu coba lagi.
            </AlertDescription>
            <Button onClick={() => void muat()} className="mt-3 min-h-12">
              Coba lagi
            </Button>
          </Alert>
        )}
        {status === "siap" && (
          <div className="mt-3 grid grid-cols-3 gap-3">
            {ringkasan.map((r) => (
              <Card key={r.label}>
                <CardContent className="flex flex-col gap-1 p-4">
                  <span className="text-2xl font-bold text-primary">{r.angka}</span>
                  <span className="text-muted-foreground text-xs">{r.label}</span>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      <section aria-label="Aksi utama" className="flex flex-col gap-2">
        <Button onClick={() => router.push(aksi.href)} className="min-h-12 w-full">
          {aksi.label}
        </Button>
        {kedua && (
          <Button
            variant="outline"
            onClick={() => router.push(kedua.href)}
            className="min-h-12 w-full"
          >
            {kedua.label}
          </Button>
        )}
      </section>

      <section aria-label="Aktivitas terakhir">
        <h2 className="text-lg font-bold text-primary">Aktivitas terakhir</h2>
        {status === "memuat" && (
          <div role="status" aria-label="Memuat aktivitas" className="mt-3 flex flex-col gap-2">
            {[0, 1, 2].map((i) => (
              <Skeleton key={i} className="h-16" />
            ))}
          </div>
        )}
        {status === "siap" && aktivitas.length === 0 && (
          <Empty className="mt-3">
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <HistoryIcon aria-hidden="true" />
              </EmptyMedia>
              <EmptyTitle>Belum ada aktivitas</EmptyTitle>
              <EmptyDescription>
                Aktivitas terbaru peran ini tampil di sini setelah ada data.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        )}
        {status === "siap" && aktivitas.length > 0 && (
          <ul className="mt-3 flex flex-col gap-2">
            {aktivitas.map((a) => (
              <li key={a.id}>
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between gap-2 text-base">
                      <a
                        href={a.href}
                        className="min-h-12 content-center text-primary underline-offset-4 hover:underline"
                      >
                        {a.judul}
                      </a>
                      <Lencana badge={a.badge} />
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="text-muted-foreground -mt-2 text-sm">
                    {a.sub}
                  </CardContent>
                </Card>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
