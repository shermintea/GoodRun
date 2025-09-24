import db from '@/lib/db';
import { NextResponse } from 'next/server';

export async function GET() {
    const [rows] = await db.query('SELECT * FROM jobs');
    return NextResponse.json(rows);
}

export async function POST(req: Request) {
    const body = await req.json();
    const {
        assigned_to,
        progress_stage,
        deadline_date,
        approx_weight,
        approx_value,
        size,
        follow_up,
        intake_priority
    } = body;

    await db.query(
        `INSERT INTO jobs 
        (assigned_to, progress_stage, deadline_date, approx_weight, approx_value, size, follow_up, intake_priority) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
        [assigned_to, progress_stage, deadline_date, approx_weight, approx_value, size, follow_up, intake_priority]
    );

    return NextResponse.json({ success: true });
}
