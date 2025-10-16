/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/api/jobs/ongoing/route.ts
* Purpose:   Provide list of ongoing jobs
* Logic:
*   - Admin: ONLY ('reserved','in_delivery')
*   - Volunteer: ONLY their jobs in ('reserved','in_delivery')
*******************************************************/
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth";
import db from "@/lib/db";

const JOBS_TABLE = (process.env.JOBS_TABLE || "jobs").trim();

function rows(result: any): any[] {
  // normalise pg/mysql wrappers
  if (!result) return [];
  if (Array.isArray(result?.rows)) return result.rows;
  if (Array.isArray(result)) return result;
  return [];
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any)?.role as "admin" | "volunteer" | undefined;
    const userId = (session.user as any)?.id;

    const allowed = ["reserved", "in_delivery"];

    let sql = `
      SELECT
        j.id,
        j.name,
        j.address,
        j.assigned_to,
        j.follow_up,
        j.deadline_date,
        j.progress_stage,
        j.intake_priority,
        j.size
      FROM ${JOBS_TABLE} j
      WHERE j.progress_stage IN ($1, $2)
    `;
    const params: any[] = allowed;

    if (role !== "admin") {
      // volunteers only see THEIR ongoing jobs
      sql += ` AND j.assigned_to = $3`;
      params.push(userId);
    }

    sql += ` ORDER BY 
       CASE j.progress_stage WHEN 'in_delivery' THEN 0 ELSE 1 END,
       COALESCE(j.deadline_date, '9999-12-31') ASC,
       j.id DESC`;

    const result = await db.query(sql, params);
    return NextResponse.json({ jobs: rows(result) });
  } catch (err) {
    console.error("Error fetching ongoing jobs:", err);
    return NextResponse.json({ error: "Failed to load ongoing jobs" }, { status: 500 });
  }
}
