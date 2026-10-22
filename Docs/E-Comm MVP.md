# E-Commerce MVP Flow

This note explains how the current Project Scale hot/cold data idea can be mapped into a simple e-commerce MVP simulation.

---

## 1. Why `item_key` Exists If We Already Have `id`

You are right that `id` can be indexed and used for lookup:

```text
GET /items/1
GET /items/2
```

But `item_key` serves a different purpose.

`id` is database/internal identity:

```text
1
2
3
```

`item_key` is business/readable identity:

```text
iphone_16_pro
samsung_s24_ultra
nike_air_zoom
```

Why `item_key` is useful:

| `id` | `item_key` |
|---|---|
| Internal DB identity | Business/product identity |
| Auto-generated | Created from product/stock/SKU logic |
| Can change between environments | Can stay stable across seed/dev/prod |
| Not readable | Readable |
| Good for joins | Good for cache keys/API testing |

For Project Scale, `item_key` is mainly useful for Redis/cache simulation:

```text
hot:iphone_16_pro
hot:samsung_s24_ultra
```

That is easier than:

```text
hot:1
hot:2
```

If readable/cache keys are not needed, then `id` alone is enough.

Suggested direction:

```text
Keep id as primary key.
Keep item_key as unique SKU/product key.
```

Think of `item_key` like a simple SKU.

---

## 2. Problem With Current `hot_items` Table

Current table:

```sql
id
item_key
user_id
value
updated_at
```

For products, `user_id` does not make much sense because an iPhone product does not belong to one user. It belongs to the platform/admin/seller.

So for now, either use:

```text
uploaded_by / created_by admin user
```

or remove `user_id`.

Better naming:

```sql
created_by BIGINT
```

instead of:

```sql
user_id
```

Because this product was created by admin, not owned by buyer.

---

## 3. Product List Page

When user opens:

```text
GET /products
GET /products?category=smartphones
```

The list should show only summary data.

For iPhone 16 Pro, product card/list data can show:

```text
productId
itemKey
name
brand
category
thumbnailUrl optional
originalPrice
discountPrice
discountPercent
ratingAverage
ratingCount
stockStatus
deliveryText
shortDescription
```

Example:

```json
{
  "id": 1,
  "itemKey": "iphone_16_pro",
  "name": "iPhone 16 Pro",
  "brand": "Apple",
  "category": "Smartphones",
  "originalPrice": 129900,
  "discountPrice": 119900,
  "discountPercent": 8,
  "ratingAverage": 4.7,
  "ratingCount": 18422,
  "stockStatus": "IN_STOCK",
  "deliveryText": "Free delivery by tomorrow",
  "shortDescription": "A18 Pro chip, 48MP camera, Titanium design"
}
```

Do not send full description/specifications in list API.

---

## 4. Product Detail Page

When user clicks product:

```text
GET /products/{id}
```

or:

```text
GET /products/{itemKey}
```

Then show full details:

```text
id
itemKey
name
brand
category
originalPrice
discountPrice
discountPercent
ratingAverage
ratingCount
stockCount
description
features
specifications
warranty
sellerInfo
returnPolicy
deliveryOptions
```

Example extra fields:

```json
{
  "description": "iPhone 16 Pro with A18 Pro chip...",
  "features": [
    "A18 Pro chip",
    "48MP Fusion camera",
    "Titanium body",
    "120Hz ProMotion display"
  ],
  "specifications": {
    "display": "6.3 inch OLED",
    "storage": "128GB",
    "processor": "A18 Pro",
    "camera": "48MP + 12MP + 12MP",
    "battery": "Up to 27 hours video playback"
  },
  "returnPolicy": "7 days replacement",
  "warranty": "1 year manufacturer warranty"
}
```

This page has:

```text
Add to Cart
Buy Now
```

---

## 5. Cart Page

Cart should not show full product description.

It should show:

```text
productId
itemKey
name
thumbnailUrl optional
discountPrice
originalPrice
quantity
subtotal
stockStatus
deliveryText
remove option
increase/decrease quantity
```

Example:

```json
{
  "items": [
    {
      "productId": 1,
      "itemKey": "iphone_16_pro",
      "name": "iPhone 16 Pro",
      "price": 119900,
      "quantity": 2,
      "subtotal": 239800,
      "stockStatus": "IN_STOCK"
    }
  ],
  "cartTotal": 239800
}
```

---

## 6. Buy Now vs Cart Checkout

| Action | Meaning |
|---|---|
| Add to Cart | Product added to cart |
| Proceed to Buy from cart | Buy all cart items |
| Buy Now from product detail | Buy only that one product |

APIs can be:

```text
POST /cart/items
GET /cart
PATCH /cart/items/{productId}
DELETE /cart/items/{productId}

POST /orders/checkout-cart
POST /orders/buy-now
```

---

## 7. Order Status Flow

Current order should have four stages:

```text
PLACED
PACKED
SHIPPED
DELIVERED
```

Admin updates status:

```text
PATCH /admin/orders/{orderId}/status
```

When status becomes:

```text
DELIVERED
```

Then it should move out of current orders and appear in order history.

Actually, in DB, do not physically move it. Keep one order record and filter it:

```text
Current orders = orders where status != DELIVERED
Order history = orders where status = DELIVERED
```

Even if stored in `cold_items`, follow the same logic:

```text
type = ORDER
payload.status != DELIVERED -> current orders
payload.status = DELIVERED -> order history
```

---

## 8. Better Table Direction

For clean design, eventually create separate tables:

```sql
products
carts
cart_items
orders
order_items
```

But for the current simulation, you can continue with:

```text
hot_items = products
cold_items = cart/orders/profile/address
```

Rename conceptually:

```text
hot_items.value = product JSON
cold_items.payload = cart/order/profile JSON
```

---

## Final Clean Flow

```text
Login
 -> GET /products?category=smartphones
 -> GET /products/iphone_16_pro
 -> Add to Cart OR Buy Now

If Add to Cart:
 -> POST /cart/items
 -> GET /cart
 -> increase/decrease quantity
 -> POST /orders/checkout-cart

If Buy Now:
 -> POST /orders/buy-now

After purchase:
 -> order status = PLACED
 -> GET /orders/current shows it

Admin:
 -> PATCH /admin/orders/{orderId}/status
 -> PLACED -> PACKED -> SHIPPED -> DELIVERED

After delivered:
 -> removed from current orders
 -> visible in order history
```

This is a good MVP e-commerce simulation flow. Keep it this clean first.
