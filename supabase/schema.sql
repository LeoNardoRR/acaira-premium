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
