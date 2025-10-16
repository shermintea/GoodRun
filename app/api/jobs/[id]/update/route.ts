/*******************************************************
* Route: PATCH /api/jobs/:id/update
* Purpose: Update progress_stage for volunteer actions
* Logic:
*  - 'reserved' → 'in_delivery'
*  - 'in_delivery' → 'completed' (sets dropoff_date)
*******************************************************/

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth";
import db from "@/lib/db";

export async function PATCH(req: Request, context: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions);
    if (!session)
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

    const role = (session.user as any)?.role;
    if (role !== "volunteer")
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    // ✅ FIX: await params in Next.js 15
    const { id } = await context.params;
    const jobId = Number(id);
    if (!Number.isFinite(jobId))
      return NextResponse.json({ error: "Invalid job id" }, { status: 400 });

    const { progress_stage } = await req.json();
    if (!progress_stage)
      return NextResponse.json({ error: "Missing progress_stage" }, { status: 400 });

    if (progress_stage === "completed") {
      await db.query(
        `UPDATE jobs SET progress_stage = $1, dropoff_date = NOW() WHERE id = $2`,
        [progress_stage, jobId]
      );
    } else {
      await db.query(
        `UPDATE jobs SET progress_stage = $1 WHERE id = $2`,
        [progress_stage, jobId]
      );
    }

    return NextResponse.json({ message: "Job updated" });
  } catch (err: any) {
    console.error("Error updating job:", err);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
