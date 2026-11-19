"use client";

import { useEffect, useState } from "react";
import { kirimAntrean, muatAntrean } from "@/lib/offline";

async function kirimNyata(url: string, badan: Record<string, unknown>): Promise<boolean> {
  try {
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(badan),
    });
    return res.ok;
  } catch {
    return false;
  }
}

export function hitungAntrean(): number {
  if (typeof window === "undefined" || !window.localStorage) return 0;
  return muatAntrean(window.localStorage).length;
}

export default function BannerOffline() {
  const [ daring, setDaring ] = useState(true);
  const [ antre, setAntre ] = useState(0);

  useEffect(() => {
    async function segarkan() {
      setDaring(window.navigator.onLine);
      if (window.navigator.onLine) {
        const sisa = await kirimAntrean(window.localStorage, kirimNyata);
        setAntre(sisa.length);
      } else {
        setAntre(hitungAntrean());
      }
    }
    void segarkan();
    window.addEventListener("online", () => void segarkan());
    window.addEventListener("offline", () => void segarkan());
    return () => {
      window.removeEventListener("online", () => void segarkan());
      window.removeEventListener("offline", () => void segarkan());
    };
  }, []);

  if (daring && antre === 0) return null;
  return (
    <p role="status" className="rounded bg-[#FEF3C7] p-3 text-sm text-[#B45309]">
      {!daring
        ? `Koneksi lemah, data tersimpan dan terkirim otomatis (${antre} antre).`
        : `${antre} data menunggu sinkronisasi.`}
    </p>
  );
}
