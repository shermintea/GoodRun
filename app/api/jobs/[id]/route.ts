/*******************************************************
* File: app/api/jobs/[id]/route.ts
*******************************************************/
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth";
import db from "@/lib/db";

const JOBS_TABLE = process.env.JOBS_TABLE?.trim() || "jobs";

// Helper for normalizing row arrays across adapters
const rows = (r: any) => (Array.isArray(r?.rows) ? r.rows : Array.isArray(r) ? r : []);

type Ctx = { params: Promise<{ id: string }> }; // <-- Next 15: params is a Promise

// GET /api/jobs/[id]
export async function GET(_req: NextRequest, ctx: Ctx) {
  try {
    const { id } = await ctx.params;                 // <-- await the params
    const jobId = Number(id);
    if (!Number.isFinite(jobId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const result = await db.query(
      `SELECT id, name, address, assigned_to, follow_up, deadline_date, progress_stage, intake_priority, size
       FROM ${JOBS_TABLE} WHERE id = $1`,
      [jobId]
    );
    const job = rows(result)[0];
    if (!job) return NextResponse.json({ error: "Not found" }, { status: 404 });

    return NextResponse.json({ ok: true, job });
  } catch (e) {
    console.error("GET /api/jobs/[id] failed:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// PATCH /api/jobs/[id]  (example)
export async function PATCH(req: NextRequest, ctx: Ctx) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const { id } = await ctx.params;                 // <-- await the params
    const jobId = Number(id);
    if (!Number.isFinite(jobId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    const body = await req.json();
    // ... do your updates with `body` ...
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("PATCH /api/jobs/[id] failed:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

// DELETE /api/jobs/[id]  (admin-only)
export async function DELETE(_req: NextRequest, ctx: Ctx) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as any)?.role;
    if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const { id } = await ctx.params;                 // <-- await the params
    const jobId = Number(id);
    if (!Number.isFinite(jobId)) {
      return NextResponse.json({ error: "Invalid id" }, { status: 400 });
    }

    await db.query(`DELETE FROM ${JOBS_TABLE} WHERE id = $1`, [jobId]);
    return NextResponse.json({ ok: true });
  } catch (e) {
    console.error("DELETE /api/jobs/[id] failed:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}

