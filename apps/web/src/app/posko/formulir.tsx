"use client";

import { useEffect, useState } from "react";
import { toast } from "sonner";
import BannerOffline from "@/components/banner-offline";
import { BarisSegarkan } from "@/components/kepala-halaman";
import { Alert, AlertDescription, AlertTitle } from "@omnirelief/ui/components/alert";
import { Badge } from "@omnirelief/ui/components/badge";
import { Button } from "@omnirelief/ui/components/button";
import { Card, CardContent } from "@omnirelief/ui/components/card";
import { Input } from "@omnirelief/ui/components/input";
import { Label } from "@omnirelief/ui/components/label";
import { kirimAntrean, kirimSatuAntrean, tambahAntrean } from "@/lib/offline";

import { BantuanIstilah } from "@/components/bantuan-istilah";

type Laporan = {
  id: number;
  bayi: number;
  balita: number;
  ibu_hamil: number;
  lansia: number;
  disabilitas: number;
  umum: number;
  status: string;
  alasan: string | null;
  dibuat_pada: string;
};

const MEDAN = [
  { nama: "bayi", label: "Bayi" },
  { nama: "balita", label: "Balita" },
  { nama: "ibu_hamil", label: "Ibu hamil" },
  { nama: "lansia", label: "Lansia" },
  { nama: "disabilitas", label: "Disabilitas" },
  { nama: "umum", label: "Umum" },
] as const;

type NamaMedan = (typeof MEDAN)[number]["nama"];

const STATUS_LABEL: Record<string, string> = {
  DRAFT: "Draf",
  MENUNGGU_VERIFIKASI: "Menunggu verifikasi",
  DISETUJUI: "Disetujui",
  MINTA_REVISI: "Minta revisi",
  DITOLAK: "Ditolak",
};

export default function FormulirPosko() {
  const [laporan, setLaporan] = useState<Laporan[]>([]);
  const [hasil, setHasil] = useState<string | null>(null);
  const [galat, setGalat] = useState<string | null>(null);
  const [galatField, setGalatField] = useState<Partial<Record<NamaMedan, string>>>({});
  const [modeSibuk, setModeSibuk] = useState<"kirim" | "draf" | null>(null);
  const [diperbarui, setDiperbarui] = useState("");

  function bersihkanGalat(kunci: NamaMedan) {
    setGalatField((sebelum) => {
      if (!(kunci in sebelum)) return sebelum;
      const ganti = { ...sebelum };
      delete ganti[kunci];
      return ganti;
    });
  }
  async function muat() {
    const res = await fetch("/api/posko/laporan");
    const data = (await res.json()) as { ok: boolean; laporan?: Laporan[] };
    if (data.ok && data.laporan) {
      setLaporan(data.laporan);
      setDiperbarui(new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date()));
    }
  }

  useEffect(() => {
    void muat();
    if (window.navigator.onLine) {
      void kirimAntrean(window.localStorage, (url, badan) =>
        kirimSatuAntrean(url, badan, (pesan) => toast.error(pesan))
      ).then((sisa) => {
        if (sisa.length === 0) void muat();
      });
    }
  }, []);

  async function kirim(formData: FormData, draft: boolean) {
    setModeSibuk(draft ? "draf" : "kirim");
    setHasil(null);
    setGalat(null);
    const badan: Record<string, number | boolean> = { draft };
    const galatBaru: Partial<Record<NamaMedan, string>> = {};
    for (const m of MEDAN) {
      const mentah = String(formData.get(m.nama) ?? "");
      const nilai = mentah === "" ? Number.NaN : Number(mentah);
      if (!Number.isInteger(nilai) || nilai < 0) {
        galatBaru[m.nama] = `${m.label} harus bilangan bulat 0 atau lebih.`;
        badan[m.nama] = 0;
      } else {
        badan[m.nama] = nilai;
      }
    }
    setGalatField(galatBaru);
    if (Object.keys(galatBaru).length > 0) {
      setModeSibuk(null);
      return;
    }
    try {
      const res = await fetch("/api/posko/laporan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(badan),
      });
      const data = (await res.json()) as { ok: boolean; galat?: string };
      if (data.ok) {
        const pesan = draft ? "Draf tersimpan." : "Laporan terkirim, menunggu verifikasi BPBD.";
        setHasil(pesan);
        toast.success(pesan);
        await muat();
      } else setGalat(data.galat ?? "Gagal menyimpan.");
    } catch {
      tambahAntrean(window.localStorage, "laporan", "/api/posko/laporan", badan);
      setHasil("Koneksi lemah, laporan tersimpan dan terkirim otomatis (Menunggu Sinkronisasi).");
    } finally {
      setModeSibuk(null);
    }
  }

  function fokusFormulir(): void {
    document.getElementById("lapor")?.scrollIntoView({ behavior: "smooth", block: "start" });
    window.setTimeout(() => {
      document.getElementById("posko-bayi")?.focus({ preventScroll: true });
    }, 350);
  }

  const sibuk = modeSibuk !== null;
  const terbaru = laporan.find((l) => l.status !== "DRAFT") ?? laporan[0] ?? null;
  const jatah = laporan.find((l) => l.status === "DISETUJUI") ?? null;

  return (
    <div id="lapor" className="flex scroll-mt-20 flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-muted-foreground">
          Laporan penyintas · agregat
        </p>
        <BarisSegarkan
          diperbarui={diperbarui}
          memuat={false}
          onMuat={() => void muat()}
          sebaris
        />
      </div>
      <section aria-label="Snapshot terakhir per kategori" className="grid grid-cols-2 gap-3 rounded-none border bg-[#DCE8EE] p-4 sm:grid-cols-3">
        {(
          [
            ["Bayi", terbaru?.bayi ?? 0],
            ["Balita", terbaru?.balita ?? 0],
            ["Ibu hamil", terbaru?.ibu_hamil ?? 0],
            ["Lansia", terbaru?.lansia ?? 0],
            ["Disabilitas", terbaru?.disabilitas ?? 0],
            ["Umum", terbaru?.umum ?? 0],
          ] as const
        ).map(([label, nilai]) => (
          <div key={label} className="border bg-card p-3">
            <p className="t-label text-muted-foreground">{label}</p>
            <p className="text-2xl font-light tabular-nums text-primary">{nilai}</p>
          </div>
        ))}
      </section>
      <p className="text-muted-foreground text-sm">
        Cukup kirim angka <BantuanIstilah istilah="agregat" label="agregat tanpa NIK" />. Tanpa nama.
        Tanpa NIK.
      </p>
      <BannerOffline />
      {hasil && (
        <p role="status" className="rounded-none bg-success-bg p-3 text-sm text-success">
          {hasil}
        </p>
      )}
      {galat && (
        <Alert variant="destructive" role="alert">
          <AlertTitle>Gagal menyimpan</AlertTitle>
          <AlertDescription>{galat}</AlertDescription>
        </Alert>
      )}
      {terbaru && terbaru.status !== "DRAFT" && (
        <div
          role="status"
          className={
            terbaru.status === "DISETUJUI"
              ? "rounded-none bg-success-bg p-3 text-sm font-semibold text-success"
              : terbaru.status === "MINTA_REVISI"
                ? "rounded-none bg-warning-bg p-3 text-sm font-semibold text-warning"
                : terbaru.status === "DITOLAK"
                  ? "rounded-none bg-destructive/10 p-3 text-sm font-semibold text-destructive"
                  : "rounded-none bg-muted p-3 text-sm font-semibold text-muted-foreground"
          }
        >
          {terbaru.status === "MENUNGGU_VERIFIKASI" &&
            "Laporan terakhir: Menunggu verifikasi BPBD."}
          {terbaru.status === "DISETUJUI" && "Laporan terakhir: Disetujui BPBD."}
          {terbaru.status === "MINTA_REVISI" && (
            <span className="flex flex-col gap-2">
              <span>
                BPBD minta revisi laporan{" "}
                {new Date(terbaru.dibuat_pada).toLocaleString("id-ID")} (
                {terbaru.bayi + terbaru.balita + terbaru.ibu_hamil + terbaru.lansia +
                  terbaru.disabilitas + terbaru.umum}{" "}
                jiwa). Periksa keenam angka lalu kirim ulang.
              </span>
              {terbaru.alasan && (
                <span className="rounded-none bg-background/60 p-2 font-normal">
                  Alasan BPBD: {terbaru.alasan}
                </span>
              )}
              <Button
                type="button"
                onClick={fokusFormulir}
                variant="outline"
                className="min-h-12 w-full border-warning text-warning"
              >
                Perbaiki sekarang
              </Button>
            </span>
          )}
          {terbaru.status === "DITOLAK" && (
            <span className="flex flex-col gap-2">
              <span>Laporan terakhir: Ditolak BPBD. Kirim data baru yang benar.</span>
              {terbaru.alasan && (
                <span className="rounded-none bg-background/60 p-2 font-normal">
                  Alasan BPBD: {terbaru.alasan}
                </span>
              )}
              <Button
                type="button"
                onClick={fokusFormulir}
                variant="outline"
                className="min-h-12 w-full"
              >
                Isi data baru
              </Button>
            </span>
          )}
        </div>
      )}
      <div
        role="status"
        aria-label="Status jatah"
        className={
          jatah
            ? "rounded-none bg-success-bg p-3 text-sm font-semibold text-success"
            : "rounded-none bg-muted p-3 text-sm font-semibold text-muted-foreground"
        }
      >
        {jatah
          ? `Jatah disetujui: ${jatah.bayi + jatah.balita + jatah.ibu_hamil + jatah.lansia + jatah.disabilitas + jatah.umum} jiwa dari snapshot ${new Date(jatah.dibuat_pada).toLocaleString("id-ID")}.`
          : "Belum ada snapshot disetujui. Jatah dihitung setelah BPBD menyetujui laporan."}
      </div>
      <form
        action={(fd) => void kirim(fd, false)}
        className="flex flex-col gap-4"
        noValidate
      >
        {MEDAN.map((m) => (
          <div key={m.nama} className="flex flex-col gap-1">
            <Label htmlFor={`posko-${m.nama}`}>{m.label}</Label>
            <Input
              id={`posko-${m.nama}`}
              name={m.nama}
              type="number"
              min={0}
              defaultValue={0}
              onChange={() => bersihkanGalat(m.nama)}
              className="min-h-12"
              aria-invalid={galatField[m.nama] ? true : undefined}
              aria-describedby={galatField[m.nama] ? `posko-${m.nama}-galat` : undefined}
            />
            {galatField[m.nama] && (
              <p id={`posko-${m.nama}-galat`} role="alert" className="text-sm text-destructive">
                {galatField[m.nama]}
              </p>
            )}
          </div>
        ))}
        <div className="sticky bottom-20 z-10 flex gap-3 rounded-none border border-[#0B1F2E] bg-[#0B1F2E] p-3 shadow-lg md:bottom-4">
          <Button type="submit" disabled={sibuk} className="min-h-12 flex-1 rounded-none">
            {modeSibuk === "kirim" ? "Mengirim..." : "Kirim data"}
          </Button>
          <Button
            type="button"
            variant="outline"
            disabled={sibuk}
            onClick={(e) => {
              const form = (e.target as HTMLButtonElement).closest("form");
              if (form) void kirim(new FormData(form), true);
            }}
            className="min-h-12 flex-1 rounded-none"
          >
            {modeSibuk === "draf" ? "Menyimpan..." : "Simpan draf"}
          </Button>
        </div>
      </form>
      <section className="flex flex-col gap-2" aria-label="Riwayat laporan">
        <h2 className="text-lg font-bold text-primary">Riwayat laporan</h2>
        {laporan.length === 0 && (
          <div role="status" className="flex flex-col gap-2 rounded-none border border-dashed p-4">
            <p className="text-base font-semibold">Belum ada laporan terkirim</p>
            <p className="text-sm text-muted-foreground">
              Laporan pertama muncul di sini setelah data di atas dikirim. Simpan draf bila koneksi lemah.
            </p>
          </div>
        )}
        {laporan.map((l) => (
          <Card key={l.id}>
            <CardContent className="flex flex-col gap-1 p-4 text-sm">
              <p className="font-semibold">
                Total {l.bayi + l.balita + l.ibu_hamil + l.lansia + l.disabilitas + l.umum} jiwa
              </p>
              <p className="text-muted-foreground">
                {new Date(l.dibuat_pada).toLocaleString("id-ID")}
              </p>
              {l.status === "DISETUJUI" ? (
                <Badge className="w-fit border-transparent bg-success-bg text-success">Disetujui</Badge>
              ) : l.status === "MINTA_REVISI" ? (
                <Badge className="w-fit border-transparent bg-warning-bg text-warning">Minta revisi</Badge>
              ) : l.status === "DITOLAK" ? (
                <Badge variant="destructive" className="w-fit">Ditolak</Badge>
              ) : (
                <Badge variant="outline" className="w-fit">{STATUS_LABEL[l.status] ?? l.status}</Badge>
              )}
            </CardContent>
          </Card>
        ))}
      </section>
    </div>
  );
}
