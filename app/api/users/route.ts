/*******************************************************
* File:      app/api/users/route.ts
* Purpose:   Admin-only endpoint: list users (GET) & create user (POST)
*******************************************************/
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";
import { z } from "zod";

const CreateUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Invalid email"),
  role: z.enum(["admin", "volunteer"]),
  password: z.string().min(3, "Password must be at least 3 chars"),
});

async function assertAdmin() {
  const session = await getServerSession(authOptions);
  return !!session && (session.user as any)?.role === "admin";
}

export async function GET() {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  try {
    const { rows } = await pool.query(
      `SELECT id, name, email, role, created_at
         FROM users
         ORDER BY created_at DESC
         LIMIT 500`
    );
    return NextResponse.json({ ok: true, users: rows });
  } catch (err) {
    console.error("[GET /api/users] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  if (!(await assertAdmin())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = CreateUserSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { name, email, role, password } = parsed.data;

  try {
    const exists = await pool.query("SELECT 1 FROM users WHERE email = $1", [email]);
    if (exists.rowCount && exists.rowCount > 0) {
      return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    }

    const password_hash = await bcrypt.hash(password, 10);

    const { rows } = await pool.query(
      `INSERT INTO users (name, email, role, password_hash)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, created_at`,
      [name, email, role, password_hash]
    );

    return NextResponse.json({ ok: true, user: rows[0] }, { status: 201 });
  } catch (err) {
    console.error("[POST /api/users] error:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
