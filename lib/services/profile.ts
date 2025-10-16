/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      lib/services/profile.ts
* Author:    IT Project – Medical Pantry – Group 17
* Date:      15-10-2025
* Version:   1.0
* Purpose:   Interacts with database. 
*            Allows user lookup and update.
* Revisions:
* v1.0 - Initial implementation
*******************************************************/

import pool from "@/lib/db";

// Fetch user by email
export async function getUserProfileByEmail(email: string) {
    const result = await pool.query(
        `SELECT u.id, u.name, u.email, u.phone_no, 
        to_char(u.birthday, 'YYYY-MM-DD') as birthday,
        COALESCE(
            (SELECT COUNT(*) 
                FROM jobs j 
                WHERE j.assigned_to = u.id AND j.progress_stage = 'delivered'), 
            0
        ) AS pickups_finished, u.role
        FROM users u
        WHERE u.email = $1
        `,
        [email]
    );
    const user = result.rows[0];
    return user || null;
}

// Update user info
export async function updateUserProfile(email: string, data: {
    name?: string;
    phone_no?: string;
    birthday?: string | null;
    icon?: string | null;
}) {
    const { name, phone_no, birthday } = data;
    const birthdayDate = birthday ? birthday : null;

    const result = await pool.query(
        `UPDATE users
        SET name = $1, phone_no = $2, birthday = $3::date
        WHERE email = $4
        RETURNING id, name, email, phone_no, to_char(birthday,'YYYY-MM-DD') as birthday`,
        [name, phone_no, birthdayDate, email]
    );
    const user = result.rows[0];
    return user || null;
}
