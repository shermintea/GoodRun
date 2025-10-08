/*******************************************************
*Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
*File:      app/api/job/route.ts  
*Author:    IT Project – Medical Pantry – Group 17
*Date:      24-09-2025
*Version:   2.0
*Purpose:   REST API endpoint for MySQL Jobs table.
*           Allows fetch, add, update and delete of job entries.
*Revisions:
*v1.0 - 24-09-2025 - Initial implementation
*v2.0 - 08-10-2025 - Migrated from MySQL to PostgreSQL, adjusted query syntax
*******************************************************/

import pool from '@/lib/db';
import { NextResponse } from 'next/server';

//  Function:   GET
//  Purpose:    Fetches all job records from the database.
//  Params:     None (request object is implicitly handled by Next.js).
//  Returns:    NextResponse - JSON array of all job records.
export async function GET() {
    try {
        const result = await pool.query(
            `SELECT j.*, o.name AS organisation_name, o.contact_no, o.address, o.office_hours
            FROM jobs j
            LEFT JOIN organisation o ON j.organisation_id = o.id
            ORDER BY j.id`
        );
        return NextResponse.json(result.rows);
    } catch (error) {
        console.error('error fetching jobs:', error);
        return NextResponse.json({ error: 'Failed to fetch jobs' }, { status: 500 });
    }
}

//  Function:   POST
//  Purpose:    Creates a new job record in the database.
//  Params:     req (Request) - the incoming HTTP request containing job details in JSON format.
//  Returns:    NextResponse - JSON object with success confirmation.
export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            assigned_to,
            progress_stage,
            deadline_date,
            weight,
            value,
            size,
            follow_up,
            intake_priority,
            organisation_id,
        } = body;

        // verify foreign key
        const orgCheck = await pool.query('SELECT id FROM organisation WHERE id = $1', [organisation_id]);
        if (orgCheck.rowCount === 0) {
            return NextResponse.json({ error: 'Invalid organisation_id' }, { status: 400 });
        }

        await pool.query(
            `INSERT INTO jobs (assigned_to, progress_stage, deadline_date, approx_weight, approx_value, size, follow_up, intake_priority, organisation_id) 
            VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)`,
            [assigned_to, progress_stage, deadline_date, weight, value, size, follow_up, intake_priority, organisation_id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error creating job:', error);
        return NextResponse.json({ error: 'Failed to create job' }, { status: 500 });
    }
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
    try {
        const body = await req.json();
        const {
            id,
            assigned_to,
            progress_stage,
            deadline_date,
            approx_weight,
            approx_value,
            size,
            follow_up,
            intake_priority,
            organisation_id,
        } = body;

        if (!id) {
            return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
        }

        // verify foreign key
        if (organisation_id) {
            const orgCheck = await pool.query('SELECT id FROM organisation WHERE id = $1', [organisation_id]);
            if (orgCheck.rowCount === 0) {
                return NextResponse.json({ error: 'Invalid organisation_id' }, { status: 400 });
            }
        }

        await pool.query(
            `UPDATE jobs 
             SET assigned_to = $1, progress_stage = $2, deadline_date = $3, approx_weight = $4, 
                 approx_value = $5, size = $6, follow_up = $7, intake_priority = $8, organisation_id = $9
             WHERE id = $10`,
            [assigned_to, progress_stage, deadline_date, approx_weight, approx_value, size, follow_up, intake_priority, organisation_id, id]
        );

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error updating job:', error);
        return NextResponse.json({ error: 'Failed to update job' }, { status: 500 });
    }
}

//  Function:   DELETE
//  Purpose:    Deletes an existing job record from the database using the provided job ID.
//  Params:     req (Request) - the HTTP request containing a JSON body with:
//                  id (number) - required, identifies the job to delete
//  Returns:    NextResponse - JSON object with success confirmation or error details.
export async function DELETE(req: Request) {
    try {
        const { id } = await req.json();

        if (!id) {
            return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
        }

        await pool.query('DELETE FROM jobs WHERE id = $1', [id]);

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting job:', error);
        return NextResponse.json({ error: 'Failed to delete job' }, { status: 500 });
    }
}