"use client";

import { useEffect, useState } from "react";
import { Label } from "@omnirelief/ui/components/label";
import { Switch } from "@omnirelief/ui/components/switch";

const KUNCI = "omnirelief-aksesibilitas";

type Ukuran = "biasa" | "besar" | "sangat";
type Pilihan = { teks: Ukuran; kontras: boolean; gerak: boolean };

const BAKU: Pilihan = { teks: "biasa", kontras: false, gerak: false };

const UKURAN: { nilai: Ukuran; label: string }[] = [
  { nilai: "biasa", label: "Biasa" },
  { nilai: "besar", label: "Besar" },
  { nilai: "sangat", label: "Sangat besar" },
];

function baca(): Pilihan {
  try {
    const mentah = window.localStorage.getItem(KUNCI);
    if (!mentah) return { ...BAKU };
    const p = JSON.parse(mentah) as Partial<Pilihan>;
    const teks: Ukuran =
      p.teks === "besar" || p.teks === "sangat" ? p.teks : "biasa";
    return { teks, kontras: p.kontras === true, gerak: p.gerak === true };
  } catch {
    return { ...BAKU };
  }
}

function terapkan(p: Pilihan): void {
  const akar = document.documentElement;
  akar.style.fontSize = p.teks === "besar" ? "112.5%" : p.teks === "sangat" ? "125%" : "";
  akar.classList.toggle("a11y-kontras", p.kontras);
  akar.classList.toggle("a11y-gerak", p.gerak);
}

export default function AksesibilitasForm() {
  const [pilihan, setPilihan] = useState<Pilihan>({ ...BAKU });
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    const awal = baca();
    setPilihan(awal);
    terapkan(awal);
    setSiap(true);
  }, []);

  function simpan(baru: Pilihan): void {
    setPilihan(baru);
    terapkan(baru);
    try {
      window.localStorage.setItem(KUNCI, JSON.stringify(baru));
    } catch {
      /* abaikan */
    }
  }

  function aturUlang(): void {
    simpan({ ...BAKU });
  }

  return (
    <div className="flex flex-col gap-3 text-sm">
      <fieldset className="flex flex-col gap-2">
        <legend className="font-semibold">Ukuran teks</legend>
        <div className="flex gap-2" role="group" aria-label="Ukuran teks">
          {UKURAN.map((u) => (
            <button
              key={u.nilai}
              type="button"
              aria-pressed={siap && pilihan.teks === u.nilai}
              onClick={() => simpan({ ...pilihan, teks: u.nilai })}
              className={`flex min-h-12 flex-1 items-center justify-center rounded-none border px-3 font-semibold ${
                pilihan.teks === u.nilai
                  ? "border-[#0B1F2E] bg-[#0B1F2E] text-white"
                  : "border-[#0B1F2E]/15 bg-white text-[#0B1F2E]"
              }`}
            >
              {u.label}
            </button>
          ))}
        </div>
        <p aria-live="polite" className="text-xs text-muted-foreground">
          Pratinjau: Posko A melayani 120 penyintas hari ini.
        </p>
      </fieldset>
      <div className="flex min-h-12 items-center justify-between gap-3 border-t border-[#0B1F2E]/10 pt-2">
        <div className="flex flex-col">
          <Label htmlFor="a11y-kontras">Kontras tinggi</Label>
          <span className="text-xs text-muted-foreground">Teks lebih tegas, tetap terang.</span>
        </div>
        <Switch
          id="a11y-kontras"
          checked={siap && pilihan.kontras}
          onCheckedChange={(nilai) => simpan({ ...pilihan, kontras: nilai })}
          aria-label={`Kontras tinggi, ${pilihan.kontras ? "aktif" : "nonaktif"}`}
        />
      </div>
      <div className="flex min-h-12 items-center justify-between gap-3 border-t border-[#0B1F2E]/10 pt-2">
        <div className="flex flex-col">
          <Label htmlFor="a11y-gerak">Kurangi gerak dan animasi</Label>
          <span className="text-xs text-muted-foreground">Menghormati preferensi perangkat.</span>
        </div>
        <Switch
          id="a11y-gerak"
          checked={siap && pilihan.gerak}
          onCheckedChange={(nilai) => simpan({ ...pilihan, gerak: nilai })}
          aria-label={`Kurangi gerak dan animasi, ${pilihan.gerak ? "aktif" : "nonaktif"}`}
        />
      </div>
      <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
        <p role="status" id="a11y-info" className="flex items-center gap-2 text-xs font-semibold text-[#0B1F2E]">
          <span aria-hidden="true" className="inline-block size-2 rounded-none bg-emerald-600" />
          {siap ? "Tersimpan otomatis di perangkat ini." : "Memuat pilihan…"}
        </p>
        <button
          type="button"
          onClick={aturUlang}
          className="flex min-h-12 items-center rounded-none border border-[#0B1F2E]/15 bg-white px-4 text-xs font-bold uppercase tracking-wide text-[#0B1F2E] hover:bg-[#DCE8EE]"
        >
          Reset ke Default
        </button>
      </div>
    </div>
  );
}
