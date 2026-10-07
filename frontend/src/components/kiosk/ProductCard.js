"use client";

import { formatCurrency } from "@/lib/format";
import { getProductImage } from "@/lib/productImages";

export default function ProductCard({ product, onAdd }) {
  return (
    <button
      type="button"
      onClick={() => onAdd(product)}
      className="tap-target flex flex-col overflow-hidden rounded-2xl bg-white shadow-card transition hover:shadow-card-hover active:scale-[0.98] text-left"
    >
      <div className="relative h-32 w-full bg-cream-200 sm:h-40">
        <img
          src={getProductImage(product)}
          alt={product.name}
          className="h-full w-full object-contain"
          loading="lazy"
        />
      </div>
      <div className="flex flex-1 flex-col gap-1 p-4">
        <span className="text-xs font-semibold uppercase tracking-wide text-maroon-500">
          {product.category}
        </span>
        <h3 className="text-lg font-bold text-maroon-900 leading-snug">{product.name}</h3>
        {product.description && (
          <p className="line-clamp-2 text-sm text-maroon-700/80">{product.description}</p>
        )}
        <div className="mt-auto flex items-center justify-between pt-2">
          <span className="text-xl font-extrabold text-maroon-600">
            {formatCurrency(product.price)}
          </span>
          <span className="rounded-full bg-maroon-600 px-3 py-1 text-sm font-semibold text-cream-50">
            Add +
          </span>
        </div>
      </div>
    </button>
  );
}
