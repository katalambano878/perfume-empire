import { createClient } from "./query-builder";

/** Server-only Postgres client (node-pg query builder). */
export const db = createClient();
