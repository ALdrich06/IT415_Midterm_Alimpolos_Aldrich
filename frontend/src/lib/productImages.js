const catalogImages = {
  "iced coffee": "/products/iced-coffee.png",
  "hot coffee": "/products/hot-coffee.png",
  "milk tea": "/products/milk-tea.png",
  "fruit tea": "/products/fruit-tea.png",
  burger: "/products/burger.png",
  "french fries": "/products/french-fries.png",
  sandwich: "/products/sandwich.png",
  donut: "/products/donut.png",
};

export function getProductImage(product) {
  const imageUrl = product.image_url?.trim();
  // Existing seeded rows still contain placeholders. Keep custom admin images.
  if (imageUrl && !/^https?:\/\/placehold\.co\//i.test(imageUrl)) return imageUrl;
  return catalogImages[product.name?.trim().toLowerCase()] ||
    "https://placehold.co/400x300/f8ecd2/7f1f36?text=Product";
}
