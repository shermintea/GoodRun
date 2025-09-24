/*******************************************************
*Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
*File:      scripts/setupDb.ts  
*Author:    IT Project – Medical Pantry – Group 17
*Date:      24-09-2025
*Version:   1.0
*Purpose:   Master Script that calls all other initialisation scripts
*           for database setup. Creates required database objects
*           if not already existing.
*Revisions:
*v1.0 - 24-09-2025 - Initial implementation
*******************************************************/

import { createUsersTable } from './createUsersTable';
import { createJobsTable } from './createJobsTable';
import { seedUsers } from './seedUsers';
import { seedJobs } from './seedJobs';
import db from '../lib/db';

//  Function:   “setupDb”
//  Purpose:    Calls initialisation scripts and logs progress.        
async function setupDb() {
    try {
        console.log('Setting up database...');
        await createUsersTable();
        await createJobsTable();

        console.log('Seeding data...');
        await seedUsers();
        await seedJobs();

        console.log('Database setup complete!');
    } catch (err) {
        console.error('Error setting up database:', err);
    } finally {
        await db.end();
        process.exit(0);
    }
}

setupDb();
