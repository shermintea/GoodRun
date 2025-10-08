/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      login/page.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      12-09-2025
* Version:   1.0
* Purpose:   Implements the volunteer login page with secure
*            authentication form, styled header with logo, and
*            user-friendly navigation (e.g. forgot password link).
* Revisions:
* v1.0 - 11-09-2025 - Initial implementation of login UI
* v1.1 - 08-10-2025 - Fixes fetch URL + Content-Type, adds basic UX guards,
*                         and redirects by role from API response.
*******************************************************/

// enables state and fetch
"use client";

import Image from "next/image";
import Link from "next/link";
import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();
  const search = useSearchParams();
  const nextUrl = search.get("next"); // e.g. /dashboard/admin
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();
  const loading = isPending;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (loading) return;

    setError("");

    const body = {
      email: email.trim().toLowerCase(),
      password,
    };

    startTransition(async () => {
      try {
        const res = await fetch("/api/login", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(body),
        });

        let data: any = null;
        try {
          data = await res.json();
        } catch {
          /* ignore non-JSON */
        }

        if (!res.ok || !data?.ok) {
          setError(data?.error ?? "Invalid email or password");
          return;
        }

        // ✅ Give the browser a tick to persist Set-Cookie before navigating
        await new Promise((r) => setTimeout(r, 250));

        // 1) If URL had ?next=... go there
        if (nextUrl && nextUrl.startsWith("/")) {
          router.push(nextUrl);
          return;
        }

        // 2) Otherwise by role, fallback to /dashboard
        const role: string | undefined = data.role;
        if (role === "admin") router.push("/dashboard/admin");
        else if (role === "volunteer") router.push("/dashboard/volunteer");
        else router.push("/dashboard");
      } catch (err) {
        console.error("Login error:", err);
        setError("Server error. Please try again.");
      }
    });
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top banner */}
      <header className="bg-[#171e3a] text-white">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center gap-3">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/mpLogo.png"
              alt="Medical Pantry logo"
              width={85}
              height={85}
              className="rounded-md"
              priority
            />
            <span className="text-3xl font-semibold tracking-tight">
              Medical Pantry
            </span>
          </Link>
        </div>
      </header>

      {/* Login form */}
      <section className="mx-auto max-w-md px-6 mt-40">
        <div className="rounded-xl border border-gray-200 bg-white px-8 py-10 shadow-sm">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit} noValidate>
            {/* Email */}
            <div className="flex flex-col gap-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700">
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                autoComplete="current-password"
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              disabled={loading}
              className="w-full mt-2 rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {loading ? "Logging in…" : "Log In"}
            </button>

            {/* Forgot password */}
            <p className="mt-0 text-sm text-left">
              <Link href="/reset-password" className="text-black underline hover:text-red-600">
                Forgot password?
              </Link>
            </p>

            {/* Error message */}
            {error && (
              <p className="text-red-600 text-sm" role="alert" aria-live="polite">
                {error}
              </p>
            )}
          </form>
        </div>
      </section>
    </main>
  );
}