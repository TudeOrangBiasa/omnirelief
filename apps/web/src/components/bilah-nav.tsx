"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  BoxMinimalisticIcon,
  ClipboardCheckIcon,
  ClipboardListIcon,
  CloseCircleIcon,
  EyeIcon,
  HelpIcon,
  HomeIcon,
  LoginIcon,
  LogoutIcon,
  MagnifierIcon,
  MenuDotsVerticalIcon,
  PointOnMapIcon,
  SendSquareIcon,
  SettingsIcon,
  ShieldCheckIcon,
  TruckIcon,
  UserIcon,
} from "@solar-icons/react/linear";
import {
  BoxMinimalisticIcon as BoxMinimalisticDuoIcon,
  ClipboardCheckIcon as ClipboardCheckDuoIcon,
  ClipboardListIcon as ClipboardListDuoIcon,
  EyeIcon as EyeDuoIcon,
  HelpIcon as HelpDuoIcon,
  HomeIcon as HomeDuoIcon,
  LoginIcon as LoginDuoIcon,
  LogoutIcon as LogoutDuoIcon,
  MagnifierIcon as MagnifierDuoIcon,
  PointOnMapIcon as PointOnMapDuoIcon,
  SendSquareIcon as SendSquareDuoIcon,
  SettingsIcon as SettingsDuoIcon,
  ShieldCheckIcon as ShieldCheckDuoIcon,
  TruckIcon as TruckDuoIcon,
  UserIcon as UserDuoIcon,
} from "@solar-icons/react/bold-duotone";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@omnirelief/ui/components/sidebar";
import {
  grupSidebar,
  LABEL_SINGKAT,
  NAVIGASI_LAINNYA,
  NAVIGASI_TAB,
  sembunyikanTabBar,
  tabAktif,
  zonaDasbor,
  type NavItem,
  type NavPeran,
} from "@/lib/navigasi";
import { cn } from "@omnirelief/ui/lib/utils";
type Ikon = typeof HomeIcon;

const IKON_LIN: Record<NavItem["ikon"], Ikon> = {
  beranda: HomeIcon,
  cek: MagnifierIcon,
  transparansi: EyeIcon,
  masuk: LoginIcon,
  verifikasi: ClipboardCheckIcon,
  kirim: SendSquareIcon,
  catat: BoxMinimalisticIcon,
  lapor: ClipboardListIcon,
  bantuan: HelpIcon,
  tugas: TruckIcon,
  checkin: PointOnMapIcon,
  admin: ShieldCheckIcon,
  pengaturan: SettingsIcon,
  profil: UserIcon,
  keluar: LogoutIcon,
};

const IKON_DUO: Record<NavItem["ikon"], Ikon> = {
  beranda: HomeDuoIcon,
  cek: MagnifierDuoIcon,
  transparansi: EyeDuoIcon,
  masuk: LoginDuoIcon,
  verifikasi: ClipboardCheckDuoIcon,
  kirim: SendSquareDuoIcon,
  catat: BoxMinimalisticDuoIcon,
  lapor: ClipboardListDuoIcon,
  bantuan: HelpDuoIcon,
  tugas: TruckDuoIcon,
  checkin: PointOnMapDuoIcon,
  admin: ShieldCheckDuoIcon,
  pengaturan: SettingsDuoIcon,
  profil: UserDuoIcon,
  keluar: LogoutDuoIcon,
};

function Lencana({ jumlah }: { jumlah: number }) {
  if (jumlah <= 0) return null;
  return (
    <span
      aria-label={`${jumlah} menunggu`}
      className="flex min-h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-xs font-bold text-destructive-foreground"
    >
      {jumlah > 99 ? "99+" : jumlah}
    </span>
  );
}

function ItemTab({
  item,
  aktif,
  menunggu,
  pantau,
  gelap,
}: {
  item: NavItem;
  aktif: boolean;
  menunggu: number;
  pantau: number;
  gelap?: boolean;
}) {
  const Ikon = aktif ? IKON_DUO[item.ikon] : IKON_LIN[item.ikon];
  return (
    <a
      href={item.href}
      aria-current={aktif ? "page" : undefined}
      aria-label={
        item.lencana === "antrean" && menunggu > 0
          ? `${item.label}, ${menunggu} menunggu${pantau > 0 ? `, ${pantau} perlu dicek` : ""}`
          : item.label
      }
      className={cn(
        gelap
          ? "flex min-h-12 w-full flex-col items-center justify-center gap-0.5 rounded-full px-1 text-center text-xs"
          : "flex min-h-16 flex-col items-center justify-center gap-0.5 px-1 text-xs",
        aktif
          ? gelap
            ? "border border-white/25 bg-white/15 font-bold text-white"
            : "font-bold text-primary"
          : gelap
            ? "font-medium text-white/70"
            : "font-medium text-muted-foreground"
      )}
    >
      <span className="relative">
        <Ikon aria-hidden="true" className="size-6" />
        {item.lencana === "antrean" && (
          <span className="absolute -top-2 -end-3">
            <Lencana jumlah={menunggu} />
          </span>
        )}
      </span>
      {item.label}
    </a>
  );
}

function ItemMenu({
  item,
  aktif,
  menunggu,
  pantau,
}: {
  item: NavItem;
  aktif: boolean;
  menunggu: number;
  pantau: number;
}) {
  const Ikon = aktif ? IKON_DUO[item.ikon] : IKON_LIN[item.ikon];
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={aktif}
        tooltip={item.label}
        render={
          <a
            href={item.href}
            aria-current={aktif ? "page" : undefined}
            aria-label={
              item.lencana === "antrean" && menunggu > 0
                ? `${item.label}, ${menunggu} menunggu${pantau > 0 ? `, ${pantau} perlu dicek` : ""}`
                : item.label
            }
          />
        }
      >
        <Ikon aria-hidden="true" />
        <span>{item.label}</span>
      </SidebarMenuButton>
      {item.lencana === "antrean" && menunggu > 0 && (
        <span className="absolute top-1 end-1">
          <Lencana jumlah={menunggu} />
        </span>
      )}
    </SidebarMenuItem>
  );
}

export default function BilahNav({ peran, nama }: { peran: NavPeran; nama: string | null }) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const [lainnyaBuka, setLainnyaBuka] = useState(false);
  const [antrean, setAntrean] = useState(0);
  const [pantau, setPantau] = useState(0);

  useEffect(() => {
    function segarkanHash() {
      setHash(window.location.hash);
    }
    segarkanHash();
    window.addEventListener("hashchange", segarkanHash);
    return () => window.removeEventListener("hashchange", segarkanHash);
  }, [pathname]);

  useEffect(() => {
    if (peran !== "BPBD") {
      setAntrean(0);
      setPantau(0);
      return;
    }
    let batal = false;
    fetch("/api/bpbd/antrean")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { ok: boolean; antrean?: unknown[] } | null) => {
        if (!batal && data?.ok && Array.isArray(data.antrean))
          setAntrean(data.antrean.length);
      })
      .catch(() => {});
    fetch("/api/bpbd/pantauan")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { ok: boolean; perlu_dicek?: unknown[] } | null) => {
        if (!batal && data?.ok && Array.isArray(data.perlu_dicek))
          setPantau(data.perlu_dicek.length);
      })
      .catch(() => {});
    return () => {
      batal = true;
    };
  }, [peran, pathname]);

  useEffect(() => {
    if (!lainnyaBuka) return;
    function saatTombol(e: KeyboardEvent) {
      if (e.key === "Escape") setLainnyaBuka(false);
    }
    window.addEventListener("keydown", saatTombol);
    return () => window.removeEventListener("keydown", saatTombol);
  }, [lainnyaBuka]);

  const path = pathname ?? "/";
  const gelap = path === "/";
  const sembunyi = sembunyikanTabBar(path);
  const diDasbor = zonaDasbor(path);
  const tab = NAVIGASI_TAB[peran];
  const lainnya = NAVIGASI_LAINNYA[peran];
  const grup = grupSidebar(peran);
  const cocokAda = grup.some((g) => g.item.some((i) => tabAktif(path, hash, i.href)));
  const cocokTabAda = tab.some((i) => tabAktif(path, hash, i.href));
  const aktifItem = (href: string) =>
    tabAktif(path, hash, href) || (!cocokAda && diDasbor && href === "/beranda");
  const aktifTab = (href: string) =>
    tabAktif(path, hash, href) || (!cocokTabAda && diDasbor && href === "/beranda");

  const inisial = (nama ?? "?").trim().charAt(0).toUpperCase() || "?";

  return (
    <>
      {gelap && (
        <header className="fixed inset-x-0 top-0 z-40 w-full bg-transparent">
          <div className="ml-[6vw] flex w-[94vw] items-center justify-between py-6 pr-5 pl-6 md:ml-[14vw] md:w-[86vw] md:pl-12 md:pr-10 lg:pl-16 lg:pr-14">
            <a href="/" className="flex items-center gap-2" aria-label="OmniRelief beranda">
              <span aria-hidden="true" className="flex size-8 items-center justify-center rounded-lg bg-white text-sm font-bold text-[#0B1F2E]">
                O
              </span>
              <span className="font-semibold tracking-tight text-white">OmniRelief</span>
            </a>
            <nav aria-label="Navigasi utama" className="flex items-center gap-8">
              <span className="hidden items-center gap-8 md:flex">
                <a href="/transparansi" className="font-mono text-[11px] tracking-[0.15em] text-white/80 uppercase hover:text-white">
                  Transparansi
                </a>
                <a href="/#janji" className="font-mono text-[11px] tracking-[0.15em] text-white/80 uppercase hover:text-white">
                  Empat Janji
                </a>
                <a href="/#cara-cek" className="font-mono text-[11px] tracking-[0.15em] text-white/80 uppercase hover:text-white">
                  Cara Cek
                </a>
              </span>
              <a
                href="/masuk"
                className="inline-flex min-h-10 items-center justify-center border border-white/40 bg-white/10 px-3.5 font-mono text-xs tracking-wider text-white uppercase backdrop-blur-sm hover:bg-white/20"
              >
                Masuk
              </a>
            </nav>
          </div>
        </header>
      )}
      {diDasbor && (
        <Sidebar variant="inset" collapsible="icon" aria-label="Navigasi utama">
          <SidebarHeader>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  size="lg"
                  tooltip="Beranda"
                  render={
                    <a href="/beranda" aria-label="OmniRelief work zone" />
                  }
                >
                  <span
                    aria-hidden="true"
                    className="flex size-8 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-bold text-primary-foreground"
                  >
                    O
                  </span>
                  <span className="truncate text-sm font-bold">OmniRelief</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarHeader>
          <SidebarContent>
            {grup.map((g) => (
              <SidebarGroup key={g.judul}>
                <SidebarGroupLabel>{g.judul}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {g.item.map((item) => (
                      <ItemMenu
                        key={item.href}
                        item={item}
                        menunggu={antrean + pantau}
                        pantau={pantau}
                        aktif={aktifItem(item.href)}
                      />
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
          {nama && (
            <SidebarFooter>
              <SidebarMenu>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    size="lg"
                    tooltip={`Profil ${nama}`}
                    render={
                      <a
                        href="/profil"
                        aria-label={`Profil ${nama}, ${LABEL_SINGKAT[peran]}`}
                      />
                    }
                  >
                    <span
                      aria-hidden="true"
                      className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-bold text-secondary-foreground"
                    >
                      {inisial}
                    </span>
                    <span className="min-w-0 flex-1 leading-tight">
                      <span className="block truncate font-semibold">{nama}</span>
                      <span className="block truncate text-xs font-normal text-muted-foreground">
                        {LABEL_SINGKAT[peran]}
                      </span>
                    </span>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          )}
          <SidebarRail />
        </Sidebar>
      )}


      {!sembunyi && (
        <nav
          aria-label="Navigasi utama seluler"
          className={cn(
            "md:hidden",
            gelap
              ? "fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-full border border-white/15 bg-[#04131E]/75 p-1.5 shadow-2xl backdrop-blur-xl"
              : "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background backdrop-blur-md"
          )}
        >
          <div className={gelap ? "grid w-full grid-cols-4 items-center gap-1" : "grid grid-cols-4 pb-2"}>
            {tab.map((item) => (
              <ItemTab
                key={item.href}
                item={item}
                menunggu={antrean + pantau}
                pantau={pantau}
                aktif={aktifTab(item.href)}
                gelap={gelap}
              />
            ))}
            {gelap && (
              <button
                type="button"
                onClick={() => setLainnyaBuka(true)}
                aria-expanded={lainnyaBuka}
                aria-label="Menu lainnya"
                className="flex min-h-16 flex-col items-center justify-center gap-0.5 px-1 text-xs font-medium text-white/70"
              >
                <MenuDotsVerticalIcon aria-hidden="true" className="size-6" />
                Lainnya
              </button>
            )}
            {!gelap && (
            <button
              type="button"
              onClick={() => setLainnyaBuka(true)}
              aria-expanded={lainnyaBuka}
              aria-label="Menu lainnya"
              className={cn(
                "flex min-h-16 flex-col items-center justify-center gap-0.5 px-1 text-xs font-medium",
                gelap ? "text-white/70" : "text-muted-foreground"
              )}
            >
              <MenuDotsVerticalIcon aria-hidden="true" className="size-6" />
              Lainnya
            </button>
            )}
          </div>
        </nav>
      )}

      {lainnyaBuka && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Menu lainnya"
          className="fixed inset-0 z-50 md:hidden"
        >
          <button
            type="button"
            aria-label="Tutup menu lainnya"
            onClick={() => setLainnyaBuka(false)}
            className="absolute inset-0 cursor-default bg-foreground/40"
          />
          <div className={cn("absolute inset-x-0 bottom-0 flex flex-col gap-1 rounded-t-2xl border-t p-4 pb-6", gelap ? "border-white/15 bg-[#030D14]/80 text-white backdrop-blur-md" : "border-border bg-background")}>
            {lainnya.map((item) => {
              const Ikon = IKON_LIN[item.ikon];
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setLainnyaBuka(false)}
                  className="flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium"
                >
                  <Ikon aria-hidden="true" className={cn("size-5", gelap ? "text-white/70" : "text-muted-foreground")} />
                  {item.label}
                </a>
              );
            })}
            <button
              type="button"
              onClick={() => setLainnyaBuka(false)}
              autoFocus
              className="mt-2 flex min-h-12 items-center justify-center gap-2 rounded-xl bg-secondary text-sm font-semibold text-secondary-foreground"
            >
              <CloseCircleIcon aria-hidden="true" className="size-5" />
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
