/*******************************************************
* Project:   GoodRun Volunteer App – API
* File:      app/api/jobs/[id]/route.ts
* Purpose:   GET one job (with organisation), PATCH (admin), DELETE (admin)
*******************************************************/
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth";
import pool from "@/lib/db"; // ← same import you use in /api/jobs/route.ts

const JOBS_TABLE = process.env.JOBS_TABLE?.trim() || "jobs";
const ORG_TABLE  = process.env.ORG_TABLE?.trim()  || "organisation";

function ident(s: string) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(s)) throw new Error("Invalid identifier");
  return s;
}
const JT = ident(JOBS_TABLE);
const OT = ident(ORG_TABLE);

// ---------- GET /api/jobs/:id ----------
export async function GET(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = Number(params.id);
    if (!Number.isFinite(id)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const sql = `
      SELECT
        j.id,
        j.name,
        j.address,
        j.weight,
        j.value,
        j.size,
        j.intake_priority,
        j.deadline_date,
        j.follow_up,
        j.progress_stage,
        j.created_at,
        j.assigned_to,
        j.dropoff_date,
        j.organisation_id,
        o.name         AS organisation_name,
        o.address      AS organisation_address,
        o.contact_no   AS organisation_contact_no,
        o.office_hours AS organisation_office_hours
      FROM ${JT} j
      JOIN ${OT} o ON o.id = j.organisation_id
      WHERE j.id = $1
      LIMIT 1
    `;
    const res = await pool.query(sql, [id]);
    const row = res.rows?.[0];
    if (!row) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ ok: true, job: row }, { status: 200 });
  } catch (e: any) {
    console.error("GET /api/jobs/[id] error:", e);
    return NextResponse.json({ error: "Server error", detail: e?.message }, { status: 500 });
  }
}

// ---------- PATCH /api/jobs/:id (admin only) ----------
export async function PATCH(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as any)?.role;
    if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const id = Number(params.id);
    if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const body = await req.json();

    // allowlist editable fields
    const allowed: Record<string, any> = {};
    const setIf = (k: string, v: any) => { if (v !== undefined) allowed[k] = v; };

    setIf("name", body.name ?? null);
    setIf("address", body.address ?? null);
    if (body.weight !== undefined) setIf("weight", Number(body.weight));
    if (body.value  !== undefined) setIf("value", Number(body.value));
    if (body.size   !== undefined) setIf("size", String(body.size).toLowerCase());
    if (body.intake_priority !== undefined)
      setIf("intake_priority", String(body.intake_priority).toLowerCase());
    if (body.deadline_date !== undefined) setIf("deadline_date", body.deadline_date);
    if (body.follow_up !== undefined) setIf("follow_up", !!body.follow_up);
    if (body.progress_stage !== undefined) setIf("progress_stage", body.progress_stage);

    const keys = Object.keys(allowed);
    if (keys.length === 0) {
      return NextResponse.json({ error: "No fields to update" }, { status: 400 });
    }

    const setSql = keys.map((k, i) => `${k} = $${i + 1}`).join(", ");
    const values = keys.map((k) => allowed[k]);

    const sql = `
      UPDATE ${JT}
      SET ${setSql}
      WHERE id = $${keys.length + 1}
      RETURNING *
    `;
    const upd = await pool.query(sql, [...values, id]);
    if (!upd.rowCount) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ ok: true, job: upd.rows[0] }, { status: 200 });
  } catch (e: any) {
    console.error("PATCH /api/jobs/[id] error:", e);
    return NextResponse.json({ error: "Server error", detail: e?.message }, { status: 500 });
  }
}

// ---------- DELETE /api/jobs/:id (admin only) ----------
export async function DELETE(
  _req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as any)?.role;
    if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const id = Number(params.id);
    if (!Number.isFinite(id)) return NextResponse.json({ error: "Invalid id" }, { status: 400 });

    const del = await pool.query(`DELETE FROM ${JT} WHERE id = $1 RETURNING id`, [id]);
    if (!del.rowCount) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ ok: true, id }, { status: 200 });
  } catch (e: any) {
    console.error("DELETE /api/jobs/[id] error:", e);
    return NextResponse.json({ error: "Server error", detail: e?.message }, { status: 500 });
  }
}
