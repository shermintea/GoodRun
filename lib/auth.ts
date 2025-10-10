/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      lib/auth.ts
* Author:    IT Project – Medical Pantry – Group 17
* Date:      10-10-2025
* Version:   1.1
* Purpose:   
* Revisions:
* v1.0 - 09-10-2025 - Define NextAuth configuration
* v1.1 - 10-10-2025 - Modified jwt session strategy
*******************************************************/

import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { compare } from 'bcryptjs';
import pool from '@/lib/db';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'text' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                try {
                    if (!credentials?.email || !credentials?.password) {
                        console.warn("Missing email or password");
                        return null;
                    }

                    const client = await pool.connect();
                    const result = await client.query(
                        'SELECT id, name, email, password_hash, role FROM users WHERE email = $1',
                        [credentials.email]
                    );
                    client.release();

                    if (result.rowCount === 0) {
                        console.warn("No user found for email:", credentials.email);
                        return null;
                    }

                    const user = result.rows[0];
                    if (!user) return null;

                    const isValid = await compare(credentials.password, user.password_hash);
                    if (!isValid) {
                        console.warn("Invalid password for:", credentials.email);
                        return null;
                    }

                    return {
                        id: user.id,
                        name: user.name,
                        email: user.email,
                        role: user.role
                    };
                } catch (err) {
                    console.error("Error in authorize:", err);
                    return null;
                }
            },
        }),
    ],
    session: {
        strategy: 'jwt', // server-side sessions
        maxAge: 30 * 60, // 30 minutes
    },
    jwt: {
        maxAge: 30 * 60, // 30 minutes
    },
    callbacks: {
        async jwt({ token, user }) {
            if (user) {
                token.id = (user as any).id;
                token.role = (user as any).role;
            }
            return token;
        },
        async session({ session, token }) {
            if (session.user) {
                session.user.id = token.id as any;
                (session.user as any).role = token.role as any;
            }
            return session;
        },
    },
    pages: {
        signIn: '(auth)/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
export default authOptions;