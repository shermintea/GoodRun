/*******************************************************
* File:      app/dashboard/admin/manage-users/page.tsx
* Purpose:   Admin UI to list, search, edit, and delete users
*******************************************************/
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type User = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "volunteer";
  created_at?: string | null;
};

export default function ManageUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [editing, setEditing] = useState<User | null>(null);
  const [saving, setSaving] = useState(false);
  const [pwd, setPwd] = useState(""); // optional password change

  const fetchUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/users", { cache: "no-store" });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "Failed to load users");
        setUsers([]);
      } else {
        setUsers(data.users);
      }
    } catch (e) {
      console.error(e);
      setError("Network or server error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return users;
    return users.filter(
      (u) =>
        u.name.toLowerCase().includes(s) ||
        u.email.toLowerCase().includes(s) ||
        u.role.toLowerCase().includes(s)
    );
  }, [q, users]);

  const onEdit = (u: User) => {
    setEditing(u);
    setPwd("");
  };

  const onDelete = async (u: User) => {
    if (!confirm(`Delete user "${u.email}"? This cannot be undone.`)) return;
    try {
      const res = await fetch(`/api/users/${u.id}`, { method: "DELETE" });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        alert(data?.error ?? "Failed to delete user");
        return;
      }
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch (e) {
      console.error(e);
      alert("Network or server error");
    }
  };

  const onSave = async () => {
    if (!editing) return;
    setSaving(true);
    try {
      const payload: any = { name: editing.name, role: editing.role };
      if (pwd) payload.password = pwd;

      const res = await fetch(`/api/users/${editing.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok || !data?.ok) {
        alert(data?.error ?? "Failed to update user");
        setSaving(false);
        return;
      }

      // Update in list
      setUsers((prev) => prev.map((x) => (x.id === editing.id ? data.user : x)));
      setEditing(null);
      setPwd("");
    } catch (e) {
      console.error(e);
      alert("Network or server error");
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-5xl w-full px-4 sm:px-6 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">Manage Users</h1>
          <Link href="/dashboard/admin" className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50">
            Back to Admin
          </Link>
        </div>

        {/* Search + Create */}
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center justify-between">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Search by name, email, role…"
            className="w-full sm:w-2/3 rounded-lg border px-3 py-2"
          />
          <Link
            href="/dashboard/admin/create-user"
            className="rounded-lg bg-red-700 hover:bg-red-800 text-white px-4 py-2 text-center"
          >
            Create User
          </Link>
        </div>

        {/* Table */}
        <div className="overflow-x-auto rounded-xl border bg-white">
          <table className="min-w-full text-sm">
            <thead className="bg-gray-50 text-gray-600">
              <tr>
                <th className="px-4 py-3 text-left font-semibold">Name</th>
                <th className="px-4 py-3 text-left font-semibold">Email</th>
                <th className="px-4 py-3 text-left font-semibold">Role</th>
                <th className="px-4 py-3 text-left font-semibold">Created</th>
                <th className="px-4 py-3 text-right font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading && (
                <tr>
                  <td className="px-4 py-4 text-gray-500" colSpan={5}>
                    Loading…
                  </td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td className="px-4 py-6 text-gray-500" colSpan={5}>
                    No users found.
                  </td>
                </tr>
              )}
              {!loading &&
                filtered.map((u) => (
                  <tr key={u.id} className="border-t">
                    <td className="px-4 py-3">{u.name}</td>
                    <td className="px-4 py-3">{u.email}</td>
                    <td className="px-4 py-3">{u.role}</td>
                    <td className="px-4 py-3">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString() : "—"}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex gap-2 justify-end">
                        <button
                          onClick={() => onEdit(u)}
                          className="rounded-lg border px-3 py-1.5 hover:bg-gray-50"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(u)}
                          className="rounded-lg bg-red-600 hover:bg-red-700 text-white px-3 py-1.5"
                        >
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        </div>

        {/* Edit Drawer / Panel */}
        {editing && (
          <div className="fixed inset-0 bg-black/20 flex items-end sm:items-center justify-center z-40">
            <div className="w-full sm:max-w-md bg-white rounded-t-2xl sm:rounded-2xl p-6 shadow-xl">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold">Edit User</h2>
                <button onClick={() => setEditing(null)} className="text-gray-600 hover:text-black">
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <label className="text-sm block">
                  <span className="block text-gray-700 mb-1">Name</span>
                  <input
                    value={editing.name}
                    onChange={(e) => setEditing({ ...editing, name: e.target.value })}
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </label>

                <label className="text-sm block">
                  <span className="block text-gray-700 mb-1">Role</span>
                  <select
                    value={editing.role}
                    onChange={(e) =>
                      setEditing({ ...editing, role: e.target.value as "admin" | "volunteer" })
                    }
                    className="w-full rounded-lg border px-3 py-2"
                  >
                    <option value="volunteer">Volunteer</option>
                    <option value="admin">Admin</option>
                  </select>
                </label>

                <label className="text-sm block">
                  <span className="block text-gray-700 mb-1">New Password (optional)</span>
                  <input
                    type="password"
                    value={pwd}
                    onChange={(e) => setPwd(e.target.value)}
                    placeholder="Leave blank to keep existing"
                    className="w-full rounded-lg border px-3 py-2"
                  />
                </label>
              </div>

              <div className="flex items-center justify-end gap-2 mt-5">
                <button
                  onClick={() => setEditing(null)}
                  className="rounded-lg border px-4 py-2 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="rounded-lg bg-red-700 hover:bg-red-800 text-white px-5 py-2 disabled:opacity-60"
                >
                  {saving ? "Saving…" : "Save changes"}
                </button>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
