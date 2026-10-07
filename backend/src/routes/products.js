const express = require("express");
const { supabaseAdmin } = require("../config/supabaseClient");
const requireAdmin = require("../middleware/requireAdmin");
const { AppError } = require("../middleware/errorHandler");

const router = express.Router();

function validateProductPayload(body, { partial = false } = {}) {
  const errors = {};
  const payload = {};

  if (!partial || body.name !== undefined) {
    if (!body.name || typeof body.name !== "string" || !body.name.trim()) {
      errors.name = "Product name is required.";
    } else {
      payload.name = body.name.trim();
    }
  }

  if (!partial || body.price !== undefined) {
    const price = Number(body.price);
    if (body.price === undefined || body.price === null || body.price === "" || Number.isNaN(price) || price < 0) {
      errors.price = "Price must be a valid number greater than or equal to 0.";
    } else {
      payload.price = Math.round(price * 100) / 100;
    }
  }

  if (!partial || body.category !== undefined) {
    if (!body.category || typeof body.category !== "string" || !body.category.trim()) {
      errors.category = "Category is required.";
    } else {
      payload.category = body.category.trim();
    }
  }

  if (body.description !== undefined) payload.description = body.description?.trim() || null;
  if (body.image_url !== undefined) payload.image_url = body.image_url?.trim() || null;
  if (body.is_available !== undefined) payload.is_available = Boolean(body.is_available);

  return { errors, payload };
}

// GET /api/products - public catalog for the kiosk (available products only)
router.get("/", async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("id, name, description, price, category, image_url, is_available")
      .eq("is_available", true)
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw new AppError("Failed to load products.", 500, error.message);

    res.json({ products: data });
  } catch (err) {
    next(err);
  }
});

// GET /api/products/all - admin: every product, including unavailable ones
router.get("/all", requireAdmin, async (req, res, next) => {
  try {
    const { data, error } = await supabaseAdmin
      .from("products")
      .select("*")
      .order("category", { ascending: true })
      .order("name", { ascending: true });

    if (error) throw new AppError("Failed to load products.", 500, error.message);

    res.json({ products: data });
  } catch (err) {
    next(err);
  }
});

// POST /api/products - admin: create a product
router.post("/", requireAdmin, async (req, res, next) => {
  try {
    const { errors, payload } = validateProductPayload(req.body);
    if (Object.keys(errors).length > 0) {
      throw new AppError("Invalid product data.", 422, errors);
    }

    payload.is_available = payload.is_available ?? true;

    const { data, error } = await supabaseAdmin.from("products").insert(payload).select().single();
    if (error) throw new AppError("Failed to create product.", 500, error.message);

    res.status(201).json({ product: data });
  } catch (err) {
    next(err);
  }
});

// PUT /api/products/:id - admin: update a product
router.put("/:id", requireAdmin, async (req, res, next) => {
  try {
    const { errors, payload } = validateProductPayload(req.body, { partial: true });
    if (Object.keys(errors).length > 0) {
      throw new AppError("Invalid product data.", 422, errors);
    }
    if (Object.keys(payload).length === 0) {
      throw new AppError("No fields provided to update.", 422);
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .update(payload)
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw new AppError("Failed to update product.", 500, error.message);
    if (!data) throw new AppError("Product not found.", 404);

    res.json({ product: data });
  } catch (err) {
    next(err);
  }
});

// PATCH /api/products/:id/availability - admin: quick availability toggle
router.patch("/:id/availability", requireAdmin, async (req, res, next) => {
  try {
    if (typeof req.body.is_available !== "boolean") {
      throw new AppError("is_available must be true or false.", 422);
    }

    const { data, error } = await supabaseAdmin
      .from("products")
      .update({ is_available: req.body.is_available })
      .eq("id", req.params.id)
      .select()
      .single();

    if (error) throw new AppError("Failed to update availability.", 500, error.message);
    if (!data) throw new AppError("Product not found.", 404);

    res.json({ product: data });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/products/:id - admin: remove a product.
// transaction_items.product_id uses ON DELETE SET NULL, so historical
// receipts remain intact (they keep their own name/price snapshot).
router.delete("/:id", requireAdmin, async (req, res, next) => {
  try {
    const { error } = await supabaseAdmin.from("products").delete().eq("id", req.params.id);
    if (error) throw new AppError("Failed to delete product.", 500, error.message);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
});

module.exports = router;
