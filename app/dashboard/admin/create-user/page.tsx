/*******************************************************
* File:      app/dashboard/admin/create-user/page.tsx
* Purpose:   Admin UI to create a new user
*******************************************************/
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type Role = "admin" | "volunteer";

export default function CreateUserPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [role, setRole] = useState<Role>("volunteer");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    setError(null);
    setSuccess(null);

    if (password !== confirm) {
      setError("Passwords do not match");
      return;
    }

    setSubmitting(true);
    try {
      const res = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ name, email, role, password }),
      });

      // Parse JSON defensively
      let data: any = null;
      try {
        const text = await res.text();
        data = text ? JSON.parse(text) : null;
      } catch {
        data = null;
      }

      if (!res.ok || data?.ok === false) {
        const msg = data?.error || `Failed to create user (HTTP ${res.status})`;
        setError(msg);
        return;
      }

      // ✅ Success
      const newId: number | undefined = data?.id;
      setSuccess(data?.message || `User created: ${name} <${email}>`);

      // Optional: navigate to the new user's detail page
      if (newId) {
        router.push(`/dashboard/admin/manage-users/${newId}`);
        return;
      }

      // Or clear form and stay here
      setName("");
      setEmail("");
      setRole("volunteer");
      setPassword("");
      setConfirm("");
    } catch (err) {
      console.error(err);
      setError("Network or server error");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <section className="mx-auto max-w-2xl w-full px-4 sm:px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-extrabold tracking-tight">Create New User</h1>
          <Link
            href="/dashboard/admin"
            className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
          >
            Back to Admin
          </Link>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-2xl bg-white border border-gray-200 p-6 shadow-sm space-y-5"
        >
          <div className="grid grid-cols-1 gap-5">
            <label className="text-sm">
              <span className="block mb-1 text-gray-700">Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full rounded-lg border px-3 py-2"
                placeholder="Jane Doe"
              />
            </label>

            <label className="text-sm">
              <span className="block mb-1 text-gray-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border px-3 py-2"
                placeholder="jane@example.com"
                autoComplete="email"
              />
            </label>

            <label className="text-sm">
              <span className="block mb-1 text-gray-700">Role</span>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="w-full rounded-lg border px-3 py-2"
              >
                <option value="volunteer">Volunteer</option>
                <option value="admin">Admin</option>
              </select>
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              <label className="text-sm">
                <span className="block mb-1 text-gray-700">Password</span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="•••"
                  autoComplete="new-password"
                />
              </label>

              <label className="text-sm">
                <span className="block mb-1 text-gray-700">Confirm Password</span>
                <input
                  type="password"
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  required
                  className="w-full rounded-lg border px-3 py-2"
                  placeholder="•••"
                  autoComplete="new-password"
                />
              </label>
            </div>
          </div>

          {error && (
            <div className="rounded-md bg-red-50 text-red-700 px-4 py-3 text-sm">
              {error}
            </div>
          )}
          {success && (
            <div className="rounded-md bg-emerald-50 text-emerald-700 px-4 py-3 text-sm">
              {success}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-red-700 hover:bg-red-800 text-white px-5 py-2 font-semibold disabled:opacity-60"
            >
              {submitting ? "Creating…" : "Create User"}
            </button>
            <Link
              href="/dashboard/admin/manage-users"
              className="rounded-lg border px-5 py-2 font-semibold hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
