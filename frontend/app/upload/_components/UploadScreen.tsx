"use client";

import * as React from "react";
import Link from "next/link";
import { UploadCard } from "@/components/UploadCard";
import { MedicineCard } from "@/components/MedicineCard";
import { PriceComparison } from "@/components/PriceComparison";
import { ReminderCard } from "@/components/ReminderCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import type { PrescriptionResult } from "@/lib/types";

export function UploadScreen() {
  const [result, setResult] = React.useState<PrescriptionResult | null>(null);

  return (
    <div className="space-y-8">
      <UploadCard onAnalyzed={setResult} />

      <div className="grid gap-6 lg:grid-cols-3">
        <Card className="glass-card lg:col-span-1">
          <CardHeader className="pb-4">
            <CardTitle>Output</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {!result ? (
              <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
                Upload a prescription and click “Analyze” to see structured output.
              </div>
            ) : (
              <>
                <div className="rounded-xl border border-border bg-background/50 p-4">
                  <div className="text-xs font-medium text-muted-foreground">
                    Patient summary
                  </div>
                  <div className="mt-2 text-sm leading-7">{result.patientSummary}</div>
                </div>
                <Button asChild className="w-full">
                  <Link href={`/result/${result.id}`}>Open full result</Link>
                </Button>
              </>
            )}
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-6">
          {!result ? (
            <div className="rounded-xl border border-border bg-background/50 p-6 text-sm text-muted-foreground">
              Medicine cards will appear here after analysis.
            </div>
          ) : (
            <>
              <div className="grid gap-4 sm:grid-cols-2">
                {result.medicines.map((m) => (
                  <MedicineCard key={m.id} medicine={m} />
                ))}
              </div>
              <div className="grid gap-6 lg:grid-cols-2">
                <PriceComparison links={result.priceLinks} />
                <ReminderCard reminders={result.reminders} />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

