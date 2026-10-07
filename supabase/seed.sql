-- IT415 POS Kiosk — initial product catalog
-- Safe to re-run: skips products that already exist by name.

insert into products (name, description, price, category, image_url, is_available)
select v.name, v.description, v.price, v.category, v.image_url, true
from (
  values
    ('Iced Coffee', 'Chilled espresso over ice with fresh milk.', 89.00, 'Coffee', '/products/iced-coffee.png'),
    ('Hot Coffee', 'Freshly brewed classic hot coffee.', 79.00, 'Coffee', '/products/hot-coffee.png'),
    ('Milk Tea', 'Creamy black tea with milk and pearls.', 99.00, 'Drinks', '/products/milk-tea.png'),
    ('Fruit Tea', 'Refreshing iced tea blended with fruit syrup.', 95.00, 'Drinks', '/products/fruit-tea.png'),
    ('Burger', 'Grilled beef patty with lettuce, tomato, and cheese.', 129.00, 'Meals', '/products/burger.png'),
    ('French Fries', 'Crispy golden fries, lightly salted.', 69.00, 'Snacks', '/products/french-fries.png'),
    ('Sandwich', 'Toasted sandwich with ham, cheese, and veggies.', 109.00, 'Meals', '/products/sandwich.png'),
    ('Donut', 'Classic glazed donut, baked fresh daily.', 49.00, 'Snacks', '/products/donut.png')
) as v(name, description, price, category, image_url)
where not exists (
  select 1 from products p where p.name = v.name
);
