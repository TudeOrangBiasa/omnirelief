"use client";

import { useEffect, useState } from "react";
import { Badge } from "@omnirelief/ui/components/badge";
import { Button } from "@omnirelief/ui/components/button";
import { Card, CardContent } from "@omnirelief/ui/components/card";
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
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-4 text-sm">
        <p className="font-bold text-primary">
          Alur bantuan: Gudang → BPBD → Tim → Posko → Publik
        </p>
        <p className="text-muted-foreground">Langkah kamu: {langkah}</p>
        <Button
          type="button"
          variant="outline"
          onClick={() => bukaPanduan(peran, langkah)}
          className="min-h-12 min-w-12 w-full sm:w-fit"
        >
          Lihat peta alur
        </Button>
      </CardContent>
    </Card>
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
