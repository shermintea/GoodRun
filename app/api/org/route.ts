// File: app/api/org/route.ts
import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";

export async function GET(req: NextRequest) {
    try {
        const url = new URL(req.url);
        const q = url.searchParams.get("q")?.trim();

        let query = `
      SELECT id, name, contact_no, office_hours, address, created_at AS "createdAt"
      FROM organisation
    `;
        const values: any[] = [];

        if (q) {
            query += ` WHERE name ILIKE $1 OR address ILIKE $1 OR contact_no ILIKE $1`;
            values.push(`%${q}%`);
        }

        query += ` ORDER BY created_at DESC`;

        const result = await pool.query(query, values);
        return NextResponse.json({ ok: true, organisations: result.rows });
    } catch (err) {
        console.error("Failed to fetch organisations:", err);
        return NextResponse.json(
            { ok: false, error: "Server error while fetching organisations" },
            { status: 500 }
        );
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { name, contact_no, office_hours, address } = body;

        if (!name || !contact_no || !office_hours || !address) {
            return NextResponse.json({ ok: false, error: "Missing required fields" }, { status: 400 });
        }

        const query = `
      INSERT INTO organisation (name, contact_no, office_hours, address)
      VALUES ($1, $2, $3, $4)
      RETURNING id, name
    `;
        const values = [name, contact_no, office_hours, address];

        const result = await pool.query(query, values);
        const newOrg = result.rows[0];

        return NextResponse.json({
            ok: true,
            message: `Organisation created: ${newOrg.name}`,
            id: newOrg.id,
        });
    } catch (err: any) {
        console.error("Failed to create organisation:", err);
        return NextResponse.json(
            { ok: false, error: "Server error while creating organisation" },
            { status: 500 }
        );
    }
}
