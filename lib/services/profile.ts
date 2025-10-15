/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      lib/services/profile.ts
* Author:    IT Project – Medical Pantry – Group 17
* Date:      15-10-2025
* Version:   1.0
* Purpose:   
* Revisions:
* v1.0 - Initial implementation
*******************************************************/

import pool from "@/lib/db";

// Fetch user by email
export async function getUserProfileByEmail(email: string) {
    const result = await pool.query(
        `SELECT u.id, u.name, u.email, u.phone_no, u.birthday,
            COALESCE(
                (SELECT COUNT(*) 
                 FROM jobs j 
                 WHERE j.assigned_to = u.id AND j.progress_stage = 'delivered'), 
                0
            ) AS pickups_finished,
            u.icon, u.role
        FROM users u
        WHERE u.email = $1
        `,
        [email]
    );
    return result.rows[0] || null;
}

// Update user info
export async function updateUserProfile(email: string, data: {
    name?: string;
    phone_no?: string;
    birthday?: string | null;
    icon?: string | null;
}) {
    const { name, phone_no, birthday, icon } = data;

    // Type conversion before storing to database
    // let birthdayDate = null;
    // if (birthday) {
    //     const parsed = new Date(birthday);
    //     if (!isNaN(parsed.getTime())) {
    //         birthdayDate = parsed.toISOString().split("T")[0]; // "YYYY-MM-DD"
    //     }
    // }
    const iconBuffer = icon ? Buffer.from(icon, "base64") : null;

    const result = await pool.query(
        `UPDATE users
        SET name = $1, phone_no = $2, birthday = $3::date, icon = COALESCE($4, icon)
        WHERE email = $5
        RETURNING id, name, email, phone_no, birthday, encode(icon, 'base64') AS icon`,
        [name, phone_no, birthday, iconBuffer, email]
    );
    const user = result.rows[0];
    if (user?.icon) {
        user.icon = `data:image/png;base64,${user.icon}`;
    }

    return user || null;
}
