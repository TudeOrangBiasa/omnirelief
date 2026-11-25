import Link from "next/link";

export const metadata = { title: "Tidak ketemu | OmniRelief" };

export default function TidakKetemu() {
  return (
    <main className="mx-auto flex min-h-screen w-full max-w-[1400px] flex-col justify-center px-6 py-8 lg:px-10">
      <p className="t-label text-[#0B1F2E]/70">
        Galat 404
      </p>
      <h1 className="mt-1 text-4xl font-bold text-[#0B1F2E]">Halaman tidak ketemu</h1>
      <p className="mt-2 max-w-xl text-sm text-muted-foreground">
        Alamat yang dibuka tidak ada atau sudah dipindah. Kembali ke beranda untuk
        lanjut bertugas, atau buka transparansi untuk lacak aliran publik.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <Link
          href="/beranda"
          className="inline-flex min-h-12 items-center justify-center rounded-none bg-[#0B1F2E] px-6 text-sm font-semibold text-white"
        >
          Kembali ke Beranda
        </Link>
        <Link
          href="/transparansi"
          className="inline-flex min-h-12 items-center justify-center rounded-none border border-[#0B1F2E]/30 bg-white px-6 text-sm font-semibold text-[#0B1F2E]"
        >
          Buka Transparansi
        </Link>
      </div>
    </main>
  );
}
