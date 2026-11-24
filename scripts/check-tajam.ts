// Cek selera operasional: sudut bocor di luar daftar putih fungsional.
// Mode peringatan: selalu exit 0. Naikkan ke gagal bila daftar putih sudah stabil.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const AKAR = new URL("../apps/web/src", import.meta.url).pathname;
const POLA = /rounded-(full|xl|lg|md|2xl|\[[^\]]*\])|rounded(?![-a-z])/g;
// Baris yang dibolehkan: titik status, avatar, switch, bar progres,
const PUTIH = [
  "size-1.5 rounded-full", // dot status/telemetri
  "rounded-full text-sm font-bold text-white", // avatar sidebar/profil
  "rounded-full bg-secondary", // avatar lama (alias)
  "rounded-full bg-destructive", // lencana angka
  "h-2 w-full rounded-full", // bar progres tabel
  "h-2 rounded-full", // isi bar progres
  "rounded-full text-destructive", // tombol tutup dialog (ikon ×)
  "size-64 rounded", // QR + skeleton (gambar, bukan kotak UI)
  "size-7 shrink-0 items-center justify-center rounded-full", // simpul stepper bernomor
  "inline-flex min-h-12 min-w-12 items-center justify-center rounded-full", // FAB ke-atas
  "size-2.5 rounded-full", // dot timeline publik
  "size-8 items-center justify-center rounded-full", // avatar langkah tim
  "rounded-none", // bukan bulat: lewati
];

type Temuan = { berkas: string; baris: number; cuplik: string };
const temu: Temuan[] = [];

function pindai(dir: string): void {
  for (const nama of readdirSync(dir)) {
    const p = join(dir, nama);
    if (statSync(p).isDirectory()) {
      pindai(p);
      continue;
    }
    if (!/\.(tsx?|css)$/.test(nama)) continue;
    const isi = readFileSync(p, "utf8").split("\n");
    isi.forEach((baris, i) => {
      if (!POLA.test(baris)) return;
      POLA.lastIndex = 0;
      if (PUTIH.some((w) => baris.includes(w))) return;
      temu.push({ berkas: p, baris: i + 1, cuplik: baris.trim().slice(0, 120) });
    });
  }
}

pindai(AKAR);
if (temu.length === 0) {
  console.log("OK: tidak ada sudut bocor di luar daftar putih.");
} else {
  console.log(`PERINGATAN: ${temu.length} sudut bocor di luar daftar putih (mode peringatan, tidak menggagalkan):`);
  for (const t of temu) console.log(`- ${t.berkas}:${t.baris}: ${t.cuplik}`);
}
