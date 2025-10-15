/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/dashboard/profile/editProfileForm.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      15-10-2025
* Version:   1.0
* Purpose:   
* Revisions:
* v1.0 - Initial implementation
*******************************************************/

"use client";

import { useState, useEffect } from "react";
import type { Profile } from "@/types/profile";

export default function EditProfileForm({
    profile,
    onSave,
    onCancel,
}: {
    profile: Profile;
    onSave: (updated: Profile) => void;
    onCancel: () => void;
}) {
    const [form, setForm] = useState<Profile>(profile);
    const [saving, setSaving] = useState(false);
    const [preview, setPreview] = useState<string | null>(null);

    useEffect(() => {
        setForm(profile);
    }, [profile]);

    const set = <K extends keyof Profile>(key: K, value: Profile[K]) => {
        setForm((prev) => ({ ...prev, [key]: value }));
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onloadend = () => {
            // Strip off the `data:image/...;base64,` prefix
            const base64 = (reader.result as string).split(",")[1];
            setForm({ ...form, icon: base64 });
            setPreview(URL.createObjectURL(file));
        };
        reader.readAsDataURL(file);

        // validate
        if (file.size > 2 * 1024 * 1024) {
            alert("File size must be under 2MB");
            return;
        }
        if (!file.type.startsWith("image/")) {
            alert("Only image files are allowed");
            return;
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        try {
            await onSave(form);
        } finally {
            setSaving(false);
        }
    };

    return (
        <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className="text-sm">
                    <span className="block text-neutral-600 mb-1">Name</span>
                    <input
                        value={form.name}
                        onChange={(e) => set("name", e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                </label>

                <label className="text-sm">
                    <span className="block text-neutral-600 mb-1">Birthdate</span>
                    <input
                        type="date"
                        value={form.birthday || ""}
                        onChange={(e) => set("birthday", e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                </label>

                <label className="text-sm md:col-span-2">
                    <span className="block text-neutral-600 mb-1">Email</span>
                    <input
                        type="email"
                        value={form.email}
                        disabled
                        title="Email changes are disabled"
                        className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-neutral-500"
                    />
                </label>

                <label className="text-sm md:col-span-2">
                    <span className="block text-neutral-600 mb-1">Phone</span>
                    <input
                        value={form.phone_no || ""}
                        onChange={(e) => set("phone_no", e.target.value)}
                        className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
                    />
                </label>

                <label className="text-sm md:col-span-2">
                    <span className="block text-neutral-600 mb-1">Profile Picture</span>
                    <label htmlFor="fileUpload" className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900">
                        Choose file
                        <input
                            id="fileUpload"
                            type="file"
                            accept="image/*"
                            className="hidden"
                            onChange={handleFileChange}
                        />
                    </label>
                </label>

                {preview && (
                    <img
                        src={preview}
                        alt="Profile Preview"
                        className="w-24 h-24 object-cover rounded-full mt-2"
                    />
                )}

            </div>

            <div className="flex items-center gap-3 pt-2">
                <button
                    type="submit"
                    disabled={saving}
                    className="rounded-lg bg-neutral-900 text-white px-4 py-2 text-sm font-medium hover:bg-neutral-800 disabled:opacity-60"
                >
                    {saving ? "Saving…" : "Save changes"}
                </button>
                <button
                    type="button"
                    onClick={onCancel}
                    className="rounded-lg border border-neutral-300 px-4 py-2 text-sm font-medium hover:bg-neutral-50"
                >
                    Cancel
                </button>
            </div>
        </form>
    );
}
