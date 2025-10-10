/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/(auth)/layout.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      10-10-2025
* Version:   1.2
* Purpose:   Public layout that applies styling for public
*            pages (login, home)
* Revisions:
* v1.0 - 10-10-2025 - Initial implementation
*******************************************************/

import MedicalPantryHeader from "@/components/MedicalPantryHeader";
import PublicLayout from "@/components/PublicLayout";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return <PublicLayout><MedicalPantryHeader />{children}</PublicLayout>;
}
