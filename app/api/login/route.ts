/*******************************************************
*Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
*File:      app/api/login/route.ts  
*Author:    IT Project – Medical Pantry – Group 17
*Date:      18-09-2025
*Version:   1.0
*Purpose:   Backend Login request handler.
*           Verifies user credentials against the DB.
*           Protects passwords by using bcrypt hashing.
*           Serves as entry point for authentication.
*Revisions:
*v1.0 - 18-09-2025 - Initial implementation
*******************************************************/

import { NextRequest, NextResponse } from 'next/server';
import db from '@/lib/db';
import bcrypt from 'bcryptjs';

//  Function:   POST
//  Purpose:    Handles user login by validating credentials against the database.
//  Params:     req (NextRequest) - the incoming HTTP request containing email and password.
//  Returns:    NextResponse - JSON response with success or error message, and user ID if successful.
export async function POST(req: NextRequest) {
  const { email, password } = await req.json();

  try {
    const [rows] = await db.query(
      'SELECT id, email, password_hash FROM users WHERE email = ?',
      [email]
    );

    const user = (rows as any)[0];

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid password' }, { status: 401 });
    }

    // TODO: Generate session or JWT here
    return NextResponse.json({ message: 'Login successful', userId: user.id });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
