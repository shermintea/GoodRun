import { createUsersTable } from './createUsersTable';
import { createJobsTable } from './createJobsTable';
import { seedUsers } from './seedUsers';
import { seedJobs } from './seedJobs';
import db from '../lib/db';

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
