-- IT415 POS Kiosk — initial schema
-- Tables: products, transactions, transaction_items
-- Run this once against the Supabase project's Postgres database.

create extension if not exists pgcrypto;

-- ---------------------------------------------------------------------
-- Helper: keep updated_at current on every UPDATE
-- ---------------------------------------------------------------------
create or replace function set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

-- ---------------------------------------------------------------------
-- products
-- ---------------------------------------------------------------------
create table if not exists products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  price numeric(10,2) not null check (price >= 0),
  category text not null,
  image_url text,
  is_available boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists idx_products_category on products (category);
create index if not exists idx_products_is_available on products (is_available);

drop trigger if exists trg_products_updated_at on products;
create trigger trg_products_updated_at
before update on products
for each row execute function set_updated_at();

-- ---------------------------------------------------------------------
-- transaction number generator: TXN-<year>-<zero-padded sequence>
-- ---------------------------------------------------------------------
create sequence if not exists transaction_number_seq start 1;

create or replace function generate_transaction_number()
returns text
language plpgsql
as $$
begin
  return 'TXN-' || extract(year from now())::text || '-' ||
         lpad(nextval('transaction_number_seq')::text, 5, '0');
end;
$$;

-- ---------------------------------------------------------------------
-- transactions
-- ---------------------------------------------------------------------
create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  transaction_number text not null unique default generate_transaction_number(),
  total numeric(10,2) not null check (total >= 0),
  payment_method text not null check (payment_method in ('cash', 'qr', 'card')),
  amount_paid numeric(10,2) not null check (amount_paid >= 0),
  change_amount numeric(10,2) not null default 0 check (change_amount >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_transactions_created_at on transactions (created_at desc);
create index if not exists idx_transactions_number on transactions (transaction_number);

-- ---------------------------------------------------------------------
-- transaction_items
-- Snapshots product_name/unit_price so historical receipts stay accurate
-- even if the product is later renamed, repriced, or deleted.
-- ---------------------------------------------------------------------
create table if not exists transaction_items (
  id uuid primary key default gen_random_uuid(),
  transaction_id uuid not null references transactions (id) on delete cascade,
  product_id uuid references products (id) on delete set null,
  product_name text not null,
  quantity integer not null check (quantity > 0),
  unit_price numeric(10,2) not null check (unit_price >= 0),
  subtotal numeric(10,2) not null check (subtotal >= 0),
  created_at timestamptz not null default now()
);

create index if not exists idx_transaction_items_transaction_id on transaction_items (transaction_id);
create index if not exists idx_transaction_items_product_id on transaction_items (product_id);

-- ---------------------------------------------------------------------
-- create_pos_transaction: the one atomic entry point used by the Express
-- backend to finalize a sale. Recomputes the total from current DB prices
-- (never trusts client-supplied prices), validates cash sufficiency,
-- generates the transaction + its line items in a single DB transaction,
-- and returns the new transaction id.
-- ---------------------------------------------------------------------
create or replace function create_pos_transaction(
  p_payment_method text,
  p_amount_paid numeric,
  p_items jsonb
) returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_item jsonb;
  v_product products%rowtype;
  v_quantity integer;
  v_subtotal numeric(10,2);
  v_total numeric(10,2) := 0;
  v_change numeric(10,2);
  v_transaction_id uuid;
  v_final_amount_paid numeric(10,2);
begin
  if p_payment_method not in ('cash', 'qr', 'card') then
    raise exception 'Invalid payment method: %', p_payment_method;
  end if;

  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Cart is empty.';
  end if;

  -- Pass 1: validate items & compute the authoritative total
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item ->> 'quantity')::integer;
    if v_quantity is null or v_quantity <= 0 then
      raise exception 'Invalid quantity for product %', v_item ->> 'product_id';
    end if;

    select * into v_product from products where id = (v_item ->> 'product_id')::uuid;
    if not found then
      raise exception 'Product % no longer exists.', v_item ->> 'product_id';
    end if;

    v_total := v_total + round(v_product.price * v_quantity, 2);
  end loop;

  if p_payment_method = 'cash' then
    if p_amount_paid < v_total then
      raise exception 'Insufficient amount. Amount paid (%) is less than the total (%).', p_amount_paid, v_total;
    end if;
    v_final_amount_paid := p_amount_paid;
    v_change := round(p_amount_paid - v_total, 2);
  else
    -- QR / Card are simulations: amount paid always equals the total
    v_final_amount_paid := v_total;
    v_change := 0;
  end if;

  insert into transactions (total, payment_method, amount_paid, change_amount)
  values (v_total, p_payment_method, v_final_amount_paid, v_change)
  returning id into v_transaction_id;

  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_quantity := (v_item ->> 'quantity')::integer;
    select * into v_product from products where id = (v_item ->> 'product_id')::uuid;
    v_subtotal := round(v_product.price * v_quantity, 2);

    insert into transaction_items (transaction_id, product_id, product_name, quantity, unit_price, subtotal)
    values (v_transaction_id, v_product.id, v_product.name, v_quantity, v_product.price, v_subtotal);
  end loop;

  return v_transaction_id;
end;
$$;

revoke execute on function create_pos_transaction(text, numeric, jsonb) from public;
grant execute on function create_pos_transaction(text, numeric, jsonb) to service_role;

-- ---------------------------------------------------------------------
-- Row Level Security — least privilege
-- ---------------------------------------------------------------------
alter table products enable row level security;
alter table transactions enable row level security;
alter table transaction_items enable row level security;

drop policy if exists "Public can view available products" on products;
create policy "Public can view available products"
on products for select
to anon, authenticated
using (is_available = true);

-- No policies are defined for anon/authenticated on products INSERT/UPDATE/
-- DELETE, or on transactions/transaction_items at all. That means the only
-- way to write products or to read/write sales data is through the Express
-- backend's service role key (which bypasses RLS entirely), after it has
-- verified a valid Supabase Auth session for admin-only operations.
