import Image from "next/image";

const RASIO = 506.58 / 256;

export default function Logo({
  varian = "warna",
  tinggi = 28,
  simbol = false,
  alt = "OmniRelief",
  kelas = "",
}: {
  varian?: "warna" | "putih";
  tinggi?: number;
  simbol?: boolean;
  alt?: string;
  kelas?: string;
}) {
  const nama = simbol ? "logo-simbol" : "logo";
  const akhir = varian === "putih" ? "-putih" : "";
  return (
    <Image
      src={`/logo/${nama}${akhir}.svg`}
      alt={alt}
      width={simbol ? tinggi : Math.round(tinggi * RASIO)}
      height={tinggi}
      className={kelas}
    />
  );
}
