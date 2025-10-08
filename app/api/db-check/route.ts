// app/api/db-check/route.ts
import pool from "@/lib/db";
import { NextResponse } from "next/server";
export async function GET() {
  const { rows } = await pool.query(
    `select id, email, role, left(password_hash,12) hash_start
     from users where lower(email)=lower($1) limit 1`,
    ["louie@example.com"]
  );
  return NextResponse.json({ rows });
}
