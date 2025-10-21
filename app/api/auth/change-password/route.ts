import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/utils/auth";
import pool from "@/lib/db";

export async function POST(req: NextRequest) {
    try {
        const session = await getServerSession(authOptions);
        if (!session?.user?.id) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
        }

        const { oldPassword, newPassword } = await req.json();

        const { rows } = await pool.query(
            "SELECT password_hash FROM users WHERE id = $1",
            [session.user.id]
        );
        const user = rows[0];
        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 });
        }

        const match = await bcrypt.compare(oldPassword, user.password_hash);
        if (!match) {
            return NextResponse.json({ error: "Incorrect old password" }, { status: 400 });
        }

        const newHash = await bcrypt.hash(newPassword, 10);
        await pool.query("UPDATE users SET password_hash = $1 WHERE id = $2", [
            newHash,
            session.user.id,
        ]);

        return NextResponse.json({ ok: true, message: "Password updated successfully" });
    } catch (err) {
        console.error(err);
        return NextResponse.json({ error: "Server error" }, { status: 500 });
    }
}
