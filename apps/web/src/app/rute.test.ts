import { readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";

// Folder berawalan garis bawah tidak di-routing Next (private folder).
// Harness break yang ditaruh di sana me-render 404 dan menghasilkan
// bukti tangkapan palsu. Tes ini menggagalkan build bila ada page/route
// yang tidak akan pernah bisa dibuka.
function kumpulkanTakTerrouting(dir: string, relatif = ""): string[] {
  const hasil: string[] = [];
  for (const nama of readdirSync(dir)) {
    const penuh = join(dir, nama);
    if (!statSync(penuh).isDirectory()) continue;
    const rel = relatif ? `${relatif}/${nama}` : nama;
    if (nama.startsWith("_")) {
      for (const isi of readdirSync(penuh)) {
        if (isi === "page.tsx" || isi === "route.ts" || isi === "default.tsx") {
          hasil.push(`${rel}/${isi}`);
        }
      }
    }
    hasil.push(...kumpulkanTakTerrouting(penuh, rel));
  }
  return hasil;
}

describe("rute dapat dibuka", () => {
  it("tidak ada page/route di folder privat garis-bawah", () => {
    const akar = __dirname;
    const mati = kumpulkanTakTerrouting(akar);
    expect(
      mati,
      `rute mati (folder _ tidak di-routing Next): ${mati.join(", ")}. Pindahkan harness ke rute normal atau hapus`
    ).toEqual([]);
  });
});
