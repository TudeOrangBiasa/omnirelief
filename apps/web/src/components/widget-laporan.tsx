"use client";
import type { ReactNode } from "react";
import type { AksiItem } from "@/lib/aksi";
import type { Route } from "next";

import { useRouter } from "next/navigation";
import { RefreshIcon } from "@solar-icons/react/linear";
import {
  Alert,
  AlertDescription,
  AlertTitle,
} from "@omnirelief/ui/components/alert";
import { Badge } from "@omnirelief/ui/components/badge";
import { Button } from "@omnirelief/ui/components/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@omnirelief/ui/components/card";

export type KpiItem = { angka: string; label: string; konteks: string; lencana?: string };

export type AksiPerintah = {
  label: string;
  href?: Route;
  onAksi?: () => void;
  varian?: "default" | "destructive" | "outline";
};

/**
 * Command bar compact: satu aksi primer + status segar + segarkan.
 * Tinggi satu baris di desktop agar konten kerja naik ke atas.
 */
export function BilahPerintah({
  label,
  aksi,
  diperbarui,
  memuat,
  onMuat,
  basi,
  antre,
}: {
  label: string;
  aksi: AksiPerintah;
  diperbarui: string;
  memuat: boolean;
  onMuat: () => void;
  basi?: boolean;
  antre?: number;
}) {
  const router = useRouter();
  return (
    <section
      aria-label={label}
      className="flex flex-col gap-2 rounded-none garis-rambut-diam bg-white p-3 sm:flex-row sm:items-center"
    >
      <Button
        variant={aksi.varian ?? "default"}
        onClick={() => {
          if (aksi.onAksi) aksi.onAksi();
          else if (aksi.href) router.push(aksi.href);
        }}
        className="min-h-12 flex-1 rounded-none sm:flex-none sm:px-8"
      >
        {aksi.label}
      </Button>
      <p role="status" className="flex-1 text-sm text-muted-foreground">
        {diperbarui ? `Diperbarui ${diperbarui}` : "Belum dimuat"}
        {basi && !memuat ? " · data mungkin basi" : ""}
        {antre !== undefined && antre > 0 ? ` · ${antre} menunggu sinkronisasi` : ""}
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={onMuat}
        disabled={memuat}
        className="min-h-12 gap-2 rounded-none sm:w-auto"
      >
        <RefreshIcon aria-hidden="true" className={memuat ? "animate-spin" : undefined} />
        {memuat ? "Memuat..." : "Segarkan"}
      </Button>
    </section>
  );
}

export function StripKpi({ label, item }: { label: string; item: KpiItem[] }) {
  return (
    <div
      aria-label={label}
      className="grid grid-cols-1 divide-y divide-[#0B1F2E]/20 rounded-none border border-[#0B1F2E]/20 bg-[#DCE8EE] sm:grid-cols-3 sm:divide-x sm:divide-y-0"
    >
      {item.map((r) => (
        <div key={r.label} className="flex flex-col gap-1 p-4">
          <span className="text-4xl font-light tabular-nums text-[#0B1F2E]">{r.angka}</span>
          <span className="t-label text-[#0B1F2E]/70">
            {r.label}
          </span>
          <span className="text-xs text-[#0B1F2E]/70">{r.konteks}</span>
          {r.lencana ? (
            <span className="mt-1 w-fit rounded-none bg-[#0B1F2E] px-2 py-0.5 t-label text-white">
              {r.lencana}
            </span>
          ) : null}
        </div>
      ))}
    </div>
  );
}

type NadaBanner = "prioritas" | "info";

export function BannerAksi({
  nada,
  judul,
  deskripsi,
  aksiLabel,
  href,
}: {
  nada: NadaBanner;
  judul: string;
  deskripsi: string;
  aksiLabel: string;
  href: Route;
}) {
  const router = useRouter();
  return (
    <Alert variant={nada === "prioritas" ? "destructive" : "default"} className="rounded-none">
      <AlertTitle>{judul}</AlertTitle>
      <AlertDescription>{deskripsi}</AlertDescription>
      <Button
        variant={nada === "prioritas" ? "destructive" : "default"}
        onClick={() => router.push(href)}
        className="mt-3 min-h-12 rounded-none"
      >
        {aksiLabel}
      </Button>
    </Alert>
  );
}


export function GridAksiCepat({ label, aksi }: { label: string; aksi: AksiItem[] }) {
  const router = useRouter();
  return (
    <section aria-label={label}>
      <p className="t-label text-[#0B1F2E]/70">{label}</p>
      <div className="mt-2 grid grid-cols-1 gap-2 sm:grid-cols-2">
        {aksi.map((a, i) => (
          <Button
            key={a.label}
            variant={a.utama ? "default" : "outline"}
            onClick={() => router.push(a.href)}
            className={`min-h-12 w-full rounded-none ${i === aksi.length - 1 && aksi.length % 2 === 1 ? "sm:col-span-2" : ""}`}
          >
            {a.label}
          </Button>
        ))}
      </div>
    </section>
  );
}

export type LencanaItem = { teks: string; varian: "default" | "destructive" | "outline" | "success" };

function Lencana({ badge }: { badge: LencanaItem }) {
  if (badge.varian === "success") {
    return (
      <Badge className="border-transparent bg-success-bg text-success">{badge.teks}</Badge>
    );
  }
  return <Badge variant={badge.varian}>{badge.teks}</Badge>;
}

export type AktivitasItem = {
  id: string;
  judul: string;
  sub: string;
  href: Route;
  badge: LencanaItem;
  waktuLabel: string;
};

export function DaftarAktivitas({ item }: { item: AktivitasItem[] }) {
  if (item.length === 0) return null;
  return (
     <ul className="pudar-masuk mt-3 flex flex-col gap-2">
      {item.map((a) => (
        <li key={a.id}>
          <Card className="rounded-none">
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-2 text-base">
                <a
                  href={a.href}
                  className="min-h-12 content-center text-primary underline-offset-4 hover:underline"
                >
                  {a.judul}
                </a>
                <Lencana badge={a.badge} />
              </CardTitle>
            </CardHeader>
            <CardContent className="-mt-2 text-sm text-muted-foreground">
              <p>{a.sub}</p>
              {a.waktuLabel !== "" && (
                <p className="mt-1 t-label">
                  {a.waktuLabel}
                </p>
              )}
            </CardContent>
          </Card>
        </li>
      ))}
    </ul>
  );
}

export function KotakKosong({
  label,
  judul,
  deskripsi,
  aksiLabel,
  href,
  onAksi,
}: {
  label: string;
  judul: string;
  deskripsi: string;
  aksiLabel: string;
  href?: Route;
  onAksi?: () => void;
}) {
  const router = useRouter();
  return (
     <div className="pudar-masuk rounded-none border border-dashed border-[#0B1F2E]/25 bg-white/60 p-8">
      <p className="t-label text-[#0B1F2E]/70">{label}</p>
      <p className="mt-1 text-lg font-bold text-[#0B1F2E]">{judul}</p>
      <p className="mt-1 text-sm text-muted-foreground">{deskripsi}</p>
      <Button
        onClick={() => {
          if (onAksi) onAksi();
          else if (href) router.push(href);
        }}
        className="mt-4 min-h-12 rounded-none"
      >
        {aksiLabel}
      </Button>
    </div>
  );
}

/**
 * Bingkai sudut untuk CTA empty state. Empat siku L menempel tepat di
 * sudut tombol (bukan teks ASCII) sehingga selalu sejajar grid.
 */
export function TombolSudut({ children }: { children: ReactNode }) {
  const sudut = [
    "top-0 left-0 border-t-2 border-l-2",
    "top-0 right-0 border-t-2 border-r-2",
    "bottom-0 left-0 border-b-2 border-l-2",
    "right-0 bottom-0 border-r-2 border-b-2",
  ];
  return (
    <div className="relative p-2">
      {sudut.map((posisi) => (
        <span
          key={posisi}
          aria-hidden="true"
          className={`pointer-events-none absolute h-3 w-3 ${posisi} border-[#0B1F2E]/40`}
        />
      ))}
      {children}
    </div>
  );
}
