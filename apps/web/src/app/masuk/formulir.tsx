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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@omnirelief/ui/components/dialog";
import { Input } from "@omnirelief/ui/components/input";
import { Label } from "@omnirelief/ui/components/label";
import Logo from "@/components/logo";
import TombolSalin from "@/components/tombol-salin";

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
  const [lupaBuka, setLupaBuka] = useState(false);
  const [emailReset, setEmailReset] = useState("");
  const [poskoReset, setPoskoReset] = useState("");
  const [tiket, setTiket] = useState<string | null>(null);
  const [membuat, setMembuat] = useState(false);
  const [tahap, setTahap] = useState<"kredensial" | "pin">("kredensial");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pin, setPin] = useState("");
  const [galatPin, setGalatPin] = useState<string | null>(null);

  async function buatTiketReset(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const emailTiket = emailReset.trim().toLowerCase();
    const posko = poskoReset.trim();
    if (!emailTiket || !posko || membuat) return;
    setMembuat(true);
    try {
      // Setara sha256Hex di lib/hash.ts. WebCrypto dipakai di klien agar
      // tidak membundel node:crypto. Tidak ada password yang disimpan.
      const dasar = `reset|${emailTiket}|${posko}|${Date.now()}`;
      const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(dasar));
      const hex = Array.from(new Uint8Array(buf))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
      setTiket(hex.slice(0, 12).toUpperCase());
    } finally {
      setMembuat(false);
    }
  }

  async function kirimKredensial(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData();
    data.set("email", email);
    data.set("password", password);
    const hasil = await tahapSatu(data);
    if (hasil && hasil.perluPin) setTahap("pin");
  }

  async function kirimPin(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const bersih = pin.replace(/[^0-9]/g, "").slice(0, 6);
    if (!/^[0-9]{6}$/.test(bersih)) {
      setGalatPin("PIN harus 6 digit angka.");
      return;
    }
    setGalatPin(null);
    const data = new FormData();
    data.set("email", email);
    data.set("password", password);
    data.set("pin", bersih);
    await tahapDua(data);
  }

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
      <div className="flex justify-end">
        <Button
          type="button"
          variant="link"
          onClick={() => {
            setTiket(null);
            setLupaBuka(true);
          }}
          className="min-h-12 text-white underline"
        >
          Lupa password?
        </Button>
      </div>
      <Dialog open={lupaBuka} onOpenChange={setLupaBuka}>
        <DialogContent className="max-h-[85vh] overflow-y-auto rounded-none sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Reset password lewat command center</DialogTitle>
            <DialogDescription>
              Buat kode tiket lalu sebutkan ke operator. Password baru diberikan
              operator setelah identitas diperiksa.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={(e) => void buatTiketReset(e)} className="flex flex-col gap-4">
            <div className="flex flex-col gap-1">
              <Label htmlFor="reset-email">Email akun</Label>
              <Input
                id="reset-email"
                type="email"
                required
                value={emailReset}
                onChange={(e) => setEmailReset(e.target.value)}
                placeholder="nama@contoh.id"
                autoComplete="username"
                className="min-h-12 rounded-none"
              />
            </div>
            <div className="flex flex-col gap-1">
              <Label htmlFor="reset-posko">Nama posko</Label>
              <Input
                id="reset-posko"
                type="text"
                required
                value={poskoReset}
                onChange={(e) => setPoskoReset(e.target.value)}
                placeholder="Contoh: Posko Balai Warga"
                className="min-h-12 rounded-none"
              />
            </div>
            <Button type="submit" disabled={membuat} className="min-h-12 w-full rounded-none">
              {membuat ? "Membuat tiket..." : "Buat Tiket Reset"}
            </Button>
          </form>
          {tiket && (
            <div className="flex flex-col gap-3 rounded-none border border-[#0B1F2E]/15 bg-[#DCE8EE] p-4">
              <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#1B7FBF]">
                Kode tiket reset
              </p>
              <p aria-live="polite" className="font-mono text-2xl font-bold tracking-widest text-[#0B1F2E] tabular-nums">
                {tiket}
              </p>
              <TombolSalin teks={tiket} label="Salin Kode" pesanSukses="Kode tiket disalin" variant="outline" className="rounded-none" />
              <ol className="list-decimal pl-5 text-sm text-[#0B1F2E]">
                <li>Siapkan KTP atau SIM petugas untuk pemeriksaan identitas.</li>
                <li>Sebutkan kode tiket ini ke operator command center.</li>
                <li>Jangan bagikan password ke siapa pun lewat chat.</li>
              </ol>
            </div>
          )}
        </DialogContent>
      </Dialog>
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Akun demo untuk juri</CardTitle>
        </CardHeader>
        <CardContent className="text-muted-foreground flex flex-col gap-1 text-sm">
          <p>Pilih salah satu akun berikut. Password sama untuk semua: JuriDemo2026!</p>
          <ul className="list-disc pl-5">
            <li><span className="font-mono">bpbd@demo</span>: command center</li>
            <li><span className="font-mono">gudang@demo</span>: pencatat batch</li>
            <li><span className="font-mono">posko-a@demo</span>: relawan posko</li>
            <li><span className="font-mono">tim@demo</span>: tim distribusi</li>
          </ul>
          <p>Akun demo hanya untuk penilaian. Ganti password setelah kompetisi selesai.</p>
        </CardContent>
      </Card>
    </div>
  );
}
