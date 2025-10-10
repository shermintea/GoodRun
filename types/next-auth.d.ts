/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      types/next-auth.d.ts
* Author:    IT Project – Medical Pantry – Group 17
* Date:      10-10-2025
* Version:   1.0
* Purpose:   Extends NextAuth session and JWT types to include
*            user id and role for application-level access control.
*******************************************************/

import NextAuth from 'next-auth';

declare module 'next-auth' {
    interface Session {
        user: {
            id: string;
            role: string;
            name?: string | null;
            email?: string | null;
            image?: string | null;
        };
    }

    interface User {
        id: string;
        role: string;
    }
}
