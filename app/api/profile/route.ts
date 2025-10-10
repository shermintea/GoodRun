/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      api/profile/route.ts
* Author:    IT Project – Medical Pantry – Group 17
* Date:      10-10-2025
* Version:   2.0
* Purpose:   Updates the PostgreSQL user record.
*            Returns the updated data.
* Revisions:
* v1.0 - 09-10-2025 - implemented PATCH /api/profile
* v2.0 - 10-10-2025 - implemented profile updates in db
*******************************************************/
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import pool from "@/lib/db";

// GET /api/profile  → returns current user's info
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const result = await pool.query(
      `SELECT id, name, email, phone, birthdate, pickups_finished, image
       FROM users
       WHERE email = $1`,
      [session.user.email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("Profile fetch error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

// PATCH /api/profile  → updates current user's info
export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, phone, birthdate, pickups_finished, image } = body;

    const result = await pool.query(
      `UPDATE users
       SET name = $1, phone = $2, birthdate = $3, pickups_finished = $4, image = $5
       WHERE email = $6
       RETURNING id, name, email, phone, birthdate, pickups_finished, image`,
      [name, phone, birthdate, pickups_finished, image, session.user.email]
    );

    if (result.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(result.rows[0]);
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
