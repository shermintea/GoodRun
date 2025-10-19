/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/dashboard/admin/manage-users/page.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      16-10-2025
* Version:   2.0
* Purpose:   Admin UI to view & search users
*            - Desktop: table layout
*            - Mobile: card layout
*            - Actions: Edit / Delete (admin only)
* Revisions:
* v2.0 - Responsive table→card, actions, created info
*******************************************************/
"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

type UserRow = {
  id: number;
  name: string;
  email: string;
  role: "admin" | "volunteer" | string;
  // optional from API:
  createdAt?: string | null;          // ISO string
  createdByName?: string | null;      // name of creator (admin)
  createdByEmail?: string | null;     // email of creator (admin)
};

type SessionMe = {
  role: "admin" | "volunteer" | string;
};

export default function ManageUsersPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const initialQ = searchParams.get("q") || "";
  const [q, setQ] = useState(initialQ);
  const [loading, setLoading] = useState(false);
  const [users, setUsers] = useState<UserRow[]>([]);
  const [err, setErr] = useState("");

  // who is viewing (to gate actions)
  const [me, setMe] = useState<SessionMe | null>(null);

  const queryString = useMemo(
    () => (q ? `?q=${encodeURIComponent(q)}` : ""),
    [q]
  );

  const fetchMe = async () => {
    // Adjust this endpoint to whatever you already use to read session
    try {
      const res = await fetch("/api/session", { credentials: "include" });
      if (res.ok) {
        const data = await res.json();
        setMe({ role: data?.user?.role ?? "volunteer" });
      } else {
        setMe({ role: "volunteer" }); // safest default
      }
    } catch {
      setMe({ role: "volunteer" });
    }
  };

  const fetchUsers = async () => {
    setLoading(true);
    setErr("");
    try {
      const res = await fetch(`/api/users${queryString}`, {
        credentials: "include",
      });
      const data = await res.json();
      if (!res.ok) {
        setErr(data?.error || "Failed to fetch users");
        setUsers([]);
      } else {
        // Expecting shape: { users: UserRow[] }
        setUsers(Array.isArray(data.users) ? data.users : []);
      }
    } catch {
      setErr("Network error while loading users.");
      setUsers([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMe();
  }, []);

  useEffect(() => {
    fetchUsers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [queryString]);

  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    router.replace(
      `/dashboard/admin/manage-users${params.toString() ? `?${params}` : ""}`
    );
    // fetchUsers runs via useEffect
  };

  const formatDate = (iso?: string | null) => {
    if (!iso) return "—";
    try {
      const d = new Date(iso);
      return d.toLocaleDateString(undefined, {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return "—";
    }
  };

  const handleDelete = async (u: UserRow) => {
    const ok = window.confirm(
      `Delete user “${u.name}” (${u.email})? This cannot be undone.`
    );
    if (!ok) return;

    try {
      const res = await fetch(`/api/users/${u.id}`, {
        method: "DELETE",
        credentials: "include",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        alert(data?.error || "Failed to delete user.");
        return;
      }
      // Refresh
      setUsers((prev) => prev.filter((x) => x.id !== u.id));
    } catch {
      alert("Network error while deleting user.");
    }
  };

  const canManage = me?.role === "admin";

  return (
    <div className="max-w-6xl mx-auto px-6 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-3xl font-semibold">Manage Users</h1>
        <div className="flex gap-3">
          <button
            type="button"
            className="px-4 py-2 rounded border"
            onClick={() => router.push("/dashboard/admin")}
          >
            Back to Admin
          </button>
          {canManage && (
            <button
              type="button"
              className="px-4 py-2 rounded bg-red-700 text-white hover:bg-red-800"
              onClick={() => router.push("/dashboard/admin/create-user")}
            >
              Create User
            </button>
          )}
        </div>
      </div>

      {/* Search */}
      <form onSubmit={onSearchSubmit} className="mb-4">
        <input
          className="w-full border rounded-xl px-4 py-3"
          placeholder="Search by name, email, role…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
      </form>

      {err && (
        <div className="mb-4 p-3 rounded border border-red-300 text-red-700 bg-red-50">
          {err}
        </div>
      )}

      {/* Mobile: cards */}
      <ul className="space-y-3 md:hidden">
        {loading ? (
          <li className="text-gray-500">Loading…</li>
        ) : users.length === 0 ? (
          <li className="text-gray-500">No users found.</li>
        ) : (
          users.map((u) => (
            <li
              key={u.id}
              className="rounded-2xl border bg-white shadow-sm p-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <div className="font-semibold">{u.name}</div>
                  <div className="text-sm text-gray-600">{u.email}</div>
                  <div className="mt-1 text-sm">
                    <span className="inline-flex items-center rounded-full border px-2 py-0.5 text-xs capitalize">
                      {u.role}
                    </span>
                  </div>
                </div>
                <button
                  className="text-blue-700 hover:underline whitespace-nowrap"
                  onClick={() =>
                    router.push(`/dashboard/admin/manage-users/${u.id}`)
                  }
                >
                  View
                </button>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-y-1 text-sm text-gray-600">
                <div className="font-medium text-gray-700">Created</div>
                <div>{formatDate(u.createdAt)}</div>
                <div className="font-medium text-gray-700">Created By</div>
                <div>
                  {u.createdByName
                    ? `${u.createdByName}${
                        u.createdByEmail ? ` (${u.createdByEmail})` : ""
                      }`
                    : "—"}
                </div>
              </div>

              {canManage && (
                <div className="mt-3 flex gap-3">
                  <button
                    className="px-3 py-1.5 rounded border hover:bg-gray-50"
                    onClick={() =>
                      router.push(
                        `/dashboard/admin/manage-users/${u.id}/edit`
                      )
                    }
                  >
                    Edit
                  </button>
                  <button
                    className="px-3 py-1.5 rounded border border-red-300 text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(u)}
                  >
                    Delete
                  </button>
                </div>
              )}
            </li>
          ))
        )}
      </ul>

      {/* Desktop: table */}
      <div className="overflow-hidden border rounded-2xl hidden md:block">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr className="text-left text-gray-600">
              <th className="py-3 px-4">Name</th>
              <th className="py-3 px-4">Email</th>
              <th className="py-3 px-4">Role</th>
              <th className="py-3 px-4">Created</th>
              <th className="py-3 px-4">Created By</th>
              <th className="py-3 px-4">Actions</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td className="py-4 px-4 text-gray-500" colSpan={6}>
                  Loading…
                </td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td className="py-6 px-4 text-gray-500" colSpan={6}>
                  No users found.
                </td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-t">
                  <td className="py-3 px-4">{u.name}</td>
                  <td className="py-3 px-4">{u.email}</td>
                  <td className="py-3 px-4 capitalize">{u.role}</td>
                  <td className="py-3 px-4 text-gray-700">
                    {formatDate(u.createdAt)}
                  </td>
                  <td className="py-3 px-4 text-gray-700">
                    {u.createdByName
                      ? `${u.createdByName}${
                          u.createdByEmail ? ` (${u.createdByEmail})` : ""
                        }`
                      : "—"}
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-3">
                      <button
                        className="text-blue-700 hover:underline"
                        onClick={() =>
                          router.push(
                            `/dashboard/admin/manage-users/${u.id}`
                          )
                        }
                      >
                        View
                      </button>
                      {canManage && (
                        <>
                          <button
                            className="text-gray-700 hover:underline"
                            onClick={() =>
                              router.push(
                                `/dashboard/admin/manage-users/${u.id}/edit`
                              )
                            }
                          >
                            Edit
                          </button>
                          <button
                            className="text-red-700 hover:underline"
                            onClick={() => handleDelete(u)}
                          >
                            Delete
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
