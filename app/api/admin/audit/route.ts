import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { query } from "@/lib/db/pool";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request, { requireAdmin: true, requireOwner: true });
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, data: null, error: auth.error }, { status: 401 });
  }

  const { rows } = await query(
    `SELECT a.id, a.action, a.entity_type, a.entity_id, a.details, a.created_at,
            p.email AS actor_email, p.full_name AS actor_name, p.role AS actor_role
     FROM audit_logs a
     LEFT JOIN profiles p ON p.id = a.user_id
     ORDER BY a.created_at DESC
     LIMIT 200`
  );
  return NextResponse.json({ success: true, data: rows, error: null });
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request, { requireAdmin: true });
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, data: null, error: auth.error }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const action = String(body.action || "").slice(0, 80);
  const entityType = String(body.entity_type || body.entityType || "session").slice(0, 40);
  if (!action) {
    return NextResponse.json({ success: false, data: null, error: "Action is required" }, { status: 400 });
  }

  await query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
     VALUES ($1, $2, $3, $4, $5::jsonb)`,
    [
      auth.user.id,
      action,
      entityType,
      body.entity_id || null,
      JSON.stringify(body.details || {}),
    ]
  );

  return NextResponse.json({ success: true, data: { ok: true }, error: null });
}
