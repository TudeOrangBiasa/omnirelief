"use client";

import { useState } from "react";
import { Button } from "@omnirelief/ui/components/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@omnirelief/ui/components/dialog";

const DAFTAR = {
  fefo: {
    judul: "FEFO",
    ringkas: "Stok yang paling dekat kedaluwarsa keluar duluan.",
    jelas:
      "Aturan keluar duluan untuk batch yang kedaluwarsanya paling dekat. Batch lama tidak menumpuk di gudang.",
  },
  "hash-pengunci": {
    judul: "Hash Pengunci SHA-256",
    ringkas: "Kunci digital yang mengikat tiap manifest ke data sebelumnya.",
    jelas:
      "Rantai SHA-256 mengikat tiap manifest dan tiap baris riwayat ke hash sebelumnya. Bukti tidak ada ubah diam-diam.",
  },
  "append-only": {
    judul: "Append-Only",
    ringkas: "Data hanya tambah baru. Tidak ada ubah atau hapus.",
    jelas:
      "Catatan hanya bisa tambah baru. Manifest terkunci tidak bisa diubah atau dihapus. Koreksi lewat dokumen baru.",
  },
  agregat: {
    judul: "Data Agregat Tanpa NIK",
    ringkas: "Hanya hitung jiwa per kategori. Tanpa nama. Tanpa NIK.",
    jelas:
      "Laporan posko hanya angka per kategori: bayi, balita, ibu hamil, lansia, disabilitas, umum. Tidak ada nama dan tidak ada NIK.",
  },
  "check-in": {
    judul: "Check-in",
    ringkas: "Kabar berkala tim selama perjalanan distribusi.",
    jelas:
      "Kabar berkala tim selama perjalanan. Lewat batas tanpa kabar memicu status Perlu Dicek.",
  },
  "perlu-dicek": {
    judul: "Perlu Dicek",
    ringkas: "Tanda otomatis bahwa kiriman lewat batas check-in tanpa kabar.",
    jelas:
      "Tanda otomatis bahwa kiriman lewat batas check-in tanpa kabar. Perintahnya: hubungi tim lewat jalur darurat.",
  },
  selisih: {
    judul: "Selisih",
    ringkas: "Jatah dikurangi yang sudah diterima.",
    jelas:
      "Jatah dikurangi yang sudah diterima. Nol berarti aman. Positif berarti kurang dan tampil merah.",
  },
  verifikasi: {
    judul: "Verifikasi",
    ringkas: "Keputusan BPBD atas snapshot: disetujui, revisi, atau ditolak.",
    jelas:
      "Keputusan BPBD atas snapshot posko. Hanya snapshot disetujui yang jadi jatah kiriman.",
  },
} satisfies Record<string, { judul: string; ringkas: string; jelas: string }>;

export type IstilahKunci = keyof typeof DAFTAR;

export function BantuanIstilah({
  istilah,
  label,
}: {
  istilah: IstilahKunci;
  label?: string;
}) {
  const info = DAFTAR[istilah];
  const [buka, setBuka] = useState(false);

  function tutup(bukaBaru: boolean): void {
    if (!bukaBaru) setBuka(false);
  }

  return (
    <span className="inline-flex min-h-12 items-center">
      <button
        type="button"
        title={info.ringkas}
        aria-label={`Penjelasan: ${info.judul}`}
        onClick={() => setBuka(true)}
        className="inline-flex min-h-12 min-w-12 items-center text-primary underline decoration-dotted underline-offset-4"
      >
        {label ?? info.judul}
      </button>
      <Dialog open={buka} onOpenChange={tutup}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{info.judul}</DialogTitle>
            <DialogDescription>{info.ringkas}</DialogDescription>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{info.jelas}</p>
          <DialogFooter>
            <Button type="button" onClick={() => setBuka(false)} className="min-h-12 min-w-12">
              Tutup
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </span>
  );
}
