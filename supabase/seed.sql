-- IT415 POS Kiosk — initial product catalog
-- Safe to re-run: skips products that already exist by name.

insert into products (name, description, price, category, image_url, is_available)
select v.name, v.description, v.price, v.category, v.image_url, true
from (
  values
    ('Iced Coffee', 'Chilled espresso over ice with fresh milk.', 89.00, 'Coffee', 'https://placehold.co/400x300/f8ecd2/7f1f36?text=Iced+Coffee'),
    ('Hot Coffee', 'Freshly brewed classic hot coffee.', 79.00, 'Coffee', 'https://placehold.co/400x300/f8ecd2/7f1f36?text=Hot+Coffee'),
    ('Milk Tea', 'Creamy black tea with milk and pearls.', 99.00, 'Drinks', 'https://placehold.co/400x300/f8ecd2/7f1f36?text=Milk+Tea'),
    ('Fruit Tea', 'Refreshing iced tea blended with fruit syrup.', 95.00, 'Drinks', 'https://placehold.co/400x300/f8ecd2/7f1f36?text=Fruit+Tea'),
    ('Burger', 'Grilled beef patty with lettuce, tomato, and cheese.', 129.00, 'Meals', 'https://placehold.co/400x300/f8ecd2/7f1f36?text=Burger'),
    ('French Fries', 'Crispy golden fries, lightly salted.', 69.00, 'Snacks', 'https://placehold.co/400x300/f8ecd2/7f1f36?text=French+Fries'),
    ('Sandwich', 'Toasted sandwich with ham, cheese, and veggies.', 109.00, 'Meals', 'https://placehold.co/400x300/f8ecd2/7f1f36?text=Sandwich'),
    ('Donut', 'Classic glazed donut, baked fresh daily.', 49.00, 'Snacks', 'https://placehold.co/400x300/f8ecd2/7f1f36?text=Donut')
) as v(name, description, price, category, image_url)
where not exists (
  select 1 from products p where p.name = v.name
);
