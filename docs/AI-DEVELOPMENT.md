# AI-Assisted Development Log

This document records the significant AI-assisted development activities used to build the
Brew & Bite POS Kiosk System, as required by the IT415 midterm specification. Entries are added
in the order the work actually happened; nothing here is backfilled or fabricated.

---

## Entry 1 — Project Scaffolding & Architecture

**Prompt Used**
> "Develop a complete Touchscreen Point-of-Sale (POS) Kiosk System... Next.js + React frontend,
> Express.js backend, JavaScript only, Tailwind CSS, Supabase PostgreSQL + Auth, Vercel
> deployment... Inspect and use the existing [empty] GitHub repository... Use Supabase MCP/tools
> to create the database directly when possible..." (full master prompt, see conversation).

**AI-Generated Response/Solution**
- Inspected the existing (empty) GitHub repo and confirmed no MCP server was configured for
  Supabase in this session.
- Scaffolded a monorepo: `frontend/` (Next.js 14, App Router, Tailwind) via `create-next-app`,
  and `backend/` (Express 5) via `npm init` + manual dependency installation
  (`express`, `cors`, `helmet`, `morgan`, `express-rate-limit`, `@supabase/supabase-js`, `dotenv`,
  `pg`).
- Designed the maroon + cream visual theme in `tailwind.config.js` and `globals.css`, including
  print-specific CSS for the receipt.

**Evaluation**
No direct Supabase MCP tool was available in this session (`mcp_list_servers` returned no
servers). Rather than silently fabricating database access, this was flagged to the user, who
chose to provide Supabase credentials manually via local `.env` files instead, with migrations
applied through a dedicated Node script (`backend/scripts/run-migrations.js`) using a direct
Postgres connection. This keeps the "no secrets in conversation/commits" requirement intact while
still letting the AI apply the schema directly rather than asking the user to run SQL by hand.

**Modifications Made**
N/A for this entry — scaffolding was generated directly as described above.

**Testing/Result**
`npm run lint` and `npm run build` both passed on the generated Next.js app with no errors
(one non-blocking warning about using `<img>` instead of `next/image`, intentionally accepted
since product images are temporary placeholders). The Express app was started locally with
placeholder environment variables and `GET /health` returned `{"status":"ok"}`.

---

## Entry 2 — Supabase Schema, RLS, and Transaction Logic

**Prompt Used**
> "Create `products`, `transactions`, `transaction_items` with appropriate types/constraints...
> configure RLS with least privilege... generate a unique transaction number... every successful
> transaction must be stored atomically; do not fake successful database operations."

**AI-Generated Response/Solution**
- Wrote `supabase/migrations/0001_init_schema.sql`: three tables with primary/foreign keys,
  `CHECK` constraints, indexes, an `updated_at` trigger for `products`, a sequence-backed
  `generate_transaction_number()` function (`TXN-<year>-<5-digit sequence>`), and a
  `create_pos_transaction(payment_method, amount_paid, items)` `SECURITY DEFINER` function that
  recomputes the total from current DB prices, validates cash sufficiency, and inserts the
  transaction + all line items atomically in one database transaction.
- Enabled RLS on all three tables. Only `products` has a public policy
  (`SELECT` where `is_available = true`); `transactions`/`transaction_items` have no
  anon/authenticated policies at all, so only the backend's service-role key can touch them.
  `EXECUTE` on `create_pos_transaction` is revoked from `public` and granted only to
  `service_role`.
- Wrote `supabase/seed.sql` with 8 café products (idempotent — skips rows that already exist by
  name).

**Evaluation**
Computing the total server-side (inside the Postgres function) rather than trusting a
client-submitted total closes an obvious tampering vector. Using a single `SECURITY DEFINER`
function for the whole transaction + items insert avoids the partial-write risk of doing two
separate client-side `insert()` calls.

**Modifications Made**
None yet — to be applied and verified once Supabase credentials are provided (see Entry 4).

**Testing/Result**
Pending — will be run via `node backend/scripts/run-migrations.js --seed` once credentials are
available, then verified directly in the Supabase Table Editor / SQL editor.

---

## Entry 3 — Customer Kiosk & Admin Dashboard UI

**Prompt Used**
> "The customer must be able to browse, add to cart, adjust quantities, review order, pay via
> Cash/QR/Card, get a receipt, print it, and start a new transaction... Admin must log in, see
> stats, manage products, and view transaction history."

**AI-Generated Response/Solution**
- Built the kiosk as a single client-side state machine (`KioskApp.js`) moving through
  `catalog → summary → payment-select → payment-{cash,qr,card} → success → receipt`, with cart
  state (`lib/cart.js`) preserved across every back/forward transition.
- Implemented client-side validation for cash payments (blank/invalid/negative/insufficient
  amounts) and a duplicate-submission guard (`submittingRef`) so repeated taps on "Pay Now" /
  "Confirm Payment" / "Process Payment" cannot create two transactions.
- Built the Admin Dashboard: Supabase-Auth login page, `middleware.js` guarding all `/admin/*`
  routes server-side, a stats dashboard, a product CRUD table with a modal form, and a
  transaction history table with search/filter, pagination, and a detail page.

**Evaluation**
Using one component tree with internal stage state (instead of separate routes per step) makes
"Back / Modify Order" trivial — the cart array is just never cleared until "New Transaction" is
pressed — and matches the requirement that going back must preserve quantities.

**Modifications Made**
To be completed after the manual browser test pass (Entry 4) — any bugs found there will be
listed and fixed here.

**Testing/Result**
Pending manual end-to-end test (see Entry 4) covering: product load, cart math, all three payment
methods (including rejection cases), receipt accuracy, printing, and the full admin flow.

---

*(Further entries will be appended below as Supabase is connected and the full system is tested.)*
