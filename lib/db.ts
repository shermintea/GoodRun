/*******************************************************
*Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
*File:      lib/db.ts  
*Author:    IT Project – Medical Pantry – Group 17
*Date:      18-09-2025
*Version:   1.0
*Purpose:   Centralizes database connection setup, takes database credentials from .env.local,
*           and provides a reusable connection pool for other scripts.
*Revisions:
*v1.0 - 18-09-2025 - Initial implementation
*******************************************************/

import mysql from 'mysql2/promise';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Convert import.meta.url to a file path
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);


dotenv.config({ path: path.resolve(__dirname, '../.env.local') });

const db = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
});

export default db;
