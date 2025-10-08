// app/api/profile/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

// Shape your profile page expects (with safe defaults)
const withDefaults = (row: any) => ({
  id: row.id,
  name: row.name,
  email: row.email,
  role: row.role,
  // fields your page renders but don't exist in DB yet:
  phone: null as string | null,
  birthdate: null as string | null,
  pickups_finished: 0 as number | null,
  avatar_url: null as string | null,
});

export async function GET() {
  const jar = await cookies();
  const uid = jar.get("gr_uid")?.value;
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rows } = await pool.query(
    "SELECT id, name, email, role FROM users WHERE id = $1 LIMIT 1",
    [uid]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ user: withDefaults(rows[0]) });
}

export async function PATCH(req: NextRequest) {
  const jar = await cookies();
  const uid = jar.get("gr_uid")?.value;
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await req.json().catch(() => ({}));
  const nameRaw = typeof body.name === "string" ? body.name.trim() : "";

  if (!nameRaw) {
    return NextResponse.json({ error: "Only 'name' can be updated for now." }, { status: 400 });
  }

  const { rows } = await pool.query(
    "UPDATE users SET name = $1 WHERE id = $2 RETURNING id, name, email, role",
    [nameRaw, uid]
  );

  if (rows.length === 0) {
    return NextResponse.json({ error: "User not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true, user: withDefaults(rows[0]) });
}
