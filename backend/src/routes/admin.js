const express = require("express");
const { supabaseAdmin } = require("../config/supabaseClient");
const requireAdmin = require("../middleware/requireAdmin");
const { AppError } = require("../middleware/errorHandler");

const router = express.Router();

router.use(requireAdmin);

// GET /api/admin/stats - dashboard summary built from live Supabase data
router.get("/stats", async (req, res, next) => {
  try {
    const [{ data: transactions, error: txError }, { count: availableProducts, error: prodError }, { data: recent, error: recentError }] =
      await Promise.all([
        supabaseAdmin.from("transactions").select("id, total, payment_method"),
        supabaseAdmin.from("products").select("id", { count: "exact", head: true }).eq("is_available", true),
        supabaseAdmin
          .from("transactions")
          .select("id, transaction_number, total, payment_method, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
      ]);

    if (txError || prodError || recentError) {
      throw new AppError("Failed to load dashboard statistics.", 500);
    }

    const totalSales = transactions.reduce((sum, t) => sum + Number(t.total), 0);
    const totalTransactions = transactions.length;

    const paymentBreakdown = { cash: 0, qr: 0, card: 0 };
    transactions.forEach((t) => {
      if (paymentBreakdown[t.payment_method] !== undefined) {
        paymentBreakdown[t.payment_method] += Number(t.total);
      }
    });

    res.json({
      totalSales,
      totalTransactions,
      availableProducts: availableProducts || 0,
      paymentBreakdown,
      recentTransactions: recent,
    });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/transactions - history with search/filter + pagination
router.get("/transactions", async (req, res, next) => {
  try {
    const { search, paymentMethod, dateFrom, dateTo, page = 1, limit = 20 } = req.query;

    const pageNum = Math.max(1, parseInt(page, 10) || 1);
    const pageSize = Math.min(100, Math.max(1, parseInt(limit, 10) || 20));
    const from = (pageNum - 1) * pageSize;
    const to = from + pageSize - 1;

    let query = supabaseAdmin
      .from("transactions")
      .select("*", { count: "exact" })
      .order("created_at", { ascending: false })
      .range(from, to);

    if (search) query = query.ilike("transaction_number", `%${search}%`);
    if (paymentMethod) query = query.eq("payment_method", paymentMethod);
    if (dateFrom) query = query.gte("created_at", dateFrom);
    if (dateTo) query = query.lte("created_at", dateTo);

    const { data, error, count } = await query;
    if (error) throw new AppError("Failed to load transactions.", 500, error.message);

    res.json({ transactions: data, total: count, page: pageNum, limit: pageSize });
  } catch (err) {
    next(err);
  }
});

// GET /api/admin/transactions/:id - full detail with line items
router.get("/transactions/:id", async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("transactions")
      .select("*, items:transaction_items(*)")
      .eq("id", req.params.id)
      .single();

    if (error || !data) throw new AppError("Transaction not found.", 404);

    res.json({ transaction: data });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
