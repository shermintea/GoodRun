/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/dashboard/profile/editPasswordForm.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      21-10-2025
* Version:   1.1
* Purpose:   Interface for the change password panel
* Revisions:
* v1.0 - Initial implementation
* v1.1 - UI aligned with EditProfileForm; confirmation & feedback improved
*******************************************************/

"use client";

import { useState } from "react";

export default function ChangePasswordForm({
    onCancel,
}: {
    onCancel: () => void;
}) {
    const [form, setForm] = useState({
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [saving, setSaving] = useState(false);
    const [msg, setMsg] = useState("");

    const setField = (key: keyof typeof form, value: string) =>
        setForm((prev) => ({ ...prev, [key]: value }));

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMsg("");

        if (form.newPassword !== form.confirmPassword)
            return setMsg("Passwords do not match.");

        if (!window.confirm("Are you sure you want to change your password?"))
            return;

        setSaving(true);
        try {
            const res = await fetch("/api/auth/change-password", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    oldPassword: form.oldPassword,
                    newPassword: form.newPassword,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Password change failed");

            setMsg("Password changed successfully.");
            setForm({ oldPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err: any) {
            setMsg(err.message || "An unexpected error occurred.");
        } finally {
            setSaving(false);
        }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="text-sm md:col-span-2">
                    <span className="block text-neutral-600 mb-1">Old Password</span>
                    <input
                        type="password"
                        value={form.oldPassword}
                        onChange={(e) => setField("oldPassword", e.target.value)}
                        disabled={saving}
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 
                       focus:outline-none focus:ring-2 focus:ring-neutral-900 
                       disabled:opacity-60"
                    />
                </label>

                <label className="text-sm md:col-span-2">
                    <span className="block text-neutral-600 mb-1">New Password</span>
                    <input
                        type="password"
                        value={form.newPassword}
                        onChange={(e) => setField("newPassword", e.target.value)}
                        disabled={saving}
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 
                       focus:outline-none focus:ring-2 focus:ring-neutral-900 
                       disabled:opacity-60"
                    />
                </label>

                <label className="text-sm md:col-span-2">
                    <span className="block text-neutral-600 mb-1">Confirm New Password</span>
                    <input
                        type="password"
                        value={form.confirmPassword}
                        onChange={(e) => setField("confirmPassword", e.target.value)}
                        disabled={saving}
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 
                       focus:outline-none focus:ring-2 focus:ring-neutral-900 
                       disabled:opacity-60"
                    />
                </label>
            </div>

            <div className="flex items-center gap-3 pt-2">
                <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm font-medium 
                     hover:bg-neutral-800 disabled:opacity-60"
                >
                    {saving ? "Changing…" : "Change Password"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    disabled={saving}
                    className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium 
                     hover:bg-neutral-50 disabled:opacity-60"
                >
                    Cancel
                </button>
            </div>

            {msg && (
                <p
                    className={`text-sm mt-2 ${msg.includes("success") ? "text-green-600" : "text-red-600"
                        }`}
                >
                    {msg}
                </p>
            )}
        </form>
    );
}
