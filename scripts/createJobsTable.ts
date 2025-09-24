import db from '../lib/db';

export async function createJobsTable() {
    await db.query(`
        CREATE TABLE IF NOT EXISTS jobs (
            id INT AUTO_INCREMENT PRIMARY KEY,
            assigned_to VARCHAR(255),
            progress_stage ENUM('available', 'reserved', 'in delivery', 'delivered'),
            deadline_date DATE,
            approx_weight FLOAT,
            approx_value DECIMAL(10,2),
            size ENUM('tiny', 'small'),
            follow_up BOOLEAN DEFAULT FALSE,
            intake_priority ENUM('low', 'medium', 'high'),
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `);

    console.log('jobs table created or already exists');
}

