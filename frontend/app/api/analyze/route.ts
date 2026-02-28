import { NextResponse } from "next/server";
import { createMockAnalysis } from "@/lib/mock-data";

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL || "";

export async function POST(req: Request) {
  // If backend is configured, proxy the request
  if (BACKEND_URL) {
    try {
      const formData = await req.formData();
      const file = formData.get("file") as File | null;

      const backendForm = new FormData();
      if (file) backendForm.set("prescription", file);
      backendForm.set("language", (formData.get("language") as string) || "en");
      backendForm.set("privacyConsent", "true");

      const res = await fetch(`${BACKEND_URL}/api/prescriptions/upload`, {
        method: "POST",
        body: backendForm,
      });

      const json = await res.json();

      if (!json.success || !json.data?.prescription) {
        return NextResponse.json(
          { error: json.message || "Backend processing failed" },
          { status: 422 }
        );
      }

      // Transform and return — let the client handle transformation
      // or return raw for the client transformer
      const { transformBackendPrescription } = await import("@/lib/transform");
      const result = transformBackendPrescription(json.data.prescription);
      return NextResponse.json(result);
    } catch (error) {
      console.error("Backend proxy failed, falling back to mock:", error);
    }
  }

  // Fallback: mock data
  const formData = await req.formData().catch(() => null);
  const file = formData?.get("file");
  const fileName =
    file && typeof file === "object" && "name" in file
      ? String((file as File).name)
      : "prescription";

  const result = createMockAnalysis({ fileName });
  return NextResponse.json(result);
}
