import bcrypt from 'bcryptjs';
import db from '../lib/db';

async function addUser(email: string, password: string) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    await db.query(
        'INSERT INTO users (email, password_hash) VALUES (?, ?)',
        [email, hashedPassword]
    );

    console.log('User added:', email);
}

// Test users 
const testUsers = [
    { email: 'sophia@example.com', password: '000' },
    { email: 'esther@example.com', password: '000' },
    { email: 'monna@example.com', password: '000' },
    { email: 'louie@example.com', password: '000' },
    { email: 'jeslyn@example.com', password: '000' },
    { email: 'boxiang@example.com', password: '000' },
];

async function main() {
    for (const user of testUsers) {
        try {
            await addUser(user.email, user.password);
        } catch (err: any) {
            // Handle duplicate users 
            if (err.code === 'ER_DUP_ENTRY') {
                console.log(`User already exists: ${user.email}`);
            } else {
                throw err;
            }
        }
    }
}

// Run script
main()
    .then(() => {
        console.log('All users processed.');
        process.exit(0);
    })
    .catch((err) => {
        console.error(err);
        process.exit(1);
    });
