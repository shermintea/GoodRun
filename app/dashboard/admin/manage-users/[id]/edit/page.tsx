/*******************************************************
* File: app/dashboard/admin/manage-users/[id]/edit/page.tsx
* Purpose: Admin edit form for user (DB fields) + Delete
*******************************************************/
"use client";

import { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type UserDetail = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "volunteer" | string;
  phone_no: string | null;
  birthday: string | null; // YYYY-MM-DD
};

export default function EditUserPage() {
  const { id } = useParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const meId = Number((session?.user as any)?.id);
  const isAdmin = (session?.user as any)?.role === "admin";

  const [user, setUser] = useState<UserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (status === "loading") return;
    if (!isAdmin) {
      router.replace(`/dashboard/admin/manage-users/${id}`); // read-only redirect
      return;
    }
    const load = async () => {
      try {
        const res = await fetch(`/api/users/${id}`, { credentials: "include" });
        const data = await res.json();
        if (!res.ok) throw new Error(data?.error || "Failed to load user");
        const u = data.user as UserDetail;
        const birthday = u.birthday ? u.birthday.split("T")[0] : null;
        setUser({ ...u, birthday });
      } catch (e: any) {
        setErr(e.message);
      } finally {
        setLoading(false);
      }
    };
    if (id) load();
  }, [id, isAdmin, status, router]);

  const validate = (): string | null => {
    if (!user) return "No user loaded";
    if (!user.name.trim()) return "Name is required";
    if (!user.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(user.email))
      return "Valid email is required";
    if (user.phone_no && !/^\d{10}$/.test(user.phone_no))
      return "Phone number must be 10 digits";
    if (user.role !== "admin" && user.role !== "volunteer")
      return "Role must be admin or volunteer";
    return null;
  };

  const onSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setMsg(null);
    setErr(null);
    const v = validate();
    if (v) {
      setErr(v);
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(user),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data?.error || "Failed to save user");
      setMsg("✅ User updated");
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setSaving(false);
    }
  };

  const onDelete = async () => {
    if (!user) return;
    if (user.id === meId) {
      setErr("You cannot delete your own account.");
      return;
    }
    if (!confirm(`Delete user “${user.name}” (${user.email})? This cannot be undone.`)) return;

    setDeleting(true);
    setErr(null);
    setMsg(null);
    try {
      const res = await fetch(`/api/users/${user.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(data?.error || "Failed to delete user");
      // go back to list on success
      router.push("/dashboard/admin/manage-users");
    } catch (e: any) {
      setErr(e.message || "Failed to delete user");
      setDeleting(false);
    }
  };

  // Derive: disable delete if self
  const canDelete = useMemo(() => {
    if (!user) return false;
    return user.id !== meId;
  }, [user, meId]);

  if (loading) return <main className="p-8 text-gray-500">Loading user…</main>;
  if (err && !user) return <main className="p-8 text-red-600">Error: {err}</main>;
  if (!user) return <main className="p-8 text-gray-600">User not found.</main>;

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-2xl mx-auto bg-white border rounded-2xl p-6 shadow-sm space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Edit User #{user.id}</h1>
          <div className="flex gap-2">
            <button
              onClick={() => router.back()}
              className="px-3 py-2 rounded border hover:bg-gray-50"
            >
              Back
            </button>
          </div>
        </div>

        {err && (
          <div className="rounded border border-red-300 bg-red-50 text-red-700 px-3 py-2">
            {err}
          </div>
        )}
        {msg && (
          <div className="rounded border bg-green-50 text-green-700 px-3 py-2">
            {msg}
          </div>
        )}

        <form onSubmit={onSave} className="space-y-4">
          <div>
            <label className="block font-medium text-gray-700">Name</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={user.name}
              onChange={(e) => setUser({ ...user, name: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Email</label>
            <input
              type="email"
              className="w-full border rounded-lg px-3 py-2"
              value={user.email}
              onChange={(e) => setUser({ ...user, email: e.target.value })}
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Role</label>
            <select
              className="w-full border rounded-lg px-3 py-2"
              value={user.role}
              onChange={(e) => setUser({ ...user, role: e.target.value })}
            >
              <option value="admin">Admin</option>
              <option value="volunteer">Volunteer</option>
            </select>
          </div>

          <div>
            <label className="block font-medium text-gray-700">Phone (10 digits)</label>
            <input
              className="w-full border rounded-lg px-3 py-2"
              value={user.phone_no ?? ""}
              onChange={(e) =>
                setUser({
                  ...user,
                  // allow only digits in state
                  phone_no: e.target.value.replace(/\D/g, "").slice(0, 10),
                })
              }
              maxLength={10}
              inputMode="numeric"
              pattern="\d{10}"
            />
          </div>

          <div>
            <label className="block font-medium text-gray-700">Birthday</label>
            <input
              type="date"
              className="w-full border rounded-lg px-3 py-2"
              value={user.birthday ?? ""}
              onChange={(e) => setUser({ ...user, birthday: e.target.value })}
            />
          </div>

          <div className="flex flex-wrap gap-3 pt-2">
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 rounded bg-red-700 text-white hover:bg-red-800 disabled:opacity-60"
            >
              {saving ? "Saving…" : "Save Changes"}
            </button>

            <button
              type="button"
              className="px-4 py-2 rounded border hover:bg-gray-50"
              onClick={() => router.push(`/dashboard/admin/manage-users/${user.id}`)}
            >
              Cancel
            </button>

            <button
              type="button"
              onClick={onDelete}
              disabled={!canDelete || deleting}
              className={`px-4 py-2 rounded border ${
                canDelete ? "border-red-300 text-red-700 hover:bg-red-50" : "opacity-50 cursor-not-allowed"
              }`}
              title={canDelete ? "Delete this user" : "You cannot delete your own account"}
            >
              {deleting ? "Deleting…" : "Delete User"}
            </button>
          </div>
        </form>
      </div>
    </main>
  );
}
