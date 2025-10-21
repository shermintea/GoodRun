/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/api/users/[id]/route.ts
* Author:    IT Project – Medical Pantry – Group 17
* Date:      21-10-2025
* Version:   2.3
* Purpose:   View / Update / Delete a single user (Postgres)
*            - GET:    return a single user by id (no auth required)
*            - PATCH:  admin-only partial update with dynamic SET clause
*            - DELETE: admin-only; block only if user has ACTIVE jobs
*                      (progress_stage IN ['reserved','in_delivery']);
*                      otherwise unlink all jobs (SET assigned_to = NULL)
*                      and delete the user in a single transaction
*******************************************************/

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth";
import db from "@/lib/db";

const notAuth   = () => NextResponse.json({ error: "Unauthorized" }, { status: 401 });
const forbidden = () => NextResponse.json({ error: "Forbidden" }, { status: 403 });
const badId     = () => NextResponse.json({ error: "Invalid id" }, { status: 400 });

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

    // Build dynamic update (avoid overwriting with empty strings)
    const sets: string[] = [];
    const vals: any[] = [];
    let n = 1;
    const add = (frag: string, v: any) => {
      sets.push(`${frag} $${n++}`);
      vals.push(v);
    };

    if (name !== undefined) {
      const v = String(name ?? "").trim();
      if (v !== "") add("name =", v);
    }
    if (email !== undefined) {
      const v = String(email ?? "").trim();
      if (v !== "") add("email =", v);
    }
    if (role !== undefined) {
      // If you don't want role to be editable at all at the API level, comment this out.
      add("role =", role);
    }
    if (phone_no !== undefined) {
      const v = String(phone_no ?? "").replace(/\D/g, "").slice(0, 10);
      add("phone_no =", v === "" ? null : v);
    }
    if (birthday !== undefined) {
      const v = String(birthday ?? "").trim();
      add("birthday =", v === "" ? null : v);
    }

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
// Block deletion only if there are ACTIVE jobs (reserved/in_delivery).
// If no active jobs, unlink ALL remaining jobs (completed/cancelled/etc.) by
// setting assigned_to = NULL, then delete the user within a transaction.
export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const client = db as any;
  let inTx = false;

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

    // Ensure user exists
    const existRaw = await client.query(`SELECT id FROM users WHERE id = $1`, [id]);
    if (pickRows(existRaw).length === 0) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    // 1) Count ACTIVE references that should block deletion
    const active = await client.query(
      `SELECT COUNT(*)::int AS cnt
         FROM jobs
        WHERE assigned_to = $1
          AND progress_stage IN ('reserved','in_delivery')`,
      [id]
    );
    const activeCount = pickFirstRow(active)?.cnt ?? 0;

    if (activeCount > 0) {
      return NextResponse.json(
        {
          error:
            "Couldn’t delete user because they still have active jobs assigned (reserved/in_delivery).",
          activeJobs: activeCount,
        },
        { status: 409 }
      );
    }

    // 2) No active jobs → unlink all remaining references to avoid FK block
    await client.query("BEGIN");
    inTx = true;

    await client.query(
      `UPDATE jobs
          SET assigned_to = NULL
        WHERE assigned_to = $1`,
      [id]
    );

    // 3) Delete user
    await client.query(`DELETE FROM users WHERE id = $1`, [id]);

    await client.query("COMMIT");
    inTx = false;

    return NextResponse.json({ ok: true });
  } catch (e: any) {
    if (inTx) {
      try { await (db as any).query("ROLLBACK"); } catch {}
    }
    console.error("DELETE /api/users/:id error:", e);

    if (e?.code === "23503") {
      // Some other FK path is still blocking deletion
      return NextResponse.json(
        { error: "Couldn’t delete user due to existing references." },
        { status: 409 }
      );
    }

    return NextResponse.json({ error: "Failed to delete user" }, { status: 500 });
  }
}
