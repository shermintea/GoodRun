/*******************************************************
* Route: POST /api/jobs/:id/cancel
* Purpose: Cancel a job with stage-aware logic
* Rules:
*  - If progress_stage = 'in_delivery':
*      -> progress_stage = 'cancelled_in_delivery'
*      -> follow_up = TRUE
*      -> keep assigned_to (admin can still contact the assignee)
*  - If progress_stage = 'reserved':
*      -> progress_stage = 'available'
*      -> assigned_to = NULL
* Access:
*  - Admin: can cancel any job
*  - Volunteer: can cancel only jobs assigned to them
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

    const role = (session.user as any)?.role as "admin" | "volunteer" | undefined;
    const userId = Number((session.user as any)?.id);
    if (!role) return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // Next.js 15: params is async
    const { id } = await context.params;
    const jobId = Number(id);
    if (!Number.isFinite(jobId)) {
      return NextResponse.json({ error: "Invalid job id" }, { status: 400 });
    }

    // 1) Load current job
    const jobRes = await db.query(
      `SELECT id, progress_stage, assigned_to, follow_up FROM ${JOBS_TABLE} WHERE id = $1`,
      [jobId]
    );
    const job = jobRes.rows?.[0];
    if (!job) return NextResponse.json({ error: "Job not found" }, { status: 404 });

    // 2) Permission: volunteers can only cancel their own job
    if (role === "volunteer") {
      if (!Number.isFinite(userId)) {
        return NextResponse.json({ error: "User id missing in session" }, { status: 400 });
      }
      if (job.assigned_to !== userId) {
        return NextResponse.json({ error: "Forbidden: not assignee" }, { status: 403 });
      }
    }

    // 3) Apply stage-specific cancellation logic
    let updated;
    if (job.progress_stage === "in_delivery") {
      // Mark as cancelled_in_delivery, follow_up = TRUE, keep assigned_to
      updated = await db.query(
        `
        UPDATE ${JOBS_TABLE}
           SET progress_stage = 'cancelled_in_delivery',
               follow_up      = TRUE
         WHERE id = $1
         RETURNING id, name, address, assigned_to, follow_up, deadline_date,
                   progress_stage, intake_priority, size, dropoff_date
        `,
        [jobId]
      );
    } else if (job.progress_stage === "reserved") {
      // Make available and remove assignee
      updated = await db.query(
        `
        UPDATE ${JOBS_TABLE}
           SET progress_stage = 'available',
               assigned_to    = NULL
         WHERE id = $1
         RETURNING id, name, address, assigned_to, follow_up, deadline_date,
                   progress_stage, intake_priority, size, dropoff_date
        `,
        [jobId]
      );
    } else {
      return NextResponse.json(
        {
          error:
            "Only jobs in 'reserved' or 'in_delivery' can be cancelled by this endpoint.",
          current_stage: job.progress_stage,
        },
        { status: 409 }
      );
    }

    const row = updated.rows?.[0] ?? null;
    return NextResponse.json({
      message:
        row?.progress_stage === "cancelled_in_delivery"
          ? "Job cancelled during delivery. Follow-up flagged."
          : "Job returned to available.",
      job: row,
    });
  } catch (err: any) {
    console.error("Error cancelling job:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
