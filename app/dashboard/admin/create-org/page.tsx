/*******************************************************
* File:      app/dashboard/admin/create-org/page.tsx
* Purpose:   Admin UI to create a new organisation
*******************************************************/
"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function CreateOrgPage() {
    const router = useRouter();

    const [name, setName] = useState("");
    const [contactNo, setContactNo] = useState("");
    const [officeHours, setOfficeHours] = useState("");
    const [address, setAddress] = useState("");

    const [submitting, setSubmitting] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);

    const onSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (submitting) return;

        setError(null);
        setSuccess(null);

        setSubmitting(true);
        try {
            const res = await fetch("/api/org", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify({ name, contact_no: contactNo, office_hours: officeHours, address }),
            });

            let data: any = null;
            try {
                const text = await res.text();
                data = text ? JSON.parse(text) : null;
            } catch {
                data = null;
            }

            if (!res.ok || data?.ok === false) {
                const msg = data?.error || `Failed to create organisation (HTTP ${res.status})`;
                setError(msg);
                return;
            }

            const newId: number | undefined = data?.id;
            setSuccess(data?.message || `Organisation created: ${name}`);

            if (newId) {
                router.push(`/dashboard/admin/manage-org`);
                return;
            }

            setName("");
            setContactNo("");
            setOfficeHours("");
            setAddress("");
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
                    <h1 className="text-2xl font-extrabold tracking-tight">Create New Organisation</h1>
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
                                placeholder="GoodRun Org"
                            />
                        </label>

                        <label className="text-sm">
                            <span className="block mb-1 text-gray-700">Contact Number</span>
                            <input
                                value={contactNo}
                                onChange={(e) => setContactNo(e.target.value)}
                                required
                                className="w-full rounded-lg border px-3 py-2"
                                placeholder="0123456789"
                            />
                        </label>

                        <label className="text-sm">
                            <span className="block mb-1 text-gray-700">Office Hours</span>
                            <input
                                value={officeHours}
                                onChange={(e) => setOfficeHours(e.target.value)}
                                required
                                className="w-full rounded-lg border px-3 py-2"
                                placeholder="Mon-Fri 9am-5pm"
                            />
                        </label>

                        <label className="text-sm">
                            <span className="block mb-1 text-gray-700">Address</span>
                            <input
                                value={address}
                                onChange={(e) => setAddress(e.target.value)}
                                required
                                className="w-full rounded-lg border px-3 py-2"
                                placeholder="123 Example Street, Example City"
                            />
                        </label>
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
                            {submitting ? "Creating…" : "Create Organisation"}
                        </button>
                        <Link
                            href="/dashboard/admin/manage-org"
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