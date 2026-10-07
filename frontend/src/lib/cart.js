export function addItemToCart(cart, product) {
  const existing = cart.find((item) => item.productId === product.id);
  if (existing) {
    return cart.map((item) =>
      item.productId === product.id ? { ...item, quantity: item.quantity + 1 } : item
    );
  }
  return [
    ...cart,
    {
      productId: product.id,
      name: product.name,
      unitPrice: Number(product.price),
      quantity: 1,
    },
  ];
}

export function changeItemQuantity(cart, productId, delta) {
  return cart
    .map((item) =>
      item.productId === productId
        ? { ...item, quantity: Math.max(0, item.quantity + delta) }
        : item
    )
    .filter((item) => item.quantity > 0);
}

export function removeItemFromCart(cart, productId) {
  return cart.filter((item) => item.productId !== productId);
}

export function getItemSubtotal(item) {
  return item.unitPrice * item.quantity;
}

export function getCartTotal(cart) {
  return cart.reduce((sum, item) => sum + getItemSubtotal(item), 0);
}

export function getCartItemCount(cart) {
  return cart.reduce((sum, item) => sum + item.quantity, 0);
}
