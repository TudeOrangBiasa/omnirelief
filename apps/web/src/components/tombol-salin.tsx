"use client";

import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { CheckIcon, CopyIcon } from "@solar-icons/react/linear";
import { Button } from "@omnirelief/ui/components/button";
import { cn } from "@omnirelief/ui/lib/utils";

type Props = {
  /** Teks yang disalin ke clipboard. */
  teks: string;
  label?: string;
  pesanSukses?: string;
  pesanGagal?: string;
  className?: string;
  variant?: "default" | "outline" | "secondary" | "ghost" | "destructive" | "link";
};

/** Tombol salin dengan umpan balik taktil: ikon centang + label
 * "Tersalin" selama 2 detik, plus toast. Idempotent, timer dibersihkan.
 */
export default function TombolSalin({
  teks,
  label = "Salin Tautan",
  pesanSukses = "Tautan disalin",
  pesanGagal = "Gagal menyalin",
  className,
  variant = "default",
}: Props) {
  const [tersalin, setTersalin] = useState(false);
  const timer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timer.current !== null) window.clearTimeout(timer.current);
    },
    []
  );

  async function salin() {
    try {
      await navigator.clipboard.writeText(teks);
    } catch {
      try {
        const area = document.createElement("textarea");
        area.value = teks;
        document.body.appendChild(area);
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      } catch {
        toast.error(pesanGagal);
        return;
      }
    }
    toast.success(pesanSukses);
    setTersalin(true);
    if (timer.current !== null) window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setTersalin(false), 2000);
  }

  return (
    <Button
      onClick={() => void salin()}
      variant={variant}
      className={cn("tekan min-h-12 w-full", className)}
      aria-live="polite"
    >
      <span aria-hidden="true" className="tukar-ikon">
        <CopyIcon className={tersalin ? "opacity-0" : "opacity-100"} />
        <CheckIcon className={tersalin ? "opacity-100" : "opacity-0"} />
      </span>
      {tersalin ? "Tersalin" : label}
    </Button>
  );
}
