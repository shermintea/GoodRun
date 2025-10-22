"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";

type OrgRow = {
    id: number;
    name: string;
    contact_no: string;
    office_hours: string;
    address: string;
    createdAt?: string | null;
    createdByName?: string | null;
    createdByEmail?: string | null;
};

type SessionMe = {
    role: "admin" | "volunteer" | string;
};

export default function ManageOrganisationsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const initialQ = searchParams.get("q") || "";
    const [q, setQ] = useState(initialQ);
    const [loading, setLoading] = useState(false);
    const [orgs, setOrgs] = useState<OrgRow[]>([]);
    const [err, setErr] = useState("");

    const [me, setMe] = useState<SessionMe | null>(null);

    const queryString = useMemo(() => (q ? `?q=${encodeURIComponent(q)}` : ""), [q]);

    // Fetch current session info
    const fetchMe = async () => {
        try {
            const res = await fetch("/api/session", { credentials: "include" });
            if (res.ok) {
                const data = await res.json();
                setMe({ role: data?.user?.role ?? "volunteer" });
            } else {
                setMe({ role: "volunteer" });
            }
        } catch {
            setMe({ role: "volunteer" });
        }
    };

    // Fetch organisations
    const fetchOrgs = async () => {
        setLoading(true);
        setErr("");
        try {
            const res = await fetch(`/api/org${queryString}`, { credentials: "include" });
            const data = await res.json();
            if (!res.ok) {
                setErr(data?.error || "Failed to fetch organisations");
                setOrgs([]);
            } else {
                setOrgs(Array.isArray(data.organisations) ? data.organisations : []);
            }
        } catch {
            setErr("Network error while loading organisations.");
            setOrgs([]);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMe();
    }, []);

    useEffect(() => {
        fetchOrgs();
    }, [queryString]);

    const onSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const params = new URLSearchParams();
        if (q) params.set("q", q);
        router.replace(`/dashboard/admin/manage-org${params.toString() ? `?${params}` : ""}`);
    };

    const formatDate = (iso?: string | null) => {
        if (!iso) return "—";
        try {
            return new Date(iso).toLocaleDateString(undefined, {
                year: "numeric",
                month: "short",
                day: "numeric",
            });
        } catch {
            return "—";
        }
    };

    const handleDelete = async (org: OrgRow) => {
        const ok = window.confirm(`Delete organisation “${org.name}”? This cannot be undone.`);
        if (!ok) return;

        try {
            const res = await fetch(`/api/org/${org.id}`, { method: "DELETE", credentials: "include" });
            if (!res.ok) {
                const data = await res.json().catch(() => ({}));
                alert(data?.error || "Failed to delete organisation.");
                return;
            }
            setOrgs((prev) => prev.filter((x) => x.id !== org.id));
        } catch {
            alert("Network error while deleting organisation.");
        }
    };

    const canManage = useMemo(() => me?.role === "admin", [me]);

    if (!me) return <div className="p-6 text-gray-500">Loading session…</div>;

    return (
        <div className="max-w-6xl mx-auto px-6 py-8">
            <div className="flex items-center justify-between mb-6">
                <h1 className="text-3xl font-semibold">Manage Organisations</h1>
                <div className="flex gap-3">
                    <Link
                        href="/dashboard/admin"
                        className="rounded-lg border px-3 py-2 text-sm hover:bg-gray-50"
                    >
                        Back to Admin
                    </Link>
                    {canManage && (
                        <button
                            type="button"
                            className="px-4 py-2 rounded bg-red-700 text-white hover:bg-red-800"
                            onClick={() => router.push("/dashboard/admin/create-org")}
                        >
                            Create Organisation
                        </button>
                    )}
                </div>
            </div>

            <form onSubmit={onSearchSubmit} className="mb-4">
                <input
                    className="w-full border rounded-xl px-4 py-3"
                    placeholder="Search by name, contact, address…"
                    value={q}
                    onChange={(e) => setQ(e.target.value)}
                />
            </form>

            {err && (
                <div className="mb-4 p-3 rounded border border-red-300 text-red-700 bg-red-50">{err}</div>
            )}

            {/* Mobile: cards */}
            <ul className="space-y-3 md:hidden">
                {loading ? (
                    <li className="text-gray-500">Loading…</li>
                ) : orgs.length === 0 ? (
                    <li className="text-gray-500">No organisations found.</li>
                ) : (
                    orgs.map((o) => (
                        <li key={o.id} className="rounded-2xl border bg-white shadow-sm p-4">
                            <div className="flex items-start justify-between gap-3">
                                <div>
                                    <div className="font-semibold">{o.name}</div>
                                    <div className="text-sm text-gray-600">{o.contact_no}</div>
                                    <div className="text-sm text-gray-600">{o.address}</div>
                                    <div className="text-sm text-gray-600">{o.office_hours}</div>
                                </div>
                                <button
                                    className="text-blue-700 hover:underline whitespace-nowrap"
                                    onClick={() => router.push(`/dashboard/admin/manage-org/${o.id}/edit`)}
                                >
                                    View
                                </button>
                            </div>
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
                            <th className="py-3 px-4">Contact No.</th>
                            <th className="py-3 px-4">Office Hours</th>
                            <th className="py-3 px-4">Address</th>
                            <th className="py-3 px-4">Created</th>
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
                        ) : orgs.length === 0 ? (
                            <tr>
                                <td className="py-6 px-4 text-gray-500" colSpan={6}>
                                    No organisations found.
                                </td>
                            </tr>
                        ) : (
                            orgs.map((o) => (
                                <tr key={o.id} className="border-t">
                                    <td className="py-3 px-4">{o.name}</td>
                                    <td className="py-3 px-4">{o.contact_no}</td>
                                    <td className="py-3 px-4">{o.office_hours}</td>
                                    <td className="py-3 px-4">{o.address}</td>
                                    <td className="py-3 px-4 text-gray-700">{formatDate(o.createdAt)}</td>
                                    <td>
                                        <div className="flex gap-3">
                                            <button
                                                type="button"
                                                className="text-blue-700 hover:underline"
                                                onClick={() =>
                                                    router.push(`/dashboard/admin/manage-org/${o.id}/edit`)
                                                }
                                            >
                                                Edit
                                            </button>
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
