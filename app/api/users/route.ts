/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/api/users/route.ts
* Purpose:   List + Create users (Postgres)
*******************************************************/
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth";
import db from "@/lib/db";
import bcrypt from "bcryptjs";

/** Normalize db.query(...) for different wrappers */
function pickRows(result: any): any[] {
  if (!result) return [];
  if (Array.isArray(result?.rows)) return result.rows;
  if (Array.isArray(result)) return result;
  return [];
}
function pickFirstRow(result: any): any | null {
  const r = pickRows(result);
  return r[0] ?? null;
}

/* ==========================================================
   GET /api/users?q=...
   ========================================================== */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const q = (searchParams.get("q") || "").trim();

    const where = q
      ? `WHERE u.name ILIKE $1 OR u.email ILIKE $1 OR u.role ILIKE $1`
      : "";
    const params = q ? [`%${q}%`] : [];

    const raw = await (db as any).query(
      `
      SELECT
        u.id,
        u.name,
        u.email,
        u.role,
        u.created_at AS "createdAt",
        c.name       AS "createdByName",
        c.email      AS "createdByEmail"
      FROM users u
      LEFT JOIN users c ON c.id = u.created_by
      ${where}
      ORDER BY u.created_at DESC, u.name ASC
      `,
      params
    );

    const list = pickRows(raw);
    return NextResponse.json({ users: list });
  } catch (e) {
    console.error("GET /api/users error:", e);
    return NextResponse.json({ error: "Failed to load users" }, { status: 500 });
  }
}

/* ==========================================================
   POST /api/users  → Admin only
   ========================================================== */
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const creator = session.user as any;
    if (creator?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const body = await req.json();
    const { name, email, role, password, phone_no, birthday } = body || {};

    if (!name || !email || !role || !password) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    if (!["admin", "volunteer"].includes(role)) {
      return NextResponse.json({ error: "Invalid role" }, { status: 400 });
    }

    const password_hash = await bcrypt.hash(String(password), 10);

    const insert = await (db as any).query(
      `
      INSERT INTO users
        (name, email, role, password_hash, phone_no, birthday, created_by)
      VALUES ($1, $2, $3, $4, $5, $6, $7)
      RETURNING id
      `,
      [name, email, role, password_hash, phone_no ?? null, birthday ?? null, creator?.id ?? null]
    );

    const row = pickFirstRow(insert);

    return NextResponse.json(
      {
        ok: true,
        id: row?.id ?? null,
        message: "User created successfully",
      },
      { status: 201 }
    );
  } catch (e: any) {
    console.error("POST /api/users error:", e);
    const msg = e?.code === "23505" ? "Email already exists" : "Failed to create user";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}
