# Brew & Bite — Touchscreen POS Kiosk System

A full-stack Touchscreen Point-of-Sale (POS) Kiosk System built for the IT415 — Application
Development and Emerging Technologies midterm practical examination.

## 1. Project Overview

Brew & Bite is a self-service kiosk system for a small café/food-and-drinks store. Customers
browse the menu on a touchscreen, build their order, pay (Cash, QR, or Card), and receive a
digital/printable receipt — with zero staff involvement. A separate Admin Dashboard lets the
café owner manage the product catalog and review sales/transaction history.

### Problem Addressed

Small cafés often rely on a single cashier to take every order, which slows down service during
peak hours and makes it hard to track sales and inventory. A self-service kiosk speeds up
ordering, reduces human error in totals/change, and gives the owner real-time visibility into
sales through an admin dashboard.

### Target Users

- **Customers** — walk-in café customers placing their own orders on a touchscreen kiosk.
- **Admin / Store Owner** — manages the product catalog, prices, availability, and reviews sales.

## 2. Features

### Customer Kiosk
- Browse products by category, large touch-friendly product cards
- Add/remove items, increase/decrease quantity, live subtotal & total
- Order Summary with Back/Modify Order before payment
- Cash payment with change calculation and validation (blank/invalid/negative/insufficient amounts)
- QR payment simulation
- Credit/Debit Card payment simulation (no real card data collected)
- Unique transaction number per sale (`TXN-YYYY-NNNNN`)
- Payment Successful screen, on-screen digital receipt, printable receipt
- New Transaction resets the kiosk back to the product catalog

### Admin Dashboard
- Secure login via Supabase Authentication; all `/admin` routes are protected
- Dashboard stats: total sales, total transactions, available products, payment-method breakdown,
  recent transactions — all computed live from Supabase
- Product management: add, edit, change availability, delete
- Transaction history with search (by transaction number) and payment-method filter, plus
  transaction detail view (line items)
- Logout

## 3. Technology Stack

| Layer            | Technology                                   |
|-------------------|-----------------------------------------------|
| Frontend          | Next.js (App Router) + React, JavaScript, Tailwind CSS |
| Backend/API       | Express.js (Node.js), JavaScript               |
| Database          | Supabase (PostgreSQL)                          |
| Authentication    | Supabase Auth (email/password)                 |
| Deployment        | Vercel (frontend), any Node host for the backend |
| Version Control   | Git + GitHub                                   |

## 4. Project Architecture

```
IT415_Midterm_Alimpolos_Sulana_Perono/
├── frontend/                 # Next.js app (customer kiosk + admin dashboard)
│   ├── src/app/               # App Router pages (/, /admin, /admin/login, ...)
│   ├── src/components/        # kiosk/ and admin/ React components
│   ├── src/lib/                # Supabase client, API helper, cart/format utils
│   └── src/middleware.js       # Protects /admin/* routes server-side
├── backend/                  # Express.js API
│   ├── src/routes/             # products, transactions, admin endpoints
│   ├── src/middleware/         # requireAdmin (Supabase JWT check), error handler
│   ├── src/config/             # Supabase service-role client (server-only)
│   └── scripts/                # run-migrations.js, create-admin-user.js
├── supabase/
│   ├── migrations/0001_init_schema.sql   # tables, RLS policies, RPC function
│   └── seed.sql                           # initial product catalog
└── docs/AI-DEVELOPMENT.md     # AI-assisted development log
```

### How the frontend talks to the backend

- **Public product catalog** (`GET /api/products`) — the kiosk calls the Express API, which
  reads `products` using the Supabase **service role** key, filtered to `is_available = true`.
- **Transaction creation** (`POST /api/transactions`) — the kiosk sends the cart (product IDs +
  quantities) and payment info to Express. Express calls the `create_pos_transaction` Postgres
  function, which re-validates everything against the **current** database prices (never trusts
  client-sent totals), checks cash sufficiency, and atomically inserts the transaction + its line
  items. This prevents price tampering and duplicate/partial writes.
- **Admin login/logout** happens directly against Supabase Auth from the browser
  (`@supabase/supabase-js` / `@supabase/ssr`), since that's what Supabase Auth is designed for.
- **Admin data operations** (product CRUD, stats, transaction history) — the dashboard attaches
  the Supabase session's access token as `Authorization: Bearer <token>` when calling the Express
  API. Express verifies that token with `supabase.auth.getUser()` before using its service-role
  client to read/write privileged data. The service role key never reaches the browser.
- Next.js `middleware.js` also blocks direct navigation to any `/admin/*` URL without a valid
  Supabase session, redirecting to `/admin/login`.

## 5. Database Structure

See `supabase/migrations/0001_init_schema.sql` for the full, authoritative schema.

**products**
| column | type | notes |
|---|---|---|
| id | uuid, PK | default `gen_random_uuid()` |
| name | text, not null | |
| description | text | |
| price | numeric(10,2), not null | `>= 0` |
| category | text, not null | |
| image_url | text | |
| is_available | boolean, not null, default true | |
| created_at / updated_at | timestamptz | `updated_at` auto-refreshed via trigger |

**transactions**
| column | type | notes |
|---|---|---|
| id | uuid, PK | |
| transaction_number | text, unique, not null | auto-generated `TXN-YYYY-NNNNN` |
| total | numeric(10,2), not null | |
| payment_method | text, not null | `cash` \| `qr` \| `card` |
| amount_paid | numeric(10,2), not null | |
| change_amount | numeric(10,2), not null, default 0 | |
| created_at | timestamptz | |

**transaction_items**
| column | type | notes |
|---|---|---|
| id | uuid, PK | |
| transaction_id | uuid, FK → transactions(id) `ON DELETE CASCADE` | |
| product_id | uuid, FK → products(id) `ON DELETE SET NULL` | kept for reference only |
| product_name | text, not null | **snapshot** at time of sale |
| quantity | integer, not null | `> 0` |
| unit_price | numeric(10,2), not null | **snapshot** at time of sale |
| subtotal | numeric(10,2), not null | |
| created_at | timestamptz | |

Product name/price are snapshotted into `transaction_items` so historical receipts stay accurate
even if a product is later renamed, repriced, or deleted.

### Row Level Security

- `products`: RLS enabled. Only policy: `anon`/`authenticated` may `SELECT` where
  `is_available = true`. No public write policies — all writes go through the backend's service
  role key after it verifies an admin session.
- `transactions` / `transaction_items`: RLS enabled with **no** `anon`/`authenticated` policies at
  all. The public API has zero direct access to sales data; only the backend's service role key
  (which bypasses RLS) can read or write them.
- `create_pos_transaction()` is a `SECURITY DEFINER` function with `EXECUTE` revoked from `public`
  and granted only to `service_role`.

## 6. Installation & Setup

### Prerequisites
- Node.js 18+
- A Supabase project (free tier is fine)

### Clone & install
```bash
git clone https://github.com/ALdrich06/IT415_Midterm_Alimpolos_Aldrich.git
cd IT415_Midterm_Alimpolos_Sulana_Perono
cd frontend && npm install
cd ../backend && npm install
```

### Environment variables

Copy the example files and fill in your real Supabase values (see `.env.example` in each folder
for the full list):

```bash
cp frontend/.env.example frontend/.env.local
cp backend/.env.example backend/.env
```

| Variable | Where | Description |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | frontend | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | frontend | Supabase anon/public key |
| `NEXT_PUBLIC_API_URL` | frontend | URL of the running Express backend |
| `SUPABASE_URL` | backend | Supabase project URL |
| `SUPABASE_SERVICE_ROLE_KEY` | backend | **Secret.** Service role key, server-only |
| `SUPABASE_DB_URL` | backend | Direct Postgres connection string (used only by the migration script) |
| `CORS_ORIGIN` | backend | Allowed frontend origin(s) |

Never commit `.env` / `.env.local` files — they are git-ignored.

### Supabase configuration

1. Apply the schema + RLS policies + RPC function:
   ```bash
   cd backend
   node scripts/run-migrations.js --seed
   ```
   This runs every file in `supabase/migrations/` and then `supabase/seed.sql` (8 starter
   products) against your database using `SUPABASE_DB_URL`.

2. Create the Admin Dashboard user:
   ```bash
   node scripts/create-admin-user.js admin@yourcafe.com
   ```
   This prints a generated password once in the terminal — save it, it is never shown again or
   stored anywhere. You can also pass your own password as a second argument.

### Run the backend
```bash
cd backend
npm run dev     # http://localhost:4000
```

### Run the frontend
```bash
cd frontend
npm run dev     # http://localhost:3000
```

- Customer kiosk: `http://localhost:3000/`
- Admin login: `http://localhost:3000/admin/login`

## 7. Authentication Setup

Admin accounts are plain Supabase Auth users (email/password) — there's no separate "roles"
table; any account you create with `scripts/create-admin-user.js` has full dashboard access.
`frontend/src/middleware.js` checks for a valid Supabase session on every `/admin/*` request and
redirects to `/admin/login` if there isn't one, so the dashboard can't be reached just by typing
the URL. The Express backend independently re-verifies the session token on every admin API call.

## 8. Deployment

- **Frontend (Vercel):** import the `frontend/` directory as the project root, set the
  `NEXT_PUBLIC_*` environment variables in the Vercel dashboard, deploy.
- **Backend (Express):** deploy `backend/` to any Node host (Render, Railway, Fly.io, a VM, etc.).
  Set `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, and `CORS_ORIGIN` (your Vercel domain) in that
  host's environment variables. Point the frontend's `NEXT_PUBLIC_API_URL` at the deployed
  backend's URL.
- **Database:** your existing Supabase project; no extra deployment step beyond the migration
  script above.

## 9. Git / GitHub Workflow

- `main` — stable, integration branch.
- Feature work happens on dedicated branches (e.g. `feature-payment`) and is merged into `main`
  via Pull Request after review.
- Commits describe real, meaningful changes (setup, features, validation, fixes, docs) rather than
  artificial/filler commits.

## 10. Contributors

- Alimpolos, Aldrich
- Sulana
- Perono

## 11. AI-Assisted Development

See [`docs/AI-DEVELOPMENT.md`](./docs/AI-DEVELOPMENT.md) for a log of significant AI-assisted
development activities: prompts used, generated solutions, evaluation, modifications, and testing.
