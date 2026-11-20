// Verifikasi formal selera UI: tiap berkas dalam cakupan diperiksa,
// bukan sampel. Aturan bersumber dari docs/desain/design.md.
// Jalankan: bun run check:ui. Keluar 1 bila satu cek gagal.
import { readdir, readFile, stat } from "node:fs/promises";
import { join, relative } from "node:path";

const AKAR = join(import.meta.dir, "..");
const SRC = ["apps/web/src", "packages/ui/src"];
const LEWATI_DIR: Record<string, true> = { node_modules: true, ".next": true, ".turbo": true, dist: true, build: true };
// globals.css adalah satu-satunya sumber nilai token (design.md: nilai token
// hanya di packages/ui/src/styles/globals.css).
const FONDASI = ["apps/web/src/components", "apps/web/src/lib", "packages/ui/src/components"];
const FONDASI_LEWATI: Record<string, true> = { "packages/ui/src/styles/globals.css": true };

type Temuan = { berkas: string; baris: number; isi: string };

async function kumpulkan(dir: string, hasil: string[]): Promise<void> {
  let entri: string[];
  try {
    entri = await readdir(dir);
  } catch {
    return;
  }
  for (const nama of entri) {
    if (LEWATI_DIR[nama]) continue;
    const penuh = join(dir, nama);
    const info = await stat(penuh);
    if (info.isDirectory()) await kumpulkan(penuh, hasil);
    else if (nama.endsWith(".ts") || nama.endsWith(".tsx")) hasil.push(penuh);
  }
}

async function bacaBaris(f: string): Promise<string[]> {
  return (await readFile(f, "utf8")).split("\n");
}

const rel = (f: string) => relative(AKAR, f);
let gagal = false;
function lapor(nama: string, ok: boolean, temuan: Temuan[], acuan: string) {
  if (ok) console.log(`OK   ${nama} (${acuan})`);
  else {
    gagal = true;
    for (const t of temuan.slice(0, 20))
      console.error(`GAGAL ${nama} ${t.berkas}:${t.baris}: ${t.isi.trim().slice(0, 120)} (${acuan})`);
    if (temuan.length > 20) console.error(`GAGAL ${nama}: +${temuan.length - 20} temuan lain (${acuan})`);
  }
}

const berkas: string[] = [];
for (const d of SRC) await kumpulkan(join(AKAR, d), berkas);
const isi = new Map<string, string[]>();
for (const f of berkas) isi.set(f, await bacaBaris(f));

// C1 larang-lucide — design.md §Komponen Ikon: satu-satunya @solar-icons/react.
{
  const temuan: Temuan[] = [];
  for (const [f, baris] of isi)
    baris.forEach((b, i) => {
      if (b.includes("lucide-react")) temuan.push({ berkas: rel(f), baris: i + 1, isi: b });
    });
  for (const pj of ["apps/web/package.json", "packages/ui/package.json"]) {
    const teks = await readFile(join(AKAR, pj), "utf8").catch(() => "");
    if (teks.includes("lucide-react"))
      temuan.push({ berkas: pj, baris: 0, isi: "dependensi lucide-react" });
  }
  lapor("larang-lucide", temuan.length === 0, temuan, "design.md §Komponen Ikon");
}

// C2 nama-ikon-solar — design.md §Komponen Ikon: nama diverifikasi dari dist.
{
  const temuan: Temuan[] = [];
  const pola = /from\s+["']@solar-icons\/react(\/[a-z-]+)?["']/g;
  const impor = /import\s+(?:type\s+)?\{([^}]+)\}/;
  const dist = new Map<string, string>();
  for (const basis of ["apps/web/node_modules/@solar-icons/react", "packages/ui/node_modules/@solar-icons/react"]) {
    for (const gaya of ["linear", "bold-duotone"]) {
      const kunci = `${basis}::${gaya}`;
      if (dist.has(kunci)) continue;
      const teks = await readFile(join(AKAR, basis, "dist/icons/style", `${gaya}.mjs`), "utf8").catch(() => "");
      if (teks) dist.set(kunci, teks);
    }
  }
  const adaDist = [...dist.values()].some((t) => t.length > 0);
  for (const [f, baris] of isi)
    baris.forEach((b, i) => {
      const m = pola.exec(b);
      pola.lastIndex = 0;
      if (!m) return;
      if (!m[1]) return; // entri utama (@solar-icons/react): provider/hook, bukan ikon.
      const gaya = m[1] === "/bold-duotone" ? "bold-duotone" : "linear";
      const im = b.match(impor);
      if (!im) return;
      const teksGaya = [...dist.entries()]
        .filter(([k]) => k.endsWith(`::${gaya}`))
        .map(([, t]) => t)
        .join("\n");
      for (const mentah of im[1].split(",")) {
        const nama = mentah.trim().split(/\s+as\s+/).pop()?.trim() ?? "";
        if (!nama || nama.startsWith("type ")) continue;
        if (adaDist && !teksGaya.includes(` as ${nama},`))
          temuan.push({ berkas: rel(f), baris: i + 1, isi: `ikon tak dikenal: ${nama}` });
      }
    });
  lapor("nama-ikon-solar", temuan.length === 0, temuan, "design.md §Komponen Ikon");
}

// C3 provider — design.md §Komponen Ikon: default global size + strokeWidth.
{
  const f = join(AKAR, "apps/web/src/components/providers.tsx");
  const teks = (await readFile(f, "utf8").catch(() => "")).replace(/\s+/g, " ");
  const ok = teks.includes("SolarProvider") && teks.includes("size=") && teks.includes("strokeWidth=");
  lapor("provider-ikon", ok, ok ? [] : [{ berkas: "apps/web/src/components/providers.tsx", baris: 0, isi: "SolarProvider tanpa size+strokeWidth" }], "design.md §Komponen Ikon");
}

// C4 tanpa-prop-ukuran — mengandalkan default provider, bukan repetisi.
{
  const temuan: Temuan[] = [];
  const pola = /<[A-Z][A-Za-z]*Icon\b[^>]*(?:\bsize=|\bstrokeWidth=)/;
  for (const [f, baris] of isi) {
    if (f.endsWith("providers.tsx")) continue;
    baris.forEach((b, i) => {
      if (pola.test(b)) temuan.push({ berkas: rel(f), baris: i + 1, isi: b });
    });
  }
  lapor("tanpa-prop-ukuran", temuan.length === 0, temuan, "design.md §Komponen Ikon");
}

// C5 fondasi-tanpa-hex — design.md Langkah #1: nol hex di luar token.
{
  const temuan: Temuan[] = [];
  const pola = /#[0-9a-fA-F]{3,8}\b/;
  for (const [f, baris] of isi) {
    const r = rel(f);
    if (!FONDASI.some((d) => r === d || r.startsWith(`${d}/`))) continue;
    if (FONDASI_LEWATI[r]) continue;
    baris.forEach((b, i) => {
      if (pola.test(b)) temuan.push({ berkas: r, baris: i + 1, isi: b });
    });
  }
  lapor("fondasi-tanpa-hex", temuan.length === 0, temuan, "design.md Langkah #1");
}

// C6 tanpa-shadow-arbitrary — design.md Langkah #1: nol bayangan kustom.
{
  const temuan: Temuan[] = [];
  for (const [f, baris] of isi)
    baris.forEach((b, i) => {
      if (b.includes("shadow-[")) temuan.push({ berkas: rel(f), baris: i + 1, isi: b });
    });
  lapor("tanpa-shadow-arbitrary", temuan.length === 0, temuan, "design.md Langkah #1");
}

if (gagal) process.exit(1);
console.log(`OK: ${berkas.length} berkas diperiksa, 6 cek lolos.`);
