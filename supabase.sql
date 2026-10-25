-- La Place Caisse — à coller dans Supabase > SQL Editor > New query > Run
-- Crée les tables et les règles d'accès : seuls les comptes connectés (caisse et gérant) peuvent lire et écrire.

create table if not exists public.services (
  id           text primary key,
  type         text not null,              -- 'matin' | 'soir'
  opened_at    bigint not null,            -- millisecondes
  closed_at    bigint,
  cash_float   integer not null default 0, -- millimes
  counted      integer,
  expected     integer,
  drawer_opens integer not null default 0,
  updated_at   timestamptz not null default now()
);

create table if not exists public.sales (
  id           text primary key,
  sale_no      integer,
  ts           bigint not null,
  service_id   text,
  service_type text,
  items        jsonb not null,
  total        integer not null,
  received     integer,
  change       integer,
  cancelled    boolean not null default false,
  cancelled_at bigint,
  updated_at   timestamptz not null default now()
);

create table if not exists public.config (
  key        text primary key,
  value      jsonb,
  updated_at bigint
);

create index if not exists sales_ts_idx on public.sales (ts);
create index if not exists sales_service_idx on public.sales (service_id);
create index if not exists services_opened_idx on public.services (opened_at);

-- Seuls les comptes listés dans staff ont accès (un compte créé par un inconnu ne voit rien).
create table if not exists public.staff (user_id uuid primary key references auth.users(id) on delete cascade, role text not null default 'caisse');
alter table public.staff enable row level security;
create or replace function public.is_staff() returns boolean
language sql stable security definer set search_path = '' as
$$ select exists (select 1 from public.staff where user_id = (select auth.uid())) $$;
revoke all on function public.is_staff() from public, anon;
grant execute on function public.is_staff() to authenticated;

alter table public.services enable row level security;
alter table public.sales    enable row level security;
alter table public.config   enable row level security;
create policy staff_all on public.services for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));
create policy staff_all on public.sales    for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));
create policy staff_all on public.config   for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));
-- Ajouter un compte : Authentication > Add user, puis
-- insert into public.staff(user_id, role) select id, 'caisse' from auth.users where email = '...';

-- V4 : dépenses (achats du jour, avances, charges) et mouvements de stock
create table if not exists public.expenses (
  id text primary key, ts bigint not null, type text not null, label text, amount integer not null,
  from_drawer boolean not null default false, service_id text, service_type text, person text,
  stock_id text, qty numeric, cancelled boolean not null default false, cancelled_at bigint,
  source text not null default 'caisse', updated_at timestamptz not null default now());
create table if not exists public.stock_moves (
  id text primary key, ts bigint not null, item_id text not null, kind text not null, qty numeric not null,
  expense_id text, note text, cancelled boolean not null default false, source text not null default 'caisse',
  updated_at timestamptz not null default now());
create index if not exists expenses_ts_idx on public.expenses (ts);
create index if not exists expenses_service_idx on public.expenses (service_id);
create index if not exists stock_moves_ts_idx on public.stock_moves (ts);
create index if not exists stock_moves_source_ts_idx on public.stock_moves (source, ts);
alter table public.expenses enable row level security;
alter table public.stock_moves enable row level security;
create policy staff_all on public.expenses for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));
create policy staff_all on public.stock_moves for all to authenticated using ((select public.is_staff())) with check ((select public.is_staff()));
-- config : clés 'menu', 'stock' (liste des produits du stock) et 'wipe' (dernier « Vider les données »)
