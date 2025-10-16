/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/api/jobs/completed/route.ts
* Purpose:   Provide completed jobs for Job History page
* Logic:     - Completed ⇒ progress_stage = 'completed'
* Access:    - Admin → all completed jobs
*             - Volunteer → only their own completed jobs
* Tables:    jobs (FK assigned_to → users.id)
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

    // ✅ Base query for completed jobs
    let sql = `
      SELECT
        j.id                               AS id,
        j.name                             AS item_name,
        j.id                               AS item_id,           -- using job id as item identifier
        j.dropoff_date                     AS dropoff_date,
        j.follow_up                        AS follow_up_required,
        COALESCE(u.name, u.email)          AS assignee_name,
        u.email                            AS assignee_email
      FROM ${JOBS_TABLE} j
      LEFT JOIN ${USERS_TABLE} u ON u.id = j.assigned_to
      WHERE j.progress_stage = 'completed'
    `;

    const params: any[] = [];

    // ✅ Volunteer: only see their own completed jobs
    if (role !== "admin") {
      params.push(email);
      sql += ` AND u.email = $${params.length}`;
    }

    sql += ` ORDER BY j.dropoff_date DESC NULLS LAST`;

    const result = await db.query(sql, params);
    return NextResponse.json({ jobs: result.rows ?? [] });
  } catch (err: any) {
    console.error("Error fetching completed jobs:", err);
    return NextResponse.json(
      { error: "Failed to load completed jobs" },
      { status: 500 }
    );
  }
}
