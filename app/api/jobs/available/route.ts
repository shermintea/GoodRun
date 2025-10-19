/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/api/jobs/available/route.ts
* Purpose:   Fetch jobs for the Available page
* Policy:
*   - Admin: show 'available' + 'cancelled_in_delivery'
*   - Volunteer: show only 'available'
* DB:        PostgreSQL (pg)
*******************************************************/

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth";
import db from "@/lib/db";

const JOBS_TABLE = process.env.JOBS_TABLE?.trim() || "jobs";

type Row = {
  id: number;
  name: string | null;
  address: string | null;
  package_size: string | null; // size AS package_size
  progress_stage: string | null;
};

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const role = (session.user as any)?.role as "admin" | "volunteer" | undefined;
    if (role !== "admin" && role !== "volunteer") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // ✅ Role-based status filter
    const statuses =
      role === "admin"
        ? ["available", "cancelled_in_delivery"]
        : ["available"];

    const sql = `
      SELECT
        id,
        name,
        address,
        size AS package_size,
        progress_stage
      FROM ${JOBS_TABLE}
      WHERE REPLACE(LOWER(progress_stage), ' ', '_') = ANY($1)
      ORDER BY created_at DESC
    `;

    // pg style
    const { rows } = await db.query<Row>(sql, [statuses]);

    return NextResponse.json(
      { jobs: rows },
      { headers: { "Cache-Control": "no-store" } } // avoid stale cache
    );
  } catch (err: any) {
    console.error("Error fetching available jobs:", err);
    return NextResponse.json(
      { error: "Failed to load available jobs" },
      { status: 500 }
    );
  }
}
