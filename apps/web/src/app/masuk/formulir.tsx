"use client";

import { useState } from "react";
import { useFormStatus } from "react-dom";
import { EyeClosedIcon, EyeIcon } from "@solar-icons/react/linear";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@omnirelief/ui/components/alert";
import { Button } from "@omnirelief/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@omnirelief/ui/components/card";
import { Input } from "@omnirelief/ui/components/input";
import { Label } from "@omnirelief/ui/components/label";
import Logo from "@/components/logo";

function TombolMasuk({ label }: { label: string }) {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="min-h-12 w-full">
      {pending ? "Memeriksa..." : label}
    </Button>
  );
}

export default function FormulirMasuk({
  tahapSatu,
  tahapDua,
  galat,
}: {
  tahapSatu: (data: FormData) => Promise<{ perluPin: true } | undefined>;
  tahapDua: (data: FormData) => Promise<void>;
  galat: string | null;
}) {
  const [tampil, setTampil] = useState(false);
  const [tahap, setTahap] = useState<"kredensial" | "pin">("kredensial");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [galatPin, setGalatPin] = useState<string | null>(null);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <Logo varian="putih" tinggi={30} />
        <h1 className="mt-3 text-2xl font-bold text-white">Masuk</h1>
        <p className="mt-1 text-sm text-white/70">
          Masuk dengan akun peran yang dibagikan command center.
        </p>
      </div>
      {galat && (
        <Alert variant="destructive" role="alert">
          <AlertTitle>Gagal masuk</AlertTitle>
          <AlertDescription id="masuk-galat">{galat}</AlertDescription>
        </Alert>
      )}
      {tahap === "kredensial" ? (
        <form onSubmit={(e) => void kirimKredensial(e)} className="flex flex-col gap-4">
          <div className="flex flex-col gap-1">
            <Label htmlFor="masuk-email" className="text-white">Email</Label>
            <Input
              id="masuk-email"
              name="email"
              type="email"
              required
              autoComplete="username"
              autoFocus={galat ? true : undefined}
              placeholder="nama@contoh.id"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              aria-invalid={galat ? true : undefined}
              aria-describedby={galat ? "masuk-galat" : undefined}
              className="min-h-12 border-white/30 bg-white/10 text-white placeholder:text-white/50"
            />
          </div>
          <div className="flex flex-col gap-1">
            <Label htmlFor="masuk-password" className="text-white">Password</Label>
            <div className="relative">
              <Input
                id="masuk-password"
                name="password"
                type={tampil ? "text" : "password"}
                required
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                aria-invalid={galat ? true : undefined}
                aria-describedby={galat ? "masuk-galat" : undefined}
                className="min-h-12 border-white/30 bg-white/10 pr-14 text-white placeholder:text-white/50"
              />
              <Button
                type="button"
                variant="ghost"
                onClick={() => setTampil((v) => !v)}
                aria-pressed={tampil}
                aria-label={tampil ? "Sembunyikan password" : "Tampilkan password"}
                className="absolute top-1/2 right-1 min-h-12 w-12 -translate-y-1/2 text-white hover:text-white"
              >
                {tampil ? (
                  <EyeClosedIcon aria-hidden="true" />
                ) : (
                  <EyeIcon aria-hidden="true" />
                )}
              </Button>
            </div>
          </div>
          <label
            htmlFor="masuk-ingat"
            className="flex min-h-12 cursor-pointer items-center gap-3 text-sm text-white"
          >
            <input
              id="masuk-ingat"
              name="ingat"
              type="checkbox"
              defaultChecked
              className="h-5 w-5 accent-primary"
            />
            Ingat saya di perangkat ini
          </label>
          <TombolMasuk label="Masuk" />
        </form>
      ) : (
        <form onSubmit={(e) => void kirimPin(e)} className="flex flex-col gap-4">
          <p className="text-sm text-white/70">
            Akun memakai kode otorisasi. Masukkan PIN 6 digit untuk {email || "akun kamu"}.
          </p>
          {galatPin && (
            <Alert variant="destructive" role="alert">
              <AlertTitle>Kode salah</AlertTitle>
              <AlertDescription>{galatPin}</AlertDescription>
            </Alert>
          )}
          <div className="flex flex-col gap-1">
            <Label htmlFor="masuk-pin" className="text-white">Kode otorisasi PIN</Label>
            <Input
              id="masuk-pin"
              name="pin"
              type="password"
              inputMode="numeric"
              maxLength={6}
              required
              autoComplete="one-time-code"
              autoFocus
              placeholder="6 digit angka"
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
              className="min-h-12 border-white/30 bg-white/10 text-white tabular-nums placeholder:text-white/50"
            />
          </div>
          <TombolMasuk label="Verifikasi dan Masuk" />
          <Button
            type="button"
            variant="ghost"
            onClick={() => {
              setTahap("kredensial");
              setPin("");
              setGalatPin(null);
            }}
            className="min-h-12 w-full text-white underline"
          >
            Kembali ubah email
          </Button>
        </form>
      )}
        >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Akun demo untuk juri</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground flex flex-col gap-1 text-sm">
          <p>Pilih salah satu email berikut lalu minta password ke pendamping demo:</p>
          <ul className="list-disc pl-5">
            <li>bpbd@demo: command center</li>
            <li>gudang@demo: pencatat batch</li>
            <li>posko-a@demo: relawan posko</li>
            <li>tim@demo: tim distribusi</li>
          </ul>
          <p>Password tidak ditulis di sini dan tidak diketik saat demo video.</p>
        </CardContent>
      </Card>
    </div>
  );
}
