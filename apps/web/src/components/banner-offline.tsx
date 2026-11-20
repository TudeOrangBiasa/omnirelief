"use client";

import { useEffect, useState } from "react";
import { Alert, AlertDescription, AlertTitle } from "@omnirelief/ui/components/alert";
import { WiFiOffIcon } from "@solar-icons/react/linear";
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
    function saatBerubah() {
      void segarkan();
    }
    void segarkan();
    window.addEventListener("online", saatBerubah);
    window.addEventListener("offline", saatBerubah);
    return () => {
      window.removeEventListener("online", saatBerubah);
      window.removeEventListener("offline", saatBerubah);
    };
  }, []);

  if (daring && antre === 0) return null;
  return (
    <Alert
      role="status"
      className="border-warning bg-warning-bg text-warning-badge-fg"
    >
      <WiFiOffIcon />
      <AlertTitle>{!daring ? "Luring" : "Menunggu Sinkronisasi"}</AlertTitle>
      <AlertDescription className="text-warning-badge-fg">
        {!daring
          ? `Koneksi lemah, data tersimpan dan terkirim otomatis (${antre} antre).`
          : `${antre} data menunggu sinkronisasi.`}
      </AlertDescription>
    </Alert>
  );
}
