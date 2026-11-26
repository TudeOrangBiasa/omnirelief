-- Kunci append-only manifest: hanya transisi status sah + kolom terkendali.
-- Berlaku untuk SEMUA peran database (termasuk service_role): tiga UPDATE
-- terkendali lewat API (publikasi, pembatalan, ketidaksesuaian) tetap lolos.
-- JANGAN apply manual ke database prod tanpa persetujuan; file ini untuk review.

create or replace function kunci_status_manifest()
returns trigger
language plpgsql
as $$
declare
  boleh boolean := false;
begin
  -- 1. Transisi status yang sah (termasuk tanpa-ubah agar UPDATE no-op lolos).
  if old.status = new.status then
    boleh := true;
  elsif old.status = 'DRAFT' and new.status = 'TERKUNCI_PUBLIK' then
    boleh := true;
  elsif old.status = 'TERKUNCI_PUBLIK' and new.status in ('DIBATALKAN', 'PUNYA_PENGGANTI', 'PUNYA_LAPORAN') then
    boleh := true;
  end if;
  if not boleh then
    raise exception 'transisi status manifest tidak sah: % -> %', old.status, new.status;
  end if;

  -- 2. Kolom selain status/dipublikasikan_pada/hash-terkendali tidak boleh berubah.
  --    hash hanya boleh berubah saat penguncian DRAFT -> TERKUNCI_PUBLIK (publikasi).
  if new.id is distinct from old.id
    or new.kode is distinct from old.kode
    or new.posko_id is distinct from old.posko_id
    or new.tim is distinct from old.tim
    or new.eta is distinct from old.eta
    or new.batas_checkin is distinct from old.batas_checkin
  then
    raise exception 'kolom manifest terkunci, hanya status yang boleh berubah';
  end if;
  if new.hash is distinct from old.hash
    and not (old.status = 'DRAFT' and new.status = 'TERKUNCI_PUBLIK')
  then
    raise exception 'hash manifest terkunci di luar publikasi';
  end if;

  return new;
end;
$$;

drop trigger if exists trg_kunci_status_manifest on manifest;
create trigger trg_kunci_status_manifest
  before update on manifest
  for each row
  execute function kunci_status_manifest();

-- ROLLBACK (jalankan bila trigger ini dicabut):
-- drop trigger trg_kunci_status_manifest on manifest;
-- drop function kunci_status_manifest();
