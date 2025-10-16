// app/api/jobs/[id]/advance/route.ts
import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const uid = (await cookies()).get("gr_uid")?.value;
  if (!uid) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { rows } = await pool.query(
    "SELECT progress_stage, assigned_to FROM jobs WHERE id = $1",
    [params.id]
  );
  if (!rows.length) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (String(rows[0].assigned_to) !== String(uid))
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const current = rows[0].progress_stage as string;
  const next = current === "reserved" ? "in_delivery" : current === "in_delivery" ? "delivered" : null;
  if (!next) return NextResponse.json({ error: "Nothing to advance" }, { status: 400 });

  await pool.query("UPDATE jobs SET progress_stage = $1 WHERE id = $2", [next, params.id]);
  return NextResponse.json({ ok: true, stage: next });
}
