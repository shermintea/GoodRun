/*******************************************************
* Route: POST /api/jobs/:id/reserve
* Purpose: Volunteer reserves an available job
* Rules:
*   - Only volunteers
*   - Only when job is currently 'available'
*   - Assigns the job to the current user and sets stage -> 'reserved'
*******************************************************/

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth";
import db from "@/lib/db";

const JOBS_TABLE = (process.env.JOBS_TABLE || "jobs").trim();

export async function POST(
  _req: Request,
  context: { params: Promise<{ id: string }> }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any)?.role;
    const userId = Number((session.user as any)?.id);
    if (role !== "volunteer" || !Number.isFinite(userId)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Next.js 15: params is async
    const { id } = await context.params;
    const jobId = Number(id);
    if (!Number.isFinite(jobId)) {
      return NextResponse.json({ error: "Invalid job id" }, { status: 400 });
    }

    // Reserve only if still available (race-condition safe)
    const result = await db.query(
      `
      UPDATE ${JOBS_TABLE}
         SET assigned_to    = $1,
             progress_stage = 'reserved'
       WHERE id = $2
         AND progress_stage = 'available'
         AND (assigned_to IS NULL OR assigned_to = $1)
       RETURNING id, name, address, assigned_to, follow_up, deadline_date,
                 progress_stage, intake_priority, size, dropoff_date
      `,
      [userId, jobId]
    );

    if (result.rowCount === 0) {
      return NextResponse.json(
        { error: "Job is no longer available." },
        { status: 409 }
      );
    }

    return NextResponse.json({ message: "Job reserved", job: result.rows[0] });
  } catch (err: any) {
    console.error("Error reserving job:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
