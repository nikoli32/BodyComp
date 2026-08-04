create extension if not exists pgcrypto;

create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text not null unique,
  display_name text,
  created_at timestamptz not null default now()
);

create table if not exists muscle_groups (
  id smallserial primary key,
  slug text not null unique,
  name text not null,
  description text not null,
  default_recovery_hours smallint not null default 72 check (default_recovery_hours between 1 and 336),
  map_view text not null check (map_view in ('front', 'back', 'both'))
);

create table if not exists muscle_regions (
  id smallserial primary key,
  muscle_group_id smallint not null references muscle_groups(id) on delete cascade,
  region_key text not null unique,
  side text not null check (side in ('left', 'right', 'center')),
  map_view text not null check (map_view in ('front', 'back'))
);

create table if not exists exercises (
  id bigserial primary key,
  name text not null unique,
  instructions text
);

create table if not exists exercise_muscles (
  exercise_id bigint not null references exercises(id) on delete cascade,
  muscle_group_id smallint not null references muscle_groups(id) on delete cascade,
  role text not null check (role in ('primary', 'secondary')),
  load_factor numeric(3,2) not null default 1.00 check (load_factor > 0 and load_factor <= 1),
  primary key (exercise_id, muscle_group_id)
);

create table if not exists workouts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references users(id) on delete cascade,
  started_at timestamptz not null,
  finished_at timestamptz,
  notes text,
  created_at timestamptz not null default now(),
  check (finished_at is null or finished_at >= started_at)
);

create table if not exists workout_exercises (
  id uuid primary key default gen_random_uuid(),
  workout_id uuid not null references workouts(id) on delete cascade,
  exercise_id bigint not null references exercises(id),
  position smallint not null check (position > 0),
  notes text,
  unique (workout_id, position)
);

create table if not exists workout_sets (
  id uuid primary key default gen_random_uuid(),
  workout_exercise_id uuid not null references workout_exercises(id) on delete cascade,
  set_number smallint not null check (set_number > 0),
  weight_kg numeric(7,2) check (weight_kg >= 0),
  reps smallint check (reps > 0),
  duration_seconds integer check (duration_seconds > 0),
  rir smallint check (rir between 0 and 10),
  completed_at timestamptz,
  unique (workout_exercise_id, set_number),
  check (reps is not null or duration_seconds is not null)
);

create index if not exists workouts_user_started_idx on workouts (user_id, started_at desc);
create index if not exists workout_exercises_workout_idx on workout_exercises (workout_id);
create index if not exists workout_sets_workout_exercise_idx on workout_sets (workout_exercise_id);
