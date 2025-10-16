import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import pool from "@/lib/db";

// Map DB stage -> UI action needed
function toUiStatus(stage: string): "PICKUP" | "DROPOFF" {
  if (stage === "reserved") return "PICKUP";
  if (stage === "in_delivery") return "DROPOFF";
  // anything else shouldn't be on "ongoing", but default safely:
  return "PICKUP";
}

export async function GET() {
  const jar = await cookies();
  const uid = jar.get("gr_uid")?.value;      // set at login
  if (!uid) return NextResponse.json({ jobs: [] }, { status: 200 });

  // join org to get an address to show
  const sql = `
    SELECT
      j.id,
      j.progress_stage,
      j.deadline_date,
      j.organisation_id,
      o.address AS org_address
    FROM jobs j
    LEFT JOIN organisation o ON o.id = j.organisation_id
    WHERE j.assigned_to = $1
      AND j.progress_stage IN ('reserved', 'in_delivery')
    ORDER BY j.deadline_date NULLS LAST, j.id DESC;
  `;

  const { rows } = await pool.query(sql, [uid]);

  // shape for the page (you can extend when you add columns like lat/lng)
  const out = rows.map((r) => ({
    id: String(r.id),
    name: `Job #${r.id}`,                 // until you add item_name
    status: toUiStatus(r.progress_stage), // PICKUP/DROPOFF
    address: r.org_address ?? "—",
    pickupTime: r.deadline_date
      ? new Date(r.deadline_date).toLocaleString()
      : "TBA",
    source: "stored" as const,            // it’s in DB
    // lat/lng, urgency can be appended later when you add columns
  }));

  return NextResponse.json({ jobs: out });
}
