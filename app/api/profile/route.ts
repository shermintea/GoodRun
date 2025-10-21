/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/api/profile/route.ts
* Author:    IT Project – Medical Pantry – Group 17
* Date:      21-10-2025
* Version:   1.3
* Purpose:   Return and update the logged-in user's profile
* Notes:
*   - GET: returns { user: {...}, metrics: { pickups_finished } }
*   - PATCH: partial update; only changes provided fields
*******************************************************/
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth";
import db from "@/lib/db";

function rows(r: any) { return Array.isArray(r?.rows) ? r.rows : Array.isArray(r) ? r : []; }
function first(r: any) { const a = rows(r); return a[0] ?? null; }

/* ----------------------------- GET /api/profile ---------------------------- */
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Prefer id; fallback to email
    const sid = (session.user as any)?.id;
    const semail = (session.user as any)?.email;

    let urow: any | null = null;
    if (sid && Number.isFinite(Number(sid))) {
      urow = first(await (db as any).query(
        `SELECT id, name, email, role, phone_no, birthday
           FROM users
          WHERE id = $1
          LIMIT 1`,
        [Number(sid)]
      ));
    } else if (semail) {
      urow = first(await (db as any).query(
        `SELECT id, name, email, role, phone_no, birthday
           FROM users
          WHERE email = $1
          LIMIT 1`,
        [semail]
      ));
    }

    if (!urow) return NextResponse.json({ error: "User not found" }, { status: 404 });

    // Count completed jobs (by assigned_to + exact progress_stage)
    const cres = await (db as any).query(
      `SELECT COUNT(*)::int AS total
         FROM jobs
        WHERE assigned_to = $1
          AND progress_stage = 'completed'`,
      [urow.id]
    );
    const pickups_finished = first(cres)?.total ?? 0;

    const user = {
      id: urow.id,
      name: urow.name,
      email: urow.email,
      role: urow.role,
      phone_no: urow.phone_no?.trim?.() ?? urow.phone_no ?? null, // CHAR(10) -> trim
      birthday: urow.birthday ? String(urow.birthday).split("T")[0] : null,
    };

    return NextResponse.json({ user, metrics: { pickups_finished } });
  } catch (e: any) {
    console.error("GET /api/profile error:", e);
    return NextResponse.json({ error: "Failed to load profile" }, { status: 500 });
  }
}

/* ---------------------------- PATCH /api/profile --------------------------- */
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    // Resolve user id
    const sid = (session.user as any)?.id;
    const semail = (session.user as any)?.email;
    let uid: number | null = null;

    if (sid && Number.isFinite(Number(sid))) {
      uid = Number(sid);
    } else if (semail) {
      uid = first(await (db as any).query(
        `SELECT id FROM users WHERE email = $1 LIMIT 1`,
        [semail]
      ))?.id ?? null;
    }
    if (!uid) return NextResponse.json({ error: "User not found" }, { status: 404 });

    const body = await req.json();
    const { name, phone_no, birthday, email } = body ?? {};

    // Build partial update (avoid overwriting with "")
    const sets: string[] = [];
    const vals: any[] = [];
    let n = 1; const add = (frag: string, v: any) => { sets.push(`${frag} $${n++}`); vals.push(v); };

    if (name !== undefined) {
      const v = String(name ?? "").trim();
      if (v !== "") add("name =", v);
    }
    if (email !== undefined) {
      const v = String(email ?? "").trim();
      if (v !== "") add("email =", v); // keep or remove depending on your policy
    }
    if (phone_no !== undefined) {
      const v = String(phone_no ?? "").replace(/\D/g, "").slice(0, 10);
      add("phone_no =", v === "" ? null : v);
    }
    if (birthday !== undefined) {
      const v = String(birthday ?? "").trim();
      add("birthday =", v === "" ? null : v);
    }

    if (sets.length === 0)
      return NextResponse.json({ error: "No changes provided" }, { status: 400 });

    const sql = `UPDATE users SET ${sets.join(", ")} WHERE id = $${n}
                 RETURNING id, name, email, role, phone_no, birthday`;
    vals.push(uid);
    const updated = first(await (db as any).query(sql, vals));

    const user = updated ? {
      id: updated.id,
      name: updated.name,
      email: updated.email,
      role: updated.role,
      phone_no: updated.phone_no?.trim?.() ?? updated.phone_no ?? null,
      birthday: updated.birthday ? String(updated.birthday).split("T")[0] : null,
    } : null;

    return NextResponse.json({ ok: true, user });
  } catch (e: any) {
    console.error("PATCH /api/profile error:", e);
    if (e?.code === "23505") return NextResponse.json({ error: "Email already exists" }, { status: 409 });
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
