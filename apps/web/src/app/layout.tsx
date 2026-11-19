import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";

import "../index.css";
import Header from "@/components/header";
import PendaftaranSw from "@/components/pendaftaran-sw";
import Providers from "@/components/providers";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        <Providers>
          <div className="grid grid-rows-[auto_1fr] h-svh">
            <Header />
            {children}
          </div>
        </Providers>
        <PendaftaranSw />
      </body>
    </html>
  );
}
