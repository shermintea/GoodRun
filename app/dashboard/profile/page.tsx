/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      page.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      23-09-2025
* Version:   1.6
* Purpose:   Profile Page 
*            - Display personal information of volunteer/admin 
*            - Users can edit details and manage basic settings
*            - Users can logout and end session
* Revisions:
* v1.0 - Initial layout
* v1.1 - Added editing function to personal details 
* v1.2 - Header: GoodRun logo (left) + Dashboard shortcut (right)
* v1.3 - Modified so that profile edits are persistant with localstorage
* v1.4 - Added session-based header redirection
* v1.5 - Moved page to dashboard/profile, replaced with reusable header
* v1.6 - Added logout button
* v2.0 - Edits are persisted via PATCH /api/profile in cookies
* v3.0 - 
*******************************************************/

"use client";

import { useState, useEffect } from 'react';
import { useSession, signIn } from "next-auth/react";
import Image from "next/image";
import LogoutButton from "@/components/LogoutButton";

/* ---------- Types ---------- */
type Profile = {
  name: string;
  email: string;
  phone: string;
  birthdate: string | null;
  image: string | null;
  pickups_finished: number;
};

type SettingsState = {
  notif: boolean;
  location: boolean;
  darkmode: boolean;
};

type SettingRowProps = {
  label: string;
  description: string;
  enabled: boolean;
  onToggle: () => void;
};

/* ---------------- Utils ---------------- */

// Safe dd/MM/yyyy formatter
function formatDate(isoString: string | null) {
  if (!isoString) return "—";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "—";
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  const year = d.getUTCFullYear();
  return `${day}/${month}/${year}`;
}

/* ---------------- Page ---------------- */

export default function ProfilePage() {
  const { data: session } = useSession();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [settings, setSettings] = useState<SettingsState>({
    notif: true,
    location: true,
    darkmode: false,
  });

  // Get profile from database
  useEffect(() => {
    if (!session?.user?.email) return;

    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => setProfile(data))
      .catch(() => setError("Failed to load profile"));
  }, [session?.user?.email]);

  // Save changes
  const handleSave = async (updated: Profile) => {
    setIsSaving(true);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updated),
      });

      if (!res.ok) throw new Error("Failed to save");

      const updatedProfile = await res.json();
      setProfile(updatedProfile);
      setIsEditing(false);
    } catch {
      setError("Failed to save changes");
    }
    setIsSaving(false);
  };

  const toggleSetting = (key: keyof SettingsState) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-900">

      {/* Main */}
      <section className="mx-auto max-w-screen-sm md:max-w-screen-md lg:max-w-4xl px-4 md:px-6 lg:px-8 py-6">
        {!profile ? (
          <div className="py-24 text-center text-neutral-500">Loading profile…</div>
        ) : (
          <div className="grid lg:grid-cols-2 gap-8 items-start">
            {/* Profile card */}
            <div className="relative rounded-2xl bg-[#11183A] text-white overflow-visible">
              <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
                <div className="h-24 w-24 md:h-28 md:w-28 rounded-full ring-4 ring-white overflow-hidden shadow-lg">
                  <Image src={profile.image || "/default-avatar.png"} alt="Profile photo" width={120} height={120} />
                </div>
              </div>

              <div className="px-6 pt-20 pb-8 md:px-8 md:pt-24">
                <h1 className="text-center text-xl md:text-2xl font-semibold">
                  {profile.name} / Admin
                </h1>

                <div className="mt-6 space-y-4 text-sm md:text-base">
                  <InfoRow label="Name" value={profile.name} />
                  <InfoRow label="Birthdate" value={formatDate(profile.birthdate)} />
                  <InfoRow label="Email" value={profile.email} />
                  <InfoRow label="Phone" value={profile.phone || "—"} />
                  <InfoRow
                    label="Total pickups finished"
                    value={String(profile.pickups_finished ?? 0)}
                  />
                </div>

                <div className="mt-6 text-center">
                  {!isEditing && (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white"
                    >
                      Edit profile
                    </button>
                  )}
                </div>
              </div>
            </div>

            {/* Right column: settings + edit form */}
            <div className="pt-2 lg:pt-0 space-y-6">
              <h2 className="text-base md:text-lg font-extrabold tracking-wide">SETTINGS</h2>
              <div className="divide-y divide-neutral-200 rounded-2xl bg-white shadow-sm">
                <SettingRow
                  label="Notifications"
                  description="Receive important updates about pickups"
                  enabled={settings.notif}
                  onToggle={() => toggleSetting("notif")}
                />
                <SettingRow
                  label="Location access"
                  description="Allow location for better routing"
                  enabled={settings.location}
                  onToggle={() => toggleSetting("location")}
                />
                <SettingRow
                  label="Dark mode"
                  description="Use a darker color theme"
                  enabled={settings.darkmode}
                  onToggle={() => toggleSetting("darkmode")}
                />
              </div>

              {isEditing && (
                <div className="rounded-2xl bg-white shadow-sm p-5">
                  <div className="mb-3 text-base md:text-lg font-extrabold tracking-wide">
                    EDIT PROFILE
                  </div>
                  <EditProfileForm
                    profile={profile}
                    saving={isSaving}
                    onSave={handleSave}
                    onCancel={() => setIsEditing(false)}
                  />
                </div>
              )}

              <LogoutButton />
            </div>
          </div>
        )}
        {error && (
          <div className="py-4 mb-6 rounded-lg bg-red-50 text-red-700 border border-red-200 px-4">
            {error}
          </div>
        )}
      </section>
    </main>
  );
}

/* ---------------- Small Components ---------------- */

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <div className="font-semibold text-white">{label}</div>
      <div className="text-neutral-300 break-words">{value}</div>
    </div>
  );
}

function SettingRow({ label, description, enabled, onToggle }: SettingRowProps) {
  return (
    <div className="flex items-center justify-between px-5 py-4">
      <div>
        <div className="font-medium">{label}</div>
        <div className="text-sm text-neutral-500">{description}</div>
      </div>

      <button
        type="button"
        role="switch"
        aria-checked={enabled}
        onClick={onToggle}
        className={[
          "relative inline-flex h-7 w-12 items-center rounded-full transition",
          enabled ? "bg-[#11183A]" : "bg-neutral-300",
        ].join(" ")}
      >
        <span
          className={[
            "inline-block h-5 w-5 transform rounded-full bg-white shadow transition",
            enabled ? "translate-x-6" : "translate-x-1",
          ].join(" ")}
        />
        <span className="sr-only">{`Toggle ${label}`}</span>
      </button>
    </div>
  );
}

/* ---------------- Edit Form ---------------- */

function EditProfileForm({
  profile,
  saving,
  onSave,
  onCancel,
}: {
  profile: Profile;
  saving: boolean;
  onSave: (updated: Profile) => void;
  onCancel: () => void;
}) {
  const [form, setForm] = useState<Profile>(profile);

  const set = <K extends keyof Profile>(key: K, value: Profile[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <form
      className="space-y-4"
      onSubmit={(e) => {
        e.preventDefault();
        onSave(form);
      }}
    >
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
            value={form.birthdate || ""}
            onChange={(e) => set("birthdate", e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </label>

        <label className="text-sm md:col-span-2">
          <span className="block text-neutral-600 mb-1">Email</span>
          <input
            type="email"
            value={form.email}
            disabled
            title="Email changes are disabled in demo"
            className="w-full rounded-lg border border-neutral-200 bg-neutral-50 px-3 py-2 text-neutral-500"
          />
        </label>

        <label className="text-sm md:col-span-2">
          <span className="block text-neutral-600 mb-1">Phone</span>
          <input
            value={form.phone}
            onChange={(e) => set("phone", e.target.value)}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </label>

        <label className="text-sm">
          <span className="block text-neutral-600 mb-1">Total pickups finished</span>
          <input
            type="number"
            min={0}
            value={form.pickups_finished}
            onChange={(e) => set("pickups_finished", Number(e.target.value))}
            className="w-full rounded-lg border border-neutral-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-neutral-900"
          />
        </label>
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
