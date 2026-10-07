"use client";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import ProductFormModal from "@/components/admin/ProductFormModal";
import {
  adminFetchAllProducts,
  adminCreateProduct,
  adminUpdateProduct,
  adminDeleteProduct,
  ApiError,
} from "@/lib/api";
import { formatCurrency } from "@/lib/format";

export default function AdminProductsPage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  function loadProducts() {
    setLoading(true);
    return adminFetchAllProducts()
      .then((data) => setProducts(data.products || []))
      .catch(() => toast.error("Failed to load products."))
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadProducts();
  }, []);

  function openCreateModal() {
    setEditingProduct(null);
    setModalOpen(true);
  }

  function openEditModal(product) {
    setEditingProduct(product);
    setModalOpen(true);
  }

  async function handleSubmit(formData) {
    setSubmitting(true);
    try {
      if (editingProduct) {
        await adminUpdateProduct(editingProduct.id, formData);
        toast.success("Product updated");
      } else {
        await adminCreateProduct(formData);
        toast.success("Product created");
      }
      setModalOpen(false);
      await loadProducts();
    } catch (err) {
      toast.error(err instanceof ApiError ? err.message : "Failed to save product.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleToggleAvailability(product) {
    try {
      await adminUpdateProduct(product.id, { is_available: !product.is_available });
      toast.success(product.is_available ? "Product deactivated" : "Product activated");
      await loadProducts();
    } catch (err) {
      toast.error("Failed to update availability.");
    }
  }

  async function handleDelete(product) {
    if (!window.confirm(`Delete "${product.name}"? This cannot be undone.`)) return;
    try {
      await adminDeleteProduct(product.id);
      toast.success("Product deleted");
      await loadProducts();
    } catch (err) {
      toast.error("Failed to delete product.");
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-extrabold text-maroon-900">Products</h1>
        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-xl bg-maroon-600 px-5 py-3 font-semibold text-cream-50 shadow-card"
        >
          + Add Product
        </button>
      </div>

      <div className="overflow-x-auto rounded-2xl bg-white shadow-card">
        <table className="w-full text-left text-sm">
          <thead>
            <tr className="border-b border-cream-200 text-maroon-700/70">
              <th className="p-4">Name</th>
              <th className="p-4">Category</th>
              <th className="p-4">Price</th>
              <th className="p-4">Status</th>
              <th className="p-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-maroon-700/70">
                  Loading products…
                </td>
              </tr>
            ) : products.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-6 text-center text-maroon-700/70">
                  No products yet. Add your first product.
                </td>
              </tr>
            ) : (
              products.map((product) => (
                <tr key={product.id} className="border-b border-cream-100 last:border-0">
                  <td className="p-4 font-semibold text-maroon-900">{product.name}</td>
                  <td className="p-4 text-maroon-700">{product.category}</td>
                  <td className="p-4 font-semibold text-maroon-600">{formatCurrency(product.price)}</td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => handleToggleAvailability(product)}
                      className={`rounded-full px-3 py-1 text-xs font-bold ${
                        product.is_available
                          ? "bg-green-100 text-green-700"
                          : "bg-maroon-100 text-maroon-600"
                      }`}
                    >
                      {product.is_available ? "Available" : "Unavailable"}
                    </button>
                  </td>
                  <td className="p-4">
                    <div className="flex gap-3">
                      <button
                        type="button"
                        onClick={() => openEditModal(product)}
                        className="font-semibold text-maroon-600 underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDelete(product)}
                        className="font-semibold text-maroon-500 underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <ProductFormModal
          product={editingProduct}
          onClose={() => setModalOpen(false)}
          onSubmit={handleSubmit}
          submitting={submitting}
        />
      )}
    </div>
  );
}
