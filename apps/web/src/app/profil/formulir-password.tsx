"use client";

import { useEffect, useState } from "react";
import { useFormStatus } from "react-dom";
import { toast } from "sonner";
import { Button } from "@omnirelief/ui/components/button";
import { Input } from "@omnirelief/ui/components/input";
import { Label } from "@omnirelief/ui/components/label";

function TombolSimpan({ aktif }: { aktif: boolean }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={!aktif || pending} className="min-h-12 w-full rounded-none">
      {pending ? "Menyimpan..." : "Simpan password baru"}
    </Button>
  );
}

export default function FormulirPassword({
  aksi,
  ok,
  gagal,
}: {
  aksi: (data: FormData) => Promise<void>;
  ok: boolean;
  gagal: "salah" | "pendek" | "gagal" | null;
}) {
  const [lama, setLama] = useState("");
  const [baru, setBaru] = useState("");
  const [konfirmasi, setKonfirmasi] = useState("");
  const [yakin, setYakin] = useState(false);
  const [galatCocok, setGalatCocok] = useState<string | null>(null);

  const kotor = lama !== "" || baru !== "" || konfirmasi !== "";
  const cocok = baru === "" || konfirmasi === "" || baru === konfirmasi;
  const siapKirim = kotor && cocok && yakin;

  useEffect(() => {
    if (ok) {
      toast.success("Password berhasil diubah.");
      setLama("");
      setBaru("");
      setKonfirmasi("");
      setYakin(false);
    }
  }, [ok]);

  return (
    <div className="flex flex-col gap-3">
      {ok && (
        <p role="status" className="rounded-none border border-emerald-700/30 bg-emerald-50 p-3 text-sm font-semibold text-emerald-800">
          Password berhasil diubah. Masuk berikutnya pakai password baru.
        </p>
      )}
      {gagal && (
        <div role="alert" className="rounded-none border border-red-700/30 bg-red-50 p-3 text-sm text-red-800">
          {gagal === "salah"
            ? "Password lama tidak sama. Periksa lagi."
            : gagal === "pendek"
              ? "Password baru minimal 8 karakter."
              : "Ubah password gagal. Coba lagi."}
        </div>
      )}
      <form
        action={(fd) => {
          if (baru !== konfirmasi) {
            setGalatCocok("Konfirmasi password baru tidak sama. Periksa lagi.");
            return;
          }
          if (!yakin) {
            setGalatCocok("Centang konfirmasi dulu sebelum menyimpan.");
            return;
          }
          setGalatCocok(null);
          void aksi(fd);
        }}
        className="flex flex-col gap-4 text-sm"
      >
        <p className="text-muted-foreground">
          Demi keamanan, masukkan password lama dulu (autentikasi ulang).
        </p>
        <div className="flex flex-col gap-1">
          <Label htmlFor="password_lama">Password lama</Label>
          <Input
            id="password_lama"
            name="password_lama"
            type="password"
            required
            autoComplete="current-password"
            value={lama}
            onChange={(e) => setLama(e.target.value)}
            className="min-h-12 rounded-none"
          />
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="password_baru">Password baru (min. 8 karakter)</Label>
          <Input
            id="password_baru"
            name="password_baru"
            type="password"
            required
            minLength={8}
            autoComplete="new-password"
            value={baru}
            onChange={(e) => setBaru(e.target.value)}
            aria-invalid={baru !== "" && baru.length < 8 ? true : undefined}
            className="min-h-12 rounded-none"
          />
          {baru !== "" && baru.length < 8 && (
            <p role="alert" className="text-sm text-destructive">
              Password baru minimal 8 karakter.
            </p>
          )}
        </div>
        <div className="flex flex-col gap-1">
          <Label htmlFor="password_konfirmasi">Konfirmasi password baru</Label>
          <Input
            id="password_konfirmasi"
            type="password"
            required
            autoComplete="new-password"
            value={konfirmasi}
            onChange={(e) => setKonfirmasi(e.target.value)}
            aria-invalid={!cocok ? true : undefined}
            aria-describedby={!cocok || galatCocok ? "password-konfirmasi-galat" : undefined}
            className="min-h-12 rounded-none"
          />
          {(!cocok || galatCocok) && (
            <p id="password-konfirmasi-galat" role="alert" className="text-sm text-destructive">
              {galatCocok ?? "Konfirmasi password baru tidak sama. Periksa lagi."}
            </p>
          )}
        </div>
        <label className="flex min-h-12 cursor-pointer items-start gap-3 rounded-none border border-[#0B1F2E]/15 p-3 text-sm">
          <input
            type="checkbox"
            checked={yakin}
            onChange={(e) => setYakin(e.target.checked)}
            className="mt-1 size-5 accent-[#0B1F2E]"
          />
          <span>Saya yakin ingin mengubah password akun ini.</span>
        </label>
        <TombolSimpan aktif={siapKirim} />
      </form>
    </div>
  );
}
