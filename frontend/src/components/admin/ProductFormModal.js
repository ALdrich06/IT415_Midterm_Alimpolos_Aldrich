"use client";

import { useEffect, useState } from "react";

const EMPTY_FORM = { name: "", description: "", price: "", category: "", image_url: "", is_available: true };

export default function ProductFormModal({ product, onClose, onSubmit, submitting }) {
  const [form, setForm] = useState(EMPTY_FORM);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (product) {
      setForm({
        name: product.name || "",
        description: product.description || "",
        price: product.price ?? "",
        category: product.category || "",
        image_url: product.image_url || "",
        is_available: product.is_available,
      });
    } else {
      setForm(EMPTY_FORM);
    }
    setErrors({});
  }, [product]);

  function validate() {
    const newErrors = {};
    if (!form.name.trim()) newErrors.name = "Product name is required.";
    const price = Number(form.price);
    if (form.price === "" || Number.isNaN(price) || price < 0) {
      newErrors.price = "Enter a valid price (0 or more).";
    }
    if (!form.category.trim()) newErrors.category = "Category is required.";
    return newErrors;
  }

  function handleSubmit(e) {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    onSubmit({ ...form, price: Number(form.price) });
  }

  return (
    <div className="fixed inset-0 z-30 flex items-center justify-center bg-maroon-900/40 p-4">
      <form onSubmit={handleSubmit} className="w-full max-w-lg rounded-2xl bg-white p-6 shadow-card-hover">
        <h2 className="mb-4 text-xl font-extrabold text-maroon-900">
          {product ? "Edit Product" : "Add Product"}
        </h2>

        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-sm font-semibold text-maroon-900">Name</label>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              className="w-full rounded-xl border-2 border-cream-200 px-3 py-2 outline-none focus:border-maroon-400"
            />
            {errors.name && <p className="mt-1 text-sm text-maroon-600">{errors.name}</p>}
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-maroon-900">Description</label>
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              className="w-full rounded-xl border-2 border-cream-200 px-3 py-2 outline-none focus:border-maroon-400"
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-sm font-semibold text-maroon-900">Price (₱)</label>
              <input
                type="number"
                min="0"
                step="0.01"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: e.target.value })}
                className="w-full rounded-xl border-2 border-cream-200 px-3 py-2 outline-none focus:border-maroon-400"
              />
              {errors.price && <p className="mt-1 text-sm text-maroon-600">{errors.price}</p>}
            </div>
            <div>
              <label className="mb-1 block text-sm font-semibold text-maroon-900">Category</label>
              <input
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
                className="w-full rounded-xl border-2 border-cream-200 px-3 py-2 outline-none focus:border-maroon-400"
                placeholder="Coffee, Drinks, Meals, Snacks…"
              />
              {errors.category && <p className="mt-1 text-sm text-maroon-600">{errors.category}</p>}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-sm font-semibold text-maroon-900">Image URL</label>
            <input
              value={form.image_url}
              onChange={(e) => setForm({ ...form, image_url: e.target.value })}
              className="w-full rounded-xl border-2 border-cream-200 px-3 py-2 outline-none focus:border-maroon-400"
              placeholder="https://placehold.co/400x300"
            />
          </div>

          <label className="flex items-center gap-2 text-sm font-semibold text-maroon-900">
            <input
              type="checkbox"
              checked={form.is_available}
              onChange={(e) => setForm({ ...form, is_available: e.target.checked })}
              className="h-5 w-5"
            />
            Available for sale
          </label>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-xl bg-cream-100 px-5 py-2 font-semibold text-maroon-700"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="rounded-xl bg-maroon-600 px-5 py-2 font-semibold text-cream-50 disabled:opacity-60"
          >
            {submitting ? "Saving…" : "Save Product"}
          </button>
        </div>
      </form>
    </div>
  );
}
