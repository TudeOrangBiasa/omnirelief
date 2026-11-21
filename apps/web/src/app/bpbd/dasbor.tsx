"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import {
  DangerTriangleIcon,
  InfoCircleIcon,
  PhoneCallingRoundedIcon,
} from "@solar-icons/react/linear";
import { Alert, AlertDescription, AlertTitle } from "@omnirelief/ui/components/alert";
import { Badge } from "@omnirelief/ui/components/badge";
import { Button, buttonVariants } from "@omnirelief/ui/components/button";
import { Card, CardContent, CardHeader, CardTitle } from "@omnirelief/ui/components/card";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@omnirelief/ui/components/dialog";
import {
  Empty,
  EmptyDescription,
  EmptyHeader,
  EmptyTitle,
} from "@omnirelief/ui/components/empty";
import { Label } from "@omnirelief/ui/components/label";
import { Skeleton } from "@omnirelief/ui/components/skeleton";
import { Textarea } from "@omnirelief/ui/components/textarea";
import { cn } from "@omnirelief/ui/lib/utils";
import { baris } from "@/lib/supabase/baris";

type StatusMuat = "memuat" | "siap" | "gagal";

type Antrean = {
  id: number;
  bayi: number;
  balita: number;
  ibu_hamil: number;
  lansia: number;
  disabilitas: number;
  umum: number;
  dibuat_pada: string;
  posko: { nama: string } | null;
};

type Prioritas = {
  posko_id: number;
  posko_nama: string;
  wilayah: string;
  butuh: number;
  dikirim: number;
  diterima: number;
  selisih: number;
};

type Pantau = {
  id: number;
  kode: string;
  tim: string;
  posko_nama: string;
  batas_checkin: string;
  log_terakhir: string | null;
  ditandai: boolean;
};

type PutusanTarget = {
  id: number;
  nama: string;
  keputusan: "MINTA_REVISI" | "DITOLAK";
};

type BatalTarget = { id: number; kode: string; posko_nama: string };

function galatDari(data: unknown, bawaan: string): string {
  if (typeof data === "object" && data !== null && "galat" in data) {
    return String(data.galat);
  }
  return bawaan;
}

function KartuMuat() {
  return (
    <Card aria-hidden="true">
      <CardHeader>
        <Skeleton className="h-5 w-2/3" />
      </CardHeader>
      <CardContent className="flex flex-col gap-2">
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-12 w-full" />
      </CardContent>
    </Card>
  );
}

export default function DasborBpbd() {
  const [status, setStatus] = useState<StatusMuat>("memuat");
  const [antrean, setAntrean] = useState<Antrean[]>([]);
  const [prioritas, setPrioritas] = useState<Prioritas[]>([]);
  const [pantau, setPantau] = useState<Pantau[]>([]);
  const [putusan, setPutusan] = useState<PutusanTarget | null>(null);
  const [alasanPutusan, setAlasanPutusan] = useState("");
  const [galatPutusan, setGalatPutusan] = useState<string | null>(null);
  const [sibukPutusan, setSibukPutusan] = useState(false);
  const [batal, setBatal] = useState<BatalTarget | null>(null);
  const [alasanBatal, setAlasanBatal] = useState("");
  const [galatBatal, setGalatBatal] = useState<string | null>(null);
  const [sibukBatal, setSibukBatal] = useState(false);

  const muat = useCallback(async () => {
    setStatus("memuat");
    try {
      const [ra, rp, rw] = await Promise.all([
        fetch("/api/bpbd/antrean").then((r) => r.json()),
        fetch("/api/bpbd/prioritas").then((r) => r.json()),
        fetch("/api/bpbd/pantauan").then((r) => r.json()),
      ]);
      const da: unknown = ra;
      const dp: unknown = rp;
      const dw: unknown = rw;
      const okA = typeof da === "object" && da !== null && "ok" in da && da.ok === true;
      const okP = typeof dp === "object" && dp !== null && "ok" in dp && dp.ok === true;
      const okW = typeof dw === "object" && dw !== null && "ok" in dw && dw.ok === true;
      setAntrean(okA && "antrean" in da ? baris<Antrean>(da.antrean) : []);
      setPrioritas(okP && "prioritas" in dp ? baris<Prioritas>(dp.prioritas) : []);
      setPantau(okW && "perlu_dicek" in dw ? baris<Pantau>(dw.perlu_dicek) : []);
      setStatus(okA && okP && okW ? "siap" : "gagal");
    } catch {
      setStatus("gagal");
    }
  }, []);

  useEffect(() => {
    void muat();
  }, [muat]);

  async function kirimPutusan(snapshot_id: number, keputusan: string, alasan?: string) {
    const res = await fetch("/api/bpbd/verifikasi", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ snapshot_id, keputusan, catatan: alasan ?? "" }),
    });
    const data: unknown = await res.json();
    if (typeof data === "object" && data !== null && "ok" in data && data.ok === true) return;
    throw new Error(galatDari(data, "Keputusan gagal disimpan."));
  }

  async function setujui(snapshot_id: number) {
    try {
      await kirimPutusan(snapshot_id, "DISETUJUI");
      toast.success("Snapshot disetujui.");
      await muat();
    } catch (e) {
      toast.error(e instanceof Error ? e.message : "Keputusan gagal.");
    }
  }

  function bukaPutusan(target: PutusanTarget) {
    setPutusan(target);
    setAlasanPutusan("");
    setGalatPutusan(null);
  }

  async function konfirmasiPutusan() {
    if (!putusan) return;
    if (alasanPutusan.trim().length < 5) {
      setGalatPutusan("Alasan wajib diisi (minimal 5 huruf) untuk revisi atau penolakan.");
      return;
    }
    setSibukPutusan(true);
    try {
      await kirimPutusan(putusan.id, putusan.keputusan, alasanPutusan.trim());
      toast.success(
        putusan.keputusan === "MINTA_REVISI" ? "Revisi diminta." : "Snapshot ditolak.",
      );
      setPutusan(null);
      await muat();
    } catch (e) {
      setGalatPutusan(e instanceof Error ? e.message : "Keputusan gagal.");
    } finally {
      setSibukPutusan(false);
    }
  }

  function bukaBatal(target: BatalTarget) {
    setBatal(target);
    setAlasanBatal("");
    setGalatBatal(null);
  }

  async function konfirmasiBatal() {
    if (!batal) return;
    if (alasanBatal.trim().length < 5) {
      setGalatBatal("Alasan pembatalan wajib diisi (minimal 5 huruf).");
      return;
    }
    setSibukBatal(true);
    try {
      const res = await fetch("/api/bpbd/pembatalan", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ manifest_id: batal.id, alasan: alasanBatal.trim() }),
      });
      const data: unknown = await res.json();
      if (typeof data !== "object" || data === null || !("ok" in data) || data.ok !== true) {
        throw new Error(galatDari(data, "Pembatalan gagal."));
      }
      toast.success(`Manifest ${batal.kode} dibatalkan.`);
      setBatal(null);
      await muat();
    } catch (e) {
      setGalatBatal(e instanceof Error ? e.message : "Pembatalan gagal.");
    } finally {
      setSibukBatal(false);
    }
  }

  return (
    <div className="flex flex-col gap-8">
      {status === "gagal" && (
        <Alert variant="destructive" role="status">
          <DangerTriangleIcon aria-hidden="true" />
          <AlertTitle>Gagal memuat data</AlertTitle>
          <AlertDescription className="flex flex-col gap-2">
            Sebagian data tidak bisa dimuat. Periksa koneksi lalu coba lagi.
            <Button onClick={() => void muat()} className="min-h-12 w-fit">
              Muat ulang
            </Button>
          </AlertDescription>
        </Alert>
      )}

      <div className="flex flex-col gap-2 sm:flex-row">
        <a href="/bpbd/kirim" className={cn(buttonVariants(), "min-h-12 flex-1")}>
          Buat manifest baru
        </a>
        <Button variant="outline" onClick={() => void muat()} className="min-h-12 flex-1">
          Segarkan data
        </Button>
      </div>

      <section aria-label="Perlu Dicek" className="flex flex-col gap-2">
        <div className="flex items-center gap-2">
          <h2 className="text-lg font-bold text-destructive">Perlu Dicek ({pantau.length})</h2>
          {pantau.length > 0 && <Badge variant="destructive">Perlu Dicek</Badge>}
        </div>
        {status === "memuat" ? (
          <KartuMuat />
        ) : pantau.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Semua kiriman terpantau</EmptyTitle>
              <EmptyDescription>
                Tidak ada kiriman yang lewat batas check-in saat ini.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          pantau.map((w) => (
            <Card key={w.id} className="border-destructive">
              <CardContent className="flex flex-col gap-2 p-4 text-sm">
                <p className="font-semibold">
                  {w.kode} · {w.posko_nama}
                </p>
                <p className="text-muted-foreground">
                  Tim {w.tim} · batas check-in lewat · kabar terakhir {w.log_terakhir ?? "-"}
                  {w.ditandai ? " · sudah ditandai otomatis" : ""}
                </p>
                <div className="flex flex-col gap-2 sm:flex-row">
                  <a
                    href="tel:112"
                    className={cn(buttonVariants({ variant: "outline" }), "min-h-12 flex-1")}
                  >
                    <PhoneCallingRoundedIcon aria-hidden="true" />
                    Hubungi jalur darurat
                  </a>
                  <Button
                    variant="destructive"
                    onClick={() =>
                      bukaBatal({ id: w.id, kode: w.kode, posko_nama: w.posko_nama })
                    }
                    className="min-h-12 flex-1"
                  >
                    Batalkan manifest ini
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </section>

      <section aria-label="Antrean verifikasi" className="flex flex-col gap-2">
        <h2 className="text-lg font-bold text-primary">Antrean verifikasi ({antrean.length})</h2>
        {status === "memuat" ? (
          <KartuMuat />
        ) : antrean.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Antrean kosong</EmptyTitle>
              <EmptyDescription>
                Tidak ada snapshot penyintas yang menunggu verifikasi.
              </EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          antrean.map((a) => {
            const total = a.bayi + a.balita + a.ibu_hamil + a.lansia + a.disabilitas + a.umum;
            return (
              <Card key={a.id}>
                <CardHeader>
                  <CardTitle className="text-base">{a.posko?.nama ?? "Posko?"}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-col gap-2 text-sm">
                  <p className="text-muted-foreground">
                    Total {total} jiwa ·{" "}
                    {new Date(a.dibuat_pada).toLocaleString("id-ID")}
                  </p>
                  <dl className="grid grid-cols-2 gap-1 text-sm sm:grid-cols-3">
                    <div>Bayi: <strong>{a.bayi}</strong></div>
                    <div>Balita: <strong>{a.balita}</strong></div>
                    <div>Ibu hamil: <strong>{a.ibu_hamil}</strong></div>
                    <div>Lansia: <strong>{a.lansia}</strong></div>
                    <div>Disabilitas: <strong>{a.disabilitas}</strong></div>
                    <div>Umum: <strong>{a.umum}</strong></div>
                  </dl>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button
                      onClick={() => void setujui(a.id)}
                      className="min-h-12 flex-1 bg-success text-white hover:bg-success/80"
                    >
                      Setujui
                    </Button>
                    <Button
                      onClick={() =>
                        bukaPutusan({
                          id: a.id,
                          nama: a.posko?.nama ?? "Posko?",
                          keputusan: "MINTA_REVISI",
                        })
                      }
                      className="min-h-12 flex-1 bg-warning-bg text-warning hover:bg-warning-bg"
                    >
                      Minta revisi
                    </Button>
                    <Button
                      variant="destructive"
                      onClick={() =>
                        bukaPutusan({
                          id: a.id,
                          nama: a.posko?.nama ?? "Posko?",
                          keputusan: "DITOLAK",
                        })
                      }
                      className="min-h-12 flex-1"
                    >
                      Tolak
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </section>

      <section aria-label="Prioritas kebutuhan" className="flex flex-col gap-2">
        <h2 className="text-lg font-bold text-primary">Prioritas kebutuhan</h2>
        {status === "memuat" ? (
          <KartuMuat />
        ) : prioritas.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyTitle>Belum ada data selisih</EmptyTitle>
              <EmptyDescription>Data kebutuhan posko belum tersedia.</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          prioritas.map((p) => (
            <Card key={p.posko_id}>
              <CardContent className="flex flex-col gap-2 p-4 text-sm">
                <p className="font-semibold">
                  {p.posko_nama} · {p.wilayah}
                </p>
                <p className="text-muted-foreground">
                  Butuh {p.butuh} · Dikirim {p.dikirim} · Diterima {p.diterima}
                </p>
                {p.selisih > 0 ? (
                  <Badge variant="destructive">Kurang {p.selisih}</Badge>
                ) : (
                  <Badge className="border-transparent bg-success-bg text-success">Aman</Badge>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </section>

      <Dialog open={putusan !== null} onOpenChange={(buka) => !buka && setPutusan(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {putusan?.keputusan === "MINTA_REVISI" ? "Minta revisi" : "Tolak snapshot"} ·{" "}
              {putusan?.nama}
            </DialogTitle>
            <DialogDescription>
              Tulis alasan yang jelas agar posko tahu apa yang harus diperbaiki. Alasan wajib
              diisi.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1">
            <Label htmlFor="alasan-putusan">Alasan</Label>
            <Textarea
              id="alasan-putusan"
              value={alasanPutusan}
              onChange={(e) => setAlasanPutusan(e.target.value)}
              placeholder="Contoh: jumlah lansia tidak cocok dengan laporan kemarin, mohon cek ulang."
              rows={3}
            />
            {galatPutusan && (
              <p role="alert" className="flex items-center gap-1 text-sm text-destructive">
                <InfoCircleIcon aria-hidden="true" />
                {galatPutusan}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setPutusan(null)}
              className="min-h-12"
            >
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => void konfirmasiPutusan()}
              disabled={sibukPutusan}
              className="min-h-12"
            >
              {sibukPutusan
                ? "Menyimpan..."
                : putusan?.keputusan === "MINTA_REVISI"
                  ? "Kirim permintaan revisi"
                  : "Tolak snapshot"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={batal !== null} onOpenChange={(buka) => !buka && setBatal(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Batalkan manifest {batal?.kode}?</DialogTitle>
            <DialogDescription>
              Pembatalan tercatat publik dan tidak bisa dibatalkan. Manifest tujuan{" "}
              {batal?.posko_nama} tidak jadi dikirim; buat manifest pengganti bila masih
              dibutuhkan.
            </DialogDescription>
          </DialogHeader>
          <div className="flex flex-col gap-1">
            <Label htmlFor="alasan-batal">Alasan pembatalan publik</Label>
            <Textarea
              id="alasan-batal"
              value={alasanBatal}
              onChange={(e) => setAlasanBatal(e.target.value)}
              placeholder="Contoh: tim tidak bisa berangkat karena akses putus, diganti manifest baru."
              rows={3}
            />
            {galatBatal && (
              <p role="alert" className="flex items-center gap-1 text-sm text-destructive">
                <InfoCircleIcon aria-hidden="true" />
                {galatBatal}
              </p>
            )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setBatal(null)} className="min-h-12">
              Batal
            </Button>
            <Button
              variant="destructive"
              onClick={() => void konfirmasiBatal()}
              disabled={sibukBatal}
              className="min-h-12"
            >
              {sibukBatal ? "Membatalkan..." : "Ya, batalkan manifest"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
