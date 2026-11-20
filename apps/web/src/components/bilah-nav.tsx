"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import {
  ClipboardCheck,
  ClipboardList,
  Ellipsis,
  Eye,
  Home,
  LifeBuoy,
  LogIn,
  MapPin,
  PackagePlus,
  Search,
  Send,
  Settings,
  ShieldCheck,
  Truck,
  User,
  X,
  type LucideIcon,
} from "lucide-react";
import {
  NAVIGASI_LAINNYA,
  NAVIGASI_SIDEBAR,
  NAVIGASI_TAB,
  sembunyikanTabBar,
  tabAktif,
  type NavItem,
  type NavPeran,
} from "@/lib/navigasi";
import { cn } from "@omnirelief/ui/lib/utils";

const IKON: Record<NavItem["ikon"], LucideIcon> = {
  beranda: Home,
  cek: Search,
  transparansi: Eye,
  masuk: LogIn,
  verifikasi: ClipboardCheck,
  kirim: Send,
  catat: PackagePlus,
  lapor: ClipboardList,
  bantuan: LifeBuoy,
  tugas: Truck,
  checkin: MapPin,
  admin: ShieldCheck,
  pengaturan: Settings,
  profil: User,
  keluar: LogIn,
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
  const Ikon = IKON[item.ikon];
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
        <Ikon aria-hidden="true" className="size-6" strokeWidth={aktif ? 2.5 : 2} />
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

export default function BilahNav({ peran }: { peran: NavPeran }) {
  const pathname = usePathname();
  const [hash, setHash] = useState("");
  const [lainnyaBuka, setLainnyaBuka] = useState(false);
  const [antrean, setAntrean] = useState(0);

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

  const sembunyi = sembunyikanTabBar(pathname ?? "/");
  const tab = NAVIGASI_TAB[peran];
  const lainnya = NAVIGASI_LAINNYA[peran];

  return (
    <>
      <aside
        aria-label="Navigasi utama"
        className="sticky top-16 hidden w-60 shrink-0 flex-col gap-1 overflow-y-auto border-e border-border p-4 md:flex"
      >
        {NAVIGASI_SIDEBAR[peran].map((item) => {
          const Ikon = IKON[item.ikon];
          const aktif = tabAktif(pathname ?? "/", hash, item.href);
          return (
            <a
              key={item.href}
              href={item.href}
              aria-current={aktif ? "page" : undefined}
              className={cn(
                "flex min-h-12 items-center gap-3 rounded-xl px-4 text-sm",
                aktif
                  ? "bg-primary-bg font-bold text-primary"
                  : "font-medium text-muted-foreground"
              )}
            >
              <Ikon aria-hidden="true" className="size-5" />
              {item.label}
              {item.lencana === "antrean" && <Lencana jumlah={antrean} />}
            </a>
          );
        })}
      </aside>

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
              <Ellipsis aria-hidden="true" className="size-6" />
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
          <div className="absolute inset-x-0 bottom-0 flex flex-col gap-1 rounded-t-3xl border-t border-border bg-background p-4 pb-6">
            {lainnya.map((item) => {
              const Ikon = IKON[item.ikon];
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
              <X aria-hidden="true" className="size-5" />
              Tutup
            </button>
          </div>
        </div>
      )}
    </>
  );
}
