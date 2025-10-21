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
const USERS_TABLE = (process.env.USERS_TABLE || "users").trim();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any)?.role;
    const email = session.user?.email ?? null;

    // Base query
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
        j.size,
        COALESCE(u.name, u.email) AS assignee_name,
        u.email AS assignee_email
      FROM ${JOBS_TABLE} j
      LEFT JOIN ${USERS_TABLE} u ON u.id = j.assigned_to
      WHERE j.progress_stage IN ('reserved', 'in_delivery')
    `;

    const params: any[] = [];

    // Volunteer: only their own jobs
    if (role !== "admin") {
      params.push(email);
      sql += ` AND u.email = $${params.length}`;
    }

    sql += `
      ORDER BY
        CASE j.progress_stage WHEN 'in_delivery' THEN 0 ELSE 1 END,
        COALESCE(j.deadline_date, '9999-12-31') ASC,
        j.id DESC
    `;

    const result = await db.query(sql, params);
    return NextResponse.json({ jobs: result.rows ?? [] });
  } catch (err: any) {
    console.error("Error fetching ongoing jobs:", err);
    return NextResponse.json(
      { error: "Failed to load ongoing jobs" },
      { status: 500 }
    );
  }
}
