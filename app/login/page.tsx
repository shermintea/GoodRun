/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      login/page.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      10-10-2025
* Version:   2.1
* Purpose:   Implements the volunteer login page with secure
*            authentication form, styled header with logo, and
*            user-friendly navigation (e.g. forgot password link).
* Revisions:
* v1.0 - 11-09-2025 - Initial implementation of login UI
* v2.0 - 09-10-2025 - Added NextAuth login session and db integration
* v2.1 - 10-10-2025 - Added loading state and debug lines
*******************************************************/

"use client";

import Image from "next/image";
import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

export default function LoginPage() {
  const { data: session, status } = useSession();
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (status === "authenticated") {
      router.replace("/dashboard");
      console.log("Session status:", status, session); // debug
    }
  }, [status, router]);

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    const result = await signIn("credentials", {
      redirect: false,
      email,
      password,
      callbackUrl: "/dashboard",
    });
    console.log("signIn result", result); // debug

    if (result?.error) {
      setError("Invalid email or password. Please try again.");
    } else if (result?.ok) {
      router.push("/dashboard");
    }
  };

  // Render loading state
  if (status === "loading") {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p>Loading...</p>
      </main>
    );
  }

  // Front-end page render
  // TO-DO: add remember me button
  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top banner */}
      <header className="bg-[#171e3a] text-white">
        <div className="mx-auto max-w-6xl px-6 py-6 flex items-center gap-3">
          <a href="/" className="flex items-center gap-2">
            <Image
              src="/mpLogo.png"
              alt="Medical Pantry logo"
              width={85}
              height={85}
              className="rounded-md"
            />
            <span className="text-3xl font-semibold tracking-tight">
              Medical Pantry
            </span>
          </a>
        </div>
      </header>

      {/* Login form */}
      <section className="mx-auto max-w-md px-6 mt-40">
        <div className="rounded-xl border border-gray-200 bg-white px-8 py-10 shadow-sm">
          <form className="flex flex-col gap-6" onSubmit={handleSubmit}>

            {/* Email */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-medium text-gray-700"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* Password */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="password"
                className="text-sm font-medium text-gray-700"
              >
                Password
              </label>
              <input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full rounded-lg border border-gray-300 bg-gray-100 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-red-600"
              />
            </div>

            {/* Submit */}
            <button
              type="submit"
              className="w-full mt-2 rounded-lg bg-red-600 px-5 py-2 text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600/40"
            >
              Log In
            </button>

            {/* Forgot password */}
            <p className="mt-0 text-sm text-left">
              <a
                href="/reset-password"
                className="text-black underline hover:text-red-600"
              >
                Forgot password?
              </a>
            </p>

            {/* Error message */}
            {error && <p className="text-red-600 text-sm">{error}</p>}

          </form>
        </div>
      </section>
    </main>
  );
}
