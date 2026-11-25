"use client";

import { useEffect, useState } from "react";
import { Label } from "@omnirelief/ui/components/label";
import { Switch } from "@omnirelief/ui/components/switch";

const KUNCI_LAMA = "omnirelief-notifikasi";

export const KUNCI_NOTIFIKASI = "omnirelief-notifikasi-v2";

export type FrekuensiNotifikasi = "seketika" | "perjam";

export type PengaturanNotifikasi = {
  tugas: boolean;
  dicek: boolean;
  sinkron: boolean;
  bisu: boolean;
  spanduk: boolean;
  suara: boolean;
  frekuensi: FrekuensiNotifikasi;
};

export const BAKU_NOTIFIKASI: PengaturanNotifikasi = {
  tugas: true,
  dicek: true,
  sinkron: true,
  bisu: false,
  spanduk: true,
  suara: true,
  frekuensi: "seketika",
};

function isRekaman(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function bacaLama(): Pick<PengaturanNotifikasi, "tugas" | "dicek" | "sinkron"> | null {
  try {
    const mentah = window.localStorage.getItem(KUNCI_LAMA);
    if (!mentah) return null;
    const parsed: unknown = JSON.parse(mentah);
    if (!isRekaman(parsed)) return null;
    const tugas = "tugas" in parsed ? parsed["tugas"] : undefined;
    const dicek = "dicek" in parsed ? parsed["dicek"] : undefined;
    const sinkron = "sinkron" in parsed ? parsed["sinkron"] : undefined;
    return {
      tugas: typeof tugas === "boolean" ? tugas : true,
      dicek: typeof dicek === "boolean" ? dicek : true,
      sinkron: typeof sinkron === "boolean" ? sinkron : true,
    };
  } catch {
    return null;
  }
}

function bacaBoolean(
  rekaman: Record<string, unknown>,
  kunci: string,
  baku: boolean,
): boolean {
  if (!(kunci in rekaman)) return baku;
  const nilai = rekaman[kunci];
  return typeof nilai === "boolean" ? nilai : baku;
}

export function bacaPengaturanNotifikasi(): PengaturanNotifikasi {
  const baku = { ...BAKU_NOTIFIKASI };
  try {
    const mentah = window.localStorage.getItem(KUNCI_NOTIFIKASI);
    if (!mentah) {
      const lama = bacaLama();
      if (lama) return { ...baku, ...lama };
      return baku;
    }
    const parsed: unknown = JSON.parse(mentah);
    if (!isRekaman(parsed)) return baku;
    const frekuensi: FrekuensiNotifikasi =
      "frekuensi" in parsed && parsed["frekuensi"] === "perjam" ? "perjam" : "seketika";
    return {
      tugas: bacaBoolean(parsed, "tugas", baku.tugas),
      dicek: bacaBoolean(parsed, "dicek", baku.dicek),
      sinkron: bacaBoolean(parsed, "sinkron", baku.sinkron),
      bisu: bacaBoolean(parsed, "bisu", baku.bisu),
      spanduk: bacaBoolean(parsed, "spanduk", baku.spanduk),
      suara: bacaBoolean(parsed, "suara", baku.suara),
      frekuensi,
    };
  } catch {
    return baku;
  }
}

function simpanPengaturan(p: PengaturanNotifikasi): void {
  try {
    window.localStorage.setItem(KUNCI_NOTIFIKASI, JSON.stringify(p));
  } catch {
    /* abaikan */
  }
}

const BARIS: { kunci: "tugas" | "dicek" | "sinkron"; judul: string; jelas: string }[] = [
  { kunci: "tugas", judul: "Tugas baru untuk saya", jelas: "Kirim manifest baru ke tim saya." },
  { kunci: "dicek", judul: "Perlu Dicek", jelas: "Lewat batas check-in tanpa kabar." },
  { kunci: "sinkron", judul: "Hasil sinkronisasi offline", jelas: "Antrean terkirim setelah daring." },
];

export default function NotifikasiForm() {
  const [pilihan, setPilihan] = useState<PengaturanNotifikasi>({ ...BAKU_NOTIFIKASI });
  const [siap, setSiap] = useState(false);

  useEffect(() => {
    setPilihan(bacaPengaturanNotifikasi());
    setSiap(true);
  }, []);

  function ubah<K extends keyof PengaturanNotifikasi>(kunci: K, nilai: PengaturanNotifikasi[K]): void {
    setPilihan((lama) => {
      const baru = { ...lama, [kunci]: nilai };
      simpanPengaturan(baru);
      return baru;
    });
  }

  function aturUlang(): void {
    setPilihan({ ...BAKU_NOTIFIKASI });
    simpanPengaturan({ ...BAKU_NOTIFIKASI });
  }

  const nonaktif = !siap || pilihan.bisu;

  return (
    <div className="flex flex-col gap-1 text-sm">
      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-[#0B1F2E]/10 py-2">
        <div className="flex flex-col">
          <Label htmlFor="notif-bisu">Senyapkan Semua Sementara</Label>
          <span className="text-xs text-muted-foreground">
            Matikan bunyi dan lencana sampai sakelar ini dimatikan lagi.
          </span>
        </div>
        <Switch
          id="notif-bisu"
          checked={siap && pilihan.bisu}
          onCheckedChange={(nilai) => ubah("bisu", nilai)}
          aria-label={`Senyapkan Semua Sementara, ${pilihan.bisu ? "aktif" : "nonaktif"}`}
        />
      </div>

      {BARIS.map((b) => (
        <div key={b.kunci} className="flex min-h-12 items-center justify-between gap-3 border-b border-[#0B1F2E]/10 py-2 last:border-b-0">
          <div className="flex flex-col">
            <Label htmlFor={`notif-${b.kunci}`}>{b.judul}</Label>
            <span className="text-xs text-muted-foreground">{b.jelas}</span>
          </div>
          <Switch
            id={`notif-${b.kunci}`}
            checked={siap && !pilihan.bisu && pilihan[b.kunci]}
            disabled={nonaktif}
            onCheckedChange={(nilai) => ubah(b.kunci, nilai)}
            aria-label={`${b.judul}, ${pilihan[b.kunci] ? "aktif" : "nonaktif"}`}
          />
        </div>
      ))}

      <p className="mt-3 font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
        Kanal
      </p>
      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-[#0B1F2E]/10 py-2">
        <div className="flex flex-col">
          <Label htmlFor="notif-spanduk">Banner Dalam Aplikasi</Label>
          <span className="text-xs text-muted-foreground">
            Tampilkan lencana jumlah di ikon lonceng.
          </span>
        </div>
        <Switch
          id="notif-spanduk"
          checked={siap && !pilihan.bisu && pilihan.spanduk}
          disabled={nonaktif}
          onCheckedChange={(nilai) => ubah("spanduk", nilai)}
          aria-label={`Banner Dalam Aplikasi, ${pilihan.spanduk ? "aktif" : "nonaktif"}`}
        />
      </div>
      <div className="flex min-h-12 items-center justify-between gap-3 border-b border-[#0B1F2E]/10 py-2">
        <div className="flex flex-col">
          <Label htmlFor="notif-suara">Suara Peringatan Darurat</Label>
          <span className="text-xs text-muted-foreground">
            Bunyikan bip pendek saat ada kabar Perlu Dicek yang baru.
          </span>
        </div>
        <Switch
          id="notif-suara"
          checked={siap && !pilihan.bisu && pilihan.suara}
          disabled={nonaktif}
          onCheckedChange={(nilai) => ubah("suara", nilai)}
          aria-label={`Suara Peringatan Darurat, ${pilihan.suara ? "aktif" : "nonaktif"}`}
        />
      </div>

      <p className="mt-3 font-mono text-[11px] tracking-widest text-muted-foreground uppercase">
        Frekuensi
      </p>
      <div role="radiogroup" aria-label="Frekuensi pemberitahuan" className="flex flex-col gap-2">
        <label
          htmlFor="notif-frek-seketika"
          className="flex min-h-12 cursor-pointer items-center gap-3 garis-rambut-diam bg-white px-4 py-2 has-checked:border-[#0f79b8] has-checked:bg-[#DCE8EE]/40 has-disabled:cursor-not-allowed has-disabled:opacity-50"
        >
          <input
            id="notif-frek-seketika"
            type="radio"
            name="notif-frekuensi"
            value="seketika"
            checked={pilihan.frekuensi === "seketika"}
            disabled={nonaktif}
            onChange={() => ubah("frekuensi", "seketika")}
            className="size-4 accent-[#0f79b8]"
          />
          <span className="flex flex-col">
            <span className="text-sm font-semibold">Real-time Seketika</span>
            <span className="text-xs text-muted-foreground">Periksa kabar baru tiap 30 detik.</span>
          </span>
        </label>
        <label
          htmlFor="notif-frek-perjam"
          className="flex min-h-12 cursor-pointer items-center gap-3 garis-rambut-diam bg-white px-4 py-2 has-checked:border-[#0f79b8] has-checked:bg-[#DCE8EE]/40 has-disabled:cursor-not-allowed has-disabled:opacity-50"
        >
          <input
            id="notif-frek-perjam"
            type="radio"
            name="notif-frekuensi"
            value="perjam"
            checked={pilihan.frekuensi === "perjam"}
            disabled={nonaktif}
            onChange={() => ubah("frekuensi", "perjam")}
            className="size-4 accent-[#0f79b8]"
          />
          <span className="flex flex-col">
            <span className="text-sm font-semibold">Ringkasan Per Jam</span>
            <span className="text-xs text-muted-foreground">Periksa kabar baru tiap 1 jam.</span>
          </span>
        </label>
      </div>

      <div className="mt-2 flex flex-wrap items-center justify-between gap-3">
        <p role="status" id="notif-info" className="flex items-center gap-2 text-xs font-semibold text-[#0B1F2E]">
          <span aria-hidden="true" className="inline-block size-2 rounded-none bg-emerald-600" />
          {siap ? "Tersimpan otomatis di perangkat ini." : "Memuat pilihan…"}
        </p>
        <button
          type="button"
          onClick={aturUlang}
          className="flex min-h-12 items-center rounded-none garis-rambut-diam bg-white px-4 text-xs font-bold uppercase tracking-wide text-[#0B1F2E] hover:bg-[#DCE8EE]"
        >
          Reset ke Default
        </button>
      </div>
      <p className="text-xs text-muted-foreground">
        Butuh teks lebih besar? <a href="#aksesibilitas" className="underline">Buka aksesibilitas</a>.
      </p>
    </div>
  );
}
