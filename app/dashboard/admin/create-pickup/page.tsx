// app/dashboard/admin/create-pickup/page.tsx
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type FormState = {
  // optional: job can start "available" and be assigned later
  assigned_to?: number | "";
  deadline_date: string;          // YYYY-MM-DD
  weight: string;                 // store as string, convert to number on submit
  value: string;                  // store as string, convert to number on submit
  size: "tiny" | "small" | "medium" | "large";
  follow_up: boolean;
  intake_priority: "low" | "medium" | "high";
  organisation_id: number | "";
};

export default function CreatePickUpPage() {
  const router = useRouter();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string>("");

  // Default values (adjust organisation_id if you have a single org)
  const [form, setForm] = useState<FormState>({
    assigned_to: "",
    deadline_date: "",
    weight: "",
    value: "",
    size: "small",
    follow_up: false,
    intake_priority: "medium",
    organisation_id: "" as unknown as number,
  });

  const set = <K extends keyof FormState>(key: K, value: FormState[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const validate = (): string | null => {
    if (!form.deadline_date) return "Please select a deadline date.";
    if (form.weight === "" || Number(form.weight) < 0) return "Weight must be a non-negative number.";
    if (form.value === "" || Number(form.value) < 0) return "Value must be a non-negative number.";
    if (!form.organisation_id) return "Please enter an organisation id.";
    return null;
  };

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (submitting) return;

    const msg = validate();
    if (msg) {
      setError(msg);
      return;
    }

    setError("");
    setSubmitting(true);

    // Build payload expected by POST /api/jobs
    const payload = {
      assigned_to:
        form.assigned_to === "" ? undefined : Number(form.assigned_to),
      deadline_date: form.deadline_date,
      weight: Number(form.weight),
      value: Number(form.value),
      size: form.size,
      follow_up: form.follow_up,
      intake_priority: form.intake_priority,
      organisation_id: Number(form.organisation_id),
      // progress_stage omitted -> defaults to "available" on the server
    };

    try {
      const res = await fetch("/api/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data?.ok) {
        setError(data?.error ?? "Failed to create job.");
        setSubmitting(false);
        return;
      }

      // Success: go to Ongoing Jobs (or show a toast and stay)
      router.push("/dashboard/ongoingJobs");
    } catch (err) {
      console.error(err);
      setError("Network error. Please try again.");
      setSubmitting(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50">
      {/* Top header comes from your global layout; this section is the page body */}
      <section className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-semibold">Create New Pick Up Request</h1>
          <Link
            href="/dashboard/admin"
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
          >
            Back to Admin
          </Link>
        </div>

        <form
          onSubmit={onSubmit}
          className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm space-y-6"
        >
          {/* Row: date */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm">
              <span className="mb-1 block text-gray-700">Deadline date</span>
              <input
                type="date"
                value={form.deadline_date}
                onChange={(e) => set("deadline_date", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 bg-gray-50"
                required
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block text-gray-700">Assign to (user id)</span>
              <input
                type="number"
                placeholder="Optional"
                value={form.assigned_to}
                onChange={(e) => set("assigned_to", e.target.value === "" ? "" : Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 bg-gray-50"
                min={1}
              />
            </label>
          </div>

          {/* Row: weight/value */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm">
              <span className="mb-1 block text-gray-700">Weight (kg)</span>
              <input
                type="number"
                min={0}
                step="0.1"
                value={form.weight}
                onChange={(e) => set("weight", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 bg-gray-50"
                required
              />
            </label>

            <label className="text-sm">
              <span className="mb-1 block text-gray-700">Value ($)</span>
              <input
                type="number"
                min={0}
                step="0.1"
                value={form.value}
                onChange={(e) => set("value", e.target.value)}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 bg-gray-50"
                required
              />
            </label>
          </div>

          {/* Row: size / follow-up */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm">
              <span className="mb-1 block text-gray-700">Size</span>
              <select
                value={form.size}
                onChange={(e) => set("size", e.target.value as FormState["size"])}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 bg-gray-50"
              >
                <option value="tiny">Tiny</option>
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
            </label>

            <label className="text-sm flex items-center gap-3 pt-7 md:pt-7">
              <input
                type="checkbox"
                checked={form.follow_up}
                onChange={(e) => set("follow_up", e.target.checked)}
                className="h-5 w-5 accent-red-600"
              />
              <span className="text-gray-700">Follow-up required</span>
            </label>
          </div>

          {/* Row: priority / org */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <label className="text-sm">
              <span className="mb-1 block text-gray-700">Intake priority</span>
              <select
                value={form.intake_priority}
                onChange={(e) => set("intake_priority", e.target.value as FormState["intake_priority"])}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 bg-gray-50"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </label>

            <label className="text-sm">
              <span className="mb-1 block text-gray-700">Organisation ID</span>
              <input
                type="number"
                min={1}
                value={form.organisation_id}
                onChange={(e) => set("organisation_id", Number(e.target.value))}
                className="w-full rounded-lg border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-red-600 bg-gray-50"
                required
              />
            </label>
          </div>

          {/* Errors */}
          {error && (
            <div className="rounded-md bg-red-50 px-4 py-3 text-sm text-red-700 border border-red-200">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="flex items-center gap-3 pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="rounded-lg bg-red-600 px-5 py-2 text-white font-medium hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-600/40 disabled:opacity-60"
            >
              {submitting ? "Creating…" : "Create Request"}
            </button>
            <Link
              href="/dashboard/ongoingJobs"
              className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm hover:bg-gray-50"
            >
              Cancel
            </Link>
          </div>
        </form>
      </section>
    </main>
  );
}
