/*******************************************************
* File: app/api/users/[id]/route.ts
* Purpose: View / Update / Delete a single user (Postgres)
*******************************************************/
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth";
import db from "@/lib/db";

const notAuth  = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const forbidden= () => NextResponse.json({ error: "Forbidden" }, { status: 403 });
const badId    = () => NextResponse.json({ error: "Invalid id" }, { status: 400 });

function pickRows(result: any): any[] {
  if (!result) return [];
  if (Array.isArray(result?.rows)) return result.rows;
  if (Array.isArray(result)) return result;
  return [];
}
function pickFirstRow(result: any): any | null {
  const rows = pickRows(result);
  return rows[0] ?? null;
}

// ---------- GET /api/users/:id ----------
export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const { id: idStr } = await ctx.params;
    const id = Number(idStr);
    if (!Number.isFinite(id)) return badId();

    const raw = await (db as any).query(
      `
      SELECT id, name, email, role, phone_no, birthday
      FROM users
      WHERE id = $1
      `,
      [id]
    );

    const user = pickFirstRow(raw);
    if (!user) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ user });
  } catch (e) {
    console.error("GET /api/users/:id error:", e);
    return NextResponse.json({ error: "Failed to load user" }, { status: 500 });
  }
}

// ---------- PATCH /api/users/:id ----------
export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return notAuth();
    if ((session.user as any)?.role !== "admin") return forbidden();

    const { id: idStr } = await ctx.params;
    const id = Number(idStr);
    if (!Number.isFinite(id)) return badId();

    const body = await req.json();
    const { name, email, role, phone_no, birthday } = body || {};

    // Build dynamic update
    const sets: string[] = [];
    const vals: any[] = [];
    let n = 1;
    const add = (frag: string, v: any) => { sets.push(`${frag} $${n++}`); vals.push(v); };

    if (name !== undefined)      add("name =", name);
    if (email !== undefined)     add("email =", email);
    if (role !== undefined)      add("role =", role);
    if (phone_no !== undefined)  add("phone_no =", phone_no || null);
    if (birthday !== undefined)  add("birthday =", birthday || null);

    if (sets.length === 0) {
      return NextResponse.json({ error: "No changes provided" }, { status: 400 });
    }

    const sql = `UPDATE users SET ${sets.join(", ")} WHERE id = $${n}`;
    vals.push(id);
    await (db as any).query(sql, vals);

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("PATCH /api/users/:id error:", e);
    const msg = e?.code === "23505" ? "Email already exists" : "Failed to update user";
    return NextResponse.json({ error: msg }, { status: 400 });
  }
}

// ---------- DELETE /api/users/:id ----------
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return notAuth();
    if ((session.user as any)?.role !== "admin") return forbidden();

    const myId = Number((session.user as any)?.id);
    const { id: idStr } = await ctx.params;
    const id = Number(idStr);
    if (!Number.isFinite(id)) return badId();
    if (id === myId) {
      return NextResponse.json({ error: "You cannot delete your own account" }, { status: 400 });
    }

    const existRaw = await (db as any).query(`SELECT id FROM users WHERE id = $1`, [id]);
    if (pickRows(existRaw).length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await (db as any).query(`DELETE FROM users WHERE id = $1`, [id]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/users/:id error:", e);
    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
