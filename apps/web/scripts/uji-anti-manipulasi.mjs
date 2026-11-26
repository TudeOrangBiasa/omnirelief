// Skrip QA read-only: uji anti-manipulasi ledger manifest.
// - Tanpa mutasi: probe UPDATE memakai filter mustahil (id = -1), tanpa INSERT/DELETE.
// - JANGAN apply migrasi dari sini; trigger 0002_kunci_status.sql di-apply manusia.
// Jalankan: bun scripts/uji-anti-manipulasi.mjs [--dasar http://localhost:3001]
// Env: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY (probe 1-2)
//      UJI_EMAIL, UJI_SANDI (opsional, akun non-BPBD untuk probe 2)
//      SUPABASE_SERVICE_ROLE_KEY (opsional, SELECT saja untuk verifikasi rantai dalam)
//      KODE (opsional, default MNF-2026-0001)

import { createClient } from "@supabase/supabase-js";
import { hashLog, hashManifest, GENESIS_HASH } from "../src/lib/hash.ts";

const dasar = process.argv.includes("--dasar")
  ? process.argv[process.argv.indexOf("--dasar") + 1]
  : (process.env.DASAR ?? "http://localhost:3001");
const KODE = process.env.KODE ?? "MNF-2026-0001";
const URL = process.env.NEXT_PUBLIC_SUPABASE_URL ?? "";
const ANON = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "";
const SRV = process.env.SUPABASE_SERVICE_ROLE_KEY ?? "";

function catat(skenario, status, detail) {
  console.log(`[${status}] ${skenario} — ${detail}`);
  return { skenario, status, detail };
}

const hasil = [];

// Skenario 1: audit statis — migrasi tak boleh memuat policy tulis (RLS default-deny).
// Probe mustahil (id=-1) tak bisa membedakan "ditolak RLS" dari "nol baris cocok",
// jadi bukti dinamis hanya konsistensi; bukti penentu adalah audit berkas migrasi.
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
 const akarRepo = join(dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
let tulisDitemukan = [];
try {
const sql = readFileSync(join(akarRepo, "supabase", "migrations", "0001_schema.sql"), "utf8");
const barisTulis = sql.split("\n").filter((b) => /create policy/i.test(b) && /for\s+(update|delete|insert|all)/i.test(b));
tulisDitemukan = barisTulis;
} catch { tulisDitemukan = ["gagal baca 0001_schema.sql"]; }
if (tulisDitemukan.length === 0) {
hasil.push(catat("nol policy tulis di migrasi (RLS default-deny)", "LULUS", "0001_schema.sql tanpa FOR UPDATE/DELETE/INSERT/ALL"));
} else {
hasil.push(catat("nol policy tulis di migrasi (RLS default-deny)", "GAGAL", tulisDitemukan.join(" | ").slice(0, 200)));
}
if (URL === "" || ANON === "") {
hasil.push(catat("probe anon UPDATE tanpa mutasi", "DILEWATI", "env NEXT_PUBLIC_SUPABASE_URL/ANON_KEY kosong"));
} else {
const anon = createClient(URL, ANON);
const { error, count } = await anon
.from("manifest")
.update({ status: "DIBATALKAN" }, { count: "exact" })
.eq("id", -1);
if ((count ?? 0) > 0) {
hasil.push(catat("probe anon UPDATE tanpa mutasi", "GAGAL", `${count} baris berubah — MUTASI TERJADI`));
} else {
hasil.push(catat("probe anon UPDATE tanpa mutasi", "LULUS", error ? `ditolak eksplisit: ${error.message}` : "nol baris cocok, konsisten dengan default-deny"));
}
const { error: errorLog, count: countLog } = await anon
.from("manifest_log")
.update({ status: "DITERIMA" }, { count: "exact" })
.eq("id", -1);
if ((countLog ?? 0) > 0) {
hasil.push(catat("probe anon UPDATE log tanpa mutasi", "GAGAL", `${countLog} baris berubah — MUTASI TERJADI`));
} else {
hasil.push(catat("probe anon UPDATE log tanpa mutasi", "LULUS", errorLog ? `ditolak eksplisit: ${errorLog.message}` : "nol baris cocok, konsisten dengan default-deny"));
}
}

// Skenario 2: auth non-BPBD coba UPDATE manifest (filter mustahil, tanpa mutasi).
if (URL === "" || ANON === "") {
  hasil.push(catat("non-BPBD UPDATE manifest ditolak", "DILEWATI", "env supabase kosong"));
} else if (!process.env.UJI_EMAIL || !process.env.UJI_SANDI) {
  hasil.push(catat("non-BPBD UPDATE manifest ditolak", "DILEWATI", "env UJI_EMAIL/UJI_SANDI kosong"));
} else {
  const auth = createClient(URL, ANON);
  const { error: errorMasuk } = await auth.auth.signInWithPassword({
    email: process.env.UJI_EMAIL,
    password: process.env.UJI_SANDI,
  });
  if (errorMasuk) {
    hasil.push(catat("non-BPBD UPDATE manifest ditolak", "DILEWATI", `gagal masuk: ${errorMasuk.message}`));
  } else {
    const { error } = await auth.from("manifest").update({ status: "DIBATALKAN" }).eq("id", -1);
    await auth.auth.signOut();
    if (error) {
      hasil.push(catat("non-BPBD UPDATE manifest ditolak", "LULUS", `gagal RLS/kebijakan: ${error.message}`));
    } else {
      hasil.push(catat("non-BPBD UPDATE manifest ditolak", "GAGAL", "UPDATE lolos tanpa galat"));
    }
  }
}

// Skenario 3a: verifikasi rantai dalam (SELECT saja, opsional).
if (URL === "" || SRV === "") {
  hasil.push(catat("rantai hash manifest (baca langsung)", "DILEWATI", "env SUPABASE_SERVICE_ROLE_KEY kosong"));
} else {
  const baca = createClient(URL, SRV);
  const { data: mf } = await baca.from("manifest").select("id,kode,posko_id,hash").eq("kode", KODE).single();
  if (!mf) {
    hasil.push(catat("rantai hash manifest (baca langsung)", "GAGAL", `manifest ${KODE} tidak ada`));
  } else {
    const { data: itemDb } = await baca
      .from("manifest_item")
      .select("jumlah,batch:batch_id(kode_sumbangan)")
      .eq("manifest_id", mf.id);
    const { data: prevDb } = await baca
      .from("manifest")
      .select("hash")
      .neq("status", "DRAFT")
      .lt("id", mf.id)
      .order("id", { ascending: false })
      .limit(1)
      .single();
    const prevHash = prevDb?.hash ?? GENESIS_HASH;
    const hitungM = hashManifest({
      kode: mf.kode,
      poskoKode: String(mf.posko_id),
      items: (itemDb ?? []).map((i) => ({
        batchKode: i.batch?.kode_sumbangan ?? "?",
        jumlah: i.jumlah,
      })),
      prevHash,
    });
    if (hitungM !== mf.hash) {
      hasil.push(catat("rantai hash manifest (baca langsung)", "GAGAL", "hashManifest tersimpan != hitung ulang"));
    } else {
      const { data: logDb } = await baca
        .from("manifest_log")
        .select("status,hash")
        .eq("manifest_id", mf.id)
        .order("id");
      let prev = mf.hash;
      let putus = -1;
      for (let i = 0; i < (logDb ?? []).length; i++) {
        const l = logDb[i];
        const hitung = hashLog({ manifestKode: mf.kode, status: l.status, prevHash: prev });
        if (hitung !== l.hash) {
          putus = i;
          break;
        }
        prev = l.hash;
      }
      hasil.push(
        catat(
          "rantai hash manifest (baca langsung)",
          putus === -1 ? "LULUS" : "GAGAL",
          putus === -1
            ? `hash manifest + ${(logDb ?? []).length} log cocok hitung ulang`
            : `log ke-${putus} tidak cocok`
        )
      );
    }
  }
}

// Skenario 3b: API publik — format hash + aktor tersamar (tanpa nama orang).
try {
  const res = await fetch(`${dasar}/api/publik/manifest?kode=${encodeURIComponent(KODE)}`);
  if (!res.ok) {
    hasil.push(catat("API publik manifest + aktor samar", "GAGAL", `API ${res.status}`));
  } else {
    const badan = await res.json();
    const m = badan.manifest;
    const hashOk = typeof m?.hash === "string" && /^[0-9a-f]{64}$/.test(m.hash);
    const aktorOk = Array.isArray(m?.riwayat) && m.riwayat.every(
      (r) => r.aktor === null || /^(Relawan .+|Petugas (BPBD|Gudang|Admin))$/.test(r.aktor)
    );
    hasil.push(
      catat(
        "API publik manifest + aktor samar",
        hashOk && aktorOk ? "LULUS" : "GAGAL",
        hashOk && aktorOk ? "hash hex-64, semua aktor peran+posko" : "hash cacat atau nama orang terdeteksi"
      )
    );
  }
} catch (e) {
  hasil.push(catat("API publik manifest + aktor samar", "GAGAL", `jaringan: ${String(e)}`));
}

// Skenario 4: nol kontrol edit/hapus di HTML /m/MNF-2026-0001.
try {
  const res = await fetch(`${dasar}/m/${encodeURIComponent(KODE)}`);
  const html = await res.text();
  const tombol = [...html.matchAll(/<(button|a)[^>]*>([\s\S]{0,200}?)<\/(button|a)>/gi)]
    .map((cocok) => cocok[2].replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim())
    .filter((t) => t.length > 0);
  const mencurigakan = tombol.filter((t) => /ubah|hapus|edit/i.test(t));
  const adaForm = /<form[\s>]/i.test(html);
  if (mencurigakan.length === 0 && !adaForm) {
    hasil.push(catat("nol tombol edit/hapus di /m", "LULUS", `${tombol.length} kontrol interaktif, tanpa kata ubah/hapus/edit`));
  } else {
    hasil.push(
      catat(
        "nol tombol edit/hapus di /m",
        "GAGAL",
        adaForm ? "ditemukan <form>" : `kontrol mencurigakan: ${mencurigakan.join(" | ").slice(0, 200)}`
      )
    );
  }
} catch (e) {
  hasil.push(catat("nol tombol edit/hapus di /m", "GAGAL", `jaringan: ${String(e)}`));
}

const lulus = hasil.filter((h) => h.status === "LULUS").length;
const gagal = hasil.filter((h) => h.status === "GAGAL").length;
const lewati = hasil.filter((h) => h.status === "DILEWATI").length;
console.log(`\nRingkas: ${lulus} LULUS, ${gagal} GAGAL, ${lewati} DILEWATI`);
process.exit(gagal > 0 ? 1 : 0);
