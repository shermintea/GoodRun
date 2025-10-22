/*****************************************************************************************
 * Project:   COMP30023 IT Project 2025 – GoodRun Volunteer App
 * File:      app/dashboard/admin/create-pickup/page.tsx
 * Author:    IT Project – Medical Pantry – Group 17
 * Date:      16-10-2025
 * Version:   2.5
 * Purpose:   Admin form for creating pick-up jobs
 *            - Posts to /api/create-pickup
 *            - Includes "Job Name" separate from Organisation Name
 *            - Pick-up address is independent (not tied to organisation)
 *            - Handles all errors gracefully, including non-JSON responses
 ******************************************************************************************/

"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import Select from "react-select";

type FormData = {
  jobName: string;
  organisationName: string;
  address: string;
  weight: string;
  value: string;
  size: string;
  intakePriority: string;
  deadlineDate: string;
  followUp: boolean;
};

export default function CreatePickupPage() {
  const router = useRouter();

  const [form, setForm] = useState<FormData>({
    jobName: "",
    organisationName: "",
    address: "",
    weight: "",
    value: "",
    size: "Medium",
    intakePriority: "High",
    deadlineDate: "",
    followUp: false,
  });

  const [orgOptions, setOrgOptions] = useState<{ value: string; label: string }[]>([]);
  const [searchTerm, setSearchTerm] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  /** Handles input/select/textarea changes (non-checkbox). */
  const handleFieldChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  /** Handles checkbox separately. */
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm((prev) => ({ ...prev, [name]: checked }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    // --- client-side validation
    const weightNum = Number(form.weight);
    const valueNum = Number(form.value);

    if (!form.organisationName.trim()) {
      setError("Organisation name is required.");
      return;
    }
    if (!form.address.trim()) {
      setError("Pick-up address is required.");
      return;
    }
    if (Number.isNaN(weightNum) || weightNum < 0) {
      setError("Please enter a valid non-negative weight.");
      return;
    }
    if (Number.isNaN(valueNum) || valueNum < 0) {
      setError("Please enter a valid non-negative value.");
      return;
    }
    if (!form.deadlineDate) {
      setError("Deadline date is required.");
      return;
    }

    // --- map frontend fields to backend payload
    const payload = {
      jobName: form.jobName.trim(),
      organisationName: form.organisationName.trim(),
      address: form.address.trim(),
      weight: weightNum,
      value: valueNum,
      size: form.size.toLowerCase(),
      intakePriority: form.intakePriority.toLowerCase(),
      deadlineDate: form.deadlineDate,
      followUp: form.followUp,
    };

    try {
      const res = await fetch("/api/create-pickup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });

      const ct = res.headers.get("content-type") || "";
      let data: any = null;
      let text = "";

      if (ct.includes("application/json")) {
        try {
          data = await res.json();
        } catch {
          data = null;
        }
      } else {
        try {
          text = await res.text();
        } catch {
          text = "";
        }
      }

      if (!res.ok) {
        setError(data?.error || text || `${res.status} ${res.statusText}`);
        return;
      }

      setSuccess("✅ Pick-up job created successfully.");
      setForm({
        jobName: "",
        organisationName: "",
        address: "",
        weight: "",
        value: "",
        size: "Medium",
        intakePriority: "High",
        deadlineDate: "",
        followUp: false,
      });
    } catch (err: any) {
      console.error(err);
      setError(err?.message || "Unexpected error occurred. Please try again.");
    }
  };

  /* Handles organisation input */
  const fetchOrganisations = useCallback(async (query: string) => {
    try {
      const res = await fetch(`/api/org?q=${encodeURIComponent(query)}`);
      const data = await res.json();
      if (data.ok) {
        setOrgOptions(
          data.organisations.map((org: any) => ({
            value: org.name,
            label: org.name,
          }))
        );
      } else {
        setOrgOptions([]);
      }
    } catch (err) {
      console.error("Failed to fetch organisations:", err);
    }
  }, []);

  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      // Fetch all orgs when empty search, or filter by query
      fetchOrganisations(searchTerm || "");
    }, 400);
    return () => clearTimeout(delayDebounce);
  }, [searchTerm, fetchOrganisations]);

  useEffect(() => {
    fetchOrganisations(""); // initial fetch for all orgs
  }, [fetchOrganisations]);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center items-start pt-12 px-4">
      <div className="w-full max-w-3xl bg-white p-6 rounded-xl shadow-sm">
        <h1 className="text-2xl font-semibold text-red-700 mb-6">
          Create New Pick-Up Request
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Job Name */}
          <div>
            <label className="font-medium">Job Name</label>
            <input
              type="text"
              name="jobName"
              value={form.jobName}
              onChange={handleFieldChange}
              className="w-full border rounded p-2"
              placeholder="e.g. Helping Hands – Flemington pickup"
            />
            <p className="text-xs text-gray-500">
              A short label for this job (for admins and volunteers).
            </p>
          </div>

          {/* Organisation Name */}
          <div>
            <label className="font-medium">Organisation Name</label>
            <Select
              placeholder="Search or select organisation..."
              isSearchable
              isClearable
              value={
                form.organisationName
                  ? { value: form.organisationName, label: form.organisationName }
                  : null
              }
              onInputChange={(inputValue) => {
                setSearchTerm(inputValue || "");
                return inputValue;
              }}
              onChange={(selected) => {
                setForm((prev) => ({
                  ...prev,
                  organisationName: selected ? selected.value : "",
                }));
              }}
              options={orgOptions}
              className="text-sm"
              styles={{
                control: (base) => ({
                  ...base,
                  borderColor: "#d1d5db",
                  boxShadow: "none",
                  "&:hover": { borderColor: "#9ca3af" },
                }),
              }}
            />
            <p className="text-xs text-gray-500 mt-1">
              Select from existing organisations (searchable).
            </p>
          </div>

          {/* Pick-up Address */}
          <div>
            <label className="font-medium">Pick-up Address (max 200 chars)</label>
            <textarea
              name="address"
              value={form.address}
              onChange={handleFieldChange}
              maxLength={200}
              className="w-full border rounded p-2"
              placeholder="e.g. 5 Victoria Street, Flemington"
              required
            />
            <p className="text-xs text-gray-500">
              This is the pick-up location — it doesn’t have to match the organisation’s address.
            </p>
          </div>

          {/* Weight & Value */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium">Weight (kg)</label>
              <input
                type="number"
                name="weight"
                value={form.weight}
                onChange={handleFieldChange}
                className="w-full border rounded p-2"
                required
                min="0"
                step="0.1"
              />
            </div>
            <div>
              <label className="font-medium">Value ($)</label>
              <input
                type="number"
                name="value"
                value={form.value}
                onChange={handleFieldChange}
                className="w-full border rounded p-2"
                required
                min="0"
                step="1"
              />
            </div>
          </div>

          {/* Size & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium">Package Size</label>
              <select
                name="size"
                value={form.size}
                onChange={handleFieldChange}
                className="w-full border rounded p-2"
              >
                <option>Tiny</option>
                <option>Small</option>
                <option>Medium</option>
                <option>Large</option>
              </select>
            </div>
            <div>
              <label className="font-medium">Intake Priority</label>
              <select
                name="intakePriority"
                value={form.intakePriority}
                onChange={handleFieldChange}
                className="w-full border rounded p-2"
              >
                <option>Low</option>
                <option>Medium</option>
                <option>High</option>
              </select>
            </div>
          </div>

          {/* Deadline & Follow-up */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-medium">Deadline Date</label>
              <input
                type="date"
                name="deadlineDate"
                value={form.deadlineDate}
                onChange={handleFieldChange}
                className="w-full border rounded p-2"
                required
              />
            </div>
            <div className="flex items-center space-x-2 mt-7">
              <input
                id="followUp"
                type="checkbox"
                name="followUp"
                checked={form.followUp}
                onChange={handleCheckboxChange}
              />
              <label htmlFor="followUp">Follow-up Required</label>
            </div>
          </div>

          {/* Messages */}
          {error && (
            <div className="border border-red-300 bg-red-50 text-red-700 p-2 rounded">
              {error}
            </div>
          )}
          {success && (
            <div className="border border-green-300 bg-green-50 text-green-700 p-2 rounded">
              {success}
            </div>
          )}

          {/* Buttons */}
          <div className="flex gap-3">
            <button
              type="submit"
              className="bg-red-700 text-white px-4 py-2 rounded hover:bg-red-800"
            >
              Add Job
            </button>
            <button
              type="button"
              className="bg-gray-200 px-4 py-2 rounded"
              onClick={() => router.push("/dashboard/admin")}
            >
              Back to Admin
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
