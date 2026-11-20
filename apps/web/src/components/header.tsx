"use client";

import { useEffect, useState } from "react";
import { WiFiOffIcon } from "@solar-icons/react/linear";
import { hitungAntrean } from "@/components/banner-offline";

export default function Header({
  nama,
  peranLabel,
}: {
  nama: string | null;
  peranLabel: string;
}) {
  const [daring, setDaring] = useState(true);
  const [antre, setAntre] = useState(0);

  useEffect(() => {
    function segarkan() {
      setDaring(window.navigator.onLine);
      setAntre(hitungAntrean());
    }
    segarkan();
    window.addEventListener("online", segarkan);
    window.addEventListener("offline", segarkan);
    window.addEventListener("storage", segarkan);
    const id = window.setInterval(segarkan, 5000);
    return () => {
      window.removeEventListener("online", segarkan);
      window.removeEventListener("offline", segarkan);
      window.removeEventListener("storage", segarkan);
      window.clearInterval(id);
    };
  }, []);

  const inisial = (nama ?? "?").trim().charAt(0).toUpperCase() || "?";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background">
      <div className="mx-auto flex min-h-16 w-full max-w-5xl items-center gap-3 px-4">
        <a
          href="/"
          className="flex min-h-12 items-center gap-2 font-bold text-primary"
        >
          <span
            aria-hidden="true"
            className="flex size-8 items-center justify-center rounded-lg bg-primary text-sm font-bold text-primary-foreground"
          >
            O
          </span>
          <span className="leading-tight">
            OmniRelief
            <span className="block text-xs font-normal text-muted-foreground">
              {peranLabel}
            </span>
          </span>
        </a>
        <div className="ms-auto flex items-center gap-2">
          {(!daring || antre > 0) && (
            <p
              role="status"
              className="flex min-h-12 items-center gap-1.5 rounded-full bg-warning-bg px-3 text-xs font-semibold text-warning-badge-fg"
            >
              <WiFiOffIcon aria-hidden="true" className="size-4" />
              {!daring
                ? `Luring${antre > 0 ? ` · ${antre} Menunggu Sinkronisasi` : ""}`
                : `${antre} Menunggu Sinkronisasi`}
            </p>
          )}
          {nama ? (
            <a
              href="/profil"
              aria-label={`Profil ${nama}`}
              className="flex min-h-12 min-w-12 items-center justify-center rounded-full bg-secondary px-2 text-sm font-bold text-secondary-foreground"
            >
              {inisial}
            </a>
          ) : (
            <a
              href="/masuk"
              className="flex min-h-12 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              Masuk
            </a>
          )}
        </div>
      </div>
    </header>
  );
}
