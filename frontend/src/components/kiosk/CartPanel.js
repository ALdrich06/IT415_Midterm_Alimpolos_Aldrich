"use client";

import { formatCurrency } from "@/lib/format";
import { getCartTotal, getItemSubtotal } from "@/lib/cart";

export default function CartPanel({ cart, onIncrease, onDecrease, onRemove, onReviewOrder }) {
  const total = getCartTotal(cart);
  const isEmpty = cart.length === 0;

  return (
    <aside className="flex h-full flex-col rounded-2xl bg-white shadow-card">
      <div className="border-b border-cream-200 p-4">
        <h2 className="text-lg font-bold text-maroon-900">Current Order</h2>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {isEmpty ? (
          <p className="py-10 text-center text-sm text-maroon-700/70">
            Tap a product to add it to your order.
          </p>
        ) : (
          <ul className="flex flex-col gap-3">
            {cart.map((item) => (
              <li key={item.productId} className="rounded-xl bg-cream-50 p-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-maroon-900">{item.name}</p>
                    <p className="text-sm text-maroon-700/70">
                      {formatCurrency(item.unitPrice)} each
                    </p>
                  </div>
                  <p className="font-bold text-maroon-600">
                    {formatCurrency(getItemSubtotal(item))}
                  </p>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      aria-label={`Decrease quantity of ${item.name}`}
                      onClick={() => onDecrease(item.productId)}
                      className="tap-target flex h-10 w-10 items-center justify-center rounded-full bg-maroon-100 text-xl font-bold text-maroon-700 active:bg-maroon-200"
                    >
                      −
                    </button>
                    <span className="w-6 text-center text-lg font-semibold">{item.quantity}</span>
                    <button
                      type="button"
                      aria-label={`Increase quantity of ${item.name}`}
                      onClick={() => onIncrease(item.productId)}
                      className="tap-target flex h-10 w-10 items-center justify-center rounded-full bg-maroon-100 text-xl font-bold text-maroon-700 active:bg-maroon-200"
                    >
                      +
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => onRemove(item.productId)}
                    className="text-sm font-semibold text-maroon-500 underline underline-offset-2"
                  >
                    Remove
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div className="border-t border-cream-200 p-4">
        <div className="mb-3 flex items-center justify-between text-lg font-bold text-maroon-900">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
        <button
          type="button"
          disabled={isEmpty}
          onClick={onReviewOrder}
          className="tap-target w-full rounded-xl bg-maroon-600 py-4 text-lg font-bold text-cream-50 shadow-card transition disabled:cursor-not-allowed disabled:bg-maroon-200 disabled:text-maroon-500"
        >
          Review Order
        </button>
      </div>
    </aside>
  );
}
