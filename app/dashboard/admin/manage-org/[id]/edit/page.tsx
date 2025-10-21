/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/dashboard/admin/manage-org/[id]/edit/page.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      21-10-2025
* Version:   1.0
* Purpose:   Admin edit form for organisation + Delete
* Changes:
*   - PATCH updates editable fields
*   - Delete organisation with confirmation
*******************************************************/
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";

type OrgDetail = {
    id: number;
    name: string;
    contact_no: string;
    office_hours: string;
    address: string;
    createdAt?: string | null;
};

export default function EditOrgPage() {
    const { id } = useParams();
    const router = useRouter();
    const { data: session, status } = useSession();
    const isAdmin = (session?.user as any)?.role === "admin";

    const [org, setOrg] = useState<OrgDetail | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [deleting, setDeleting] = useState(false);
    const [msg, setMsg] = useState<string | null>(null);
    const [err, setErr] = useState<string | null>(null);

    useEffect(() => {
        if (status === "loading") return;
        if (!isAdmin) {
            router.replace(`/dashboard/admin/manage-org/${id}`);
            return;
        }
        const load = async () => {
            try {
                const res = await fetch(`/api/org/${id}`, { credentials: "include" });
                const data = await res.json();
                if (!res.ok) throw new Error(data?.error || "Failed to load organisation");
                setOrg(data.organisation as OrgDetail);
            } catch (e: any) {
                setErr(e.message);
            } finally {
                setLoading(false);
            }
        };
        if (id) load();
    }, [id, isAdmin, status, router]);

    const validate = (): string | null => {
        if (!org) return "No organisation loaded";
        if (!org.name.trim()) return "Name is required";
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
            const payload = {
                name: org!.name.trim(),
                contact_no: org!.contact_no?.trim() || "",
                office_hours: org!.office_hours?.trim() || "",
                address: org!.address?.trim() || "",
            };

            const res = await fetch(`/api/org/${id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                credentials: "include",
                body: JSON.stringify(payload),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data?.error || "Failed to save organisation");
            setMsg("✅ Organisation updated");
        } catch (e: any) {
            setErr(e.message);
        } finally {
            setSaving(false);
        }
    };

    const onDelete = async () => {
        if (!org) return;
        if (!confirm(`Delete organisation “${org.name}”? This cannot be undone.`)) return;

        setDeleting(true);
        setErr(null);
        setMsg(null);
        try {
            const res = await fetch(`/api/org/${org.id}`, {
                method: "DELETE",
                credentials: "include",
            });
            const data = await res.json().catch(() => ({}));
            if (!res.ok) throw new Error(data?.error || "Failed to delete organisation");
            router.push("/dashboard/admin/manage-org");
        } catch (e: any) {
            setErr(e.message || "Failed to delete organisation");
            setDeleting(false);
        }
    };

    if (loading) return <main className="p-8 text-gray-500">Loading organisation…</main>;
    if (err && !org) return <main className="p-8 text-red-600">Error: {err}</main>;
    if (!org) return <main className="p-8 text-gray-600">Organisation not found.</main>;

    return (
        <main className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-2xl mx-auto bg-white border rounded-2xl p-6 shadow-sm space-y-6">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-semibold">Edit Organisation #{org.id}</h1>
                    <button
                        onClick={() => router.back()}
                        className="px-3 py-2 rounded border hover:bg-gray-50"
                    >
                        Back
                    </button>
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

                <form onSubmit={onSave} className="space-y-4" noValidate>
                    <div>
                        <label htmlFor="name" className="block font-medium text-gray-700">
                            Name
                        </label>
                        <input
                            id="name"
                            className="w-full border rounded-lg px-3 py-2"
                            value={org.name}
                            onChange={(e) => setOrg({ ...org, name: e.target.value })}
                        />
                    </div>

                    <div>
                        <label htmlFor="contact_no" className="block font-medium text-gray-700">
                            Contact Number
                        </label>
                        <input
                            id="contact_no"
                            className="w-full border rounded-lg px-3 py-2"
                            value={org.contact_no ?? ""}
                            onChange={(e) => setOrg({ ...org, contact_no: e.target.value })}
                        />
                    </div>

                    <div>
                        <label htmlFor="office_hours" className="block font-medium text-gray-700">
                            Office Hours
                        </label>
                        <input
                            id="office_hours"
                            className="w-full border rounded-lg px-3 py-2"
                            value={org.office_hours ?? ""}
                            onChange={(e) => setOrg({ ...org, office_hours: e.target.value })}
                        />
                    </div>

                    <div>
                        <label htmlFor="address" className="block font-medium text-gray-700">
                            Address
                        </label>
                        <input
                            id="address"
                            className="w-full border rounded-lg px-3 py-2"
                            value={org.address ?? ""}
                            onChange={(e) => setOrg({ ...org, address: e.target.value })}
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
                            onClick={() => router.push(`/dashboard/admin/manage-org`)}
                        >
                            Cancel
                        </button>

                        <button
                            type="button"
                            onClick={onDelete}
                            disabled={deleting}
                            className={`px-4 py-2 rounded border border-red-300 text-red-700 hover:bg-red-50 ${deleting ? "opacity-60 cursor-not-allowed" : ""
                                }`}
                        >
                            {deleting ? "Deleting…" : "Delete Organisation"}
                        </button>
                    </div>
                </form>
            </div>
        </main>
    );
}
