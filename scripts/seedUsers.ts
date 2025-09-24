import bcrypt from 'bcryptjs';
import db from '../lib/db';

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
