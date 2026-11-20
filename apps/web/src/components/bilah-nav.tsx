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
  MenuDotsIcon,
  PointOnMapIcon,
  SendSquareIcon,
  SettingsIcon,
  ShieldCheckIcon,
  SidebarCloseIcon,
  SidebarOpenIcon,
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
  antrean,
}: {
  item: NavItem;
  aktif: boolean;
  antrean: number;
}) {
  const Ikon = aktif ? IKON_DUO[item.ikon] : IKON_LIN[item.ikon];
  return (
    <a
      href={item.href}
      aria-current={aktif ? "page" : undefined}
      aria-label={
        item.lencana === "antrean" && antrean > 0
          ? `${item.label}, ${antrean} menunggu`
          : item.label
      }
      className={cn(
        "flex min-h-16 flex-col items-center justify-center gap-0.5 px-1 text-xs",
        aktif
          ? "font-bold text-primary"
          : "font-medium text-muted-foreground"
      )}
    >
      <span className="relative">
        <Ikon aria-hidden="true" className="size-6" />
        {item.lencana === "antrean" && (
          <span className="absolute -top-2 -end-3">
            <Lencana jumlah={antrean} />
          </span>
        )}
      </span>
      {item.label}
    </a>
  );
}

function ItemSidebar({
  item,
  aktif,
  antrean,
  ciut,
}: {
  item: NavItem;
  aktif: boolean;
  antrean: number;
  ciut: boolean;
}) {
  const Ikon = aktif ? IKON_DUO[item.ikon] : IKON_LIN[item.ikon];
  return (
    <a
      href={item.href}
      aria-current={aktif ? "page" : undefined}
      title={ciut ? item.label : undefined}
      aria-label={
        item.lencana === "antrean" && antrean > 0
          ? `${item.label}, ${antrean} menunggu`
          : item.label
      }
      className={cn(
        "flex min-h-12 items-center gap-3 rounded-xl text-sm",
        ciut ? "w-12 justify-center" : "px-3",
        aktif ? "bg-primary-bg font-bold text-primary" : "font-medium text-muted-foreground"
      )}
    >
      <span className="relative shrink-0">
        <Ikon aria-hidden="true" className="size-5" />
        {ciut && item.lencana === "antrean" && (
          <span className="absolute -top-2 -end-2">
            <Lencana jumlah={antrean} />
          </span>
        )}
      </span>
      {!ciut && <span className="flex-1">{item.label}</span>}
      {!ciut && item.lencana === "antrean" && <Lencana jumlah={antrean} />}
    </a>
  );
}

export default function BilahNav({ peran }: { peran: NavPeran }) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const [lainnyaBuka, setLainnyaBuka] = useState(false);
  const [antrean, setAntrean] = useState(0);
  const [ciut, setCiut] = useState(false);

  useEffect(() => {
    function segarkanHash() {
      setHash(window.location.hash);
    }
    segarkanHash();
    window.addEventListener("hashchange", segarkanHash);
    return () => window.removeEventListener("hashchange", segarkanHash);
  }, [pathname]);

  useEffect(() => {
    if (peran !== "BPBD") return;
    let batal = false;
    fetch("/api/bpbd/antrean")
      .then((res) => (res.ok ? res.json() : null))
      .then((data: { ok: boolean; antrean?: unknown[] } | null) => {
        if (!batal && data?.ok && Array.isArray(data.antrean))
          setAntrean(data.antrean.length);
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


  useEffect(() => {
    try {
      setCiut(window.localStorage.getItem("omnirelief-bilah") === "ciut");
    } catch {
      /* abaikan: privat mode */
    }
  }, []);

  function alihLebar() {
    setCiut((v) => {
      try {
        window.localStorage.setItem("omnirelief-bilah", v ? "lebar" : "ciut");
      } catch {
        /* abaikan */
      }
      return !v;
    });
  }
  const path = pathname ?? "/";
  const sembunyi = sembunyikanTabBar(path);
  const diDasbor = zonaDasbor(path);
  const tab = NAVIGASI_TAB[peran];
  const lainnya = NAVIGASI_LAINNYA[peran];
  const { utama, akun } = grupSidebar(peran);
  const IkonCiut = ciut ? SidebarOpenIcon : SidebarCloseIcon;

  return (
    <>
      {diDasbor && (
        <aside
          aria-label="Navigasi utama"
          className={cn(
            "sticky top-16 hidden shrink-0 flex-col gap-1 self-start overflow-y-auto border-e border-border py-4 md:flex",
            ciut ? "w-20 items-center px-2" : "w-60 px-4"
          )}
        >
          <div className={cn("flex min-h-12 items-center gap-2", ciut ? "flex-col" : "px-2")}>
            <a
              href="/beranda"
              aria-label="OmniRelief work zone"
              className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-primary text-base font-bold text-primary-foreground"
            >
              O
            </a>
            {!ciut && (
              <p className="min-w-0 flex-1 leading-tight">
                <span className="block truncate text-sm font-bold">OmniRelief</span>
                <span className="block truncate text-xs font-normal text-muted-foreground">
                  {LABEL_PERAN[peran]}
                </span>
              </p>
            )}
            <button
              type="button"
              onClick={alihLebar}
              aria-expanded={!ciut}
              aria-label={ciut ? "Bentangkan navigasi" : "Ciutkan navigasi"}
              title={ciut ? "Bentangkan" : "Ciutkan"}
              className="flex min-h-12 min-w-12 items-center justify-center rounded-xl text-muted-foreground"
            >
              <IkonCiut aria-hidden="true" className="size-5" />
            </button>
          </div>
          {!ciut && (
            <p className="t-micro px-3 pt-3 text-muted-foreground">Utama</p>
          )}
          {utama.map((item) => (
            <ItemSidebar
              key={item.href}
              item={item}
              ciut={ciut}
              antrean={antrean}
              aktif={tabAktif(path, hash, item.href)}
            />
          ))}
          {!ciut && (
            <p className="t-micro border-t border-border px-3 pt-3 text-muted-foreground">Akun</p>
          )}
          {ciut && <span aria-hidden="true" className="my-1 w-10 border-t border-border" />}
          {akun.map((item) => (
            <ItemSidebar
              key={item.href}
              item={item}
              ciut={ciut}
              antrean={antrean}
              aktif={tabAktif(path, hash, item.href)}
            />
          ))}
        </aside>
      )}


      {!sembunyi && (
        <nav
          aria-label="Navigasi utama seluler"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-background md:hidden"
        >
          <div className="grid grid-cols-4 pb-2">
            {tab.map((item) => (
              <ItemTab
                key={item.href}
                item={item}
                antrean={antrean}
                aktif={tabAktif(pathname ?? "/", hash, item.href)}
              />
            ))}
            <button
              type="button"
              onClick={() => setLainnyaBuka(true)}
              aria-expanded={lainnyaBuka}
              aria-label="Menu lainnya"
              className="flex min-h-16 flex-col items-center justify-center gap-0.5 px-1 text-xs font-medium text-muted-foreground"
            >
              <MenuDotsIcon aria-hidden="true" className="size-6" />
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
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 rounded-t-2xl border-t border-border bg-background p-4 pb-6">
            {lainnya.map((item) => {
              const Ikon = IKON_LIN[item.ikon];
              return (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setLainnyaBuka(false)}
                  className="flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm font-medium"
                >
                  <Ikon aria-hidden="true" className="size-5 text-muted-foreground" />
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
