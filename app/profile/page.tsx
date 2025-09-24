'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';

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

export default function ProfilePage() {
  const [settings, setSettings] = useState<SettingsState>({
    notif: true,
    location: true,
    darkmode: false,
  });

  const toggle = (key: keyof SettingsState) =>
    setSettings((s) => ({ ...s, [key]: !s[key] }));

  return (
    <main className="min-h-screen bg-neutral-100 text-neutral-900">
      {/* Header / brand */}
      <header className="bg-white">
        <div className="mx-auto max-w-screen-sm md:max-w-screen-md lg:max-w-4xl px-4 md:px-6 lg:px-8 py-6 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3">
            <Image
              src="/grLogo-transparent.png"
              alt="GoodRun"
              width={56}
              height={56}
              priority
            />
            {/*<span className="text-lg md:text-xl font-semibold">Medical Pantry</span>*/}
          </Link>
          <div className="hidden md:block text-sm text-neutral-500">Profile</div>
        </div>
      </header>

      {/* Main content: two columns on desktop */}
      <section className="mx-auto max-w-screen-sm md:max-w-screen-md lg:max-w-4xl px-4 md:px-6 lg:px-8 py-6">
        <div className="grid lg:grid-cols-2 gap-8 items-start">
          {/* Left: Profile card */}
          <div className="relative rounded-2xl bg-[#11183A] text-white overflow-visible">
            {/* Avatar, floating above the card */}
            <div className="absolute left-1/2 top-0 -translate-x-1/2 -translate-y-1/2">
              <div className="h-24 w-24 md:h-28 md:w-28 rounded-full ring-4 ring-white overflow-hidden shadow-lg">
                <Image src="/avatar.png" alt="Profile photo" width={120} height={120} />
              </div>
            </div>

            {/* Card body with extra top padding */}
            <div className="px-6 pt-20 pb-8 md:px-8 md:pt-24">
              <h1 className="text-center text-xl md:text-2xl font-semibold">
                Volunteer / Admin
              </h1>

              <ul className="mt-6 space-y-4 text-sm md:text-base text-neutral-200">
                <li className="flex items-start">
                  <Dot /> <span>Personal information</span>
                </li>
                <li className="flex items-start">
                  <Dot /> <span>Contact details</span>
                </li>
                <li className="flex items-start">
                  <Dot /> <span>Number of pickups finished …</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Right: Settings */}
          <div className="pt-2 lg:pt-0">
            <h2 className="text-base md:text-lg font-extrabold tracking-wide">SETTINGS</h2>
            <div className="mt-4 divide-y divide-neutral-200 rounded-2xl bg-white shadow-sm">
              <SettingRow
                label="Notifications"
                description="Receive important updates about pickups"
                enabled={settings.notif}
                onToggle={() => toggle('notif')}
              />
              <SettingRow
                label="Location access"
                description="Allow location for better routing"
                enabled={settings.location}
                onToggle={() => toggle('location')}
              />
              <SettingRow
                label="Dark mode"
                description="Use a darker color theme"
                enabled={settings.darkmode}
                onToggle={() => toggle('darkmode')}
              />
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}

function Dot() {
  return <span className="mt-1 mr-3 inline-block h-2 w-2 rounded-full bg-neutral-300" />;
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
          'relative inline-flex h-7 w-12 items-center rounded-full transition',
          enabled ? 'bg-[#11183A]' : 'bg-neutral-300',
          'focus:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#11183A]'
        ].join(' ')}
      >
        <span
          className={[
            'inline-block h-5 w-5 transform rounded-full bg-white shadow transition',
            enabled ? 'translate-x-6' : 'translate-x-1'
          ].join(' ')}
        />
        <span className="sr-only">{`Toggle ${label}`}</span>
      </button>
    </div>
  );
}
