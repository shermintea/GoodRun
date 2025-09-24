/*******************************************************
*Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
*File:      scripts/seedUsers.ts  
*Author:    IT Project – Medical Pantry – Group 17
*Date:      24-09-2025
*Version:   1.1
*Purpose:   Inserts list of test users into local MySQL Users Table
*Revisions:
*v1.0 - 18-09-2025 - Initial implementation
*v1.1 - 24-09/2025 - Refactored and added master script
*******************************************************/

import bcrypt from 'bcryptjs';
import db from '../lib/db';

//  Function:   “seedUsers”
//  Purpose:    Initialises a list of test users and insert new entries into MySQL table.
export async function seedUsers() {

    // List of test users
    const testUsers = [
        { email: 'sophia@example.com', password: '000' },
        { email: 'esther@example.com', password: '000' },
        { email: 'monna@example.com', password: '000' },
        { email: 'louie@example.com', password: '000' },
        { email: 'jeslyn@example.com', password: '000' },
        { email: 'boxiang@example.com', password: '000' },
    ];

    // Check if user already exists, insert if not
    for (const user of testUsers) {
        const [rows] = await db.query('SELECT id FROM users WHERE email = ?', [user.email]);
        if ((rows as any[]).length === 0) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(user.password, salt);

            await db.query(
                'INSERT INTO users (email, password_hash) VALUES (?, ?)',
                [user.email, hashedPassword]
            );

            console.log(`Added user: ${user.email}`);
        } else {
            console.log(`User already exists: ${user.email}`);
        }
    }
}
