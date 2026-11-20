export default function Home() {
  return (
    <main className="mx-auto flex min-h-svh w-full max-w-md flex-col justify-center gap-6 p-6">
      <div>
        <h1 className="text-3xl font-bold text-[#0F3B5F]">OmniRelief</h1>
        <p className="mt-2 text-[#1A2433]">
          Sistem supply chain pangan darurat yang transparan dan anti-korupsi.
          Setiap paket tercatat dari gudang sampai posko dan bisa dicek publik.
        </p>
      </div>
      <div className="flex flex-col gap-3">
        <a
          href="/transparansi"
          className="block min-h-12 rounded bg-[#0F3B5F] p-3 text-center font-semibold text-white"
        >
          Lihat transparansi per posko
        </a>
        <a
          href="/masuk"
          className="block min-h-12 rounded border border-gray-300 p-3 text-center font-semibold"
        >
          Masuk untuk relawan
        </a>
      </div>
      <p className="text-xs text-[#5B6B7F]">
        Tanpa login: cek dashboard, manifest, dan sumbangan lewat kode.
      </p>
    </main>
  );
}
