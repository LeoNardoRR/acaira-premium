create table if not exists public.products (
  id text primary key,
  name text not null,
  category text not null,
  description text not null default '',
  price numeric(10,2) not null,
  image text not null,
  badge text,
  rating numeric(2,1) not null default 5,
  prep text not null default '15–20 min',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.orders (
  id uuid primary key default gen_random_uuid(),
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  address jsonb not null,
  items jsonb not null,
  subtotal numeric(10,2) not null,
  delivery_fee numeric(10,2) not null default 0,
  total numeric(10,2) not null,
  payment_method text not null check (payment_method in ('pix', 'card')),
  payment_status text not null default 'simulated',
  status text not null default 'Novo',
  created_at timestamptz not null default now()
);

alter table public.products enable row level security;
alter table public.orders enable row level security;

create policy "Public products are readable" on public.products for select using (active = true);
create policy "Orders can be created" on public.orders for insert with check (true);

-- Produção: somente usuários marcados como admin podem operar o painel.
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  display_name text not null,
  role text not null default 'admin' check (role in ('admin')),
  created_at timestamptz not null default now()
);

create table if not exists public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  unit text not null check (unit in ('kg', 'un', 'l')),
  quantity numeric(10,2) not null default 0 check (quantity >= 0),
  minimum_quantity numeric(10,2) not null default 0 check (minimum_quantity >= 0),
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.product_recipes (
  product_id text not null references public.products(id) on delete cascade,
  inventory_item_id uuid not null references public.inventory_items(id) on delete cascade,
  quantity numeric(10,3) not null check (quantity > 0),
  primary key (product_id, inventory_item_id)
);

create table if not exists public.inventory_movements (
  id uuid primary key default gen_random_uuid(),
  inventory_item_id uuid not null references public.inventory_items(id),
  order_id uuid references public.orders(id),
  delta numeric(10,2) not null,
  reason text not null check (reason in ('manual_adjustment', 'order_paid', 'order_cancelled')),
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create or replace function public.is_admin()
returns boolean language sql stable security definer set search_path = public as $$
  select exists (select 1 from public.profiles where id = auth.uid() and role = 'admin');
$$;

alter table public.profiles enable row level security;
alter table public.inventory_items enable row level security;
alter table public.product_recipes enable row level security;
alter table public.inventory_movements enable row level security;

create policy "Admins read own profile" on public.profiles for select using (id = auth.uid());
create policy "Admins manage inventory" on public.inventory_items for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins manage recipes" on public.product_recipes for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins read movements" on public.inventory_movements for select using (public.is_admin());
create policy "Admins create movements" on public.inventory_movements for insert with check (public.is_admin());
create policy "Admins manage products" on public.products for all using (public.is_admin()) with check (public.is_admin());
create policy "Admins read orders" on public.orders for select using (public.is_admin());
create policy "Admins update orders" on public.orders for update using (public.is_admin()) with check (public.is_admin());
