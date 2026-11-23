"use client";

import { useEffect, useState } from "react";
import { Input } from "@omnirelief/ui/components/input";
import { Label } from "@omnirelief/ui/components/label";
import {
  IDENTITAS_BAKU,
  KUNCI_IDENTITAS,
  WARNA_AVATAR,
  bacaIdentitas,
  simpanIdentitas,
  type Identitas,
} from "@/lib/identitas";

export default function IdentitasForm() {
  const [nilai, setNilai] = useState<Identitas>({ ...IDENTITAS_BAKU });
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    setNilai(bacaIdentitas());
    setSiap(true);
  }, []);

  function ubah(patch: Partial<Identitas>): void {
    setNilai((lama) => {
      const baru = { ...lama, ...patch };
      simpanIdentitas(baru);
      try {
        window.dispatchEvent(new StorageEvent("storage", { key: KUNCI_IDENTITAS }));
      } catch {
        /* abaikan */
      }
      return baru;
    });
  }

  function aturUlang(): void {
    setNilai({ ...IDENTITAS_BAKU });
    simpanIdentitas({ ...IDENTITAS_BAKU });
  }

  const inisial = nilai.nama.trim().charAt(0).toUpperCase() || "?";

  return (
    <div className="flex flex-col gap-4 text-sm">
      <div className="flex items-center gap-3">
        <span
          aria-hidden="true"
          style={{ backgroundColor: nilai.warna }}
          className="flex size-14 items-center justify-center rounded-none text-xl font-bold text-white"
        >
          {inisial}
        </span>
        <p className="text-xs text-muted-foreground">
          Pratinjau lencana avatar. Warna langsung tampil di sidebar.
        </p>
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="identitas-nama">Nama panggilan</Label>
        <Input
          id="identitas-nama"
          value={nilai.nama}
          onChange={(e) => ubah({ nama: e.target.value })}
          placeholder="Dipanggil apa saat bertugas"
          maxLength={40}
          autoComplete="nickname"
          className="min-h-12 rounded-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="identitas-jabatan">Jabatan lapangan</Label>
        <Input
          id="identitas-jabatan"
          value={nilai.jabatan}
          onChange={(e) => ubah({ jabatan: e.target.value })}
          placeholder="Misal koordinator posko"
          maxLength={40}
          className="min-h-12 rounded-none"
        />
      </div>
      <div className="flex flex-col gap-1">
        <Label htmlFor="identitas-kontak">Nomor kontak darurat</Label>
        <Input
          id="identitas-kontak"
          value={nilai.kontak}
          onChange={(e) => ubah({ kontak: e.target.value })}
          placeholder="WhatsApp atau radio, misal 0812..."
          maxLength={30}
          inputMode="tel"
          className="min-h-12 rounded-none"
        />
      </div>
      <fieldset>
        <legend className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#1B7FBF]">
          Warna lencana avatar
        </legend>
        <div className="mt-2 flex gap-2">
          {WARNA_AVATAR.map((w) => (
            <button
              key={w.nilai}
              type="button"
              onClick={() => ubah({ warna: w.nilai })}
              aria-pressed={nilai.warna === w.nilai}
              aria-label={w.label}
              title={w.label}
              style={{ backgroundColor: w.nilai }}
              className={`flex min-h-12 min-w-12 items-center justify-center rounded-none text-lg font-bold text-white ${nilai.warna === w.nilai ? "outline-2 outline-offset-2 outline-[#0B1F2E]" : ""}`}
            >
              {nilai.warna === w.nilai ? "✓" : ""}
            </button>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <p role="status" className="flex items-center gap-2 text-xs font-semibold text-[#0B1F2E]">
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
