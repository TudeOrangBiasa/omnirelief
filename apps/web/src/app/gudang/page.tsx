"use client";

import { useRef, useState } from "react";
import { toast } from "sonner";
import { Alert, AlertDescription, AlertTitle } from "@omnirelief/ui/components/alert";
import { Button } from "@omnirelief/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@omnirelief/ui/components/card";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@omnirelief/ui/components/empty";
import { Input } from "@omnirelief/ui/components/input";
import { Label } from "@omnirelief/ui/components/label";

type GalatField = {
  item_id?: string;
  jumlah?: string;
  kedaluwarsa?: string;
  sumber?: string;
};

type IntakeHariIni = {
  kode: string;
  jumlah: number;
  sumber: string;
  waktu: string;
};

function validasiClient(formData: FormData): { nilai: { item_id: number; jumlah: number; kedaluwarsa: string; sumber: string; tampilkan_nama: boolean }; galat: GalatField } {
  const galat: GalatField = {};
  const item_id = Number(formData.get("item_id"));
  const jumlah = Number(formData.get("jumlah"));
  const kedaluwarsa = String(formData.get("kedaluwarsa") ?? "");
  const sumber = String(formData.get("sumber") ?? "").trim();

  if (!Number.isInteger(item_id) || item_id <= 0)
    galat.item_id = "Isi ID item dengan angka lebih dari 0.";
  if (!Number.isInteger(jumlah) || jumlah <= 0)
    galat.jumlah = "Jumlah harus lebih dari 0.";
  if (sumber === "") galat.sumber = "Sumber wajib diisi.";
  if (kedaluwarsa !== "") {
    const hariIni = new Date().toISOString().slice(0, 10);
    if (kedaluwarsa < hariIni) galat.kedaluwarsa = "Kedaluwarsa tidak boleh sudah lewat.";
  }

  return {
    nilai: {
      item_id,
      jumlah,
      kedaluwarsa: kedaluwarsa === "" ? "" : kedaluwarsa,
      sumber,
      tampilkan_nama: formData.get("tampilkan_nama") === "on",
    },
    galat,
  };
}

export default function GudangPage() {
  const [hasil, setHasil] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [galatField, setGalatField] = useState<GalatField>({});
  const [riwayat, setRiwayat] = useState<IntakeHariIni[]>([]);
  const [sibuk, setSibuk] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  async function simpan(formData: FormData) {
    setHasil(null);
    setGalat(null);
    const { nilai, galat: galatBaru } = validasiClient(formData);
    setGalatField(galatBaru);
    if (Object.keys(galatBaru).length > 0) return;
    setSibuk(true);
    try {
      const res = await fetch("/api/gudang/intake", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          item_id: nilai.item_id,
          jumlah: nilai.jumlah,
          kedaluwarsa: nilai.kedaluwarsa === "" ? null : nilai.kedaluwarsa,
          sumber: nilai.sumber,
          tampilkan_nama: nilai.tampilkan_nama,
        }),
      });
      const data = (await res.json()) as { ok: boolean; kode_sumbangan?: string; galat?: string };
      if (data.ok && data.kode_sumbangan) {
        setHasil(data.kode_sumbangan);
        setRiwayat((r) => [
          {
            kode: data.kode_sumbangan as string,
            jumlah: nilai.jumlah,
            sumber: nilai.sumber,
            waktu: new Date().toLocaleString("id-ID"),
          },
          ...r,
        ]);
        toast.success(`Intake tersimpan. Kode ${data.kode_sumbangan}.`);
        formRef.current?.reset();
      } else {
        setGalat(data.galat ?? "Gagal menyimpan.");
      }
    } catch {
      setGalat("Jaringan bermasalah. Coba lagi.");
    } finally {
      setSibuk(false);
    }
  }

  async function salinKode() {
    if (!hasil) return;
    try {
      await navigator.clipboard.writeText(hasil);
      toast.success("Kode sumbangan disalin.");
    } catch {
      toast.error("Gagal menyalin. Catat kode secara manual.");
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
          <CardHeader>
            <CardTitle className="text-base text-success">Intake tersimpan</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            <p className="text-sm text-success">
              Kode sumbangan: <strong>{hasil}</strong>
            </p>
            <Button onClick={() => void salinKode()} variant="outline" className="min-h-12">
              Salin kode
            </Button>
          </CardContent>
        </Card>
      )}

      {galat && (
        <Alert variant="destructive" role="alert">
          <AlertTitle>Gagal menyimpan</AlertTitle>
          <AlertDescription>{galat}</AlertDescription>
        </Alert>
      )}

      <form ref={formRef} action={simpan} className="flex flex-col gap-4" noValidate>
        <div className="flex flex-col gap-1">
          <Label htmlFor="gudang-item">ID item (lihat katalog, contoh 6 untuk Paket Sembako)</Label>
          <Input
            id="gudang-item"
            name="item_id"
            type="number"
            min={1}
            className="min-h-12"
            aria-invalid={galatField.item_id ? true : undefined}
            aria-describedby={galatField.item_id ? "gudang-item-galat" : undefined}
          />
          {galatField.item_id && (
            <p id="gudang-item-galat" role="alert" className="text-sm text-destructive">
              {galatField.item_id}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="gudang-jumlah">Jumlah</Label>
          <Input
            id="gudang-jumlah"
            name="jumlah"
            type="number"
            min={1}
            className="min-h-12"
            aria-invalid={galatField.jumlah ? true : undefined}
            aria-describedby={galatField.jumlah ? "gudang-jumlah-galat" : undefined}
          />
          {galatField.jumlah && (
            <p id="gudang-jumlah-galat" role="alert" className="text-sm text-destructive">
              {galatField.jumlah}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="gudang-exp">Kedaluwarsa (opsional)</Label>
          <Input
            id="gudang-exp"
            name="kedaluwarsa"
            type="date"
            className="min-h-12"
            aria-invalid={galatField.kedaluwarsa ? true : undefined}
            aria-describedby={galatField.kedaluwarsa ? "gudang-exp-galat" : undefined}
          />
          {galatField.kedaluwarsa && (
            <p id="gudang-exp-galat" role="alert" className="text-sm text-destructive">
              {galatField.kedaluwarsa}
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="gudang-sumber">Sumber (donatur, NGO, CSR, pemerintah)</Label>
          <Input
            id="gudang-sumber"
            name="sumber"
            type="text"
            className="min-h-12"
            aria-invalid={galatField.sumber ? true : undefined}
            aria-describedby={galatField.sumber ? "gudang-sumber-galat" : undefined}
          />
          {galatField.sumber && (
            <p id="gudang-sumber-galat" role="alert" className="text-sm text-destructive">
              {galatField.sumber}
            </p>
          )}
        </div>
        <label htmlFor="gudang-izin" className="flex min-h-12 items-center gap-2 text-sm">
          <input id="gudang-izin" name="tampilkan_nama" type="checkbox" className="h-5 w-5 accent-primary" />
          Tampilkan nama sumber ke publik
        </label>
        <Button type="submit" disabled={sibuk} className="min-h-12">
          {sibuk ? "Menyimpan..." : "Simpan batch"}
        </Button>
      </form>

      <section aria-label="Riwayat intake hari ini" className="flex flex-col gap-2">
        <h2 className="text-lg font-bold text-primary">Riwayat intake hari ini</h2>
        {riwayat.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Belum ada intake hari ini</EmptyTitle>
              <EmptyDescription>
                Setiap batch yang tersimpan muncul di sini beserta kodenya.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          riwayat.map((r) => (
            <Card key={r.kode}>
              <CardContent className="flex flex-col gap-1 p-4 text-sm">
                <p className="font-semibold">{r.kode}</p>
                <p className="text-muted-foreground">
                  {r.jumlah} paket · {r.sumber} · {r.waktu}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </section>
    </main>
  );
}
