/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      api/profile/route.ts
* Author:    IT Project – Medical Pantry – Group 17
* Date:      15-10-2025
* Version:   3.0
* Purpose:   Handles GET and PATCH for user profile.
* Revisions:
* v1.0 - 09-10-2025 - implemented PATCH /api/profile
* v2.0 - 10-10-2025 - implemented profile updates in db
* v3.0 - 15-10-2025 - modularized using services/profile.ts
*******************************************************/

import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth";
import { getUserProfileByEmail, updateUserProfile } from "@/lib/services/profile";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const user = await getUserProfileByEmail(session.user.email);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch (err) {
    console.error("Profile fetch error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const updatedUser = await updateUserProfile(session.user.email, body);

    if (!updatedUser) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    return NextResponse.json(updatedUser, { status: 200 });
  } catch (err) {
    console.error("Profile update error:", err);
    return NextResponse.json({ error: "Database error" }, { status: 500 });
  }
}
