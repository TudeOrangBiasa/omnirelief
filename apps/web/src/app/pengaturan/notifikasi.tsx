"use client";

import { useEffect, useState } from "react";
import { Label } from "@omnirelief/ui/components/label";
import { Switch } from "@omnirelief/ui/components/switch";

const KUNCI = "omnirelief-notifikasi";

type Pilihan = { tugas: boolean; dicek: boolean; sinkron: boolean };

const BARIS: { kunci: keyof Pilihan; judul: string; jelas: string }[] = [
  { kunci: "tugas", judul: "Tugas baru untuk saya", jelas: "Kirim manifest baru ke tim saya." },
  { kunci: "dicek", judul: "Perlu Dicek", jelas: "Lewat batas check-in tanpa kabar." },
  { kunci: "sinkron", judul: "Hasil sinkronisasi offline", jelas: "Antrean terkirim setelah daring." },
];

function baca(): Pilihan {
  const baku = { tugas: true, dicek: true, sinkron: true };
  try {
    const mentah = window.localStorage.getItem(KUNCI);
    if (!mentah) return baku;
    const p = JSON.parse(mentah) as Partial<Pilihan>;
    return {
      tugas: p.tugas !== false,
      dicek: p.dicek !== false,
      sinkron: p.sinkron !== false,
    };
  } catch {
    return baku;
  }
}

export default function NotifikasiForm() {
  const [pilihan, setPilihan] = useState<Pilihan>({ tugas: true, dicek: true, sinkron: true });
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    setPilihan(baca());
    setSiap(true);
  }, []);

  function ubah(kunci: keyof Pilihan, nilai: boolean): void {
    setPilihan((lama) => {
      const baru = { ...lama, [kunci]: nilai };
      try {
        window.localStorage.setItem(KUNCI, JSON.stringify(baru));
      } catch {
        /* abaikan */
      }
      return baru;
    });
  }

  return (
    <div className="flex flex-col gap-1 text-sm">
      {BARIS.map((b) => (
        <div key={b.kunci} className="flex min-h-12 items-center justify-between gap-3">
          <div className="flex flex-col">
            <Label htmlFor={`notif-${b.kunci}`}>{b.judul}</Label>
            <span className="text-muted-foreground text-xs">{b.jelas}</span>
          </div>
          <Switch
            id={`notif-${b.kunci}`}
            checked={siap && pilihan[b.kunci]}
            onCheckedChange={(nilai) => ubah(b.kunci, nilai)}
            aria-label={`${b.judul}, ${pilihan[b.kunci] ? "aktif" : "nonaktif"}`}
          />
        </div>
      ))}
      <p role="status" id="notif-info" className="text-muted-foreground">
        {siap ? "Pilihan notifikasi tersimpan di perangkat ini." : "Memuat pilihan…"}
      </p>
      <p className="text-muted-foreground text-xs">
        Butuh teks lebih besar? <a href="#aksesibilitas" className="underline">Buka aksesibilitas</a>.
      </p>
    </div>
  );
}
