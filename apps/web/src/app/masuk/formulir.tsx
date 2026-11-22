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

function TombolMasuk() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" disabled={pending} className="min-h-12 w-full">
      {pending ? "Memeriksa..." : "Masuk"}
    </Button>
  );
}

export default function FormulirMasuk({
  aksi,
  galat,
}: {
  aksi: (data: FormData) => Promise<void>;
  galat: string | null;
}) {
  const [tampil, setTampil] = useState(false);

  return (
    <div className="flex flex-col gap-4">
      <div>
        <h1 className="text-2xl font-bold text-white">Masuk OmniRelief</h1>
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
      <form action={aksi} className="flex flex-col gap-4">
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
        <TombolMasuk />
      </form>
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
