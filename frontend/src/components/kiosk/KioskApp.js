"use client";

import { useEffect, useRef, useState } from "react";
import toast from "react-hot-toast";
import ProductCatalog from "./ProductCatalog";
import OrderSummary from "./OrderSummary";
import PaymentSelect from "./PaymentSelect";
import PaymentCash from "./PaymentCash";
import PaymentQR from "./PaymentQR";
import PaymentCard from "./PaymentCard";
import PaymentSuccess from "./PaymentSuccess";
import Receipt from "./Receipt";
import { fetchProducts, createTransaction, ApiError } from "@/lib/api";
import { addItemToCart, changeItemQuantity, removeItemFromCart, getCartTotal } from "@/lib/cart";

const STAGES = {
  CATALOG: "catalog",
  SUMMARY: "summary",
  PAYMENT_SELECT: "payment-select",
  PAYMENT_CASH: "payment-cash",
  PAYMENT_QR: "payment-qr",
  PAYMENT_CARD: "payment-card",
  SUCCESS: "success",
  RECEIPT: "receipt",
};

export default function KioskApp() {
  const [products, setProducts] = useState([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [cart, setCart] = useState([]);
  const [stage, setStage] = useState(STAGES.CATALOG);
  const [paymentMethod, setPaymentMethod] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transaction, setTransaction] = useState(null);
  const submittingRef = useRef(false);

  useEffect(() => {
    let active = true;
    setLoadingProducts(true);
    fetchProducts()
      .then((data) => {
        if (active) setProducts(data.products || []);
      })
      .catch(() => {
        toast.error("Could not load products. Please check your connection.");
      })
      .finally(() => {
        if (active) setLoadingProducts(false);
      });
    return () => {
      active = false;
    };
  }, []);

  function handleAddToCart(product) {
    setCart((prev) => addItemToCart(prev, product));
    toast.success(`${product.name} added to order`);
  }

  function handleIncrease(productId) {
    setCart((prev) => changeItemQuantity(prev, productId, 1));
  }

  function handleDecrease(productId) {
    setCart((prev) => changeItemQuantity(prev, productId, -1));
  }

  function handleRemove(productId) {
    setCart((prev) => removeItemFromCart(prev, productId));
    toast("Item removed from order", { icon: "🗑️" });
  }

  function handleReviewOrder() {
    if (cart.length === 0) {
      toast.error("Your cart is empty. Please add at least one item.");
      return;
    }
    setStage(STAGES.SUMMARY);
  }

  function handleSelectPaymentMethod(method) {
    setPaymentMethod(method);
    if (method === "cash") setStage(STAGES.PAYMENT_CASH);
    if (method === "qr") setStage(STAGES.PAYMENT_QR);
    if (method === "card") setStage(STAGES.PAYMENT_CARD);
  }

  async function handleConfirmPayment({ amountPaid, changeAmount }) {
    if (submittingRef.current) return; // guard against double submission
    submittingRef.current = true;
    setIsProcessing(true);
    try {
      const payload = {
        paymentMethod,
        amountPaid,
        items: cart.map((item) => ({ productId: item.productId, quantity: item.quantity })),
      };
      const result = await createTransaction(payload);
      setTransaction(result.transaction);
      setStage(STAGES.SUCCESS);
    } catch (err) {
      const message =
        err instanceof ApiError ? err.message : "Failed to process payment. Please try again.";
      toast.error(message);
    } finally {
      setIsProcessing(false);
      submittingRef.current = false;
    }
  }

  function handleNewTransaction() {
    setCart([]);
    setPaymentMethod(null);
    setTransaction(null);
    setIsProcessing(false);
    setStage(STAGES.CATALOG);
  }

  const total = getCartTotal(cart);

  return (
    <div className="mx-auto h-screen max-w-7xl p-4 sm:p-6">
      {stage === STAGES.CATALOG && (
        <ProductCatalog
          products={products}
          loading={loadingProducts}
          cart={cart}
          onAdd={handleAddToCart}
          onIncrease={handleIncrease}
          onDecrease={handleDecrease}
          onRemove={handleRemove}
          onReviewOrder={handleReviewOrder}
        />
      )}

      {stage === STAGES.SUMMARY && (
        <OrderSummary
          cart={cart}
          onBack={() => setStage(STAGES.CATALOG)}
          onContinue={() => setStage(STAGES.PAYMENT_SELECT)}
        />
      )}

      {stage === STAGES.PAYMENT_SELECT && (
        <PaymentSelect
          total={total}
          onSelect={handleSelectPaymentMethod}
          onBack={() => setStage(STAGES.SUMMARY)}
        />
      )}

      {stage === STAGES.PAYMENT_CASH && (
        <PaymentCash
          total={total}
          onBack={() => setStage(STAGES.PAYMENT_SELECT)}
          onConfirm={handleConfirmPayment}
          isProcessing={isProcessing}
        />
      )}

      {stage === STAGES.PAYMENT_QR && (
        <PaymentQR
          total={total}
          onBack={() => setStage(STAGES.PAYMENT_SELECT)}
          onConfirm={handleConfirmPayment}
          isProcessing={isProcessing}
        />
      )}

      {stage === STAGES.PAYMENT_CARD && (
        <PaymentCard
          total={total}
          onBack={() => setStage(STAGES.PAYMENT_SELECT)}
          onConfirm={handleConfirmPayment}
          isProcessing={isProcessing}
        />
      )}

      {stage === STAGES.SUCCESS && transaction && (
        <PaymentSuccess
          transaction={transaction}
          onViewReceipt={() => setStage(STAGES.RECEIPT)}
          onNewTransaction={handleNewTransaction}
        />
      )}

      {stage === STAGES.RECEIPT && transaction && (
        <Receipt
          transaction={transaction}
          onBack={() => setStage(STAGES.SUCCESS)}
          onNewTransaction={handleNewTransaction}
        />
      )}
    </div>
  );
}
