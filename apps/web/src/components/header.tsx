"use client";

import { Fragment, useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { WiFiIcon, WiFiOffIcon } from "@solar-icons/react/linear";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@omnirelief/ui/components/breadcrumb";
import { Badge } from "@omnirelief/ui/components/badge";
import { Separator } from "@omnirelief/ui/components/separator";
import { SidebarTrigger } from "@omnirelief/ui/components/sidebar";
import { hitungAntrean } from "@/components/banner-offline";
import { zonaDasbor } from "@/lib/navigasi";

const PETA_LABEL: Record<string, string> = {
  beranda: "Beranda",
  bpbd: "Verifikasi",
  kirim: "Buat manifest",
  gudang: "Catat sumbangan",
  posko: "Posko",
  tim: "Tugas",
  pengaturan: "Pengaturan",
  profil: "Profil",
  admin: "Admin",
  transparansi: "Transparansi",
};

function remah(pathname: string): { label: string; href?: string }[] {
  const segmen = pathname.split("/").filter(Boolean);
  if (segmen.length === 0 || segmen[0] === "beranda")
    return [{ label: "Beranda" }];
  const utama = PETA_LABEL[segmen[0]] ?? "Halaman";
  if (segmen.length === 1) return [{ label: "Beranda", href: "/beranda" }, { label: utama }];
  const kedua = PETA_LABEL[segmen[1]] ?? "Halaman";
  return [
    { label: "Beranda", href: "/beranda" },
    { label: utama, href: `/${segmen[0]}` },
    { label: kedua },
  ];
}

export default function Header({
  nama,
  peranLabel,
}: {
  nama: string | null;
  peranLabel: string;
}) {
  const pathname = usePathname();
  const [daring, setDaring] = useState(true);
  const [antre, setAntre] = useState(0);

  useEffect(() => {
    function segarkan() {
      setDaring(window.navigator.onLine);
      setAntre(hitungAntrean());
    }
    segarkan();
    window.addEventListener("online", segarkan);
    window.addEventListener("offline", segarkan);
    window.addEventListener("storage", segarkan);
    const id = window.setInterval(segarkan, 5000);
    return () => {
      window.removeEventListener("online", segarkan);
      window.removeEventListener("offline", segarkan);
      window.removeEventListener("storage", segarkan);
      window.clearInterval(id);
    };
  }, []);

  // Top-nav publik (landing dkk) dicabut sementara: desain landing dikerjakan
  // terakhir setelah dasbor + fitur utama (keputusan Nov 2026).
  if (!zonaDasbor(pathname ?? "/")) return null;

  const daftar = remah(pathname ?? "/");
  const macet = !daring || antre > 0;

  return (
    <header className="sticky top-0 z-40 min-h-14 border-b border-slate-300/60 bg-white/70 backdrop-blur-md">
      <div className="mx-auto flex min-h-14 w-full max-w-5xl items-center gap-2 px-4">
        <SidebarTrigger className="hidden min-h-12 min-w-12 md:flex" />
        <Separator orientation="vertical" className="hidden h-4 md:block" />
        <Breadcrumb aria-label="Lokasi halaman" className="min-w-0">
          <BreadcrumbList>
            {daftar.map((c, i) => {
              const terakhir = i === daftar.length - 1;
              return (
                <Fragment key={c.label}>
                  {i > 0 && <BreadcrumbSeparator />}
                  <BreadcrumbItem>
                    {terakhir || !c.href ? (
                      <BreadcrumbPage>{c.label}</BreadcrumbPage>
                    ) : (
                      <BreadcrumbLink render={<a href={c.href} />}>
                        {c.label}
                      </BreadcrumbLink>
                    )}
                  </BreadcrumbItem>
                </Fragment>
              );
            })}
          </BreadcrumbList>
        </Breadcrumb>
        <div className="ms-auto flex items-center gap-2 py-1">
          {nama ? (
            <Badge
              variant="secondary"
              render={<a href="/profil" aria-label={`Profil ${nama}`} />}
            >
              {peranLabel}
            </Badge>
          ) : (
            <a
              href="/masuk"
              className="flex min-h-12 items-center rounded-xl bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              Masuk
            </a>
          )}
          <p
            role="status"
            className={
              macet
                ? "flex min-h-12 items-center gap-1.5 rounded-full bg-warning-bg px-3 text-xs font-semibold text-warning-badge-fg"
                : "flex min-h-12 items-center gap-1.5 rounded-full bg-success-bg px-3 text-xs font-semibold text-success"
            }
          >
            {macet ? (
              <WiFiOffIcon aria-hidden="true" className="size-4" />
            ) : (
              <WiFiIcon aria-hidden="true" className="size-4" />
            )}
            {!daring
              ? `Luring${antre > 0 ? `, ${antre} Menunggu` : ""}`
              : antre > 0
                ? `${antre} Menunggu Sinkronisasi`
                : "Daring"}
          </p>
        </div>
      </div>
    </header>
  );
}
