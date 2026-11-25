-- Peran ADMIN untuk dasbor /admin + flag aktif untuk nonaktifkan akun.
-- Append-only ledger tidak tersentuh: flag hanya di profil.
alter table profil drop constraint if exists profil_peran_check;
alter table profil
  add constraint profil_peran_check check (peran in ('BPBD','GUDANG','POSKO','TIM','ADMIN'));
alter table profil
  add column if not exists aktif boolean not null default true;
