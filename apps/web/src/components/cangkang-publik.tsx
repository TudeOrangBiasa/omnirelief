import type { ReactNode } from "react";
import { ShaderBackground } from "@/components/motion/shader-background";

/**
 * Kulit anon halaman publik: shader gelap ikut landing + wadah tengah.
 * Dipakai /transparansi dan /dasbor (sempit + bilah atas) serta /m dan /s
 * (lebar, tanpa bilah atas). Varian login tidak lewat sini.
 */
export function CangkangPublik({
  children,
  bilahAtas,
  lebar,
}: {
  children: ReactNode;
  bilahAtas?: ReactNode;
  lebar?: "sempit" | "lebar";
}) {
  const sempit = lebar !== "lebar";
  return (
    <div className="relative ml-[calc(50%-50vw)] min-h-screen w-screen overflow-x-hidden">
      <ShaderBackground
        variant="mesh-gradient"
        colors={["#030D14", "#082032", "#0F3B5F", "#0f79b8"]}
        aria-hidden
        className={
          sempit
            ? "pointer-events-none fixed inset-0 h-screen w-screen bg-[#030D14]"
            : "pointer-events-none fixed inset-0 h-screen w-screen bg-[#030D14] print:hidden"
        }
      />
      <main
        className={
          sempit
            ? "relative z-10 mx-auto flex min-h-screen w-full max-w-4xl flex-col gap-8 px-5 pt-12 pb-28 md:px-10 md:py-20"
            : "relative mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 p-6 pb-28 print:min-h-0 print:bg-white md:pb-6"
        }
      >
        {bilahAtas}
        <div
          className={
            sempit
              ? "relative flex min-h-0 flex-col gap-8"
              : "relative flex min-h-0 flex-col gap-6"
          }
        >
          {children}
        </div>
      </main>
    </div>
  );
}
