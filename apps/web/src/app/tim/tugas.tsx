"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import BannerOffline, { hitungAntrean } from "@/components/banner-offline";
import Link from "next/link";
import { Alert, AlertDescription, AlertTitle } from "@omnirelief/ui/components/alert";
import { Badge } from "@omnirelief/ui/components/badge";
import { Button } from "@omnirelief/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@omnirelief/ui/components/card";
import { BantuanIstilah } from "@/components/bantuan-istilah";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@omnirelief/ui/components/dialog";
import { Skeleton } from "@omnirelief/ui/components/skeleton";
import { CheckIcon, WiFiOffIcon } from "@solar-icons/react/linear";
import { Textarea } from "@omnirelief/ui/components/textarea";
import { kirimAntrean, kirimSatuAntrean, tambahAntrean } from "@/lib/offline";
import TombolSalin from "@/components/tombol-salin";
import { formatTanggalLokal, labelStatusRiwayat } from "@/lib/tanggal";
import { TombolSudut } from "@/components/widget-laporan";
import { BarisSegarkan } from "@/components/kepala-halaman";

type Tugas = {
  id: number;
  kode: string;
  tim: string;
  eta: string | null;
  batas_checkin: string | null;
  posko_nama: string;
  log_terakhir: { status: string; dibuat_pada: string } | null;
};

type StatusMuat = "memuat" | "siap" | "gagal";

const AKSI = [
  { status: "KELUAR_GUDANG", label: "Keluar gudang" },
  { status: "DALAM_PERJALANAN", label: "Dalam perjalanan" },
  { status: "CHECKIN", label: "Check-in" },
  { status: "TIBA", label: "Tiba" },
] as const;

function lewatBatas(t: Tugas): boolean {
  return t.batas_checkin !== null && new Date(t.batas_checkin) < new Date();
}
async function kirimNyata(url: string, badan: Record<string, unknown>): Promise<boolean> {
  return kirimSatuAntrean(url, badan, (pesan) => toast.error(pesan));
}

export default function TugasTim() {
  const [tugas, setTugas] = useState<Tugas[]>([]);
  const [status, setStatus] = useState<StatusMuat>("memuat");
  const [pilih, setPilih] = useState<number | null>(null);
  const [kendala, setKendala] = useState("");
  const [darurat, setDarurat] = useState(false);
  const [tanyaDarurat, setTanyaDarurat] = useState(false);
  const [antre, setAntre] = useState(0);
  const [diperbarui, setDiperbarui] = useState("");
  const [sibukKirim, setSibukKirim] = useState(false);

  const muat = useCallback(async () => {
    setStatus("memuat");
    try {
      const res = await fetch("/api/tim/tugas");
      const data = (await res.json()) as { ok: boolean; tugas?: Tugas[] };
      if (!data.ok || !data.tugas) {
        setStatus("gagal");
        return;
      }
      setTugas(data.tugas);
      if (data.tugas.length === 1) setPilih(data.tugas[0].id);
      setDiperbarui(new Intl.DateTimeFormat("id-ID", { hour: "2-digit", minute: "2-digit" }).format(new Date()));
      setStatus("siap");
    } catch {
      setStatus("gagal");
    }
  }, []);

  useEffect(() => {
    void muat();
    setAntre(hitungAntrean());
    if (window.navigator.onLine) {
      void kirimAntrean(window.localStorage, kirimNyata).then((sisa) => {
        setAntre(sisa.length);
        if (sisa.length === 0) void muat();
        else toast.info(`${sisa.length} data Menunggu Sinkronisasi.`);
      });
    }
    function saatOnline() {
      void kirimAntrean(window.localStorage, kirimNyata).then((sisa) => {
        setAntre(sisa.length);
        if (sisa.length === 0) {
          toast.success("Antrean terkirim otomatis.");
          void muat();
        }
      });
    }
    window.addEventListener("online", saatOnline);
    return () => window.removeEventListener("online", saatOnline);
  }, [muat]);

  async function kirim(label: string, url: string, badan: object) {
    if (sibukKirim) return;
    setSibukKirim(true);
    const isi = badan as Record<string, unknown>;
    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(badan),
      });
      const data = (await res.json()) as { ok: boolean; galat?: string };
      if (!data.ok) {
        toast.error(data.galat ?? "Gagal mencatat update.");
      } else {
        toast.success(`${label} tercatat.`);
        setKendala("");
        await muat();
      }
    } catch {
      tambahAntrean(
        window.localStorage,
        url.endsWith("/kendala") ? "kendala" : "status",
        url,
        isi,
      );
      setAntre(hitungAntrean());
      toast.info("Koneksi lemah, update tersimpan dan terkirim otomatis.");
    } finally {
      setSibukKirim(false);
    }
  }

  async function kirimSekarang(): Promise<void> {
    const sisa = await kirimAntrean(window.localStorage, kirimNyata);
    setAntre(sisa.length);
    if (sisa.length === 0) {
      toast.success("Antrean terkirim.");
      await muat();
    } else {
      toast.error(`${sisa.length} data masih menunggu. Periksa koneksi lalu coba lagi.`);
    }
  }

  function menitMenujuBatas(t: Tugas): number | null {
    if (t.batas_checkin === null) return null;
    return Math.round((new Date(t.batas_checkin).getTime() - Date.now()) / 60000);
  }

  const aktif = tugas.find((t) => t.id === pilih) ?? null;
  const perluDicek = tugas.filter(lewatBatas).length;

  return (
    <div className="flex flex-col gap-4">
      <BarisSegarkan
        diperbarui={diperbarui}
        memuat={status === "memuat"}
        onMuat={() => void muat()}
      />
      <section aria-label="Ringkasan tugas" className="grid grid-cols-3 gap-3 rounded-none border bg-[#DCE8EE] p-4">
        <div className="border bg-card p-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Tugas aktif</p>
          <p className="text-4xl font-light tabular-nums text-primary">{tugas.length}</p>
        </div>
        <div className="border bg-card p-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Perlu check-in</p>
          <p className={`text-4xl font-light tabular-nums ${perluDicek > 0 ? "text-destructive" : "text-primary"}`}>{perluDicek}</p>
        </div>
        <div className="border bg-card p-3">
          <p className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">Sudah tiba</p>
          <p className="text-4xl font-light tabular-nums text-primary">{tugas.filter((t) => t.log_terakhir?.status === "TIBA").length}</p>
        </div>
      </section>
      <div className="grid grid-cols-12 gap-6">
        <div className="col-span-12 flex flex-col gap-4 lg:col-span-8">
      <p className="text-muted-foreground text-sm">
        <BantuanIstilah istilah="check-in" label="Check-in" /> tepat waktu agar tidak kena status{" "}
        <BantuanIstilah istilah="perlu-dicek" label="Perlu Dicek" />.
      </p>
      <BannerOffline />
      {antre > 0 && (
        <div
          role="status"
          className="flex flex-col gap-2 rounded-none bg-warning-bg p-3 text-sm font-semibold text-warning-badge-fg"
        >
          <p className="flex min-h-12 items-center gap-2">
            <WiFiOffIcon aria-hidden="true" className="size-5" />
            {antre} Menunggu Sinkronisasi. Terkirim otomatis saat daring.
          </p>
          <div className="flex gap-2">
            <Button
              onClick={() => void kirimSekarang()}
              variant="outline"
              className="min-h-12 flex-1"
            >
              Kirim sekarang
            </Button>
            <a
              href="/pengaturan#notifikasi"
              className="flex min-h-12 flex-1 items-center justify-center rounded-none border border-border px-4 font-semibold"
            >
              Atur notifikasi
            </a>
          </div>
        </div>
      )}

      {status === "memuat" && (
        <div className="flex flex-col gap-4" aria-label="Memuat tugas">
          <Skeleton className="h-20 w-full" />
          <Skeleton className="h-20 w-full" />
        </div>
      )}

      {status === "gagal" && (
        <Alert variant="destructive">
          <AlertTitle>Gagal memuat tugas</AlertTitle>
          <AlertDescription className="flex flex-col gap-3">
            Periksa koneksi lalu coba lagi.
            <Button onClick={() => void muat()} className="min-h-12 w-full">
              Muat ulang
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {status === "siap" && tugas.length === 0 && (
        <div role="status" className="flex flex-col gap-2 rounded-none border border-dashed p-4">
          <p className="text-base font-semibold">Belum ada manifest perlu dicek</p>
          <p className="text-sm text-muted-foreground">
            Manifest baru dari BPBD muncul di sini setelah dipublikasikan. Tetap siaga dan
            check-in bila diminta command center.
          </p>
        <TombolSudut>
          <Button onClick={() => void muat()} variant="outline" className="min-h-12 w-full rounded-none">
            Muat ulang tugas
          </Button>
        </TombolSudut>
        </div>
      )}

      {status === "siap" && tugas.length > 0 && (
        <>
          <p role="status" className="text-sm text-muted-foreground">
            {tugas.length} tugas hari ini
            {perluDicek > 0 ? ` · ${perluDicek} Perlu Dicek (lewat batas check-in)` : ""}
            {pilih === null ? " · pilih tugas untuk update status." : ""}
          </p>
          {tugas.map((t) => {
            const sisa = menitMenujuBatas(t);
            const mepet = !lewatBatas(t) && sisa !== null && sisa < 60 && sisa >= 0;
            return (
              <Card
                key={t.id}
                className={`text-left ${pilih === t.id ? "border-2 border-primary" : ""}`}
              >
                <CardContent className="flex flex-col gap-1 p-4 text-sm">
                  <p className="flex flex-wrap items-center gap-2 font-bold">
                    {t.kode} · {t.posko_nama}
                    {lewatBatas(t) && <Badge variant="destructive">Perlu Dicek</Badge>}
                    {mepet && (
                      <Badge className="border-transparent bg-warning-bg text-warning-badge-fg">
                        Check-in {sisa} mnt lagi
                      </Badge>
                    )}
                  </p>
                  <p className="text-muted-foreground">
                    Terakhir: {t.log_terakhir ? labelStatusRiwayat(t.log_terakhir.status) : "-"}
                    {t.eta ? ` · tiba ${formatTanggalLokal(t.eta)}` : ""}
                  </p>
                  <p className="text-muted-foreground">
                    {t.batas_checkin
                      ? `Batas check-in: ${formatTanggalLokal(t.batas_checkin)}`
                      : "Tanpa batas check-in"}
                  </p>
                  <div className="mt-1 flex flex-col gap-2 sm:flex-row">
                    <Button
                      type="button"
                      variant={pilih === t.id ? "default" : "outline"}
                      onClick={() => setPilih(t.id)}
                      aria-pressed={pilih === t.id}
                      className="min-h-12 flex-1 rounded-none sm:flex-none sm:px-6"
                    >
                      {pilih === t.id ? "Dipilih, buka panel" : "Pilih tugas"}
                    </Button>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setPilih(t.id);
                        document.getElementById("check-in")?.scrollIntoView({ behavior: "smooth", block: "start" });
                      }}
                      className="min-h-12 flex-1 rounded-none sm:flex-none sm:px-6"
                    >
                      Check-in sekarang
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </>
      )}
        </div>
        <aside className="col-span-12 lg:col-span-4">
          <div className="flex flex-col gap-4 lg:sticky lg:top-4">
      {status === "siap" && tugas.length === 0 && (
        <div role="status" className="flex flex-col gap-2 rounded-none border border-dashed p-4">
          <p className="text-base font-semibold">Belum ada manifest perlu dicek</p>
          <p className="text-sm text-muted-foreground">
            Panel update status tampil di sini setelah ada manifest untuk tim kamu.
          </p>
        </div>
      )}
      {aktif &&
        (() => {
          const sisaAktif = menitMenujuBatas(aktif);
          const mepetAktif =
            !lewatBatas(aktif) && sisaAktif !== null && sisaAktif < 60 && sisaAktif >= 0;
          const temu = AKSI.findIndex((a) => a.status === aktif.log_terakhir?.status);
          const kini = temu < 0 ? 0 : temu;
          return (
            <Card id="check-in" className="scroll-mt-20">
              <CardHeader>
                <CardTitle className="flex flex-wrap items-center gap-2 text-base">
                  Update {aktif.kode}
                  {lewatBatas(aktif) && <Badge variant="destructive">Perlu Dicek</Badge>}
                  {mepetAktif && (
                    <Badge className="border-transparent bg-warning-bg text-warning-badge-fg">
                      Check-in {sisaAktif} mnt lagi
                    </Badge>
                  )}
                </CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-3 text-sm">
                <div className="flex flex-col gap-2 sm:flex-row">
                  <TombolSalin
                    teks={aktif.kode}
                    label="Salin kode"
                    pesanSukses="Kode manifest disalin."
                    variant="outline"
                    className="flex-1"
                  />
                  <Button
                    render={
                      <Link href={`/m/${aktif.kode}`} target="_blank" rel="noreferrer">
                        Lihat halaman publik ↗
                      </Link>
                    }
                    variant="outline"
                    className="min-h-12 flex-1"
                  />
                </div>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <Button
                    render={<a href="tel:112">Hubungi darurat 112</a>}
                    variant="outline"
                    className="min-h-12 flex-1"
                  />
                  <p className="flex min-h-12 flex-1 items-center text-xs text-muted-foreground">
                    {lewatBatas(aktif)
                      ? "Lewat batas check-in. Kabari command center sekarang."
                      : "Gunakan bila armada butuh bantuan segera."}
                  </p>
                </div>
                <div className="flex flex-col gap-2">
                  <p role="status" className="font-semibold">
                    Tahap {kini + 1} dari {AKSI.length}: {AKSI[kini].label}
                  </p>
                  <ol aria-label="Progres pengiriman" className="flex gap-1 overflow-x-auto pb-1">
                    {AKSI.map((a, i) => {
                      const selesai = i < kini;
                      const tahapKini = i === kini;
                      return (
                        <li key={a.status} className="flex min-w-28 flex-1">
                          <button
                            type="button"
                            disabled={sibukKirim}
                            onClick={() =>
                              void kirim(a.label, "/api/tim/status", {
                                manifest_id: aktif.id,
                                status: a.status,
                              })
                            }
                            aria-current={tahapKini ? "step" : undefined}
                            aria-label={sibukKirim ? `Mengirim status ${a.label}` : `Kirim status ${a.label}`}
                            className="flex min-h-12 w-full flex-col items-center gap-1 rounded-none px-1 py-2 focus-visible:ring-2 focus-visible:ring-primary disabled:opacity-50"
                          >
                            <span aria-hidden="true" className="flex w-full items-center">
                              <span
                                className={`h-0.5 flex-1 ${i === 0 ? "bg-transparent" : i <= kini ? "bg-primary" : "bg-slate-200"}`}
                              />
                              <span
                                className={`flex size-8 items-center justify-center rounded-full ${
                                  selesai
                                    ? "bg-success text-white"
                                    : tahapKini
                                      ? "border-2 border-primary bg-white font-bold text-primary"
                                      : "border border-slate-200 bg-slate-50 text-muted-foreground"
                                }`}
                              >
                                {selesai ? (
                                  <CheckIcon aria-hidden="true" className="size-5" />
                                ) : (
                                  i + 1
                                )}
                              </span>
                              <span
                                className={`h-0.5 flex-1 ${i === AKSI.length - 1 ? "bg-transparent" : i < kini ? "bg-primary" : "bg-slate-200"}`}
                              />
                            </span>
                            <span
                              className={`text-center text-sm leading-tight ${tahapKini ? "font-bold text-primary" : selesai ? "font-semibold" : "text-muted-foreground"}`}
                            >
                              {a.label}
                            </span>
                            <span
                              className={`text-center text-xs ${selesai ? "font-semibold text-success" : tahapKini ? "font-semibold text-primary" : "text-muted-foreground"}`}
                            >
                              {selesai ? "Selesai" : tahapKini ? "Tahap kini" : "Belum"}
                            </span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </div>
                <div className="flex flex-wrap gap-2" role="group" aria-label="Template kendala cepat">
                  {["Macet", "Ban bocor", "Akses putus"].map((t) => (
                    <Button
                      key={t}
                      type="button"
                      variant="outline"
                      onClick={() => setKendala((s) => (s === "" ? t : `${s}, ${t.toLowerCase()}`))}
                      className="min-h-12 rounded-none text-xs"
                    >
                      {t}
                    </Button>
                  ))}
                </div>
                <Textarea
                  value={kendala}
                  onChange={(e) => setKendala(e.target.value)}
                  placeholder="Tulis kendala di lapangan"
                  aria-label="Kendala di lapangan"
                  className="min-h-12"
                  maxLength={500}
                />
                <label className="flex min-h-12 items-center gap-2 font-semibold text-destructive">
                  <input
                    type="checkbox"
                    checked={darurat}
                    onChange={(e) => setDarurat(e.target.checked)}
                    className="h-5 w-5 accent-destructive"
                  />
                  Darurat (butuh SOP darurat BPBD)
                </label>
                <Button
                  onClick={() => {
                    if (darurat) {
                      setTanyaDarurat(true);
                      return;
                    }
                    void kirim("Kendala", "/api/tim/kendala", {
                      manifest_id: aktif.id,
                      kendala,
                      darurat,
                    });
                  }}
                  disabled={kendala.trim() === "" || sibukKirim}
                  variant={darurat ? "destructive" : "outline"}
                  className="min-h-12 w-full"
                >
                  {sibukKirim ? "Mengirim..." : darurat ? "Kirim tanda darurat" : "Lapor kendala"}
                </Button>
              </CardContent>
            </Card>
          );
        })()}
          </div>
        </aside>
      </div>
      <Dialog open={tanyaDarurat} onOpenChange={(buka) => !buka && setTanyaDarurat(false)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="text-destructive">Kirim tanda darurat?</DialogTitle>
            <DialogDescription>
              Tanda darurat memakai SOP darurat BPBD dan command center segera dihubungi. Pastikan
              situasi benar-benar darurat sebelum mengirim.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setTanyaDarurat(false)}
              className="min-h-12"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => {
                setTanyaDarurat(false);
                if (aktif) {
                  void kirim("Darurat", "/api/tim/kendala", {
                    manifest_id: aktif.id,
                    kendala,
                    darurat: true,
                  });
                }
              }}
              disabled={kendala.trim() === ""}
              className="min-h-12"
            >
              Ya, kirim darurat
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
