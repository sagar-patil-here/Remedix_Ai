"use client";

import type { PrescriptionResult } from "@/lib/types";
import { transformBackendPrescription } from "@/lib/transform";


export async function uploadPrescription(
  file: File,
  language: string = "en",
  pipeline: string = "gemini",
  userId?: string | null
): Promise<PrescriptionResult> {
  const formData = new FormData();
  formData.set("prescription", file);
  formData.set("language", language);
  formData.set("privacyConsent", "true");
  formData.set("pipeline", pipeline);

  const headers: Record<string, string> = {};
  if (userId) {
    headers["x-user-id"] = userId;
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prescriptions/upload`, {
    method: "POST",
    headers,
    body: formData,
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error || err.message || "Analysis failed");
  }

  const json = await res.json();
  if (!json.success || !json.data?.prescription) {
    throw new Error(json.message || "Invalid response format");
  }

  return transformBackendPrescription(json.data.prescription);
}

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function fetchPrescriptions(
  userId: string | null | undefined,
  page: number = 1,
  limit: number = 10
): Promise<{ prescriptions: PrescriptionResult[]; total: number }> {
  if (!BACKEND_URL) return { prescriptions: [], total: 0 };

  const headers: Record<string, string> = {};
  if (userId) {
    headers["x-user-id"] = userId;
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/prescriptions/userPrescriptions/${userId}?page=${page}&limit=${limit}`,
    { headers }
  );
  if (!res.ok) throw new Error("Failed to fetch prescriptions");

  const json = await res.json();
  const prescriptions = (json.data?.prescriptions ?? []).map(
    (p: any) => transformBackendPrescription(p)
  );
  return { prescriptions, total: json.meta?.total ?? prescriptions.length };
}

export async function translatePrescription(
  prescriptionId: string,
  language: string,
  userId?: string | null
): Promise<PrescriptionResult> {
  if (!BACKEND_URL) throw new Error("Backend not configured for translation");

  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (userId) {
    headers["x-user-id"] = userId;
  }

  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/prescriptions/${prescriptionId}/translate`, {
    method: "POST",
    headers,
    body: JSON.stringify({ language }),
  });

  if (!res.ok) throw new Error("Translation failed");

  const json = await res.json();
  if (!json.success || !json.data?.prescription) throw new Error(json.message);

  return transformBackendPrescription(json.data.prescription);
}

export async function fetchPrescriptionById(
  prescriptionId: string,
  userId: string | null | undefined
): Promise<PrescriptionResult | null> {
  const headers: Record<string, string> = {};
  if (userId) {
    headers["x-user-id"] = userId;
  }

  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_URL}/api/prescriptions/detail/${prescriptionId}`,
    { headers }
  );

  if (!res.ok) return null;

  const json = await res.json();
  if (!json.success || !json.data?.prescription) return null;

  return transformBackendPrescription(json.data.prescription);
}
