/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/api/jobs/[id]/route.ts
* Author:    IT Project – Medical Pantry – Group 17
* Date:      20-10-2025
* Version:   2.1
* Purpose:   Server-side API handler for single job records.
*
*            Supports:
*              • GET    – Retrieve full job details (joined with organisation)
*              • PATCH  – Admin-only update of editable job fields
*              • DELETE – Admin-only deletion of a job record
*
* Design Notes:
*   - Uses Next.js 15 App Router convention (async params: Promise<{ id }>)
*   - Queries PostgreSQL via pooled SSL connection (Render-ready)
*   - Protects mutating routes via next-auth session + role check
*   - Returns structured JSON: { ok: true, job } or { error }
*
* Revisions:
*   v1.0 – Basic GET/DELETE
*   v1.1 – Added session authentication
*   v2.0 – Added PATCH (update)
*   v2.1 – Fixed join to match table name "organisation" (singular)
*******************************************************/

import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth";
import db from "@/lib/db";

const JOBS_TABLE = process.env.JOBS_TABLE?.trim() || "jobs";
const ORG_TABLE = process.env.ORG_TABLE?.trim() || "organisation"; // ✅ singular
const rows = (r: any) =>
  Array.isArray(r?.rows) ? r.rows : Array.isArray(r) ? r : [];

type Ctx = { params: Promise<{ id: string }> };

/** ------------------------------------------------------------------------
 * GET /api/jobs/[id]
 * Returns one job joined with its organisation info.
 * ---------------------------------------------------------------------- */
export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;
    const jobId = Number(id);
    if (!Number.isFinite(jobId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const q = `
      SELECT
        j.id, j.name, j.address, j.weight, j.value, j.size,
        j.intake_priority, j.deadline_date, j.follow_up,
        j.progress_stage, j.assigned_to, j.organisation_id,
        o.name AS organisation_name,
        o.address AS organisation_address,
        o.contact_no AS organisation_contact_no,
        o.office_hours AS organisation_office_hours
      FROM ${JOBS_TABLE} j
      LEFT JOIN ${ORG_TABLE} o ON o.id = j.organisation_id
      WHERE j.id = $1
    `;

    const result = await db.query(q, [jobId]);
    const job = rows(result)[0];
    if (!job)
      return NextResponse.json({ error: "Job not found" }, { status: 404 });

    return NextResponse.json({ ok: true, job });
  } catch (e: any) {
    console.error("GET /api/jobs/[id] failed:", e);
    return NextResponse.json(
      { error: "Server error while fetching job" },
      { status: 500 }
    );
  }
}

/** ------------------------------------------------------------------------
 * PATCH /api/jobs/[id]
 * Admin-only: updates editable job fields.
 * ---------------------------------------------------------------------- */
export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any)?.role;
    if (role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await ctx.params;
    const jobId = Number(id);
    if (!Number.isFinite(jobId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    const {
      name,
      address,
      weight,
      value,
      size,
      intake_priority,
      deadline_date,
      follow_up,
      progress_stage,
    } = body;

    // Defensive: ensure only valid fields are updated
    const q = `
      UPDATE ${JOBS_TABLE}
      SET
        name = $1,
        address = $2,
        weight = $3,
        value = $4,
        size = $5,
        intake_priority = $6,
        deadline_date = $7,
        follow_up = $8,
        progress_stage = $9
      WHERE id = $10
      RETURNING *
    `;
    const result = await db.query(q, [
      name,
      address,
      weight,
      value,
      size,
      intake_priority,
      deadline_date,
      follow_up,
      progress_stage,
      jobId,
    ]);
    const updated = rows(result)[0];
    if (!updated)
      return NextResponse.json({ error: "Job not found" }, { status: 404 });

    // Rejoin org info for a consistent response
    const jobRes = await db.query(
      `
      SELECT
        j.*, o.name AS organisation_name, o.address AS organisation_address,
        o.contact_no AS organisation_contact_no, o.office_hours AS organisation_office_hours
      FROM ${JOBS_TABLE} j
      LEFT JOIN ${ORG_TABLE} o ON o.id = j.organisation_id
      WHERE j.id = $1
      `,
      [jobId]
    );
    const job = rows(jobRes)[0];

    return NextResponse.json({ ok: true, job });
  } catch (e: any) {
    console.error("PATCH /api/jobs/[id] failed:", e);
    return NextResponse.json(
      { error: "Server error while updating job" },
      { status: 500 }
    );
  }
}

/** ------------------------------------------------------------------------
 * DELETE /api/jobs/[id]
 * Admin-only: deletes a job record.
 * ---------------------------------------------------------------------- */
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any)?.role;
    if (role !== "admin")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await ctx.params;
    const jobId = Number(id);
    if (!Number.isFinite(jobId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    await db.query(`DELETE FROM ${JOBS_TABLE} WHERE id = $1`, [jobId]);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    console.error("DELETE /api/jobs/[id] failed:", e);
    return NextResponse.json(
      { error: "Server error while deleting job" },
      { status: 500 }
    );
  }
}
