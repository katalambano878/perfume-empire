// Foreign-key map for nested embeds in the Postgres query builder.
// Generated from perfume-empire supabase/migrations (2026-02).

export interface FkEdge {
  column: string;
  foreignTable: string;
  foreignColumn: string;
}

export const JSONB_COLUMNS: Record<string, Set<string>> = {
  profiles: new Set(["preferences"]),
  addresses: new Set(["metadata"]),
  store_settings: new Set(["value"]),
  site_settings: new Set(["value"]),
  audit_logs: new Set(["details"]),
  categories: new Set(["metadata"]),
  products: new Set(["options", "metadata"]),
  product_variants: new Set(["metadata"]),
  coupons: new Set(["metadata"]),
  orders: new Set(["shipping_address", "billing_address", "metadata"]),
  order_items: new Set(["metadata"]),
  notifications: new Set(["data"]),
  cms_content: new Set(["metadata"]),
  customers: new Set(["default_address"]),
  support_tickets: new Set(["metadata"]),
  support_messages: new Set(["attachments"]),
};

export const FK_MAP: Record<string, FkEdge[]> = {
  addresses: [
    { column: "user_id", foreignTable: "profiles", foreignColumn: "id" },
  ],
  cart_items: [
    { column: "product_id", foreignTable: "products", foreignColumn: "id" },
    { column: "variant_id", foreignTable: "product_variants", foreignColumn: "id" },
  ],
  categories: [
    { column: "parent_id", foreignTable: "categories", foreignColumn: "id" },
  ],
  customers: [
    { column: "user_id", foreignTable: "profiles", foreignColumn: "id" },
  ],
  navigation_items: [
    { column: "menu_id", foreignTable: "navigation_menus", foreignColumn: "id" },
    { column: "parent_id", foreignTable: "navigation_items", foreignColumn: "id" },
  ],
  order_items: [
    { column: "order_id", foreignTable: "orders", foreignColumn: "id" },
    { column: "product_id", foreignTable: "products", foreignColumn: "id" },
    { column: "variant_id", foreignTable: "product_variants", foreignColumn: "id" },
  ],
  order_status_history: [
    { column: "order_id", foreignTable: "orders", foreignColumn: "id" },
  ],
  product_images: [
    { column: "product_id", foreignTable: "products", foreignColumn: "id" },
  ],
  product_variants: [
    { column: "product_id", foreignTable: "products", foreignColumn: "id" },
  ],
  products: [
    { column: "category_id", foreignTable: "categories", foreignColumn: "id" },
  ],
  return_items: [
    { column: "return_request_id", foreignTable: "return_requests", foreignColumn: "id" },
    { column: "order_item_id", foreignTable: "order_items", foreignColumn: "id" },
  ],
  return_requests: [
    { column: "order_id", foreignTable: "orders", foreignColumn: "id" },
  ],
  review_images: [
    { column: "review_id", foreignTable: "reviews", foreignColumn: "id" },
  ],
  reviews: [
    { column: "product_id", foreignTable: "products", foreignColumn: "id" },
  ],
  support_messages: [
    { column: "ticket_id", foreignTable: "support_tickets", foreignColumn: "id" },
  ],
  wishlist_items: [
    { column: "product_id", foreignTable: "products", foreignColumn: "id" },
  ],
};
