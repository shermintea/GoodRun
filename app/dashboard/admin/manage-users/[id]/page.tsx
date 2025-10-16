/*******************************************************
* File: app/dashboard/admin/manage-users/[id]/page.tsx
* Purpose: View a single user (fields from DB schema)
*******************************************************/
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type UserDetail = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "volunteer" | string;
  phone_no: string | null;
  birthday: string | null; // ISO date or YYYY-MM-DD
};

export default function ViewUserPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session } = useSession();
  const isAdmin = (session?.user as any)?.role === "admin";

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    const load = async () => {
      try {
        const res = await fetch(`/api/users/${id}`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load user");
        const u = data.user as UserDetail;
        setUser(u);
      } catch (e: any) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id]);

  const fmtDate = (d: string | null) => {
    if (!d) return "—";
    const x = new Date(d);
    return isNaN(x.getTime()) ? d : x.toLocaleDateString();
  };

  if (loading) return <main className="p-8 text-gray-500">Loading user…</main>;
  if (err) return <main className="p-8 text-red-600">Error: {err}</main>;
  if (!user) return <main className="p-8 text-gray-600">User not found.</main>;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-semibold">
            User #{user.id} — {user.name}
          </h1>
          <button
            onClick={() => router.back()}
            className="px-3 py-2 rounded border hover:bg-gray-50"
          >
            Back
          </button>
        </div>

        <div className="text-gray-800 space-y-3">
          <p><span className="font-medium">Email:</span> {user.email}</p>
          <p className="capitalize"><span className="font-medium">Role:</span> {user.role}</p>
          <p><span className="font-medium">Phone:</span> {user.phone_no ?? "—"}</p>
          <p><span className="font-medium">Birthday:</span> {fmtDate(user.birthday)}</p>
        </div>

        {isAdmin && (
          <div className="flex gap-3 pt-2">
            <button
              onClick={() => router.push(`/dashboard/admin/manage-users/${user.id}/edit`)}
              className="px-4 py-2 rounded bg-blue-600 text-white hover:bg-blue-700"
            >
              Edit
            </button>
            <button
              onClick={() => router.push(`/dashboard/admin/manage-users`)}
              className="px-4 py-2 rounded border hover:bg-gray-50"
            >
              Back to List
            </button>
          </div>
        )}
      </div>
    </main>
  );
}
