/*******************************************************
* Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
* File:      lib/dashboardRedirect.ts
* Author:    IT Project – Medical Pantry – Group 17
* Date:      11-10-2025
* Version:   1.0
* Purpose:   Redirects user to corresponsing role-based dashboards.
* Revisions:
* v1.0 - 11-10-2025 - Initial implementation
*******************************************************/

export function getDashboardPath(role?: string): string {

  switch (role) {
    case "admin":
      return "/dashboard/admin";

    case "volunteer":
      return "/dashboard/volunteer";

    default:
      return "/dashboard";
  }
}
