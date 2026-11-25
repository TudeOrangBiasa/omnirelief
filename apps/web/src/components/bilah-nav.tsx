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
import { hitungAntrean } from "@/components/banner-offline";
import { mintaBukaPintasan } from "@/components/pintasan-keyboard";
import Logo from "@/components/logo";
import {
  grupSidebar,
  LABEL_PERAN,
  NAVIGASI_LAINNYA,
  NAVIGASI_TAB,
  sembunyikanTabBar,
  tabAktif,
  zonaDasbor,
  type NavItem,
  type NavPeran,
} from "@/lib/navigasi";
import { cn } from "@omnirelief/ui/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@omnirelief/ui/components/dropdown-menu";
import { createClient } from "@/lib/supabase/client";
import { bacaIdentitas, type Identitas } from "@/lib/identitas";

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
  dasbor: ChartDuoIcon,
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
  indeks,
}: {
  item: NavItem;
  aktif: boolean;
  menunggu: number;
  pantau: number;
  indeks: string;
}) {
  const Ikon = aktif ? IKON_DUO[item.ikon] : IKON_LIN[item.ikon];
  return (
    <SidebarMenuItem>
      <SidebarMenuButton
        isActive={aktif}
        className={cn(
          "rounded-none",
        aktif && "border-l-4 border-[#0f79b8] bg-[#0B1F2E] font-medium text-white hover:bg-[#0B1F2E] hover:text-white",
        )}
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
        <span className="flex-1">{item.label}</span>
        <span aria-hidden="true" className="font-mono text-[10px] tabular-nums opacity-60 group-data-[collapsible=icon]:hidden">
          {indeks}
        </span>
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
  const [daring, setDaring] = useState(true);
  const [antreLokal, setAntreLokal] = useState(0);

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
    function segarkanLokal() {
      setDaring(window.navigator.onLine);
      setAntreLokal(hitungAntrean());
    }
    segarkanLokal();
    window.addEventListener("online", segarkanLokal);
    window.addEventListener("offline", segarkanLokal);
    return () => {
      window.removeEventListener("online", segarkanLokal);
      window.removeEventListener("offline", segarkanLokal);
    };
  }, [pathname]);

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
  const publik =
    path === "/" ||
    path === "/transparansi" ||
    path === "/masuk" ||
    path.startsWith("/m/") ||
    path.startsWith("/s/");
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

  const [identitas, setIdentitas] = useState<Identitas | null>(null);

  useEffect(() => {
    function segarkanIdentitas(): void {
      setIdentitas(bacaIdentitas());
    }
    segarkanIdentitas();
    window.addEventListener("storage", segarkanIdentitas);
    return () => window.removeEventListener("storage", segarkanIdentitas);
  }, []);

  const namaTampil = identitas && identitas.nama !== "" ? identitas.nama : nama;
  const inisialTampil = (namaTampil ?? "?").trim().charAt(0).toUpperCase() || "?";
  const warnaAvatar = identitas?.warna ?? "#0B1F2E";
  const nomorMenu = new Map(grup.flatMap((g) => g.item).map((item, i) => [item.href, String(i + 1).padStart(2, "0")]));
  const statusSinkron = !daring
    ? `LURING · ${antreLokal} ANTRE`
    : antreLokal > 0
      ? `${antreLokal} MENUNGGU SINKRON`
      : "TERSINKRON";
  async function keluar(): Promise<void> {
    try {
      const sb = createClient();
      await sb.auth.signOut();
    } catch {
      /* abaikan, tetap arahkan ke masuk */
    } finally {
      window.location.href = "/masuk";
    }
  }

  return (
    <>
      {gelap && (
        <header className="fixed inset-x-0 top-0 z-40 w-full bg-transparent print:hidden">
          <div className="ml-[3vw] grid w-[97vw] grid-cols-12 items-center py-6 pr-5 md:ml-[7vw] md:w-[93vw] md:pr-10 lg:pr-14">
            <a href="/" className="col-span-6 flex items-center gap-2" aria-label="OmniRelief beranda">
              <Logo varian="putih" tinggi={24} alt="" />
            </a>
            <span className="col-span-6 flex items-center justify-end md:hidden">
              <a
                href="/masuk"
                className="relative inline-flex min-h-10 items-center justify-center border border-white/40 bg-white/10 px-3.5 font-mono text-[11px] tracking-[0.15em] text-white uppercase backdrop-blur-sm hover:bg-white/20"
              >
                <span aria-hidden="true" className="absolute top-0 left-0 h-1.5 w-1.5 border-t border-l border-white" />
                <span aria-hidden="true" className="absolute top-0 right-0 h-1.5 w-1.5 border-t border-r border-white" />
                <span aria-hidden="true" className="absolute bottom-0 left-0 h-1.5 w-1.5 border-b border-l border-white" />
                <span aria-hidden="true" className="absolute right-0 bottom-0 h-1.5 w-1.5 border-r border-b border-white" />
                Masuk
              </a>
            </span>
            <nav aria-label="Navigasi utama" className="col-span-6 hidden items-center justify-between gap-8 md:flex">
              <span className="flex items-center gap-8">
                <a href="/transparansi" className="font-mono text-[11px] tracking-[0.15em] text-white/80 uppercase hover:text-white">
                  Transparansi
                </a>
                <a href="/#cara-kerja" className="font-mono text-[11px] tracking-[0.15em] text-white/80 uppercase hover:text-white">
                  Cara Kerja
                </a>
                <a href="/#arsitektur" className="font-mono text-[11px] tracking-[0.15em] text-white/80 uppercase hover:text-white">
                  Keamanan
                </a>
                <a href="/#faq" className="font-mono text-[11px] tracking-[0.15em] text-white/80 uppercase hover:text-white">
                  FAQ
                </a>
              </span>
              <a
                href="/masuk"
                className="relative inline-flex min-h-10 items-center justify-center border border-white/40 bg-white/10 px-3.5 font-mono text-[11px] tracking-[0.15em] text-white uppercase backdrop-blur-sm hover:bg-white/20"
              >
                <span aria-hidden="true" className="absolute top-0 left-0 h-1.5 w-1.5 border-t border-l border-white" />
                <span aria-hidden="true" className="absolute top-0 right-0 h-1.5 w-1.5 border-t border-r border-white" />
                <span aria-hidden="true" className="absolute bottom-0 left-0 h-1.5 w-1.5 border-b border-l border-white" />
                <span aria-hidden="true" className="absolute right-0 bottom-0 h-1.5 w-1.5 border-r border-b border-white" />
                Masuk Portal
              </a>
            </nav>
          </div>
        </header>
      )}
      {diDasbor && (
        <Sidebar
          variant="inset"
          collapsible="icon"
          aria-label="Navigasi utama"
          className="border-r border-[#0B1F2E]/20 bg-[#DCE8EE] [--sidebar:#DCE8EE] print:hidden"
        >
          <SidebarHeader className="flex h-14 justify-center border-b border-[#0B1F2E]/15 px-4">
            <a
              href="/beranda"
              aria-label="OmniRelief work zone"
              className="flex min-w-0 items-center gap-3"
            >
              <Logo simbol tinggi={28} alt="" />
              <span className="truncate text-base font-bold tracking-tight text-[#0B1F2E] group-data-[collapsible=icon]:hidden">
                OmniRelief
              </span>
            </a>
          </SidebarHeader>
          <SidebarContent>
            {grup.map((g) => (
              <SidebarGroup key={g.judul}>
                <SidebarGroupLabel className="font-mono text-[10px] tracking-[0.15em] uppercase">{g.judul}</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {g.item.map((item) => (
                      <ItemMenu
                        key={item.href}
                        item={item}
                        menunggu={antrean + pantau}
                        pantau={pantau}
                        aktif={aktifItem(item.href)}
                        indeks={nomorMenu.get(item.href) ?? "00"}
                      />
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </SidebarGroup>
            ))}
          </SidebarContent>
          <SidebarFooter>
            <div className="border border-[#0B1F2E]/15 p-3 font-mono text-[10px]">
              <p className="flex items-center gap-1.5">
                <span aria-hidden="true" className="inline-block size-1.5 rounded-full bg-emerald-600" />
                LEDGER SHA-256 AKTIF
              </p>
              <p className="mt-1">
                SINKRON LOKAL · {statusSinkron}{" "}
                <button
                  type="button"
                  onClick={() => mintaBukaPintasan()}
                  aria-label="Buka pintasan keyboard"
                  className="underline underline-offset-2 hover:no-underline"
                >
                  [?]
                </button>
              </p>
            </div>
            {nama && (
              <div className="flex h-11 items-center gap-1 border-t border-[#0B1F2E]/15 px-3">
                <a
                  href="/profil"
                  aria-label={`Profil ${namaTampil}, ${LABEL_PERAN[peran]}`}
                  className="flex min-w-0 flex-1 items-center gap-2 rounded-none"
                >
                  <span
                    aria-hidden="true"
                    style={{ backgroundColor: warnaAvatar }}
                    className="flex size-7 shrink-0 items-center justify-center rounded-none text-xs font-bold text-white"
                  >
                    {inisialTampil}
                  </span>
                  <span className="min-w-0 flex-1 leading-tight group-data-[collapsible=icon]:hidden">
                    <span className="block truncate text-xs font-medium">{namaTampil}</span>
                    <span className="block truncate font-mono text-[10px] uppercase tracking-wider text-[#0B1F2E]/70">
                      {LABEL_PERAN[peran]}
                    </span>
                  </span>
                </a>
                <DropdownMenu>
                  <DropdownMenuTrigger
                    render={
                      <button
                        type="button"
                        aria-label="Menu profil lainnya"
                        className="relative flex h-7 w-7 shrink-0 items-center justify-center rounded-none text-[#0B1F2E]/70 after:absolute after:-inset-[10px] after:content-[''] group-data-[collapsible=icon]:hidden hover:bg-[#0B1F2E]/5"
                      >
                        <MenuDotsVerticalIcon aria-hidden="true" className="size-4" />
                      </button>
                    }
                  />
                  <DropdownMenuContent align="end" side="top" className="min-w-48">
                    <DropdownMenuItem render={<a href="/profil" />}>
                      Profil saya
                    </DropdownMenuItem>
                    <DropdownMenuItem render={<a href="/beranda" />}>
                      Kembali ke beranda
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem variant="destructive" onClick={() => void keluar()}>
                      Keluar akun
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            )}
          </SidebarFooter>
          <SidebarRail />
        </Sidebar>
      )}


      {!sembunyi && (
        <nav
          aria-label="Navigasi utama seluler"
          className={cn(
            "md:hidden print:hidden",
            publik
              ? "fixed bottom-4 left-1/2 z-50 w-[calc(100%-2rem)] max-w-sm -translate-x-1/2 rounded-full border border-white/15 bg-[#04131E]/75 p-1.5 shadow-2xl backdrop-blur-xl"
              : "fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background backdrop-blur-md"
          )}
        >
          <div className={publik ? "grid w-full grid-cols-4 items-center gap-1" : "grid grid-cols-4 pb-2"}>
            {tab.map((item) => (
              <ItemTab
                key={item.href}
                item={item}
                menunggu={antrean + pantau}
                pantau={pantau}
                aktif={aktifTab(item.href)}
                gelap={publik}
              />
            ))}
            <button
              type="button"
              onClick={() => setLainnyaBuka(true)}
              aria-expanded={lainnyaBuka}
              aria-label="Menu lainnya"
              className={
                publik
                  ? "flex min-h-16 flex-col items-center justify-center gap-0.5 px-1 text-xs font-medium text-white/70"
                  : "flex min-h-16 flex-col items-center justify-center gap-0.5 px-1 text-xs font-medium text-muted-foreground"
              }
            >
              <MenuDotsVerticalIcon aria-hidden="true" className="size-6" />
              Lainnya
            </button>
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
          <div className={cn("absolute inset-x-0 bottom-0 flex flex-col gap-1 rounded-none border-t p-4 pb-6", publik ? "border-white/15 bg-[#030D14]/80 text-white backdrop-blur-md" : "border-border bg-background")}>
            {lainnya.map((item) => {
              const Ikon = IKON_LIN[item.ikon];
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setLainnyaBuka(false)}
                  className="flex min-h-12 items-center gap-3 rounded-none px-4 text-sm font-medium"
                >
                  <Ikon aria-hidden="true" className={cn("size-5", publik ? "text-white/70" : "text-muted-foreground")} />
                  {item.label}
                </a>
              );
            })}
            <button
              type="button"
              onClick={() => setLainnyaBuka(false)}
              autoFocus
              className="mt-2 flex min-h-12 items-center justify-center gap-2 rounded-none bg-secondary text-sm font-semibold text-secondary-foreground"
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
