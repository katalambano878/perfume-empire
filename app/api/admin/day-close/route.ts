import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { query } from "@/lib/db/pool";
import { orderChannel } from "@/lib/admin/commerce";

export const dynamic = "force-dynamic";

function todayKey() {
  return new Date().toLocaleDateString("en-CA", { timeZone: "Africa/Accra" });
}

async function canCloseDay(userId: string, role?: string) {
  if (role === "admin") return true;
  const { rows } = await query<{ preferences: { permissions?: string[] } }>(
    `SELECT preferences FROM profiles WHERE id = $1`,
    [userId]
  );
  return (rows[0]?.preferences?.permissions || []).includes("end_of_day");
}

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request, { requireAdmin: true });
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, data: null, error: auth.error }, { status: 401 });
  }

  const date = request.nextUrl.searchParams.get("date") || todayKey();
  const { rows: orders } = await query(
    `SELECT id, order_number, total, payment_status, payment_method, metadata, created_at, email
     FROM orders
     WHERE (created_at AT TIME ZONE 'Africa/Accra')::date = $1::date
     ORDER BY created_at DESC`,
    [date]
  );

  const paid = orders.filter((order) => order.payment_status === "paid");
  const summary = paid.reduce(
    (acc, order) => {
      const channel = orderChannel(order);
      const total = Number(order.total) || 0;
      const method = String(order.payment_method || "other");
      acc.orderCount += 1;
      acc.total += total;
      acc[channel] += total;
      acc.byMethod[method] = (acc.byMethod[method] || 0) + total;
      const seller = order.metadata?.sold_by?.name || order.metadata?.sold_by?.email || (channel === "online" ? "Website" : "Counter");
      acc.bySeller[seller] = (acc.bySeller[seller] || 0) + total;
      return acc;
    },
    {
      orderCount: 0,
      total: 0,
      pos: 0,
      online: 0,
      byMethod: {} as Record<string, number>,
      bySeller: {} as Record<string, number>,
    }
  );

  const { rows: closes } = await query(
    `SELECT * FROM day_closes WHERE business_date = $1::date LIMIT 1`,
    [date]
  ).catch(() => ({ rows: [] as any[] }));

  return NextResponse.json({
    success: true,
    data: { date, summary, orders: paid, close: closes[0] || null },
    error: null,
  });
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request, { requireAdmin: true });
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, data: null, error: auth.error }, { status: 401 });
  }
  if (!(await canCloseDay(auth.user.id, auth.role))) {
    return NextResponse.json({ success: false, data: null, error: "You cannot close the day" }, { status: 403 });
  }

  const body = await request.json().catch(() => ({}));
  const date = String(body.date || todayKey());
  const notes = String(body.notes || "").slice(0, 500);
  const summary = body.summary || {};

  const { rows } = await query(
    `INSERT INTO day_closes (
       business_date, closed_at, closed_by, pos_total, online_total,
       cash_total, card_total, momo_total, order_count, notes, summary
     ) VALUES (
       $1::date, now(), $2, $3, $4, $5, $6, $7, $8, $9, $10::jsonb
     )
     ON CONFLICT (business_date) DO UPDATE SET
       closed_at = now(),
       closed_by = EXCLUDED.closed_by,
       pos_total = EXCLUDED.pos_total,
       online_total = EXCLUDED.online_total,
       cash_total = EXCLUDED.cash_total,
       card_total = EXCLUDED.card_total,
       momo_total = EXCLUDED.momo_total,
       order_count = EXCLUDED.order_count,
       notes = EXCLUDED.notes,
       summary = EXCLUDED.summary
     RETURNING *`,
    [
      date,
      auth.user.id,
      Number(summary.pos) || 0,
      Number(summary.online) || 0,
      Number(summary.byMethod?.cash) || 0,
      Number(summary.byMethod?.card) || 0,
      Number(summary.byMethod?.moolre || summary.byMethod?.momo) || 0,
      Number(summary.orderCount) || 0,
      notes,
      JSON.stringify(summary),
    ]
  );

  await query(
    `INSERT INTO audit_logs (user_id, action, entity_type, details)
     VALUES ($1, 'day.closed', 'day_close', $2::jsonb)`,
    [auth.user.id, JSON.stringify({ date, total: summary.total || 0 })]
  ).catch(() => {});

  return NextResponse.json({ success: true, data: rows[0], error: null });
}
