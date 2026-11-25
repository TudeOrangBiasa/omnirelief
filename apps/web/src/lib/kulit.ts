// Palet kulit ganda halaman publik: anonim = shader gelap ikut landing,
// login = terang ikut dasbor internal. Murni agar bisa diuji tanpa Next.
export type KulitPublik = {
  teksJudul: string;
  teksRedup: string;
  teksLabel: string;
  panelInfo: string;
  tombolPrimer: string;
  tombolGhost: string;
  inputKelas: string;
  saringAktif: string;
  saringMati: string;
};

export function kulitPublik(masuk: boolean): KulitPublik {
  return {
    teksJudul: masuk ? "text-foreground" : "text-white",
    teksRedup: masuk ? "text-muted-foreground" : "text-white/70",
    teksLabel: masuk ? "text-muted-foreground" : "text-white/60",
    panelInfo: masuk
      ? "garis-rambut-diam bg-white text-foreground"
      : "rounded-none border border-white/20 bg-white/10 text-white",
    tombolPrimer: masuk
      ? "bg-primary text-primary-foreground hover:bg-primary/90"
      : "bg-white text-[#0B1F2E] hover:bg-white/90",
    tombolGhost: masuk
      ? "border-input bg-white text-foreground hover:bg-slate-100"
      : "border-white/40 bg-white/10 text-white hover:bg-white/20",
    inputKelas: masuk
      ? "border-input bg-white text-foreground placeholder:text-muted-foreground"
      : "border-white/25 bg-white/10 text-white placeholder:text-white/50",
    saringAktif: masuk ? "bg-[#0B1F2E] text-white" : "bg-white text-[#0B1F2E]",
    saringMati: masuk
      ? "text-muted-foreground hover:text-foreground"
      : "text-white/70 hover:text-white",
  };
}
