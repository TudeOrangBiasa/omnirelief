import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const BATAS = 1000;
const AKAR = join(import.meta.dir, "..");
const DIREKTORI = ["apps", "packages", "supabase", "scripts", "docs", ".github"];
const EKSTENSI = [".ts", ".tsx", ".sql", ".mjs", ".yml", ".yaml", ".md"];
const LEWATI: Record<string, true> = {
  node_modules: true,
  ".next": true,
  ".turbo": true,
  dist: true,
  build: true,
};

async function kumpulkan(dir: string, hasil: string[]): Promise<void> {
  for (const nama of await readdir(dir)) {
    if (LEWATI[nama]) continue;
    const penuh = join(dir, nama);
    const info = await stat(penuh);
    if (info.isDirectory()) await kumpulkan(penuh, hasil);
    else if (EKSTENSI.some((e) => nama.endsWith(e))) hasil.push(penuh);
  }
}

const berkas: string[] = [];
for (const d of DIREKTORI) {
  try {
    await kumpulkan(join(AKAR, d), berkas);
  } catch {
    continue;
  }
}

let gagal = false;
for (const f of berkas.sort()) {
  const isi = await readFile(f, "utf8");
  const baris = isi.split("\n").length;
  if (baris > BATAS) {
    console.error(`LEBIH: ${relative(AKAR, f)} = ${baris} baris (batas ${BATAS})`);
    gagal = true;
  }
}
if (gagal) process.exit(1);
console.log(`OK: ${berkas.length} berkas di bawah ${BATAS} baris.`);
