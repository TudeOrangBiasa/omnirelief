import { redirect } from "next/navigation";
import { getProfil } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { Alert, AlertDescription, AlertTitle } from "@omnirelief/ui/components/alert";
import { Button } from "@omnirelief/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@omnirelief/ui/components/card";
import {
  BellIcon,
  BookIcon,
  InfoCircleIcon,
  LogoutIcon,
  SettingsIcon,
  UserIcon,
} from "@solar-icons/react/linear";

export const dynamic = "force-dynamic";

const VERSI = "OmniRelief 1.0.0";

export default async function PengaturanPage() {
  const profil = await getProfil();
  if (!profil) redirect("/masuk");

  async function signOut() {
    "use server";
    const supabase = await createClient();
    await supabase.auth.signOut();
    redirect("/masuk");
  }

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-2xl flex-col gap-6 p-6">
      <div>
        <h1 className="text-2xl font-bold text-primary">Pengaturan</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Satu tempat mengatur akun, notifikasi, dan aksesibilitas.
        </p>
      </div>


      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <UserIcon aria-hidden="true" className="size-5" />
            Akun
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <p>
            Masuk sebagai <span className="font-bold">{profil.nama}</span> ({profil.peran}).
          </p>
          <a
            href="/profil"
            className="flex min-h-12 items-center justify-center rounded-xl bg-primary px-4 font-semibold text-primary-foreground"
          >
            Buka profil saya
          </a>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BellIcon aria-hidden="true" className="size-5" />
            Notifikasi
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm">
          <label className="flex min-h-12 cursor-pointer items-center gap-3">
            <input type="checkbox" id="notif-tugas" className="h-5 w-5 accent-primary" />
            Tugas baru untuk saya
          </label>
          <label className="flex min-h-12 cursor-pointer items-center gap-3">
            <input type="checkbox" id="notif-dicek" className="h-5 w-5 accent-primary" />
            Perlu Dicek (lewat batas check-in)
          </label>
          <label className="flex min-h-12 cursor-pointer items-center gap-3">
            <input type="checkbox" id="notif-sinkron" className="h-5 w-5 accent-primary" />
            Hasil sinkronisasi offline
          </label>
          <p role="status" id="notif-info" className="text-muted-foreground" />
        </CardContent>
      </Card>

      <Card id="aksesibilitas" className="scroll-mt-20">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <SettingsIcon aria-hidden="true" className="size-5" />
            Aksesibilitas
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-3 text-sm">
          <fieldset className="flex flex-col gap-1">
            <legend className="font-semibold">Ukuran teks</legend>
            <label className="flex min-h-12 cursor-pointer items-center gap-3">
              <input type="radio" name="a11y-teks" value="biasa" className="h-5 w-5 accent-primary" />
              Biasa
            </label>
            <label className="flex min-h-12 cursor-pointer items-center gap-3">
              <input type="radio" name="a11y-teks" value="besar" className="h-5 w-5 accent-primary" />
              Besar
            </label>
            <label className="flex min-h-12 cursor-pointer items-center gap-3">
              <input
                type="radio"
                name="a11y-teks"
                value="sangat"
                className="h-5 w-5 accent-primary"
              />
              Sangat besar
            </label>
          </fieldset>
          <label className="flex min-h-12 cursor-pointer items-center gap-3">
            <input type="checkbox" id="a11y-kontras" className="h-5 w-5 accent-primary" />
            Kontras tinggi
          </label>
          <label className="flex min-h-12 cursor-pointer items-center gap-3">
            <input type="checkbox" id="a11y-gerak" className="h-5 w-5 accent-primary" />
            Kurangi gerak dan animasi
          </label>
          <p role="status" id="a11y-info" className="text-muted-foreground" />
        </CardContent>
      </Card>

      <Card id="bantuan">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <BookIcon aria-hidden="true" className="size-5" />
            Bantuan
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-2 text-sm">
          <p className="text-muted-foreground">
            Butuh bantuan cepat? Hubungi command center BPBD lewat jalur yang sudah dibagikan saat
            pembekalan.
          </p>
          <details className="rounded-xl border border-border p-3">
            <summary className="flex min-h-12 cursor-pointer items-center font-semibold">
              Apakah ribet memakai aplikasi ini?
            </summary>
            <p className="text-muted-foreground">
              Tidak. Tiap peran hanya punya satu tugas: gudang mencatat, posko melapor, tim
              menekan tombol status. Semua tombol setinggi 48px dan bisa dipakai offline.
            </p>
          </details>
          <details className="rounded-xl border border-border p-3">
            <summary className="flex min-h-12 cursor-pointer items-center font-semibold">
              Data saya hilang saat sinyal putus?
            </summary>
            <p className="text-muted-foreground">
              Tidak. Update tersimpan sebagai Menunggu Sinkronisasi dan terkirim otomatis saat
              daring kembali.
            </p>
          </details>
          <details className="rounded-xl border border-border p-3">
            <summary className="flex min-h-12 cursor-pointer items-center font-semibold">
              Lupa password?
            </summary>
            <p className="text-muted-foreground">
              Ubah sendiri di halaman profil, atau minta admin mengatur ulang bila tidak bisa
              masuk sama sekali.
            </p>
          </details>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <InfoCircleIcon aria-hidden="true" className="size-5" />
            Tentang
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col gap-1 text-sm text-muted-foreground">
          <p>{VERSI}</p>
          <p>
            Data operasional milik command center BPBD. Data penyintas hanya agregat, tanpa nama
            per orang.
          </p>
        </CardContent>
      </Card>

      <Alert>
        <LogoutIcon aria-hidden="true" />
        <AlertTitle>Keluar akun</AlertTitle>
        <AlertDescription className="flex flex-col gap-3">
          Perangkat ini tidak lagi bisa mencatat sampai masuk kembali.
          <form action={signOut}>
            <Button type="submit" variant="destructive" className="min-h-12 w-full">
              Keluar
            </Button>
          </form>
        </AlertDescription>
      </Alert>

      <script
        dangerouslySetInnerHTML={{
          __html: `(function(){try{var a=JSON.parse(localStorage.getItem("omnirelief-aksesibilitas")||"{}");var n=JSON.parse(localStorage.getItem("omnirelief-notifikasi")||"{}");function teks(v){document.documentElement.style.fontSize=v==="besar"?"112.5%":v==="sangat"?"125%":""}function terapkan(){var d=a||{};teks(d.teks||"biasa");document.documentElement.classList.toggle("a11y-kontras",!!d.kontras);document.documentElement.classList.toggle("a11y-gerak",!!d.gerak);var r=document.querySelector('input[name="a11y-teks"][value="'+(d.teks||"biasa")+'"]');if(r)r.checked=true;var k=document.getElementById("a11y-kontras");if(k)k.checked=!!d.kontras;var g=document.getElementById("a11y-gerak");if(g)g.checked=!!d.gerak;["tugas","dicek","sinkron"].forEach(function(j){var c=document.getElementById("notif-"+j);if(c)c.checked=n[j]!==false});var info=document.getElementById("a11y-info");if(info)info.textContent="Pilihan tersimpan di perangkat ini."}function simpan(){localStorage.setItem("omnirelief-aksesibilitas",JSON.stringify(a));localStorage.setItem("omnirelief-notifikasi",JSON.stringify(n))}document.querySelectorAll('input[name="a11y-teks"]').forEach(function(r){r.addEventListener("change",function(){a.teks=r.value;teks(r.value);simpan()})});var k=document.getElementById("a11y-kontras");if(k)k.addEventListener("change",function(){a.kontras=k.checked;document.documentElement.classList.toggle("a11y-kontras",k.checked);simpan()});var g=document.getElementById("a11y-gerak");if(g)g.addEventListener("change",function(){a.gerak=g.checked;document.documentElement.classList.toggle("a11y-gerak",g.checked);simpan()});["tugas","dicek","sinkron"].forEach(function(j){var c=document.getElementById("notif-"+j);if(c)c.addEventListener("change",function(){n[j]=c.checked;simpan();var i=document.getElementById("notif-info");if(i)i.textContent="Pilihan notifikasi tersimpan."})});terapkan()}catch(e){}})();`,
        }}
      />
    </main>
  );
}
