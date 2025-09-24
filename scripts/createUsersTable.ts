/*******************************************************
*Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
*File:      scripts/createUsersTable.ts  
*Author:    IT Project – Medical Pantry – Group 17
*Date:      24-09-2025
*Version:   1.0
*Purpose:   Creates a MySQL Users table in local database 
*           (if not already existing)
*Revisions:
*v1.0 - 24-09-2025 - Initial implementation
*******************************************************/

import db from '../lib/db';

//  Function:   “createUsersTable”
//  Purpose:    Creates a new Users table.
export async function createUsersTable() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS users (
            id INT AUTO_INCREMENT PRIMARY KEY,
            email VARCHAR(255) UNIQUE NOT NULL,
            password_hash VARCHAR(255) NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    console.log('users table created or already exists');
}
