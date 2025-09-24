/*******************************************************
*Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
*File:      app/api/job/route.ts  
*Author:    IT Project – Medical Pantry – Group 17
*Date:      24-09-2025
*Version:   1.0
*Purpose:   REST API endpoint for MySQL Jobs table.
*           Allows fetch, add, update and delete of job entries.
*Revisions:
*v1.0 - 24-09-2025 - Initial implementation
*******************************************************/

import db from '@/lib/db';
import { NextResponse } from 'next/server';

//  Function:   GET
//  Purpose:    Fetches all job records from the database.
//  Params:     None (request object is implicitly handled by Next.js).
//  Returns:    NextResponse - JSON array of all job records.
export async function GET() {
    const [rows] = await db.query('SELECT * FROM jobs');
    return NextResponse.json(rows);
}

//  Function:   POST
//  Purpose:    Creates a new job record in the database.
//  Params:     req (Request) - the incoming HTTP request containing job details in JSON format.
//  Returns:    NextResponse - JSON object with success confirmation.
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

//  Function:   PUT
//  Purpose:    Updates an existing job record in the database using the provided job ID.
//  Params:     req (Request) - the HTTP request containing a JSON body with:
//                  id (number) - required, identifies the job to update
//                  assigned_to (string)
//                  progress_stage (string)
//                  deadline_date (string, format 'YYYY-MM-DD')
//                  approx_weight (number)
//                  approx_value (number)
//                  size (string: 'tiny' | 'small')
//                  follow_up (boolean)
//                  intake_priority (string: 'low' | 'medium' | 'high')
//  Returns:    NextResponse - JSON object with success confirmation or error details.
export async function PUT(req: Request) {
    const body = await req.json();
    const {
        id, // required field
        assigned_to,
        progress_stage,
        deadline_date,
        approx_weight,
        approx_value,
        size,
        follow_up,
        intake_priority,
    } = body;

    if (!id) {
        return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    await db.query(
        `UPDATE jobs 
      SET assigned_to = ?, progress_stage = ?, deadline_date = ?, approx_weight = ?, 
          approx_value = ?, size = ?, follow_up = ?, intake_priority = ? 
      WHERE id = ?`,
        [assigned_to, progress_stage, deadline_date, approx_weight, approx_value, size, follow_up, intake_priority, id]
    );

    return NextResponse.json({ success: true });
}

//  Function:   DELETE
//  Purpose:    Deletes an existing job record from the database using the provided job ID.
//  Params:     req (Request) - the HTTP request containing a JSON body with:
//                  id (number) - required, identifies the job to delete
//  Returns:    NextResponse - JSON object with success confirmation or error details.
export async function DELETE(req: Request) {
    const { id } = await req.json();

    if (!id) {
        return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    await db.query('DELETE FROM jobs WHERE id = ?', [id]);

    return NextResponse.json({ success: true });
}