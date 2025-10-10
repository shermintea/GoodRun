/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      login/page.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      10-10-2025
* Version:   2.2
* Purpose:   Implements the volunteer login page with secure
*            authentication form, styled header with logo, and
*            user-friendly navigation (e.g. forgot password link).
* Revisions:
* v1.0 - 11-09-2025 - Initial implementation of login UI
* v1.1 - 08-10-2025 - Fixes fetch URL + Content-Type, adds basic UX guards,
*                     and redirects by role from API response.
* v2.0 - 09-10-2025 - Added NextAuth login session and db integration
* v2.1 - 10-10-2025 - Added loading state and debug lines
* v2.2 - 10-10-2025 - Redirect session users to dashboard directly
* v2.3 - 10-10-2025 - Replaced with reusable header
* v3.0 - 10-10-2025 - Merged role-based redirection and session implementation.
*******************************************************/

"use client";;

import Link from "next/link";
import { signIn } from "next-auth/react";
import { useState, useTransition } from "react";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string>("");
  const [isPending, startTransition] = useTransition();

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isPending) return;

    setError("");

    startTransition(async () => {
      const result = await signIn("credentials", {
        redirect: false,
        email,
        password,
      });

      if (result?.error) {
        setError("Invalid email or password. Please try again.");
        return;
      }
    });
  };

  // TO-DO: add remember me button
  return (
    <main className="min-h-screen bg-gray-50">


      {/* Login form */}
      <section className="mx-auto max-w-md px-6 py-40">
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
              disabled={isPending}
              className="w-full mt-2 rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600/40 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {isPending ? "Logging in…" : "Log In"}
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