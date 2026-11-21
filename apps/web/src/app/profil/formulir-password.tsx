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
    <Button type="submit" disabled={!aktif || pending} className="min-h-12 w-full">
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
  const [galatCocok, setGalatCocok] = useState<string | null>(null);

  const kotor = lama !== "" || baru !== "" || konfirmasi !== "";
  const cocok = baru === "" || konfirmasi === "" || baru === konfirmasi;

  useEffect(() => {
    if (ok) toast.success("Password berhasil diubah.");
  }, [ok]);

  return (
    <div className="flex flex-col gap-3">
      {ok && (
        <p role="status" className="rounded-xl bg-success-bg p-3 text-sm text-success-badge-fg">
          Password berhasil diubah.
        </p>
      )}
      {gagal && (
        <div role="alert" className="rounded-xl bg-destructive/10 p-3 text-sm text-destructive">
          <p className="font-semibold">Gagal mengubah password</p>
          <p>
            {gagal === "salah"
              ? "Password lama salah. Coba lagi."
              : gagal === "pendek"
                ? "Password baru minimal 8 karakter."
                : "Terjadi galat. Coba lagi."}
          </p>
        </div>
      )}
      <form
        action={(fd) => {
          if (baru !== konfirmasi) {
            setGalatCocok("Konfirmasi password baru tidak sama. Periksa lagi.");
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
            className="min-h-12"
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
            className="min-h-12"
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
            className="min-h-12"
          />
          {(!cocok || galatCocok) && (
            <p id="password-konfirmasi-galat" role="alert" className="text-sm text-destructive">
              {galatCocok ?? "Konfirmasi password baru tidak sama. Periksa lagi."}
            </p>
          )}
        </div>
        <TombolSimpan aktif={kotor && cocok} />
      </form>
    </div>
  );
}
