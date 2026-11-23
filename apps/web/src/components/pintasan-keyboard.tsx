"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@omnirelief/ui/components/dialog";

export const ACARA_PINTASAN = "omnirelief:pintasan";

type DetailPintasan = {
  buka?: boolean;
};

type BarisPintasan = {
  tombol: string[];
  guna: string;
};

type BarisPeran = {
  peran: string;
  guna: string;
};

const DAFTAR_PINTASAN: BarisPintasan[] = [
  { tombol: ["/"], guna: "Fokus ke kolom pencarian kode atau posko" },
  { tombol: ["?"], guna: "Buka panduan ini" },
  { tombol: ["g", "lalu", "b"], guna: "Ke Beranda" },
  { tombol: ["g", "lalu", "t"], guna: "Ke Transparansi" },
  { tombol: ["Esc"], guna: "Tutup dialog" },
];

const DAFTAR_PERAN: BarisPeran[] = [
  { peran: "Gudang", guna: "Catat sumbangan masuk jadi batch berkode DNT." },
  { peran: "BPBD", guna: "Verifikasi snapshot posko lalu terbitkan manifest." },
  { peran: "Tim", guna: "Antar paket, kirim kabar check-in, tandai tiap tahap." },
  { peran: "Posko", guna: "Catat penyintas lalu konfirmasi barang diterima." },
];

const SELECTOR_CARI = [
  "#cek-kode input",
  "#cari-posko",
  "#cari-batch",
  'input[type="search"]',
];

export function mintaBukaPintasan(): void {
  window.dispatchEvent(
    new CustomEvent<DetailPintasan>(ACARA_PINTASAN, { detail: { buka: true } }),
  );
}

function isDetailPintasan(nilai: unknown): nilai is DetailPintasan {
  if (typeof nilai !== "object" || nilai === null) return false;
  if (!("buka" in nilai)) return true;
  const buka = nilai.buka;
  return buka === undefined || typeof buka === "boolean";
}

function targetIsiFormulir(target: EventTarget | null): boolean {
  if (!(target instanceof HTMLElement)) return false;
  const nama = target.tagName;
  if (nama === "INPUT" || nama === "TEXTAREA" || nama === "SELECT") return true;
  return target.isContentEditable;
}

function fokusPencarian(): boolean {
  for (const selector of SELECTOR_CARI) {
    const el = document.querySelector(selector);
    if (el instanceof HTMLInputElement && !el.disabled) {
      el.focus();
      el.select();
      return true;
    }
  }
  return false;
}

export default function PintasanKeyboard({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [buka, setBuka] = useState(false);
  const menungguG = useRef<number | null>(null);

  useEffect(() => {
    function bersihkanG(): void {
      if (menungguG.current !== null) {
        window.clearTimeout(menungguG.current);
        menungguG.current = null;
      }
    }

    function tandaiG(): void {
      bersihkanG();
      menungguG.current = window.setTimeout(bersihkanG, 900);
    }

    function padaAcara(event: Event): void {
      if (event instanceof CustomEvent && isDetailPintasan(event.detail)) {
        setBuka(event.detail.buka ?? true);
        return;
      }
      setBuka(true);
    }

    function padaTombol(event: KeyboardEvent): void {
      if (event.key === "Escape") {
        bersihkanG();
        setBuka(false);
        return;
      }
      if (buka || event.ctrlKey || event.metaKey || event.altKey) return;
      if (targetIsiFormulir(event.target)) return;

      if (event.key === "/") {
        event.preventDefault();
        fokusPencarian();
        return;
      }
      if (event.key === "?") {
        event.preventDefault();
        setBuka(true);
        return;
      }
      if (menungguG.current !== null) {
        bersihkanG();
        if (event.key === "b") {
          event.preventDefault();
          router.push("/beranda");
        } else if (event.key === "t") {
          event.preventDefault();
          router.push("/transparansi");
        } else if (event.key === "g") {
          tandaiG();
        }
        return;
      }
      if (event.key === "g") {
        tandaiG();
      }
    }

    window.addEventListener(ACARA_PINTASAN, padaAcara);
    window.addEventListener("keydown", padaTombol);
    return () => {
      bersihkanG();
      window.removeEventListener(ACARA_PINTASAN, padaAcara);
      window.removeEventListener("keydown", padaTombol);
    };
  }, [buka, router]);

  return (
    <>
      {children}
      <Dialog open={buka} onOpenChange={setBuka}>
        <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Pintasan dan panduan cepat</DialogTitle>
            <DialogDescription>
              Tombol cepat keyboard dan ringkasan tugas tiap peran.
            </DialogDescription>
          </DialogHeader>
          <section aria-label="Daftar pintasan keyboard">
            <h3 className="text-sm font-semibold">Pintasan keyboard</h3>
            <ul className="mt-2 flex flex-col gap-2">
              {DAFTAR_PINTASAN.map((baris) => (
                <li
                  key={baris.guna}
                  className="flex items-center justify-between gap-3 text-sm"
                >
                  <span>{baris.guna}</span>
                  <span className="flex shrink-0 items-center gap-1">
                    {baris.tombol.map((t) => (
                      <kbd
                        key={t}
                        className="min-h-6 min-w-6 rounded border border-slate-300 bg-slate-100 px-1.5 py-0.5 text-center font-mono text-xs"
                      >
                        {t}
                      </kbd>
                    ))}
                  </span>
                </li>
              ))}
            </ul>
          </section>
          <section aria-label="Ringkasan tugas peran">
            <h3 className="text-sm font-semibold">Ringkasan tugas peran</h3>
            <ul className="mt-2 flex flex-col gap-2">
              {DAFTAR_PERAN.map((baris) => (
                <li key={baris.peran} className="text-sm">
                  <span className="font-semibold">{baris.peran}: </span>
                  <span>{baris.guna}</span>
                </li>
              ))}
            </ul>
          </section>
          <section aria-label="Pusat bantuan" className="mt-4">
            <Link
              href="/bantuan"
              onClick={() => setBuka(false)}
              className="flex min-h-12 items-center justify-center rounded-none bg-[#0B1F2E] px-4 text-sm font-semibold text-white"
            >
              Buka Pusat Bantuan Lengkap
            </Link>
          </section>
        </DialogContent>
      </Dialog>
    </>
  );
}
