import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/auth";
import { createStaffUser } from "@/lib/db/auth";
import { query } from "@/lib/db/pool";
import { STAFF_PERMISSIONS } from "@/lib/admin/commerce";

export const dynamic = "force-dynamic";

const ALLOWED = new Set(STAFF_PERMISSIONS.map((item) => item.id));

export async function GET(request: NextRequest) {
  const auth = await verifyAuth(request, { requireAdmin: true, requireOwner: true });
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, data: null, error: auth.error }, { status: 401 });
  }

  const { rows } = await query(
    `SELECT p.id, p.email, p.full_name, p.role, p.preferences, u.last_sign_in_at, u.created_at
     FROM profiles p
     JOIN auth.users u ON u.id = p.id
     WHERE p.role IN ('admin', 'staff') AND u.deleted_at IS NULL
     ORDER BY CASE WHEN p.role = 'admin' THEN 0 ELSE 1 END, p.full_name NULLS LAST`
  );

  return NextResponse.json({ success: true, data: rows, error: null });
}

export async function POST(request: NextRequest) {
  const auth = await verifyAuth(request, { requireAdmin: true, requireOwner: true });
  if (!auth.authenticated) {
    return NextResponse.json({ success: false, data: null, error: auth.error }, { status: 401 });
  }

  const body = await request.json().catch(() => ({}));
  const email = String(body.email || "").trim();
  const password = String(body.password || "");
  const fullName = String(body.fullName || body.full_name || "").trim();
  const permissions = Array.isArray(body.permissions)
    ? body.permissions.map(String).filter((id: string) => ALLOWED.has(id as never))
    : ["pos", "orders"];

  if (!fullName) {
    return NextResponse.json({ success: false, data: null, error: "Name is required" }, { status: 400 });
  }

  const created = await createStaffUser({ email, password, fullName, permissions });
  if (created.error || !created.id) {
    return NextResponse.json({ success: false, data: null, error: created.error }, { status: 400 });
  }

  await query(
    `INSERT INTO audit_logs (user_id, action, entity_type, entity_id, details)
     VALUES ($1, 'staff.created', 'profile', $2, $3::jsonb)`,
    [auth.user.id, created.id, JSON.stringify({ email, fullName, permissions })]
  ).catch(() => {});

  return NextResponse.json({ success: true, data: { id: created.id }, error: null });
}
