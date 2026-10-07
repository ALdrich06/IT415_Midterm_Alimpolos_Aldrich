"use client";

import { formatCurrency } from "@/lib/format";
import { getCartTotal, getItemSubtotal } from "@/lib/cart";

export default function OrderSummary({ cart, onBack, onContinue }) {
  const total = getCartTotal(cart);

  return (
    <div className="mx-auto flex h-full max-w-2xl flex-col gap-6">
      <h1 className="text-3xl font-extrabold text-maroon-900">Review Your Order</h1>

      <div className="flex-1 overflow-y-auto rounded-2xl bg-white p-4 shadow-card">
        <ul className="divide-y divide-cream-200">
          {cart.map((item) => (
            <li key={item.productId} className="flex items-center justify-between py-3">
              <div>
                <p className="font-semibold text-maroon-900">{item.name}</p>
                <p className="text-sm text-maroon-700/70">
                  {formatCurrency(item.unitPrice)} × {item.quantity}
                </p>
              </div>
              <p className="text-lg font-bold text-maroon-600">
                {formatCurrency(getItemSubtotal(item))}
              </p>
            </li>
          ))}
        </ul>
      </div>

      <div className="rounded-2xl bg-white p-4 shadow-card">
        <div className="flex items-center justify-between text-2xl font-extrabold text-maroon-900">
          <span>Total</span>
          <span>{formatCurrency(total)}</span>
        </div>
      </div>

      <div className="flex gap-4">
        <button
          type="button"
          onClick={onBack}
          className="tap-target flex-1 rounded-xl bg-white py-4 text-lg font-bold text-maroon-700 shadow-card"
        >
          Back / Modify Order
        </button>
        <button
          type="button"
          onClick={onContinue}
          className="tap-target flex-1 rounded-xl bg-maroon-600 py-4 text-lg font-bold text-cream-50 shadow-card"
        >
          Continue to Payment
        </button>
      </div>
    </div>
  );
}
