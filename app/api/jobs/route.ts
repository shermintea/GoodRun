// app/api/jobs/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth";
import pool from "@/lib/db";
import { z } from "zod";

// ---- schema -------------------------------------------------
const jobSchema = z.object({
  deadline_date: z.string().date().or(z.string().min(1)), // allow YYYY-MM-DD from <input type="date">
  assigned_to: z.number().int().optional().nullable(),
  weight: z.number().finite().nonnegative(),
  value: z.number().finite().nonnegative(),
  size: z.enum(["tiny", "small", "medium", "large"]).transform(s => s.toLowerCase()),
  follow_up: z.boolean().default(false),
  intake_priority: z.enum(["low", "medium", "high"]).transform(p => p.toLowerCase()),
  organisation_id: z.number().int().positive(),
});

function json(status: number, body: unknown) {
  return NextResponse.json(body, { status });
}

// ---- auth helper -------------------------------------------
async function assertAdmin(): Promise<boolean> {
  // Prefer NextAuth session
  const session = await getServerSession(authOptions);
  if (session?.user && (session.user as any).role === "admin") return true;

  // Fallback: legacy cookie (if you still set it on login)
  const role = (await cookies()).get("gr_role")?.value;
  if (role === "admin") return true;

  return false;
}

// ---- GET: list jobs (you already used this on the UI) -------
export async function GET() {
  try {
    const { rows } = await pool.query(
      `SELECT id, assigned_to, progress_stage, deadline_date, weight, value, size, follow_up, intake_priority, organisation_id
       FROM jobs
       WHERE progress_stage IN ('available','reserved','in delivery')
       ORDER BY created_at DESC
       LIMIT 200`
    );
    return json(200, { ok: true, jobs: rows });
  } catch (err) {
    console.error("[GET /api/jobs] DB error:", err);
    return json(500, { ok: false, error: "Server error" });
  }
}

// ---- POST: create job (admin only) --------------------------
export async function POST(req: NextRequest) {
  try {
    const isAdmin = await assertAdmin();
    if (!isAdmin) return json(401, { ok: false, error: "Unauthorized" });

    const raw = await req.json();
    // Coerce number-ish strings from the form (e.g. "10") to numbers
    const parsed = jobSchema.parse({
      ...raw,
      assigned_to: raw.assigned_to ? Number(raw.assigned_to) : undefined,
      weight: Number(raw.weight),
      value: Number(raw.value),
      organisation_id: Number(raw.organisation_id),
    });

    const {
      assigned_to,
      deadline_date,
      weight,
      value,
      size,
      follow_up,
      intake_priority,
      organisation_id,
    } = parsed;

    const { rows } = await pool.query(
      `INSERT INTO jobs
         (assigned_to, progress_stage, deadline_date, weight, value, size, follow_up, intake_priority, organisation_id, created_at)
       VALUES ($1,           'available',   $2,           $3,     $4,    $5,   $6,        $7,             $8,              NOW())
       RETURNING id`,
      [
        assigned_to ?? null,
        deadline_date, // 'YYYY-MM-DD'
        weight,
        value,
        size,
        follow_up,
        intake_priority,
        organisation_id,
      ]
    );

    return json(201, { ok: true, id: rows[0].id });
  } catch (err: any) {
    if (err?.name === "ZodError") {
      return json(400, { ok: false, error: "Invalid input", issues: err.issues });
    }
    console.error("[POST /api/jobs] error:", err);
    return json(500, { ok: false, error: "Server error" });
  }
}

