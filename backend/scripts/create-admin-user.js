/**
 * Creates (or resets the password for) the Admin Dashboard user in
 * Supabase Auth using the service role key (never exposed to the browser).
 *
 * Usage:
 *   node scripts/create-admin-user.js <email> [password]
 *
 * If no password is given, a secure random one is generated and printed
 * once to this terminal only - it is never logged, stored in a file, or
 * sent anywhere else.
 *
 * Requires SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in backend/.env.
 */
require("dotenv").config({ override: true });
const crypto = require("crypto");
const { supabaseAdmin } = require("../src/config/supabaseClient");

function generatePassword() {
  return crypto.randomBytes(12).toString("base64url") + "!A1";
}

async function main() {
  const email = process.argv[2];
  const password = process.argv[3] || generatePassword();

  if (!email) {
    console.error("Usage: node scripts/create-admin-user.js <email> [password]");
    process.exit(1);
  }

  const { data: existing } = await supabaseAdmin.auth.admin.listUsers();
  const match = existing?.users?.find((u) => u.email === email);

  if (match) {
    const { error } = await supabaseAdmin.auth.admin.updateUserById(match.id, { password });
    if (error) {
      console.error("Failed to update existing admin user:", error.message);
      process.exit(1);
    }
    console.log(`Updated password for existing admin user: ${email}`);
  } else {
    const { error } = await supabaseAdmin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
    });
    if (error) {
      console.error("Failed to create admin user:", error.message);
      process.exit(1);
    }
    console.log(`Created admin user: ${email}`);
  }

  console.log(`Password: ${password}`);
  console.log("Save this password now (e.g. in a password manager). It will not be shown again.");
}

main();
