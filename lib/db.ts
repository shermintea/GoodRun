/*******************************************************
*Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
*File:      lib/db.ts  
*Author:    IT Project – Medical Pantry – Group 17
*Date:      10-10-2025
*Version:   2.2
*Purpose:   Centralizes database connection setup, takes database credentials from .env.local,
*           and provides a reusable connection pool for other scripts.
*Revisions:
*v1.0 - 18-09-2025 - Initial implementation
*v2.0 - 08-10-2025 - Migrated from MySQL to PostgreSQL (Render deployment)
*v2.1 - 08-10-2025 - Removed manual dotenv configuration for simplicity
*v2.2 - 10-10-2025 - Force SSL always on for local testing
*******************************************************/

import { Pool } from 'pg';

// Create PostgreSQL connection pool
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false,
    },
});

export default pool;
