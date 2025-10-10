/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/api/login/route.ts  
* Author:    IT Project – Medical Pantry – Group 17
* Date:      09-10-2025
* Version:   3.0
* Purpose:   Backend login handler (PostgreSQL version)
*            Validates credentials, sets secure cookies
*            for session persistence and middleware routing.
* Revisions:
* v1.0 - 18-09-2025 - Initial implementation (MySQL)
* v2.0 - 08-10-2025 - Migrated to PostgreSQL
* v3.0 - 09-10-2025 - Added secure cookie handling + robust error checks
*******************************************************/

import { NextRequest, NextResponse } from "next/server";
import pool from "@/lib/db";
import bcrypt from "bcryptjs";

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    if (typeof email !== "string" || typeof password !== "string") {
      return NextResponse.json({ error: "Email and password required" }, { status: 400 });
    }

    // Case-insensitive lookup
    const { rows } = await pool.query(
      "SELECT id, email, password_hash, role FROM users WHERE lower(email)=lower($1) LIMIT 1",
      [email.trim()]
    );
    const user = rows[0];

    const ok = user ? await bcrypt.compare(password, user.password_hash) : false;
    if (!ok) {
      await new Promise(r => setTimeout(r, 250));
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 });
    }

    // Set cookies used by middleware
    const res = NextResponse.json({ ok: true, userId: user.id, role: user.role });
    const secure = process.env.NODE_ENV === "production";
    res.cookies.set("gr_role", user.role, { httpOnly: true, sameSite: "lax", path: "/", secure, maxAge: 60 * 60 * 6 });
    res.cookies.set("gr_uid", String(user.id), { httpOnly: true, sameSite: "lax", path: "/", secure, maxAge: 60 * 60 * 6 });

    return res;
  } catch (e) {
    console.error("Login error:", e);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
