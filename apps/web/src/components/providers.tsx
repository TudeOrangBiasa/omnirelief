"use client";

import { SolarProvider } from "@solar-icons/react";
import { Toaster } from "@omnirelief/ui/components/sonner";

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SolarProvider size={20} strokeWidth={2}>
      {children}
      <Toaster richColors />
    </SolarProvider>
  );
}
