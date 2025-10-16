/*******************************************************
* Project:   GoodRun Volunteer App – API
* File:      app/api/create-pickup/route.ts
* Purpose:   Create a new pick-up job (Admin only) – Postgres
*******************************************************/
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth";
import db from "@/lib/db"; // must expose pg Pool/Client with .query

const JOBS_TABLE = process.env.JOBS_TABLE?.trim() || "jobs";
const ORG_TABLE  = process.env.ORG_TABLE?.trim()  || "organisation";

// guard against weird env values (simple identifier check)
function ident(s: string) {
  if (!/^[A-Za-z_][A-Za-z0-9_]*$/.test(s)) throw new Error("Invalid table name");
  return s;
}

type AnyJson = Record<string, any>;
const idJobs = ident(JOBS_TABLE);
const idOrg  = ident(ORG_TABLE);

function norm(s: unknown) {
  return String(s ?? "").normalize("NFKC").trim().replace(/\s+/g, " ");
}
function toYMD(dateStr?: string | null) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return null;
  const yyyy = d.getFullYear();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${yyyy}-${mm}-${dd}`;
}

export async function POST(req: Request) {
  try {
    // --- auth (admin)
    const session = await getServerSession(authOptions);
    if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    const role = (session.user as any)?.role;
    if (role !== "admin") return NextResponse.json({ error: "Forbidden" }, { status: 403 });

    const body = (await req.json()) as AnyJson;

    const organisationName = norm(body.organisationName ?? body.orgName);
    const jobName          = norm(body.jobName ?? body.name ?? organisationName);
    const address          = norm(body.address);

    const weight = Number(body.weight ?? body.weightKg ?? body.weight_kg);
    const value  = Number(body.value);

    const size            = String(body.size ?? body.packageSize ?? "small").toLowerCase();
    const intakePriority  = String(body.intakePriority ?? body.priority ?? "medium").toLowerCase();
    const followUp        = Boolean(body.followUp ?? body.followupRequired ?? body.follow_up ?? false);
    const deadlineDate    = toYMD(body.deadlineDate ?? body.deadline_date);

    const problems: string[] = [];
    if (!organisationName) problems.push("organisationName is required");
    if (!address)          problems.push("address is required");
    if (!Number.isFinite(weight) || weight < 0) problems.push("weight must be a non-negative number");
    if (!Number.isFinite(value)  || value < 0)  problems.push("value must be a non-negative number");
    if (!deadlineDate)     problems.push("deadlineDate is invalid or missing (yyyy-mm-dd)");

    if (problems.length) {
      return NextResponse.json({ error: problems.join("; ") }, { status: 400 });
    }

    // --- find organisation.id by name (case-insensitive)
    const orgSql = `SELECT id FROM ${idOrg} WHERE LOWER(TRIM(name)) = LOWER(TRIM($1)) LIMIT 1`;
    const orgRes = await db.query(orgSql, [organisationName]);
    const organisationId = orgRes.rows?.[0]?.id as number | undefined;

    if (!organisationId) {
      return NextResponse.json(
        { error: `Organisation "${organisationName}" not found.` },
        { status: 400 }
      );
    }

    // --- insert job into *jobs* (NOT pickup_jobs), return id
    const insertSql = `
      INSERT INTO ${idJobs}
        (organisation_id, name, address, weight, value, size, intake_priority,
         deadline_date, follow_up, progress_stage, created_at)
      VALUES
        ($1, $2, $3, $4, $5, $6, $7, $8, $9, 'available', NOW())
      RETURNING id
    `;
    const params = [
      organisationId,
      jobName || null,  // nullable
      address,          // free-text pickup address
      weight,
      value,
      size,
      intakePriority,
      deadlineDate,
      followUp,
    ];

    const ins = await db.query(insertSql, params);

    return NextResponse.json(
      { success: true, id: ins.rows[0].id, message: "Pick-up job created successfully." },
      { status: 201 }
    );
  } catch (err: any) {
    console.error("create-pickup error:", err);
    return NextResponse.json(
      { error: "Internal Server Error", detail: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
