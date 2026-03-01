"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@clerk/nextjs";
import { FadeIn } from "@/components/motion/fade-in";
import { PrescriptionEditor } from "@/components/PrescriptionEditor";
import { fetchPrescriptionById } from "@/lib/api/client";
import type { PrescriptionResult } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { ArrowLeft, Loader2, FileX2 } from "lucide-react";
import Link from "next/link";

export default function ResultPage() {
  const params = useParams();
  const router = useRouter();
  const { userId } = useAuth();
  const [result, setResult] = useState<PrescriptionResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const prescriptionId = params?.id as string;

  useEffect(() => {
    if (!prescriptionId) return;

    const load = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await fetchPrescriptionById(prescriptionId, userId);
        if (!data) {
          setError("Prescription not found.");
        } else {
          setResult(data);
        }
      } catch (err) {
        console.error("Failed to fetch prescription:", err);
        setError("Failed to load prescription details.");
      } finally {
        setIsLoading(false);
      }
    };

    load();
  }, [prescriptionId, userId]);

  if (isLoading) {
    return (
      <div className="container-padded pt-20 pb-20 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error || !result) {
    return (
      <div className="container-padded pt-10 pb-20">
        <FadeIn>
          <Button
            variant="ghost"
            className="gap-2 mb-6"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/20 mb-4">
              <FileX2 className="h-8 w-8 text-red-500" />
            </div>
            <h2 className="text-2xl font-semibold mb-2">Not Found</h2>
            <p className="text-muted-foreground mb-6">{error || "This prescription could not be found."}</p>
            <Button asChild>
              <Link href="/dashboard">Go to Dashboard</Link>
            </Button>
          </div>
        </FadeIn>
      </div>
    );
  }

  return (
    <div className="container-padded pt-10 pb-20">
      <FadeIn>
        <PrescriptionEditor
          result={result}
          onBack={() => router.back()}
          onSave={(updated) => setResult(updated)}
        />
      </FadeIn>
    </div>
  );
}
