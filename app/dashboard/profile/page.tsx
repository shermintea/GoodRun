/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      dashboard/profile/page.tsx
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
* v3.0 - Added profile edits
*******************************************************/

"use client";

import { useState } from "react";
import Image from "next/image";
import LogoutButton from "@/components/ui/LogoutButton";
import EditProfileForm from "@/app/dashboard/profile/editProfileForm";
import { useUserProfile } from "@/app/hooks/useUserProfile";
import { Profile, SettingsState, SettingRowProps } from "@/types/profile";

export default function ProfilePage() {
  const { profile, loading, error, setProfile } = useUserProfile();
  const [isEditing, setIsEditing] = useState(false);
  const [settings, setSettings] = useState<SettingsState>({
    notif: true,
    location: true,
    darkmode: false,
  });

  const toggleSetting = (key: keyof SettingsState) => {
    setSettings((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading) return <p className="py-24 text-center text-neutral-500">Loading profile…</p>;
  if (error || !profile) return <p className="py-24 text-center text-red-500">{error || "Profile not found"}</p>;

  const handleSave = async (updated: Profile) => {
    setIsEditing(false);
    try {
      const res = await fetch("/api/profile", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: updated.name,
          phone_no: updated.phone_no,
          birthday: updated.birthday,
          // icon: updated.icon,
        }),
      });
      if (!res.ok) throw new Error("Failed to update profile");
      const saved = await res.json();

      if (saved.icon && typeof saved.icon === "object") {
        saved.icon = null; // fallback if something went wrong
      }
      setProfile(saved);
    } catch (err: any) {
      console.error(err);
      alert("Error saving profile: " + err.message);
    }
  };

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-900">
      <section className="mx-auto max-w-screen-sm md:max-w-screen-md lg:max-w-4xl px-4 md:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Profile card */}
          <div className="relative rounded-2xl bg-[#11183A] text-white overflow-visible">
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
              <div className="h-24 w-24 md:h-28 md:w-28 rounded-full ring-4 ring-white shadow-lg">
                <Image
                  src="/default-avatar.png"
                  alt="Profile photo"
                  width={120}
                  height={120}
                  className="rounded-full object-cover"
                  priority />
              </div>
            </div>

            <div className="px-6 pt-20 pb-8 md:px-8 md:pt-24">
              <h1 className="text-center text-xl md:text-2xl font-semibold">
                {profile.role}
              </h1>

              <div className="mt-6 space-y-4 text-sm md:text-base">
                <InfoRow label="Name" value={profile.name} />
                <InfoRow label="Birthday" value={profile.birthday || '-'} />
                <InfoRow label="Email" value={profile.email} />
                <InfoRow label="Phone" value={profile.phone_no || "—"} />
                <InfoRow label="Total pickups finished" value={String(profile.pickups_finished ?? 0)} />
              </div>

              {!isEditing && (
                <div className="mt-6 text-center">
                  <button
                    onClick={() => setIsEditing(true)}
                    className="rounded-full bg-white/10 px-4 py-2 text-sm font-medium hover:bg-white/20 focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-white"
                  >
                    Edit profile
                  </button>
                </div>
              )}
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
                <EditProfileForm profile={profile} onSave={handleSave} onCancel={() => setIsEditing(false)} />
              </div>
            )}

            <LogoutButton />
          </div>
        </div>
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
