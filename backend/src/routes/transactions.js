const express = require("express");
const { supabaseAdmin } = require("../config/supabaseClient");
const { AppError } = require("../middleware/errorHandler");

const router = express.Router();

const VALID_METHODS = ["cash", "qr", "card"];

// POST /api/transactions - kiosk: finalize a sale.
// Server-side validation + atomic DB insert happen inside the
// `create_pos_transaction` Postgres function (see supabase/migrations),
// so partial/duplicate writes and client-side price tampering are avoided.
router.post("/", async (req, res, next) => {
  try {
    const { paymentMethod, amountPaid, items } = req.body;

    if (!VALID_METHODS.includes(paymentMethod)) {
      throw new AppError("Invalid payment method.", 422);
    }
    if (!Array.isArray(items) || items.length === 0) {
      throw new AppError("Your cart is empty.", 422);
    }
    for (const item of items) {
      if (!item.productId || !Number.isInteger(item.quantity) || item.quantity <= 0) {
        throw new AppError("Each cart item needs a valid product and a positive quantity.", 422);
      }
    }
    const amount = Number(amountPaid);
    if (Number.isNaN(amount) || amount < 0) {
      throw new AppError("Amount paid must be a valid, non-negative number.", 422);
    }

    const { data: transactionId, error } = await supabaseAdmin.rpc("create_pos_transaction", {
      p_payment_method: paymentMethod,
      p_amount_paid: amount,
      p_items: items.map((i) => ({ product_id: i.productId, quantity: i.quantity })),
    });

    if (error) {
      console.error("[transactions] create_pos_transaction failed:", error.message);
      throw new AppError(error.message || "Failed to process payment.", 400);
    }

    const { data: transaction, error: fetchError } = await supabaseAdmin
      .from("transactions")
      .select("*, items:transaction_items(*)")
      .eq("id", transactionId)
      .single();

    if (fetchError || !transaction) {
      throw new AppError("Transaction was saved, but could not be retrieved.", 500);
    }

    res.status(201).json({ transaction });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
