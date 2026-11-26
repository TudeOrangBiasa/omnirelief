"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import { BellIcon } from "@solar-icons/react/linear";
import { Badge } from "@omnirelief/ui/components/badge";
import { Button } from "@omnirelief/ui/components/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@omnirelief/ui/components/tooltip";
import { baris, type AntreanRow, type PantauRow } from "@/lib/supabase/baris";
import {
  BAKU_NOTIFIKASI,
  bacaPengaturanNotifikasi,
  KUNCI_NOTIFIKASI,
  type PengaturanNotifikasi,
} from "@/app/pengaturan/notifikasi";
import { formatTanggalLokal } from "@/lib/tanggal";

function bunyiBip(): void {
  try {
    const Audio = window.AudioContext;
    if (!Audio) return;
    const ctx = new Audio();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.12;
    osc.start();
    osc.stop(ctx.currentTime + 0.25);
    osc.onended = () => {
      void ctx.close().catch(() => undefined);
    };
  } catch {
    /* abaikan: suara opsional */
  }
}
type Notif = {
  id: string;
  kategori: "Perlu Dicek" | "Menunggu verifikasi";
  judul: string;
  sub: string;
  href: string;
  waktu: string;
};

const KUNCI_DIBACA = "omnirelief-notif-dibaca";

function bacaDibaca(): string[] {
  try {
    const mentah = window.localStorage.getItem(KUNCI_DIBACA);
    const parsed: unknown = mentah ? JSON.parse(mentah) : [];
    return Array.isArray(parsed)
      ? parsed.filter((x): x is string => typeof x === "string")
      : [];
  } catch {
    return [];
  }
}

function stempel(waktu: string): string {
  if (!waktu) return "-";
  const hasil = formatTanggalLokal(waktu);
  return hasil;
}

export default function PusatNotifikasi() {
  const [buka, setBuka] = useState(false);
  const [daftar, setDaftar] = useState<Notif[]>([]);
  const [dibaca, setDibaca] = useState<string[]>([]);
  const [gagal, setGagal] = useState(false);

  const [pengaturan, setPengaturan] = useState<PengaturanNotifikasi>({ ...BAKU_NOTIFIKASI });
  const terlihat = useRef<Set<string>>(new Set());
  const sudahMuat = useRef(false);

  const muat = useCallback(async (): Promise<void> => {
    try {
      const [p, a]: unknown[] = await Promise.all([
        fetch("/api/bpbd/pantauan").then((r) => r.json()),
        fetch("/api/bpbd/antrean").then((r) => r.json()),
      ]);
      const pantau = baris<PantauRow>(
        p !== null && typeof p === "object" && "perlu_dicek" in p
          ? p.perlu_dicek
          : undefined,
      );
      const antrean = baris<AntreanRow>(
        a !== null && typeof a === "object" && "antrean" in a
          ? a.antrean
          : undefined,
      );
      const gabung: Notif[] = [
        ...pantau.map((x) => ({
          id: `pantau-${x.id}`,
          kategori: "Perlu Dicek" as const,
          judul: `${x.kode} · ${x.posko_nama}`,
          sub: "Lewat batas check-in tanpa kabar. Hubungi tim lewat jalur darurat.",
          href: `/m/${x.kode}`,
          waktu: x.batas_checkin,
        })),
        ...antrean.map((x) => ({
          id: `antrean-${x.id}`,
          kategori: "Menunggu verifikasi" as const,
          judul: `Snapshot ${x.posko?.nama ?? "posko"}`,
          sub: "Menunggu keputusan verifikasi BPBD.",
          href: "/bpbd",
          waktu: x.dibuat_pada,
        })),
      ].sort((m, n) => (m.waktu < n.waktu ? 1 : -1));
      setDaftar(gabung);
      setGagal(false);
    } catch {
      setDaftar([]);
      setGagal(true);
    }
  }, []);

  useEffect(() => {
    setDibaca(bacaDibaca());
    setPengaturan(bacaPengaturanNotifikasi());
    let hidup = true;
    void muat();
    const jeda = pengaturan.frekuensi === "perjam" ? 3_600_000 : 30_000;
    const id = window.setInterval(() => {
      if (hidup) void muat();
    }, jeda);
    function saatSimpan(e: StorageEvent): void {
      if (e.key === KUNCI_NOTIFIKASI) setPengaturan(bacaPengaturanNotifikasi());
    }
    window.addEventListener("storage", saatSimpan);
    return () => {
      hidup = false;
      window.clearInterval(id);
      window.removeEventListener("storage", saatSimpan);
    };
  }, [muat, pengaturan.frekuensi]);

  useEffect(() => {
    const baruDicek = daftar.filter(
      (x) => x.kategori === "Perlu Dicek" && !terlihat.current.has(x.id),
    );
    for (const x of daftar) terlihat.current.add(x.id);
    if (
      sudahMuat.current &&
      baruDicek.length > 0 &&
      !pengaturan.bisu &&
      pengaturan.suara &&
      pengaturan.dicek
    ) {
      bunyiBip();
    }
    if (daftar.length > 0) sudahMuat.current = true;
  }, [daftar, pengaturan.bisu, pengaturan.suara, pengaturan.dicek]);
  useEffect(() => {
    if (!buka) return;
    function kunci(e: KeyboardEvent): void {
      if (e.key === "Escape") setBuka(false);
    }
    window.addEventListener("keydown", kunci);
    return () => window.removeEventListener("keydown", kunci);
  }, [buka]);

  const tandaiSemua = useCallback(() => {
    setDaftar((d) => {
      const semua = d.map((x) => x.id);
      try {
        window.localStorage.setItem(KUNCI_DIBACA, JSON.stringify(semua));
      } catch {
        /* abaikan */
      }
      setDibaca(semua);
      return d;
    });
  }, []);

  const bisu = pengaturan.bisu;
  const tampilLencana = !bisu && pengaturan.spanduk;
  const perluDicek = pengaturan.dicek
    ? daftar.filter((x) => x.kategori === "Perlu Dicek")
    : [];
  const menunggu = pengaturan.sinkron
    ? daftar.filter((x) => x.kategori === "Menunggu verifikasi")
    : [];
  const tampil = daftar.filter((x) =>
    x.kategori === "Perlu Dicek" ? pengaturan.dicek : pengaturan.sinkron,
  );
  const belum = bisu ? 0 : tampil.filter((x) => !dibaca.includes(x.id)).length;

  function barisNotif(x: Notif): ReactNode {
    const baru = !dibaca.includes(x.id);
    return (
      <a
        key={x.id}
        href={x.href}
        onClick={() => setBuka(false)}
        className={
          baru
            ? "flex min-h-12 flex-col gap-1 border-l-4 border-destructive bg-white px-3 py-2"
            : "flex min-h-12 flex-col gap-1 border-l-4 border-transparent bg-muted/50 px-3 py-2"
        }
      >
        <span className="flex items-center gap-2">
          <span className="text-sm font-semibold">{x.judul}</span>
          {baru ? (
            <Badge variant="destructive">Baru</Badge>
          ) : (
            <Badge variant="secondary">Dibaca</Badge>
          )}
        </span>
        <span className="text-xs text-muted-foreground">{x.sub}</span>
        <span className="text-xs text-muted-foreground tabular-nums">
          {stempel(x.waktu)}
        </span>
      </a>
    );
  }

  return (
    <div className="relative">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger
            render={
              <button
                type="button"
                onClick={() => setBuka((v) => !v)}
                aria-label={
                  belum > 0
                    ? `Pusat notifikasi, ${belum} belum dibaca`
                    : "Pusat notifikasi, tidak ada yang baru"
                }
                aria-expanded={buka}
                className="relative flex h-9 w-9 items-center justify-center rounded-none border border-[#0B1F2E]/20 bg-white text-foreground after:absolute after:-inset-1.5 after:content-[''] hover:bg-slate-100"
              >
                <BellIcon aria-hidden="true" className="size-5" />
                {belum > 0 && tampilLencana && (
                  <span
                    aria-hidden="true"
                    className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-none bg-destructive px-1 text-xs font-bold text-white tabular-nums"
                  >
                    {belum > 99 ? "99+" : belum}
                  </span>
                )}
              </button>
            }
          />
          <TooltipContent side="bottom">Pusat notifikasi</TooltipContent>
        </Tooltip>
      </TooltipProvider>

      {buka && (
        <>
          <button
            type="button"
            aria-label="Tutup panel notifikasi"
            onClick={() => setBuka(false)}
            className="fixed inset-0 z-40 cursor-default bg-transparent"
          />
          <section
            role="dialog"
            aria-label="Pusat notifikasi"
            className="panel-masuk absolute top-full right-0 z-50 mt-2 flex max-h-[70vh] w-[min(22rem,calc(100vw-2rem))] flex-col gap-2 overflow-hidden rounded-none border border-slate-300 bg-white p-3 shadow-lg"
          >
            <div className="flex items-center gap-2">
              <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                Pemberitahuan
              </p>
              {belum > 0 && tampilLencana && (
                <Badge variant="destructive">
                  {belum} baru
                </Badge>
              )}
              <span className="flex-1" />
              {tampil.length > 0 && (
                <Button
                  type="button"
                  variant="ghost"
                  onClick={tandaiSemua}
                  disabled={belum === 0}
                  className="min-h-12"
                >
                  Tandai semua dibaca
                </Button>
              )}
            </div>
            {bisu && (
              <p role="status" className="garis-rambut-diam bg-[#DCE8EE] px-3 py-2 text-xs font-semibold text-[#0B1F2E]">
                Disenyapkan. Semua bunyi dan lencana dimatikan sementara. Matikan sakelar Senyapkan Semua Sementara di Pengaturan untuk menyalakan lagi.
              </p>
            )}
            {tampil.length === 0 ? (
              <div className="flex flex-col items-center gap-2 px-2 py-8 text-center">
                <BellIcon
                  aria-hidden="true"
                  className="size-8 text-muted-foreground"
                />
                <p className="text-sm font-semibold">
                  Belum ada pemberitahuan
                </p>
                <p className="text-xs text-muted-foreground">
                  {bisu
                    ? "Pemberitahuan disenyapkan sementara. Tidak ada lencana yang dihitung."
                    : gagal
                      ? "Gagal memuat. Periksa koneksi lalu buka ulang panel ini."
                      : "Tidak ada kiriman Perlu Dicek atau snapshot menunggu verifikasi."}
                </p>
              </div>
            ) : (
              <div className="flex flex-col gap-3 overflow-y-auto">
                {perluDicek.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <p className="font-mono text-xs tracking-widest text-destructive uppercase">
                      Perlu Dicek ({perluDicek.length})
                    </p>
                    {perluDicek.map(barisNotif)}
                  </div>
                )}
                {menunggu.length > 0 && (
                  <div className="flex flex-col gap-1">
                    <p className="font-mono text-xs tracking-widest text-muted-foreground uppercase">
                      Menunggu verifikasi ({menunggu.length})
                    </p>
                    {menunggu.map(barisNotif)}
                  </div>
                )}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  );
}
