/*******************************************************
*Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
*File:      scripts/seedJobs.ts  
*Author:    IT Project – Medical Pantry – Group 17
*Date:      24-09-2025
*Version:   1.0
*Purpose:   Inserts list of test jobs into local MySQL Jobs table
*Revisions:
*v1.0 - 24-09-2025 - Initial implementation
*******************************************************/

import db from '../lib/db';

//  Function:   “seedJobs”
//  Purpose:    Initialises a list of test jobs and insert new entries into MySQL table.
export async function seedJobs() {

    // list of test jobs
    const jobs = [
        {
            assigned_to: 'jeslyn@example.com',
            progress_stage: 'available',
            deadline_date: '2025-10-01',
            approx_weight: 5.0,
            approx_value: 20.50,
            size: 'tiny',
            follow_up: false,
            intake_priority: 'high',
        },
        {
            assigned_to: 'sophia@example.com',
            progress_stage: 'reserved',
            deadline_date: '2025-11-15',
            approx_weight: 10.2,
            approx_value: 45.00,
            size: 'small',
            follow_up: true,
            intake_priority: 'medium',
        },
    ];

    // Check if job already exists, insert if not
    for (const job of jobs) {
        const [rows] = await db.query(
            'SELECT id FROM jobs WHERE assigned_to = ? AND deadline_date = ?',
            [job.assigned_to, job.deadline_date]
        );

        if ((rows as any[]).length === 0) {
            await db.query(
                `INSERT INTO jobs 
                (assigned_to, progress_stage, deadline_date, approx_weight, approx_value, size, follow_up, intake_priority)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
                [
                    job.assigned_to,
                    job.progress_stage,
                    job.deadline_date,
                    job.approx_weight,
                    job.approx_value,
                    job.size,
                    job.follow_up,
                    job.intake_priority,
                ]
            );

            console.log(`Added job for ${job.assigned_to}`);
        } else {
            console.log(`Job already exists for ${job.assigned_to}`);
        }
    }
}
