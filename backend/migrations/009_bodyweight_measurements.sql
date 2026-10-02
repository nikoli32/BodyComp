create table if not exists bodyweight_info (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  recorded_at timestamptz not null,
  weight_kg numeric(7,2),
  body_fat_percent numeric(5,2),
  unique (user_id, recorded_at)
);

do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'bodyweight_info_complete_measurement_check'
      and conrelid = 'bodyweight_info'::regclass
  ) then
    alter table bodyweight_info
      add constraint bodyweight_info_complete_measurement_check
      check (
        weight_kg is not null and weight_kg > 0
        and body_fat_percent is not null
        and body_fat_percent between 0 and 100
      ) not valid;
  end if;
end
$$;