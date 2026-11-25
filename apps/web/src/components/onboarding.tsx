"use client";

import type { Route } from "next";
import Link from "next/link";
import { useEffect, useState } from "react";
import { Button, buttonVariants } from "@omnirelief/ui/components/button";
import { Badge } from "@omnirelief/ui/components/badge";
import { cn } from "@omnirelief/ui/lib/utils";
import type { Peran } from "@/lib/auth";

type Langkah = {
  judul: string;
  aksiLabel: string;
  href: Route;
};

const LANGKAH: Record<Peran, Langkah[]> = {
  BPBD: [
    {
      judul: "1. Tinjau antrean verifikasi posko",
      aksiLabel: "Buka antrean",
      href: "/bpbd",
    },
    {
      judul: "2. Buat dan kunci manifest prioritas FEFO",
      aksiLabel: "Buka kirim",
      href: "/bpbd/kirim",
    },
    {
      judul: "3. Verifikasi jejak publik dan hash SHA-256",
      aksiLabel: "Buka transparansi",
      href: "/transparansi",
    },
  ],
  GUDANG: [
    {
      judul: "1. Catat batch baru di gudang",
      aksiLabel: "Buka gudang",
      href: "/gudang",
    },
    {
      judul: "2. Cek stok FEFO yang kedaluwarsa dekat",
      aksiLabel: "Cek stok",
      href: "/gudang",
    },
    {
      judul: "3. Lihat jejak publik distribusi",
      aksiLabel: "Buka transparansi",
      href: "/transparansi",
    },
  ],
  POSKO: [
    {
      judul: "1. Lapor data penyintas terbaru",
      aksiLabel: "Buka posko",
      href: "/posko",
    },
    {
      judul: "2. Konfirmasi kiriman yang diterima",
      aksiLabel: "Buka bantuan",
      href: "/posko#bantuan" as Route,
    },
    {
      judul: "3. Cek status di halaman publik",
      aksiLabel: "Buka transparansi",
      href: "/transparansi",
    },
  ],
  TIM: [
    {
      judul: "1. Buka tugas pengiriman Anda",
      aksiLabel: "Buka tugas",
      href: "/tim",
    },
    {
      judul: "2. Check-in tepat waktu sesuai batas",
      aksiLabel: "Check-in",
      href: "/tim",
    },
    {
      judul: "3. Konfirmasi tiba di posko tujuan",
      aksiLabel: "Konfirmasi tiba",
      href: "/tim",
    },
  ],
  ADMIN: [
    {
      judul: "1. Kelola pengguna dan peran",
      aksiLabel: "Buka admin",
      href: "/admin",
    },
    {
      judul: "2. Unduh bukti audit CSV",
      aksiLabel: "Buka admin",
      href: "/admin",
    },
  ],
};

function kunciUntuk(peran: Peran): string {
  return `omnirelief-onboarding-${peran}`;
}

function isRekam(v: unknown): v is { selesai?: unknown; ditutup?: unknown } {
  return typeof v === "object" && v !== null;
}

function bacaStatus(peran: Peran): { selesai: boolean[]; ditutup: boolean } {
  const awal = { selesai: [false, false, false], ditutup: false };
  try {
    const mentah = window.localStorage.getItem(kunciUntuk(peran));
    if (!mentah) return awal;
    const data: unknown = JSON.parse(mentah);
    if (!isRekam(data)) return awal;
    const daftar = data.selesai;
    const selesai = daftar instanceof Array
      ? [0, 1, 2].map((i) => daftar[i] === true)
      : awal.selesai;
    return { selesai, ditutup: data.ditutup === true };
  } catch {
    return awal;
  }
}

export default function Onboarding({ peran }: { peran: Peran }) {
  const langkah = LANGKAH[peran];
  const [selesai, setSelesai] = useState<boolean[]>([false, false, false]);
  const [ditutup, setDitutup] = useState(false);
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    setSelesai(bacaStatus(peran).selesai);
    setDitutup(bacaStatus(peran).ditutup);
    setSiap(true);
  }, [peran]);

  function simpan(baru: boolean[], tutup: boolean) {
    setSelesai(baru);
    setDitutup(tutup);
    try {
      window.localStorage.setItem(
        kunciUntuk(peran),
        JSON.stringify({ selesai: baru, ditutup: tutup }),
      );
    } catch {
      /* abaikan */
    }
  }

  function balik(i: number) {
    const baru = selesai.map((s, j) => (j === i ? !s : s));
    simpan(baru, ditutup);
  }

  if (!siap) return null;

  const jumlah = selesai.filter(Boolean).length;
  const semuaSelesai = jumlah === langkah.length;

  if (ditutup || semuaSelesai) {
    return (
      <section
        aria-label="Panduan singkat"
        className="garis-rambut-diam bg-white"
      >
        <div className="flex flex-wrap items-center justify-between gap-3 p-4">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E]/70">
              Panduan singkat
            </p>
            <p className="mt-1 text-sm font-bold text-[#0B1F2E]">
              {semuaSelesai
                ? `Panduan selesai: ${jumlah} dari ${langkah.length} langkah.`
                : `Panduan ditutup: ${jumlah} dari ${langkah.length} langkah selesai.`}
            </p>
          </div>
          <Button
            type="button"
            onClick={() => simpan(selesai, false)}
            className="min-h-12 rounded-none bg-[#0B1F2E] text-white hover:bg-[#0B1F2E]/90"
          >
            Mulai tur singkat
          </Button>
        </div>
      </section>
    );
  }

  return (
    <section
      aria-label="Panduan singkat"
      className="garis-rambut-diam bg-white"
    >
      <div className="border-b border-[#0B1F2E]/10 bg-[#DCE8EE] p-4">
        <p className="font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E]/70">
          Panduan singkat
        </p>
        <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-bold text-[#0B1F2E]">
            Tiga langkah awal peran {peran}
          </h2>
          <p className="text-sm font-bold tabular-nums text-[#0B1F2E]">
            {jumlah} dari {langkah.length} selesai
          </p>
        </div>
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={langkah.length}
          aria-valuenow={jumlah}
          aria-label="Kemajuan panduan"
          className="mt-3 h-2 w-full bg-white"
        >
          <div
            className="h-2 bg-[#0f79b8]"
            style={{ width: `${(jumlah / langkah.length) * 100}%` }}
          />
        </div>
      </div>
      <ol className="flex flex-col divide-y divide-[#0B1F2E]/10">
        {langkah.map((l, i) => {
          const done = selesai[i] === true;
          return (
            <li
              key={l.judul}
              className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div className="flex items-start gap-3">
                <span
                  aria-hidden="true"
                  className={
                    done
                      ? "mt-1 inline-block h-4 w-4 shrink-0 bg-[#0f79b8]"
                      : "mt-1 inline-block h-4 w-4 shrink-0 border-2 border-[#0B1F2E]/40 bg-white"
                  }
                />
                <div>
                  <p className="text-sm font-bold text-[#0B1F2E]">{l.judul}</p>
                  <p className="mt-1">
                    {done ? (
                      <Badge className="rounded-none bg-[#0f79b8] text-white">
                        Selesai
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="rounded-none">
                        Belum selesai
                      </Badge>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <Link
                  href={l.href}
                  className={cn(buttonVariants({ variant: "outline" }), "min-h-12 rounded-none")}
                >
                  {l.aksiLabel}
                </Link>
                <Button
                  type="button"
                  onClick={() => balik(i)}
                  aria-pressed={done}
                  className={
                    done
                      ? "min-h-12 rounded-none bg-white text-[#0B1F2E]"
                      : "min-h-12 rounded-none bg-[#0B1F2E] text-white hover:bg-[#0B1F2E]/90"
                  }
                  variant={done ? "outline" : "default"}
                >
                  {done ? "Batalkan" : "Tandai selesai"}
                </Button>
              </div>
            </li>
          );
        })}
      </ol>
      <div className="flex justify-end border-t border-[#0B1F2E]/10 p-4">
        <Button
          type="button"
          variant="ghost"
          onClick={() => simpan(selesai, true)}
          className="min-h-12 rounded-none text-[#0B1F2E]"
        >
          Tutup
        </Button>
      </div>
    </section>
  );
}
