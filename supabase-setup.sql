-- Run this in your Supabase SQL Editor (Dashboard > SQL Editor > New Query)

-- Tasks table
create table public.tasks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null,
  text text not null,
  completed boolean default false,
  priority integer default 0,
  position integer default 0,
  due_date date not null,
  created_at timestamptz default now(),
  completed_at timestamptz,
  is_recurring boolean default false,
  recurrence_rule text,
  rolled_over_count integer default 0
);

-- Streaks table
create table public.streaks (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users(id) on delete cascade not null unique,
  current_streak integer default 0,
  longest_streak integer default 0,
  last_completed_date date
);

-- Profiles table
create table public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  accent_color text default 'emerald',
  created_at timestamptz default now()
);

-- Row Level Security
alter table public.tasks enable row level security;
alter table public.streaks enable row level security;
alter table public.profiles enable row level security;

-- Policies: users can only access their own data
create policy "Users can view own tasks" on public.tasks for select using (auth.uid() = user_id);
create policy "Users can insert own tasks" on public.tasks for insert with check (auth.uid() = user_id);
create policy "Users can update own tasks" on public.tasks for update using (auth.uid() = user_id);
create policy "Users can delete own tasks" on public.tasks for delete using (auth.uid() = user_id);

create policy "Users can view own streak" on public.streaks for select using (auth.uid() = user_id);
create policy "Users can insert own streak" on public.streaks for insert with check (auth.uid() = user_id);
create policy "Users can update own streak" on public.streaks for update using (auth.uid() = user_id);

create policy "Users can view own profile" on public.profiles for select using (auth.uid() = id);
create policy "Users can insert own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update own profile" on public.profiles for update using (auth.uid() = id);

-- Auto-create profile and streak on signup
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id) values (new.id);
  insert into public.streaks (user_id) values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Index for fast task queries by user and date
create index idx_tasks_user_date on public.tasks (user_id, due_date);
create index idx_tasks_user_completed on public.tasks (user_id, completed);
