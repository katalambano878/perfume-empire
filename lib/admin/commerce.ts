export const STAFF_PERMISSIONS = [
  { id: "pos", label: "Point of sale" },
  { id: "orders", label: "Orders" },
  { id: "products", label: "Products and categories" },
  { id: "customers", label: "Customers" },
  { id: "inventory", label: "Inventory" },
  { id: "end_of_day", label: "End of day" },
] as const;

export type StaffPermission = (typeof STAFF_PERMISSIONS)[number]["id"];

export function orderChannel(order: { metadata?: any; shipping_address?: any }): "pos" | "online" {
  const meta = order?.metadata || {};
  const address = order?.shipping_address || {};
  if (meta.channel === "pos" || meta.pos_sale === true || address.pos_sale === true) return "pos";
  return "online";
}

export function channelLabel(channel: "pos" | "online"): string {
  return channel === "pos" ? "Shop counter" : "Online";
}
