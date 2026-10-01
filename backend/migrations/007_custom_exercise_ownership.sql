alter table exercises
  add column if not exists created_by_user_id uuid references users(id) on delete set null;

create index if not exists exercises_created_by_user_idx
  on exercises (created_by_user_id)
  where created_by_user_id is not null;