/**
 * Applies every SQL file in /supabase/migrations (in filename order) and,
 * optionally, /supabase/seed.sql to the Supabase Postgres database.
 *
 * Usage:
 *   node scripts/run-migrations.js            # migrations only
 *   node scripts/run-migrations.js --seed      # migrations + seed data
 *
 * Requires SUPABASE_DB_URL in backend/.env (Supabase dashboard ->
 * Settings -> Database -> Connection string -> URI).
 */
require("dotenv").config({ override: true });
const fs = require("fs");
const path = require("path");
const { Client } = require("pg");

const MIGRATIONS_DIR = path.resolve(__dirname, "../../supabase/migrations");
const SEED_FILE = path.resolve(__dirname, "../../supabase/seed.sql");

async function main() {
  const connectionString = process.env.SUPABASE_DB_URL;
  if (!connectionString) {
    console.error("Missing SUPABASE_DB_URL in backend/.env. See backend/.env.example.");
    process.exit(1);
  }

  const shouldSeed = process.argv.includes("--seed");

  const client = new Client({ connectionString, ssl: { rejectUnauthorized: false } });
  await client.connect();
  console.log("Connected to Supabase Postgres.");

  try {
    const files = fs
      .readdirSync(MIGRATIONS_DIR)
      .filter((f) => f.endsWith(".sql"))
      .sort();

    for (const file of files) {
      const sql = fs.readFileSync(path.join(MIGRATIONS_DIR, file), "utf8");
      console.log(`Applying migration: ${file}`);
      await client.query(sql);
      console.log(`  ✓ ${file} applied.`);
    }

    if (shouldSeed) {
      console.log("Applying seed data...");
      const seedSql = fs.readFileSync(SEED_FILE, "utf8");
      await client.query(seedSql);
      console.log("  ✓ Seed data applied.");
    }

    console.log("All done.");
  } finally {
    await client.end();
  }
}

main().catch((err) => {
  console.error("Migration failed:", err.message);
  process.exit(1);
});
