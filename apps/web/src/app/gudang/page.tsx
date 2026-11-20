"use client";

import { useState } from "react";
import { Button } from "@omnirelief/ui/components/button";
import { Card, CardContent } from "@omnirelief/ui/components/card";
import { Input } from "@omnirelief/ui/components/input";
import { Label } from "@omnirelief/ui/components/label";
export default function GudangPage() {
  const [hasil, setHasil] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);

  async function simpan(formData: FormData) {
    setSibuk(true);
    setHasil(null);
    setGalat(null);
    try {
      const res = await fetch("/api/gudang/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: Number(formData.get("item_id")),
          jumlah: Number(formData.get("jumlah")),
          kedaluwarsa: String(formData.get("kedaluwarsa") ?? "") || null,
          sumber: String(formData.get("sumber") ?? ""),
          tampilkan_nama: formData.get("tampilkan_nama") === "on",
        }),
      });
      const data = (await res.json()) as { ok: boolean; kode_sumbangan?: string; galat?: string };
      if (data.ok && data.kode_sumbangan) setHasil(data.kode_sumbangan);
      else setGalat(data.galat ?? "Gagal menyimpan.");
    } catch {
      setGalat("Jaringan bermasalah. Coba lagi.");
    } finally {
      setSibuk(false);
    }
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Gudang</h1>
        <p className="text-muted-foreground mt-1 text-sm">
          Catat pangan masuk. Satu pencatatan sama dengan satu kode sumbangan.
        </p>
      </div>
      {hasil && (
        <Card className="border-transparent bg-success-bg">
          <CardContent className="p-4 text-sm text-success">
            Tersimpan. Kode sumbangan: <strong>{hasil}</strong>
          </CardContent>
        </Card>
      )}
      {galat && (
        <p role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          {galat}
        </p>
      )}
      <form action={simpan} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <Label htmlFor="gudang-item">ID item (lihat katalog, contoh 6 untuk Paket Sembako)</Label>
          <Input id="gudang-item" name="item_id" type="number" min={1} required className="min-h-12" />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="gudang-jumlah">Jumlah</Label>
          <Input id="gudang-jumlah" name="jumlah" type="number" min={1} required className="min-h-12" />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="gudang-exp">Kedaluwarsa (opsional)</Label>
          <Input id="gudang-exp" name="kedaluwarsa" type="date" className="min-h-12" />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="gudang-sumber">Sumber (donatur, NGO, CSR, pemerintah)</Label>
          <Input id="gudang-sumber" name="sumber" type="text" required className="min-h-12" />
        </div>
        <label className="flex min-h-12 items-center gap-2 text-sm">
          <input name="tampilkan_nama" type="checkbox" className="h-5 w-5 accent-primary" />
          Tampilkan nama sumber ke publik
        </label>
        <Button type="submit" disabled={sibuk} className="min-h-12">
          {sibuk ? "Menyimpan..." : "Simpan batch"}
        </Button>
      </form>
    </main>
  );
}
