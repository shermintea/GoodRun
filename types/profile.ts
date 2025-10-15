/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      types/profile.ts
* Author:    IT Project – Medical Pantry – Group 17
* Date:      15-10-2025
* Version:   1.0
* Purpose:   Defines types for profile use
*******************************************************/

export type Profile = {
    name: string;
    email: string;
    phone_no: string;
    birthday: string | null;
    icon: string | null;
    pickups_finished: number;
    role: string;
};

export type SettingsState = {
    notif: boolean;
    location: boolean;
    darkmode: boolean;
};

export type SettingRowProps = {
    label: string;
    description: string;
    enabled: boolean;
    onToggle: () => void;
};