/*******************************************************
* Project:   GoodRun Volunteer App
* File:      app/dashboard/job/[id]/jobDetail.tsx
* Purpose:   Show job details; admins can edit, volunteers read-only.
* Note:      Renders Leaflet JobMapView ABOVE the organisation card.
* Revisions:
* v1.0 - Initial implementation
* v1.1 - Added Map functionality with pull from DB, and translating address
*        to the geocoded coordinates
* v1.2 - Switch to JobMapView (Leaflet), prefer DB coords, fallback to /api/geocoding
* v1.3 - Debounced re-geocode on address edits (admin only)
*******************************************************/

"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import dynamic from "next/dynamic";

// IMPORTANT: Leaflet must be client-only (no SSR).
const JobMapView = dynamic(() => import("./jobMapView"), { ssr: false });

type Job = {
  id: number;
  name: string | null;
  address: string | null;
  weight: number | null;
  value: number | null;
  size: "tiny" | "small" | "medium" | "large";
  intake_priority: "low" | "medium" | "high";
  deadline_date: string | null;
  follow_up: boolean;
  progress_stage: string;
  assigned_to: number | null;
  organisation_id: number;
  organisation_name: string;
  organisation_address: string;
  organisation_contact_no: string;
  organisation_office_hours: string;
  latitude?: number | null;
  longitude?: number | null;
};

type Coords = { lat: number; lng: number };

export default function JobDetail({ id }: { id: string }) {
  const { data: session } = useSession();
  const role = (session?.user as any)?.role as "admin" | "volunteer" | undefined;

  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [msg, setMsg] = useState<string | null>(null);
  const [editMode, setEditMode] = useState(false);

  const [coords, setCoords] = useState<Coords | null>(null);
  const [geoLabel, setGeoLabel] = useState<string | null>(null);
  const [geoError, setGeoError] = useState<string | null>(null);

  const isAdmin = role === "admin";
  const canEdit = isAdmin && editMode;

  const [form, setForm] = useState({
    name: "",
    address: "",
    weight: "",
    value: "",
    size: "small",
    intake_priority: "medium",
    deadline_date: "",
    follow_up: false,
    progress_stage: "",
  });

  // 1) Load job
  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      setError(null);
      setMsg(null);
      try {
        const res = await fetch(`/api/jobs/${id}`, {
          credentials: "include",
          cache: "no-store",
        });
        if (!res.ok) throw new Error(`Failed to load job ${id}`);
        const data = await res.json();
        const j: Job = data.job ?? data;

        if (mounted) {
          setJob(j);
          setForm({
            name: j.name ?? "",
            address: j.address ?? "",
            weight: String(j.weight ?? ""),
            value: String(j.value ?? ""),
            size: j.size ?? "small",
            intake_priority: j.intake_priority ?? "medium",
            deadline_date: j.deadline_date ?? "",
            follow_up: !!j.follow_up,
            progress_stage: j.progress_stage ?? "available",
          });
        }
      } catch (e: any) {
        if (mounted) setError(e?.message || "Error loading job");
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [id]);

  // 2) Resolve map coordinates (prefer DB coords; else geocode)
  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!job) return;
      setGeoError(null);

      if (
        typeof job.latitude === "number" &&
        typeof job.longitude === "number" &&
        isFinite(job.latitude) &&
        isFinite(job.longitude)
      ) {
        if (!ignore) {
          setCoords({ lat: job.latitude, lng: job.longitude });
          setGeoLabel(job.address ?? null);
        }
        return;
      }

      if (job.address && job.address.trim()) {
        try {
          const r = await fetch(`/api/geocoding?address=${encodeURIComponent(job.address)}`, {
            cache: "no-store",
          });
          if (r.ok) {
            const g = await r.json();
            if (typeof g?.latitude === "number" && typeof g?.longitude === "number") {
              if (!ignore) {
                setCoords({ lat: g.latitude, lng: g.longitude });
                setGeoLabel(g.formattedAddress ?? job.address ?? null);
              }
              return;
            }
            if (!ignore) setGeoError("No coordinates returned for this address.");
          } else {
            const info = await r.json().catch(() => ({}));
            if (!ignore) setGeoError(info?.details || info?.error || "Geocoding failed.");
          }
        } catch (e: any) {
          if (!ignore) setGeoError(e?.message || "Geocoding error.");
        }
      } else {
        if (!ignore) {
          setCoords(null);
          setGeoLabel(null);
        }
      }
    })();
    return () => {
      ignore = true;
    };
  }, [job]);

  // 3) Debounced re-geocode while admin edits the address
  useEffect(() => {
    if (!canEdit) return;
    const addr = form.address?.trim();
    if (!addr) {
      setGeoLabel(null);
      return;
    }
    const t = setTimeout(async () => {
      try {
        const r = await fetch(`/api/geocoding?address=${encodeURIComponent(addr)}`, {
          cache: "no-store",
        });
        if (r.ok) {
          const g = await r.json();
          if (typeof g?.latitude === "number" && typeof g?.longitude === "number") {
            setCoords({ lat: g.latitude, lng: g.longitude });
            setGeoLabel(g.formattedAddress ?? addr);
            setGeoError(null);
          }
        } else {
          const info = await r.json().catch(() => ({}));
          setGeoError(info?.details || info?.error || "Geocoding failed.");
        }
      } catch {
        /* noop */
      }
    }, 500);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canEdit, form.address]);

  const onChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };
  const onCheck = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setForm((p) => ({ ...p, [name]: checked }));
  };

  const statusPill = useMemo(() => {
    const s = job?.progress_stage || "";
    if (s.includes("cancelled")) return "bg-gray-200 text-gray-700";
    if (s === "in_delivery") return "bg-blue-100 text-blue-700";
    if (s === "available") return "bg-green-100 text-green-700";
    return "bg-yellow-100 text-yellow-700";
  }, [job]);

  const startEdit = () => {
    if (isAdmin) {
      setEditMode(true);
      setMsg(null);
    }
  };
  const cancelEdit = () => {
    if (!isAdmin || !job) return;
    setForm({
      name: job.name ?? "",
      address: job.address ?? "",
      weight: String(job.weight ?? ""),
      value: String(job.value ?? ""),
      size: job.size ?? "small",
      intake_priority: job.intake_priority ?? "medium",
      deadline_date: job.deadline_date ?? "",
      follow_up: !!job.follow_up,
      progress_stage: job.progress_stage ?? "available",
    });
    setEditMode(false);
    setMsg(null);
  };

  const toNum = (s: string) => {
    const n = s.trim() === "" ? NaN : Number(s);
    return Number.isFinite(n) ? n : null;
  };

  const save = async () => {
    if (!isAdmin) return;
    setSaving(true);
    setError(null);
    setMsg(null);
    try {
      const payload = {
        name: form.name.trim() || null,
        address: form.address.trim() || null,
        weight: toNum(form.weight),
        value: toNum(form.value),
        size: form.size.toLowerCase(),
        intake_priority: form.intake_priority.toLowerCase(),
        deadline_date: form.deadline_date || null,
        follow_up: !!form.follow_up,
        progress_stage: form.progress_stage,
        // latitude: coords?.lat ?? null,
        // longitude: coords?.lng ?? null,
      };
      const res = await fetch(`/api/jobs/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify(payload),
      });
      const text = await res.text();
      let data: any = null;
      try { data = text ? JSON.parse(text) : null; } catch {}
      if (!res.ok) {
        setError(data?.error || data?.message || text || "Failed to save changes");
        return;
      }
      const updated: Job = data.job ?? data;
      setJob(updated);
      setEditMode(false);
      setMsg("✅ Changes saved.");
      setForm({
        name: updated.name ?? "",
        address: updated.address ?? "",
        weight: String(updated.weight ?? ""),
        value: String(updated.value ?? ""),
        size: updated.size ?? "small",
        intake_priority: updated.intake_priority ?? "medium",
        deadline_date: updated.deadline_date ?? "",
        follow_up: !!updated.follow_up,
        progress_stage: updated.progress_stage ?? "available",
      });
    } catch (e: any) {
      setError(e?.message || "Network error");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="rounded-lg border bg-white p-4">Loading…</div>
      </section>
    );
  }
  if (error) {
    return (
      <section className="max-w-6xl mx-auto px-6 py-10">
        <div className="rounded-lg border border-red-300 bg-red-50 text-red-700 p-4">
          {error}
        </div>
      </section>
    );
  }
  if (!job) return null;

  return (
    <section className="max-w-6xl mx-auto px-6 py-10 space-y-6">
      {/* Title */}
      <div className="rounded-lg bg-red-700 p-6 text-white flex items-center justify-between shadow-sm">
        <h1 className="text-2xl font-semibold">
          Job #{job.id} {job.name ? `— ${job.name}` : ""}
        </h1>
        <span className={`text-xs rounded-full px-3 py-1 ${statusPill}`}>
          {job.progress_stage}
        </span>
      </div>

      {/* Map */}
      <div className="rounded-lg bg-white p-4 border shadow-sm">
        <h3 className="mb-3 text-lg font-semibold">Route preview</h3>
        {coords ? (
          <JobMapView 
            jobLocation={coords}
            progressStage={form.progress_stage}
            />
        ) : (
          <div className="h-[320px] flex items-center justify-center text-gray-600 border border-dashed rounded text-center px-4">
            {geoError
              ? <>Couldn’t locate this address.<br /><span className="text-xs text-gray-500">{geoError}</span></>
              : form.address
                ? "Locating address…"
                : "No address provided"}
          </div>
        )}
        <p className="mt-2 text-xs text-gray-500">
          Address: <span className="font-medium">{geoLabel ?? job.address ?? "—"}</span>
        </p>
      </div>

      {/* Organisation quick info */}
      <div className="rounded-lg bg-white p-4 border shadow-sm">
        <div className="text-sm text-gray-700">
          <b>Organisation:</b> {job.organisation_name} • {job.organisation_contact_no} •{" "}
          {job.organisation_office_hours}
          <div className="text-xs text-gray-500">{job.organisation_address}</div>
        </div>
      </div>

      {/* Form */}
      <form
        className="bg-white rounded-lg shadow-md p-6 space-y-4 border border-gray-200"
        onSubmit={(e) => {
          e.preventDefault();
          if (canEdit) save();
        }}
      >
        {/* Row 1: name + address */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Job Name</label>
            <input
              name="name"
              type="text"
              value={form.name}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
              disabled={!canEdit}
              placeholder="Optional"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Pick-up Address</label>
            <textarea
              name="address"
              value={form.address}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
              disabled={!canEdit}
              rows={1}
            />
          </div>
        </div>

        {/* Row 2: weight/value */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Weight (kg)</label>
            <input
              name="weight"
              type="number"
              inputMode="decimal"
              value={form.weight}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
              disabled={!canEdit}
              min="0"
              step="0.1"
            />
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Value ($)</label>
            <input
              name="value"
              type="number"
              inputMode="decimal"
              value={form.value}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
              disabled={!canEdit}
              min="0"
              step="1"
            />
          </div>
        </div>

        {/* Row 3: size/priority */}
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Package Size</label>
            <select
              name="size"
              value={form.size}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
              disabled={!canEdit}
            >
              <option value="tiny">Tiny</option>
              <option value="small">Small</option>
              <option value="medium">Medium</option>
              <option value="large">Large</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Intake Priority</label>
            <select
              name="intake_priority"
              value={form.intake_priority}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
              disabled={!canEdit}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {/* Row 4: deadline + followup + status */}
        <div className="grid md:grid-cols-3 gap-4">
          <div>
            <label className="block text-gray-700 font-medium mb-1">Deadline</label>
            <input
              name="deadline_date"
              type="date"
              value={form.deadline_date || ""}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
              disabled={!canEdit}
            />
          </div>
          <label className="flex items-center gap-3 mt-7 md:mt-7">
            <input
              id="follow_up"
              name="follow_up"
              type="checkbox"
              checked={form.follow_up}
              onChange={onCheck}
              disabled={!canEdit}
            />
            <span className="text-gray-700 font-medium">Follow-up Required</span>
          </label>
          <div>
            <label className="block text-gray-700 font-medium mb-1">Progress Stage</label>
            <select
              name="progress_stage"
              value={form.progress_stage}
              onChange={onChange}
              className="w-full border rounded px-3 py-2"
              disabled={!canEdit}
            >
              <option value="available">available</option>
              <option value="reserved">reserved</option>
              <option value="in_delivery">in_delivery</option>
              <option value="cancelled_in_delivery">cancelled_in_delivery</option>
              <option value="completed">completed</option>
            </select>
          </div>
        </div>

        {msg && <div className="rounded border bg-green-50 text-green-700 px-3 py-2">{msg}</div>}
        {error && <div className="rounded border bg-red-50 text-red-700 px-3 py-2">{error}</div>}

        <div className="flex justify-between">
        
          <a
            href={form.progress_stage === "available" ? "/dashboard/availableJobs" : "/dashboard/ongoingJobs"}
            className="rounded border px-4 py-2 hover:bg-gray-50"
          >
            ← Back
          </a>

          {isAdmin && !editMode && (
            <button
              type="button"
              onClick={startEdit}
              className="rounded bg-[#171e3a] text-white px-4 py-2 hover:bg-[#2b3463]"
            >
              Edit
            </button>
          )}
          {isAdmin && editMode && (
            <div className="flex gap-3">
              <button
                type="button"
                onClick={cancelEdit}
                className="rounded border px-4 py-2 hover:bg-gray-50"
                disabled={saving}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="rounded bg-red-700 text-white px-4 py-2 hover:bg-red-800 disabled:opacity-60"
                disabled={saving}
              >
                {saving ? "Saving…" : "Save"}
              </button>
            </div>
          )}
        </div>
      </form>
    </section>
  );
}
