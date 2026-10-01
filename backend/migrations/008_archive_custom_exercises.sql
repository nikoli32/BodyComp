alter table exercises
  add column if not exists archived_at timestamptz;

alter table exercises
  drop constraint if exists exercises_name_key;

create unique index if not exists exercises_active_name_idx
  on exercises (name)
  where archived_at is null;
