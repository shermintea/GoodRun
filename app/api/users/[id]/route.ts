/*******************************************************
* File:      app/api/users/[id]/route.ts
* Purpose:   Admin-only endpoint: update (PATCH) & delete (DELETE)
*******************************************************/
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const UpdateUserSchema = z.object({
  name: z.string().min(1).optional(),
  role: z.enum(["admin", "volunteer"]).optional(),
  // optional password change
  password: z.string().min(3).optional(),
});

async function assertAdmin() {
  const session = await getServerSession(authOptions);
  return !!session && (session.user as any)?.role === "admin";
}

export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = UpdateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, role, password } = parsed.data;

  try {
    // build dynamic update
    const sets: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (name !== undefined) {
      sets.push(`name = $${idx++}`);
      values.push(name);
    }
    if (role !== undefined) {
      sets.push(`role = $${idx++}`);
      values.push(role);
    }
    if (password !== undefined) {
      const password_hash = await bcrypt.hash(password, 10);
      sets.push(`password_hash = $${idx++}`);
      values.push(password_hash);
    }

    if (sets.length === 0) {
      return NextResponse.json({ ok: true, updated: 0 }); // nothing to do
    }

    values.push(id);
    const q = `UPDATE users SET ${sets.join(", ")}, updated_at = NOW() WHERE id = $${idx} RETURNING id, name, email, role, created_at, updated_at`;
    const { rows } = await pool.query(q, values);

    if (rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json({ ok: true, user: rows[0] });
  } catch (err) {
    console.error("[PATCH /api/users/:id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function DELETE(_req: NextRequest, { params }: { params: { id: string } }) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const id = Number(params.id);
  if (!Number.isInteger(id)) {
    return NextResponse.json({ error: "Invalid user id" }, { status: 400 });
  }

  try {
    const { rowCount } = await pool.query("DELETE FROM users WHERE id = $1", [id]);
    if (!rowCount) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[DELETE /api/users/:id] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
