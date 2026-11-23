import type { Metadata } from "next";
import Link from "next/link";
import { BantuanIstilah } from "@/components/bantuan-istilah";

export const metadata: Metadata = {
  title: "Pusat Bantuan | OmniRelief",
  description: "Panduan peran, SOP, dan eskalasi command center OmniRelief.",
};

const LABEL =
  "font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#1B7FBF]";
const KARTU = "rounded-none border border-[#0B1F2E]/15 bg-white";
const TOMBOL_AKTIF =
  "min-h-12 rounded-none bg-[#0B1F2E] px-4 text-sm font-semibold text-white";
const TOMBOL_BIASA =
  "min-h-12 rounded-none border border-[#0B1F2E]/25 bg-white px-4 text-sm font-semibold text-[#0B1F2E]";

const KATEGORI = [
  { id: "semua", label: "Semua" },
  { id: "gudang", label: "Gudang dan FEFO" },
  { id: "bpbd", label: "BPBD dan Manifest" },
  { id: "tim", label: "Tim dan Check-in" },
  { id: "posko", label: "Posko dan Mode Luring" },
  { id: "audit", label: "Audit Publik dan SHA-256" },
] as const;

const SKRIP_FILTER = `(function(){var cari=document.getElementById("bantuan-cari");var tombol=Array.prototype.slice.call(document.querySelectorAll("[data-filter]"));var artikel=Array.prototype.slice.call(document.querySelectorAll("[data-artikel]"));var jumlah=document.getElementById("bantuan-jumlah");var kosong=document.getElementById("bantuan-kosong");var aktif="semua";var KELAS_AKTIF=${JSON.stringify(TOMBOL_AKTIF)};var KELAS_BIASA=${JSON.stringify(TOMBOL_BIASA)};function terapkan(){var q=cari&&"value"in cari?String(cari.value).toLowerCase().trim():"";var n=0;artikel.forEach(function(a){var okKat=aktif==="semua"||a.getAttribute("data-kategori")===aktif;var teks=String(a.getAttribute("data-cari")||"").toLowerCase();var okCari=!q||teks.indexOf(q)!==-1;var tampil=okKat&&okCari;a.classList.toggle("hidden",!tampil);if(tampil)n+=1;});tombol.forEach(function(b){var nyala=b.getAttribute("data-filter")===aktif;b.setAttribute("aria-pressed",nyala?"true":"false");b.className=nyala?KELAS_AKTIF:KELAS_BIASA;});if(kosong)kosong.classList.toggle("hidden",n!==0);if(jumlah)jumlah.textContent="Menampilkan "+n+" dari "+artikel.length+" artikel.";}tombol.forEach(function(b){b.addEventListener("click",function(){aktif=String(b.getAttribute("data-filter"));terapkan();});});if(cari)cari.addEventListener("input",terapkan);terapkan();})();`;

function Artikel({
  kategori,
  cari,
  judul,
  sop,
  children,
}: {
  kategori: string;
  cari: string;
  judul: string;
  sop: string;
  children: React.ReactNode;
}) {
  return (
    <article data-artikel data-kategori={kategori} data-cari={cari} className={KARTU}>
      <div className="flex flex-col gap-3 p-5">
        <p className={LABEL}>
          {KATEGORI.find((k) => k.id === kategori)?.label ?? kategori} · SOP diperbarui {sop}
        </p>
        <h2 className="text-lg font-bold text-[#0B1F2E]">{judul}</h2>
        <div className="flex flex-col gap-2 text-sm leading-relaxed text-[#0B1F2E]/90">
          {children}
        </div>
      </div>
    </article>
  );
}

export default function BantuanPage() {
  return (
    <main className="mx-auto min-h-screen w-full max-w-[1400px] px-6 py-8 lg:px-10">
      <div className="border-b-2 border-[#0B1F2E] pb-4">
        <p className={LABEL}>Bantuan · Semua peran</p>
        <h1 className="mt-1 text-3xl font-bold text-[#0B1F2E] tabular-nums">
          Pusat Bantuan
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Cari panduan kerja tiap peran. Setiap artikel mencantumkan tanggal
          pembaruan SOP.
        </p>
      </div>

      <div className="mt-6 flex flex-col gap-3">
        <label htmlFor="bantuan-cari" className={LABEL}>
          Cari panduan
        </label>
        <input
          id="bantuan-cari"
          type="search"
          placeholder="Contoh: manifest, kedaluwarsa, check-in, hash"
          autoComplete="off"
          className="min-h-12 w-full rounded-none border border-[#0B1F2E]/25 bg-white px-4 text-sm text-[#0B1F2E] placeholder:text-[#0B1F2E]/40"
        />
        <div role="group" aria-label="Filter kategori" className="flex flex-wrap gap-2">
          {KATEGORI.map((k) => (
            <button
              key={k.id}
              type="button"
              data-filter={k.id}
              aria-pressed={k.id === "semua"}
              className={k.id === "semua" ? TOMBOL_AKTIF : TOMBOL_BIASA}
            >
              {k.label}
            </button>
          ))}
        </div>
        <p id="bantuan-jumlah" aria-live="polite" className="text-sm text-muted-foreground tabular-nums">
          Menampilkan 10 dari 10 artikel.
        </p>
      </div>

      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <Artikel
          kategori="gudang"
          cari="mencatat sumbangan masuk batch kode dnt gudang kedaluwarsa jumlah item donatur"
          judul="Mencatat sumbangan masuk jadi batch"
          sop="12 Nov 2026"
        >
          <p>
            Setiap sumbangan dicatat satu per satu sebagai batch. Satu batch
            berarti satu item, satu jumlah, satu tanggal kedaluwarsa, dan satu
            kode sumbangan format DNT-TAHUN-NOMOR.
          </p>
          <ol className="list-decimal pl-5">
            <li>Buka halaman Gudang lalu pilih Catat sumbangan.</li>
            <li>Isi nama item, jumlah satuan, dan tanggal kedaluwarsa.</li>
            <li>Simpan. Kode sumbangan terbit dan bisa dilacak publik.</li>
          </ol>
          <p>
            Periksa kode yang terbit sebelum menutup halaman. Kode yang salah
            catat tidak bisa diubah karena riwayat bersifat{" "}
            <BantuanIstilah istilah="append-only" label="append-only" />.
          </p>
        </Artikel>

        <Artikel
          kategori="gudang"
          cari="fefo keluar duluan kedaluwarsa paling dekat stok gudang fifo"
          judul="Memakai aturan FEFO saat menyiapkan kiriman"
          sop="12 Nov 2026"
        >
          <p>
            Aturan keluar barang memakai{" "}
            <BantuanIstilah istilah="fefo" label="FEFO" />. Batch yang
            kedaluwarsanya paling dekat keluar paling dulu agar tidak ada pangan
            yang basi di gudang.
          </p>
          <ol className="list-decimal pl-5">
            <li>Buka halaman Gudang dan lihat urutan stok batch.</li>
            <li>Ambil dari batch kedaluwarsa paling dekat lebih dulu.</li>
            <li>Jangan menukar urutan demi mengejar jumlah paket.</li>
          </ol>
          <p>
            Jika ada batch lewat kedaluwarsa, pisahkan dari rak kirim dan lapor
            ke command center sebelum mencatat batch baru.
          </p>
        </Artikel>

        <Artikel
          kategori="bpbd"
          cari="verifikasi snapshot posko setujui revisi tolak bpbd jatah penyintas"
          judul="Memverifikasi snapshot posko"
          sop="15 Nov 2026"
        >
          <p>
            Snapshot adalah laporan jumlah penyintas satu posko untuk satu
            periode. Hanya snapshot yang disetujui yang dipakai sebagai jatah
            kiriman.
          </p>
          <ol className="list-decimal pl-5">
            <li>Buka halaman Verifikasi BPBD dan pilih antrean snapshot.</li>
            <li>
              Bandingkan angka laporan dengan periode sebelumnya. Angka
              melonjak tajam wajib ditanya ke posko dulu.
            </li>
            <li>
              Pilih keputusan <BantuanIstilah istilah="verifikasi" label="verifikasi" />:
              disetujui, minta revisi, atau ditolak beserta alasan.
            </li>
          </ol>
          <p>
            Keputusan tercatat permanen. Jika salah tekan, buat keputusan susulan
            lewat command center, jangan meminta hapus data.
          </p>
        </Artikel>

        <Artikel
          kategori="bpbd"
          cari="menerbitkan manifest kirim posko tim batas check-in kunci hash bpbd"
          judul="Menerbitkan manifest ke posko"
          sop="15 Nov 2026"
        >
          <p>
            Manifest adalah rencana pengiriman terkunci untuk satu posko. Isinya
            daftar batch, tim pengantar, dan batas check-in.
          </p>
          <ol className="list-decimal pl-5">
            <li>Buka Buat manifest dan pilih posko tujuan.</li>
            <li>Tambahkan batch sesuai jatah snapshot yang disetujui.</li>
            <li>Tetapkan tim dan batas check-in, lalu terbitkan.</li>
          </ol>
          <p>
            Saat diterbitkan, manifest dikunci dengan{" "}
            <BantuanIstilah istilah="hash-pengunci" label="hash pengunci SHA-256" />.
            Isi yang sudah terkunci tidak bisa diubah diam-diam.
          </p>
        </Artikel>

        <Artikel
          kategori="tim"
          cari="tugas tim distribusi berangkat antar paket rute"
          judul="Melihat tugas dan berangkat mengantar"
          sop="10 Nov 2026"
        >
          <p>
            Tugas tim muncul di halaman Tugas setelah manifest diterbitkan.
            Setiap tugas mencantumkan posko tujuan, daftar batch, dan batas
            check-in.
          </p>
          <ol className="list-decimal pl-5">
            <li>Buka halaman Tugas dan pilih kiriman aktif.</li>
            <li>Cocokkan fisik paket dengan daftar batch di layar.</li>
            <li>Tandai berangkat agar posko tahu kiriman jalan.</li>
          </ol>
          <p>
            Jika paket tidak cocok dengan daftar, jangan berangkat. Laporkan
            selisih ke command center sebelum keluar gudang.
          </p>
        </Artikel>

        <Artikel
          kategori="tim"
          cari="check-in kabar berkala perlu dicek lewat batas hubungi tim darurat"
          judul="Mengirim check-in dan menghindari status Perlu Dicek"
          sop="10 Nov 2026"
        >
          <p>
            <BantuanIstilah istilah="check-in" label="Check-in" /> adalah kabar
            berkala selama perjalanan. Lewat batas tanpa kabar memicu status{" "}
            <BantuanIstilah istilah="perlu-dicek" label="Perlu Dicek" /> dan
            command center akan menghubungi tim lewat jalur darurat.
          </p>
          <ol className="list-decimal pl-5">
            <li>Kirim kabar tiap tiba di titik yang disepakati.</li>
            <li>Jika sinyal hilang, kirim kabar begitu sinyal kembali.</li>
            <li>Jika kendaraan mogok, kabari command center segera.</li>
          </ol>
          <p>
            Satu kabar tepat waktu lebih berguna dari tiga kabar terlambat.
            Jangan menunggu sampai di posko untuk memberi kabar pertama.
          </p>
        </Artikel>

        <Artikel
          kategori="posko"
          cari="lapor jumlah penyintas agregat tanpa nik nama posko"
          judul="Melapor jumlah penyintas posko"
          sop="14 Nov 2026"
        >
          <p>
            Posko melapor cukup dengan angka{" "}
            <BantuanIstilah istilah="agregat" label="agregat tanpa NIK" /> per
            kategori. Tanpa nama, tanpa NIK, tanpa data pribadi apa pun.
          </p>
          <ol className="list-decimal pl-5">
            <li>Buka halaman Posko bagian Lapor.</li>
            <li>Isi jumlah penyintas per kategori yang diminta.</li>
            <li>Kirim dan tunggu keputusan verifikasi BPBD.</li>
          </ol>
          <p>
            Laporan tersimpan{" "}
            <BantuanIstilah istilah="append-only" label="append-only" /> dan
            tidak bisa dihapus. Jika salah isi, kirim laporan baru yang benar
            dan beri tahu command center.
          </p>
        </Artikel>

        <Artikel
          kategori="posko"
          cari="mode luring offline internet mati antrean tersimpan perangkat kirim ulang sinkron"
          judul="Melapor saat internet mati"
          sop="14 Nov 2026"
        >
          <p>
            Saat sinyal hilang, laporan tidak hilang. Aplikasi menyimpan laporan
            di perangkat dan mengirim ulang otomatis begitu internet kembali.
          </p>
          <ol className="list-decimal pl-5">
            <li>Tulis laporan seperti biasa walau tanpa sinyal.</li>
            <li>Biarkan status antrean tampil di layar posko.</li>
            <li>Buka kembali halaman saat sinyal pulih untuk memastikan terkirim.</li>
          </ol>
          <p>
            Jangan mengisi laporan yang sama dua kali. Satu laporan yang
            tertunda lebih mudah dilacak daripada dua laporan ganda.
          </p>
        </Artikel>

        <Artikel
          kategori="audit"
          cari="cek kode sumbangan dnt lacak aliran donatur publik transparansi"
          judul="Mengecek kode sumbangan sebagai publik"
          sop="16 Nov 2026"
        >
          <p>
            Siapa pun bisa melacak aliran satu batch lewat kode sumbangan
            format DNT-TAHUN-NOMOR. Tidak perlu akun dan tidak perlu masuk.
          </p>
          <ol className="list-decimal pl-5">
            <li>Buka halaman utama dan cari kolom Cek kode.</li>
            <li>Masukkan kode sumbangan lengkap dari donatur atau posko.</li>
            <li>Baca alur batch dari gudang sampai konfirmasi terima.</li>
          </ol>
          <p>
            Jika kode tidak ditemukan, periksa lagi huruf dan angkanya. Kode
            yang benar selalu diawali DNT diikuti tahun dan nomor.
          </p>
        </Artikel>

        <Artikel
          kategori="audit"
          cari="hash chain sha-256 riwayat append-only audit publik verifikasi rantai manifest"
          judul="Membaca hash chain dan riwayat audit"
          sop="16 Nov 2026"
        >
          <p>
            Setiap manifest dan setiap baris riwayat diikat ke hash sebelumnya
            dengan <BantuanIstilah istilah="hash-pengunci" label="hash chain SHA-256" />.
            Rantai ini membuktikan tidak ada perubahan diam-diam.
          </p>
          <ol className="list-decimal pl-5">
            <li>Buka halaman Transparansi lalu pilih manifest.</li>
            <li>Periksa kode hash tiap tahap kiriman.</li>
            <li>
              Pastikan riwayat hanya bertambah karena sistem bersifat{" "}
              <BantuanIstilah istilah="append-only" label="append-only" />.
            </li>
          </ol>
          <p>
            Jika menemukan tahap yang janggal, catat kode manifest dan bawa ke
            command center sebagai bahan eskalasi.
          </p>
        </Artikel>
      </div>

      <p id="bantuan-kosong" className="mt-6 hidden rounded-none border border-[#0B1F2E]/15 bg-white p-5 text-sm text-[#0B1F2E]">
        Tidak ada artikel yang cocok. Coba kata kunci lain atau pilih kategori
        Semua.
      </p>

      <section aria-label="Eskalasi command center" className="mt-6 rounded-none bg-[#0B1F2E] p-5 text-white">
        <p className="font-mono text-[11px] font-bold uppercase tracking-[0.14em] text-[#DCE8EE]">
          Eskalasi · Command Center
        </p>
        <h2 className="mt-1 text-xl font-bold tabular-nums">Butuh bantuan operator</h2>
        <ol className="mt-3 list-decimal pl-5 text-sm leading-relaxed text-white/90">
          <li>Siapkan kode manifest atau kode sumbangan yang bermasalah.</li>
          <li>Catat jam kejadian dan nama posko.</li>
          <li>Hubungi operator BPBD lewat jalur resmi daerah masing-masing.</li>
          <li>Untuk lupa password, buat tiket reset di halaman Masuk lalu sebutkan kodenya.</li>
        </ol>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row">
          <Link
            href="/transparansi"
            className="flex min-h-12 items-center justify-center rounded-none bg-white px-4 text-sm font-semibold text-[#0B1F2E]"
          >
            Buka Transparansi
          </Link>
          <Link
            href="/masuk"
            className="flex min-h-12 items-center justify-center rounded-none border border-white/40 px-4 text-sm font-semibold text-white"
          >
            Ke Halaman Masuk
          </Link>
        </div>
      </section>

      <script dangerouslySetInnerHTML={{ __html: SKRIP_FILTER }} />
    </main>
  );
}
