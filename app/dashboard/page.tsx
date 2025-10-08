/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      app/dashboard/page.tsx
* Author:    IT Project – Medical Pantry – Group 17
* Date:      09-10-2025
* Version:   2.0
* Purpose:   Dashboard entry point that redirects users
*            to their role-specific dashboards (Admin or Volunteer)
*            based on the "gr_role" cookie value set at login.
*
* Revisions:
* v1.0 - 15-09-2025 - Initial shared dashboard page
* v2.0 - 09-10-2025 - Updated for role-based routing and Next.js 15 cookie API
*******************************************************/

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export default async function DashboardIndex() {
  const jar = await cookies();
  const role = jar.get("gr_role")?.value;

  if (role === "admin") redirect("/dashboard/admin");
  if (role === "volunteer") redirect("/dashboard/volunteer");
  redirect("/login");
}
