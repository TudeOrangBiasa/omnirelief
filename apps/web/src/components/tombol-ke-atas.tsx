"use client";

import { useEffect, useState } from "react";

const AMBANG_TAMPIL = 600;

export default function TombolKeAtas() {
  const [tampil, setTampil] = useState(false);

  useEffect(() => {
    function saatGulir() {
      setTampil(window.scrollY > AMBANG_TAMPIL);
    }
    saatGulir();
    window.addEventListener("scroll", saatGulir, { passive: true });
    return () => window.removeEventListener("scroll", saatGulir);
  }, []);

  if (!tampil) return null;

  return (
    <button
      type="button"
      onClick={() =>
        window.scrollTo({
          top: 0,
          behavior: window.matchMedia("(prefers-reduced-motion: reduce)")
            .matches
            ? "auto"
            : "smooth",
        })
      }
      aria-label="Kembali ke atas"
      className="fixed right-6 bottom-24 z-50 inline-flex min-h-12 min-w-12 items-center justify-center rounded-full bg-foreground text-lg text-white shadow-lg hover:bg-foreground/90 md:bottom-6"
    >
      <span aria-hidden="true">↑</span>
    </button>
  );
}
