import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

// Helper to safely parse id
const parseId = (id: string | string[]) => {
    const val = Array.isArray(id) ? id[0] : id;
    const num = parseInt(val, 10);
    return isNaN(num) ? null : num;
};

// GET /api/org/[id]
export async function GET(req: NextRequest, context: { params: any }) {
    const orgId = parseId(context.params.id);
    if (!orgId) return NextResponse.json({ ok: false, error: "Invalid ID" }, { status: 400 });

    const result = await pool.query(`SELECT * FROM organisation WHERE id = $1`, [orgId]);
    if (result.rows.length === 0)
        return NextResponse.json({ ok: false, error: "Organisation not found" }, { status: 404 });

    return NextResponse.json({ ok: true, organisation: result.rows[0] });
}

// PATCH /api/org/[id]
export async function PATCH(req: NextRequest, context: { params: any }) {
    const orgId = parseId(context.params.id);
    if (!orgId) return NextResponse.json({ ok: false, error: "Invalid ID" }, { status: 400 });

    const body = await req.json();
    const { name, contact_no, office_hours, address } = body;

    if (!name?.trim()) return NextResponse.json({ ok: false, error: "Name is required" }, { status: 400 });

    const result = await pool.query(
        `UPDATE organisation 
     SET name=$1, contact_no=$2, office_hours=$3, address=$4
     WHERE id=$5 RETURNING *`,
        [name, contact_no ?? null, office_hours ?? null, address ?? null, orgId]
    );

    if (result.rows.length === 0)
        return NextResponse.json({ ok: false, error: "Organisation not found" }, { status: 404 });

    return NextResponse.json({ ok: true, organisation: result.rows[0] });
}

// DELETE /api/org/[id]
export async function DELETE(req: NextRequest, context: { params: any }) {
    const orgId = parseId(context.params.id);
    if (!orgId) return NextResponse.json({ ok: false, error: "Invalid ID" }, { status: 400 });

    const result = await pool.query(`DELETE FROM organisation WHERE id = $1 RETURNING id`, [orgId]);
    if (result.rows.length === 0)
        return NextResponse.json({ ok: false, error: "Organisation not found" }, { status: 404 });

    return NextResponse.json({ ok: true, message: "Organisation deleted" });
}
