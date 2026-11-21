import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "../index.css";
import Header from "@/components/header";
import BilahNav from "@/components/bilah-nav";
import PendaftaranSw from "@/components/pendaftaran-sw";
import Providers from "@/components/providers";
import { getProfil } from "@/lib/auth";
import { LABEL_PERAN, peranDariString } from "@/lib/navigasi";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "OmniRelief",
  description: "Supply chain pangan darurat yang transparan dan anti-korupsi",
  manifest: "/manifest.webmanifest",
  themeColor: "#0F3B5F",
  appleWebApp: { capable: true, title: "OmniRelief", statusBarStyle: "black-translucent" },
  icons: {
    icon: [
      { url: "/ikon-192.png", sizes: "192x192", type: "image/png" },
      { url: "/ikon-512.png", sizes: "512x512", type: "image/png" },
    ],
  },
};

export const dynamic = "force-dynamic";

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const profil = await getProfil().catch(() => null);
  const peran = peranDariString(profil?.peran ?? null);

  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <script
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var a=JSON.parse(localStorage.getItem("omnirelief-aksesibilitas")||"{}");if(a.teks==="besar")document.documentElement.style.fontSize="112.5%";else if(a.teks==="sangat")document.documentElement.style.fontSize="125%";document.documentElement.classList.toggle("a11y-kontras",!!a.kontras);document.documentElement.classList.toggle("a11y-gerak",!!a.gerak)}catch(e){}})();`,
          }}
        />
        <Providers>
          <Header nama={profil?.nama ?? null} peranLabel={LABEL_PERAN[peran]} />
          <div className="mx-auto flex w-full max-w-5xl items-start">
            <BilahNav peran={peran} nama={profil?.nama ?? null} />
            <div className="min-w-0 flex-1 pb-28 md:pb-0">{children}</div>
          </div>
        </Providers>
        <PendaftaranSw />
      </body>
    </html>
  );
}
