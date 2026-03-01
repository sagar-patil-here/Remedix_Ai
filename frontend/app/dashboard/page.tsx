"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, ArrowRight, Loader2 } from "lucide-react";
import { useAuth } from "@clerk/nextjs";
import { fetchPrescriptions } from "@/lib/api/client";
import type { PrescriptionResult } from "@/lib/types";

export default function DashboardPage() {
  const { userId, isLoaded } = useAuth();
  const [prescriptions, setPrescriptions] = useState<PrescriptionResult[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isLoaded) return;

    if (!userId) {
      setIsLoading(false);
      return;
    }

    const loadData = async () => {
      try {
        const { prescriptions } = await fetchPrescriptions(userId, 1, 50);
        setPrescriptions(prescriptions);
      } catch (err) {
        console.error("Failed to fetch prescriptions:", err);
        setError("Failed to load your prescriptions.");
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [userId, isLoaded]);

  if (!isLoaded || isLoading) {
    return (
      <div className="container-padded pt-20 pb-20 flex justify-center items-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="container-padded pt-10 pb-20 text-center">
        <h2 className="text-3xl font-semibold tracking-tight">Access Denied</h2>
        <p className="mt-2 text-muted-foreground mb-6">You must be logged in to view your dashboard.</p>
        <Button asChild>
          <Link href="/sign-in">Sign In</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="container-padded pt-10 pb-20">
      <FadeIn>
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between mb-8">
          <div>
            <h2 className="text-3xl font-semibold tracking-tight">Your Prescriptions</h2>
            <p className="mt-2 text-muted-foreground">
              Manage your saved analyses, reminders, and reports.
            </p>
          </div>
          <Button asChild>
            <Link href="/upload">Scan New</Link>
          </Button>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        {error ? (
          <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center text-red-700">
            {error}
          </div>
        ) : prescriptions.length === 0 ? (
          <Card className="border-dashed p-12 text-center shadow-none">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <FileText className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mt-4 text-lg font-semibold">No prescriptions yet</h3>
            <p className="mt-2 text-muted-foreground mb-6">
              Upload your first prescription to get started.
            </p>
            <Button asChild variant="secondary">
              <Link href="/upload">Upload Now</Link>
            </Button>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {prescriptions.map((p) => (
              <Card key={p.id} className="hover:border-primary/30 transition-all hover:shadow-cal-md flex flex-col">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div>
                      <CardTitle className="text-base truncate" title={p.sourceFileName || "Prescription"}>
                        {p.sourceFileName || "Prescription"}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(p.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{p.medicines?.length || 0} Meds</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between gap-4">
                  <div className="text-sm text-muted-foreground line-clamp-3">
                    {p.patientSummary || "No summary available."}
                  </div>
                  <Button asChild variant="outline" className="w-full justify-between group">
                    <Link href={`/result/${p.id}`}>
                      View Details
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </FadeIn>
    </div>
  );
}
