 /*******************************************************
 * File: app/api/profile/route.ts
 * Purpose: Return and update the logged-in user's profile
 * Notes: Includes total completed pickups from jobs table
 *******************************************************/

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth";
import db from "@/lib/db"; // <-- your Postgres client (e.g. pg or prisma)

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = (session.user as any)?.email;
    if (!userEmail) {
      return NextResponse.json({ error: "No email in session" }, { status: 400 });
    }

    // --- 1️⃣ Fetch user info ---
    const userResult = await db.query(
      `
      SELECT id, name, email, role, phone_no, birthday
      FROM users
      WHERE email = $1
      LIMIT 1;
      `,
      [userEmail]
    );

    if (userResult.rows.length === 0) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const user = userResult.rows[0];

    // --- 2️⃣ Count completed jobs ---
    const completedResult = await db.query(
      `
      SELECT COUNT(*) AS total
      FROM jobs
      WHERE assigned_to = $1
      AND progress_stage = 'completed';
      `,
      [user.id]
    );

    const totalPickupsFinished = parseInt(completedResult.rows[0].total, 10) || 0;

    // --- 3️⃣ Return combined profile ---
    return NextResponse.json({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone_no: user.phone_no,
      birthday: user.birthday,
      pickups_finished: totalPickupsFinished,
    });
  } catch (err: any) {
    console.error("GET /api/profile error:", err);
    return NextResponse.json(
      { error: "Failed to load profile", details: err.message },
      { status: 500 }
    );
  }
}

/* ---------- PATCH route for editing ---------- */
export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userEmail = (session.user as any)?.email;
    if (!userEmail) {
      return NextResponse.json({ error: "No email in session" }, { status: 400 });
    }

    const body = await req.json();
    const { name, phone_no, birthday } = body;

    await db.query(
      `
      UPDATE users
      SET name = $1,
          phone_no = $2,
          birthday = $3
      WHERE email = $4;
      `,
      [name, phone_no, birthday || null, userEmail]
    );

    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error("PATCH /api/profile error:", err);
    return NextResponse.json(
      { error: "Failed to update profile", details: err.message },
      { status: 500 }
    );
  }
}
