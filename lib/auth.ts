/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      lib/auth.ts
* Author:    IT Project – Medical Pantry – Group 17
* Date:      09-10-2025
* Version:   1.0
* Purpose:   Implements the volunteer login page with secure
*            authentication form, styled header with logo, and
*            user-friendly navigation (e.g. forgot password link).
* Revisions:
* v1.0 - 11-09-2025 - Initial implementation of login UI
* v2.0 - 09-10-2025 - Define NextAuth configuration
*******************************************************/

import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import pool from '@/lib/db';
import bcrypt from 'bcryptjs';

export const authOptions: NextAuthOptions = {
    providers: [
        CredentialsProvider({
            name: 'Credentials',
            credentials: {
                email: { label: 'Email', type: 'email' },
                password: { label: 'Password', type: 'password' },
            },
            async authorize(credentials) {
                if (!credentials?.email || !credentials?.password) return null;

                const result = await pool.query(
                    'SELECT id, email, password_hash, role FROM users WHERE email = $1',
                    [credentials.email]
                );

                const user = result.rows[0];
                if (!user) return null;

                const isValid = await bcrypt.compare(credentials.password, user.password_hash);
                if (!isValid) return null;

                return { id: user.id, email: user.email, role: user.role };
            },
        }),
    ],
    session: {
        strategy: 'database', // server-side sessions
        maxAge: 60 * 60 * 24, // 1 day
    },
    callbacks: {
        async session({ session, user }) {
            if (session.user && user) {
                session.user.id = user.id;
                session.user.role = user.role;
            }
            return session;
        },
    },
    pages: {
        signIn: '/login',
    },
    secret: process.env.NEXTAUTH_SECRET,
};
