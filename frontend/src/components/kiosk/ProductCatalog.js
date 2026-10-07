"use client";

import { useMemo, useState } from "react";
import ProductCard from "./ProductCard";
import CartPanel from "./CartPanel";
import { formatCurrency } from "@/lib/format";
import { getCartTotal, getCartItemCount } from "@/lib/cart";

export default function ProductCatalog({
  products,
  loading,
  cart,
  onAdd,
  onIncrease,
  onDecrease,
  onRemove,
  onReviewOrder,
}) {
  const [activeCategory, setActiveCategory] = useState("All");

  const categories = useMemo(() => {
    const unique = Array.from(new Set(products.map((p) => p.category))).filter(Boolean);
    return ["All", ...unique];
  }, [products]);

  const visibleProducts = useMemo(() => {
    if (activeCategory === "All") return products;
    return products.filter((p) => p.category === activeCategory);
  }, [products, activeCategory]);

  const total = getCartTotal(cart);
  const itemCount = getCartItemCount(cart);

  return (
    <div className="grid h-full grid-cols-1 gap-6 pb-24 md:grid-cols-[1fr_340px] md:pb-0">
      <section className="flex flex-col gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-maroon-900">Brew &amp; Bite Kiosk</h1>
          <p className="text-maroon-700/80">Tap a product to add it to your order.</p>
        </div>

        <div className="flex flex-wrap gap-2">
          {categories.map((category) => (
            <button
              key={category}
              type="button"
              onClick={() => setActiveCategory(category)}
              className={`tap-target rounded-full px-5 py-2 text-sm font-semibold transition ${
                activeCategory === category
                  ? "bg-maroon-600 text-cream-50"
                  : "bg-white text-maroon-700 shadow-card"
              }`}
            >
              {category}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="h-56 animate-pulse rounded-2xl bg-white/70" />
            ))}
          </div>
        ) : visibleProducts.length === 0 ? (
          <p className="py-16 text-center text-maroon-700/70">No products available right now.</p>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
            {visibleProducts.map((product) => (
              <ProductCard key={product.id} product={product} onAdd={onAdd} />
            ))}
          </div>
        )}
      </section>

      <div className="hidden md:block">
        <CartPanel
          cart={cart}
          onIncrease={onIncrease}
          onDecrease={onDecrease}
          onRemove={onRemove}
          onReviewOrder={onReviewOrder}
        />
      </div>

      {itemCount > 0 && (
        <div className="no-print fixed inset-x-0 bottom-0 z-20 flex items-center justify-between gap-4 bg-maroon-600 p-4 shadow-card-hover md:hidden">
          <div className="text-cream-50">
            <p className="text-sm">{itemCount} item(s)</p>
            <p className="text-xl font-extrabold">{formatCurrency(total)}</p>
          </div>
          <button
            type="button"
            onClick={onReviewOrder}
            className="tap-target rounded-xl bg-cream-50 px-6 py-3 text-lg font-bold text-maroon-700"
          >
            Review Order
          </button>
        </div>
      )}
    </div>
  );
}
