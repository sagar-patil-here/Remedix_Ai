"use client";

import type { PrescriptionResult } from "@/lib/types";

/**
 * Upload a prescription image and get back the analysis result.
 * Always uses the Next.js API route (/api/analyze) which proxies to the backend
 * when configured, or returns mock data. This avoids CORS and keeps logic server-side.
 */
export async function analyzePrescription(
  file: File,
  language: string = "en"
): Promise<PrescriptionResult> {
  const formData = new FormData();
  formData.set("file", file);
  formData.set("language", language);

  const res = await fetch("/api/analyze", {
    method: "POST",
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || err.message || "Analysis failed");
  }

  return (await res.json()) as PrescriptionResult;
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "";

/**
 * Fetch all prescriptions for the current user (from backend).
 * Falls back to empty list if backend is not configured.
 */
export async function fetchPrescriptions(
  page: number = 1,
  limit: number = 10
): Promise<{ prescriptions: PrescriptionResult[]; total: number }> {
  if (!BACKEND_URL) return { prescriptions: [], total: 0 };

  const res = await fetch(
    `${BACKEND_URL}/api/prescriptions/userPrescriptions?page=${page}&limit=${limit}`
  );
  if (!res.ok) throw new Error("Failed to fetch prescriptions");

  const json = await res.json();
  const prescriptions = (json.data?.prescriptions ?? []).map(
    (p: unknown) => p as PrescriptionResult
  );
  return { prescriptions, total: json.meta?.total ?? prescriptions.length };
}

/**
 * Translate a prescription to another language (backend only).
 */
export async function translatePrescription(
  prescriptionId: string,
  language: string
): Promise<PrescriptionResult> {
  if (!BACKEND_URL) throw new Error("Backend not configured for translation");

  const res = await fetch(`${BACKEND_URL}/api/prescriptions/${prescriptionId}/translate`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ language }),
  });

  if (!res.ok) throw new Error("Translation failed");

  const json = await res.json();
  if (!json.success || !json.data?.prescription) throw new Error(json.message);

  return json.data.prescription as PrescriptionResult;
}
