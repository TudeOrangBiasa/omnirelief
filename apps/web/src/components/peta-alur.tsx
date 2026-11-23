"use client";

import { useEffect, useState } from "react";
import { Badge } from "@omnirelief/ui/components/badge";
import { Button } from "@omnirelief/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@omnirelief/ui/components/dialog";

export const ACARA_PANDUAN = "omnirelief:panduan";

export type PeranAlur = "GUDANG" | "BPBD" | "TIM" | "POSKO" | "UMUM";

type Tahap = {
  peran: PeranAlur;
  judul: string;
  jelas: string;
};

const TAHAP: Tahap[] = [
  {
    peran: "GUDANG",
    judul: "Gudang catat sumbangan",
    jelas: "Satu pencatatan sama dengan satu batch dan satu kode sumbangan.",
  },
  {
    peran: "BPBD",
    judul: "BPBD kunci manifest",
    jelas: "Snapshot disetujui jadi jatah. Manifest terkunci untuk satu posko.",
  },
  {
    peran: "TIM",
    judul: "Tim antar dan check-in",
    jelas: "Kabar berkala selama jalan. Lewat batas tanpa kabar jadi Perlu Dicek.",
  },
  {
    peran: "POSKO",
    judul: "Posko konfirmasi terima",
    jelas: "Konfirmasi menutup selisih. Masalah dilaporkan sebagai dokumen publik.",
  },
  {
    peran: "UMUM",
    judul: "Publik bisa audit",
    jelas: "Lacak aliran lewat kode sumbangan atau kode manifest.",
  },
];

type DetailPanduan = {
  peran: PeranAlur;
  langkah: string;
};

function isPeranAlur(nilai: unknown): nilai is PeranAlur {
  return (
    nilai === "GUDANG" ||
    nilai === "BPBD" ||
    nilai === "TIM" ||
    nilai === "POSKO" ||
    nilai === "UMUM"
  );
}

function isDetailPanduan(nilai: unknown): nilai is DetailPanduan {
  if (typeof nilai !== "object" || nilai === null) return false;
  if (!("peran" in nilai) || !("langkah" in nilai)) return false;
  const { peran, langkah } = nilai;
  return isPeranAlur(peran) && typeof langkah === "string";
}

export function bukaPanduan(peran: PeranAlur = "UMUM", langkah = ""): void {
  const detail: DetailPanduan = { peran, langkah };
  window.dispatchEvent(new CustomEvent<DetailPanduan>(ACARA_PANDUAN, { detail }));
}

export function PetaAlurRingkasan({
  peran,
  langkah,
}: {
  peran: PeranAlur;
  langkah: string;
}) {
  const posisi = TAHAP.findIndex((t) => t.peran === peran);
  return (
    <div className="rounded-none border border-[#0B1F2E]/15 bg-white px-4 py-3">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-mono text-[11px] uppercase tracking-widest text-[#0B1F2E]/60">
            Peta alur bantuan
          </p>
          <p className="mt-0.5 truncate text-sm text-[#0B1F2E]">
            Langkah kamu: <strong>{langkah}</strong>
          </p>
        </div>
        <Button
          type="button"
          variant="outline"
          onClick={() => bukaPanduan(peran, langkah)}
          className="min-h-12 shrink-0 rounded-none border border-[#0B1F2E]/30 sm:w-auto"
        >
          Lihat Peta Alur
        </Button>
      </div>
      <ol
        className="mt-3 flex items-start border-t border-[#0B1F2E]/10 pt-4"
        aria-label="Tahapan alur bantuan"
      >
        {TAHAP.map((t, i) => {
          const aktif = i === posisi;
          const selesai = posisi >= 0 && i < posisi;
          return (
            <li key={t.peran} className="relative flex flex-1 flex-col items-center gap-1.5 px-1 text-center">
              {i > 0 && (
                <span aria-hidden="true" className="absolute top-3.5 right-[calc(50%+14px)] left-[-50%] h-px bg-[#0B1F2E]/20" />
              )}
              <span
                aria-current={aktif ? "step" : undefined}
                className={
                  aktif
                    ? "flex size-7 shrink-0 items-center justify-center rounded-full bg-[#0B1F2E] font-mono text-[11px] font-bold text-white"
                    : selesai
                      ? "flex size-7 shrink-0 items-center justify-center rounded-full bg-[#DCE8EE] font-mono text-[11px] font-bold text-[#0B1F2E]"
                      : "flex size-7 shrink-0 items-center justify-center rounded-full border border-[#0B1F2E]/25 font-mono text-[11px] text-[#0B1F2E]/55"
                }
              >
                {i + 1}
              </span>
              <span
                className={
                  aktif
                    ? "text-[11px] leading-tight font-semibold text-[#0B1F2E]"
                    : "text-[11px] leading-tight text-[#0B1F2E]/60"
                }
              >
                {t.judul}
              </span>
            </li>
          );
        })}
      </ol>
    </div>
  );
}

export function PetaAlur() {
  const [buka, setBuka] = useState(false);
  const [detail, setDetail] = useState<DetailPanduan>({ peran: "UMUM", langkah: "" });

  useEffect(() => {
    function saatPanduan(e: Event): void {
      if (!(e instanceof CustomEvent)) return;
      const data: unknown = e.detail;
      if (isDetailPanduan(data)) setDetail(data);
      setBuka(true);
    }
    window.addEventListener(ACARA_PANDUAN, saatPanduan);
    return () => window.removeEventListener(ACARA_PANDUAN, saatPanduan);
  }, []);

  function tutup(bukaBaru: boolean): void {
    if (!bukaBaru) setBuka(false);
  }

  return (
    <Dialog open={buka} onOpenChange={tutup}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Peta alur bantuan</DialogTitle>
          <DialogDescription>
            Rantai tercatat dari gudang sampai posko. Bisa dicek publik per daerah.
          </DialogDescription>
        </DialogHeader>
        <ol className="flex flex-col gap-2">
          {TAHAP.map((t, i) => {
            const posisi = t.peran === detail.peran;
            return (
              <li
                key={t.peran}
                className={
                  posisi
                    ? "flex flex-col gap-1 rounded-xl border-2 border-primary p-3 text-sm"
                    : "flex flex-col gap-1 rounded-xl border border-border p-3 text-sm"
                }
              >
                <p className="flex flex-wrap items-center gap-2 font-bold">
                  <span className="text-primary">{i + 1}.</span> {t.judul}
                  {posisi && <Badge className="border-transparent bg-success-bg text-success">Posisi kamu</Badge>}
                </p>
                <p className="text-muted-foreground">{t.jelas}</p>
              </li>
            );
          })}
        </ol>
        {detail.langkah !== "" && (
          <p className="rounded-xl bg-muted p-3 text-sm font-semibold">
            Langkah aksi: {detail.langkah}
          </p>
        )}
        <DialogFooter>
          <Button type="button" onClick={() => setBuka(false)} className="min-h-12 min-w-12">
            Tutup
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
