const { supabaseAdmin } = require("../config/supabaseClient");

/**
 * Verifies the Supabase access token sent by the Admin Dashboard.
 * A request only reaches protected Admin routes if it carries a valid,
 * non-expired Supabase session token - typing an admin URL in the browser
 * is not enough, since the frontend route itself is also guarded, and the
 * underlying data never leaves this API without a verified token.
 */
async function requireAdmin(req, res, next) {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

    if (!token) {
      return res.status(401).json({ message: "Missing authentication token." });
    }

    const { data, error } = await supabaseAdmin.auth.getUser(token);

    if (error || !data?.user) {
      return res.status(401).json({ message: "Invalid or expired session. Please log in again." });
    }

    req.user = data.user;
    next();
  } catch (err) {
    console.error("[requireAdmin] auth check failed:", err.message);
    res.status(500).json({ message: "Authentication check failed." });
  }
}

module.exports = requireAdmin;
