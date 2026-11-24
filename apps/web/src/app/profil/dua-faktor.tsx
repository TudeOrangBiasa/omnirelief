"use client";

import { useState } from "react";
import { Button } from "@omnirelief/ui/components/button";
import { Input } from "@omnirelief/ui/components/input";
import { Label } from "@omnirelief/ui/components/label";

type HasilAksi = { ok: boolean; pesan: string };

export default function DuaFaktorForm({
  hasPin,
  aksiAtur,
  aksiMatikan,
}: {
  hasPin: boolean;
  aksiAtur: (data: FormData) => Promise<HasilAksi>;
  aksiMatikan: () => Promise<HasilAksi>;
}) {
  const [pin, setPin] = useState("");
  const [aktif, setAktif] = useState(hasPin);
  const [pesan, setPesan] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [sibuk, setSibuk] = useState(false);


  async function simpan(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPesan(null);
    setGalat(null);
    if (!/^[0-9]{6}$/.test(pin)) {
      setGalat("PIN harus 6 digit angka.");
      return;
    }
    setSibuk(true);
    try {
      const data = new FormData();
      data.set("pin", pin);
      const hasil = await aksiAtur(data);
      if (hasil.ok) {
        setAktif(true);
        setPin("");
        setPesan(hasil.pesan);
      } else {
        setGalat(hasil.pesan);
      }
    } finally {
      setSibuk(false);
    }
  }

  async function matikan() {
    setPesan(null);
    setGalat(null);
    setSibuk(true);
    try {
      const hasil = await aksiMatikan();
      if (hasil.ok) {
        setAktif(false);
        setPin("");
        setPesan(hasil.pesan);
      } else {
        setGalat(hasil.pesan);
      }
    } finally {
      setSibuk(false);
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p aria-live="polite" className="text-sm text-[#0B1F2E]">
        Status:{" "}
        <span className="font-bold">{aktif ? "Aktif" : "Nonaktif"}</span>
      </p>
      <p className="text-sm text-muted-foreground">
        PIN 6 digit dipakai sebagai kode otorisasi saat masuk.
      </p>
      {pesan && (
        <p role="status" className="rounded-none border border-[#0f79b8]/40 bg-[#DCE8EE] p-3 text-sm text-[#0B1F2E]">
          {pesan}
        </p>
      )}
      {galat && (
        <p role="alert" className="rounded-none border border-red-700/40 bg-red-50 p-3 text-sm text-red-800">
          {galat}
        </p>
      )}
      <form onSubmit={(e) => void simpan(e)} className="flex flex-col gap-3">
        <div className="flex flex-col gap-1">
          <Label htmlFor="pin-baru">PIN baru 6 digit</Label>
          <Input
            id="pin-baru"
            name="pin"
            type="password"
            inputMode="numeric"
            maxLength={6}
            autoComplete="one-time-code"
            value={pin}
            onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
            placeholder="Contoh: 482913"
            className="min-h-12 rounded-none tabular-nums"
          />
        </div>
        <Button type="submit" disabled={sibuk} className="min-h-12 w-full rounded-none">
          {sibuk ? "Menyimpan..." : aktif ? "Ganti PIN" : "Aktifkan PIN"}
        </Button>
      </form>
      {aktif && (
        <Button
          type="button"
          variant="outline"
          onClick={() => void matikan()}
          disabled={sibuk}
          className="min-h-12 w-full rounded-none"
        >
          Matikan PIN
        </Button>
      )}
    </div>
  );
}
