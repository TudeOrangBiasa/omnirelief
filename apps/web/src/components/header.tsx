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
import { Separator } from "@omnirelief/ui/components/separator";
import { SidebarTrigger } from "@omnirelief/ui/components/sidebar";
import { hitungAntrean } from "@/components/banner-offline";
import { mintaBukaPintasan } from "@/components/pintasan-keyboard";
import { zonaDasbor } from "@/lib/navigasi";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@omnirelief/ui/components/tooltip";
import PusatNotifikasi from "@/components/pusat-notifikasi";

const PETA_LABEL: Record<string, string> = {
  beranda: "Beranda",
  bpbd: "Verifikasi",
  kirim: "Buat manifest",
  gudang: "Catat sumbangan",
  posko: "Posko",
  tim: "Tugas",
  pengaturan: "Pengaturan",
  profil: "Profil",
  bantuan: "Pusat bantuan",
  audit: "Audit log",
  admin: "Admin",
  transparansi: "Transparansi",
  dasbor: "Dasbor",
};

function remahManifest(
  segmen: string[],
): { label: string; href?: string }[] | null {
  if (segmen[0] !== "m" && segmen[0] !== "s") return null;
  if (segmen.length < 2 || segmen[1] === "") return null;
  return [
    { label: "Beranda", href: "/beranda" },
    { label: "Transparansi", href: "/transparansi" },
    { label: segmen[1] },
  ];
}

function remah(pathname: string): { label: string; href?: string }[] {
  const segmen = pathname.split("/").filter(Boolean);
  const manifest = remahManifest(segmen);
  if (manifest) return manifest;
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
export default function Header({ nama, masuk }: { nama: string | null; masuk: boolean }) {
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
  if (!zonaDasbor(pathname ?? "/") || !masuk) return null;

  const daftar = remah(pathname ?? "/");
  const macet = !daring || antre > 0;

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-[#0B1F2E]/15 bg-white print:hidden">
      <div className="flex h-14 w-full items-center gap-2 pr-3 pl-3 md:pl-4">
        <SidebarTrigger className="hidden h-9 w-9 rounded-none garis-rambut-diam after:absolute after:-inset-1.5 after:content-[''] md:flex" />
        <Separator orientation="vertical" className="hidden h-4 w-px bg-[#0B1F2E]/20 md:block" />
        <Breadcrumb aria-label="Lokasi halaman" className="min-w-0 font-mono text-[#0B1F2E]/70 [&_li]:text-xs [&_li]:uppercase [&_li]:tracking-wider">
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
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger
                render={
                  <button
                    type="button"
                    onClick={() => mintaBukaPintasan()}
                    aria-label="Buka pintasan dan panduan cepat (Ctrl K)"
                    className="relative flex h-9 w-9 items-center justify-center rounded-none border border-[#0B1F2E]/20 bg-white font-mono text-xs text-foreground after:absolute after:-inset-1.5 after:content-[''] hover:bg-slate-100 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring"
                  >
                    <span aria-hidden="true">?</span>
                  </button>
                }
              />
              <TooltipContent side="bottom">
                Pintasan dan panduan cepat (Ctrl K)
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
          <PusatNotifikasi />
          {!nama && (
            <a
              href="/masuk"
              className="flex h-9 items-center rounded-none bg-primary px-4 text-sm font-semibold text-primary-foreground"
            >
              Masuk
            </a>
          )}
          <p
            role="status"
          className={
            macet
              ? "flex h-9 items-center gap-1.5 rounded-none border border-emerald-700/30 bg-warning-bg px-3 font-mono text-[11px] uppercase tracking-wider text-warning-badge-fg"
              : "flex h-9 items-center gap-1.5 rounded-none border border-emerald-700/30 bg-emerald-50 px-3 font-mono text-[11px] uppercase tracking-wider text-emerald-900"
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
