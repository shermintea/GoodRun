// app/dashboard/layout.tsx
import Link from "next/link";
import Image from "next/image";
import type { ReactNode } from "react";

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-[#171e3a] text-white">
        <div className="mx-auto max-w-6xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image src="/grLogo-alternate.png" alt="GoodRun logo" width={56} height={56} className="rounded-md" />
            <span className="text-xl font-semibold">GoodRun</span>
          </Link>

          <nav className="flex items-center gap-4">
            <Link href="/dashboard/volunteer" className="hover:underline">Volunteer</Link>
            <Link href="/dashboard/admin" className="hover:underline">Admin</Link>
            <Link
              href="/profile"
              className="rounded-full bg-white/90 px-4 py-1.5 text-[#171e3a] font-medium hover:bg-white transition"
            >
              Profile
            </Link>
          </nav>
        </div>
      </header>

      {/* Page body */}
      <main className="mx-auto max-w-6xl px-6 py-8">{children}</main>
    </div>
  );
}
