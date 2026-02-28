import { notFound } from "next/navigation";
import { FadeIn } from "@/components/motion/fade-in";
import { MedicineCard } from "@/components/MedicineCard";
import { PriceComparison } from "@/components/PriceComparison";
import { PrescriptionViewer } from "@/components/PrescriptionViewer";
import { ReminderCard } from "@/components/ReminderCard";
import { ResultActions } from "@/components/ResultActions";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { getPrescription } from "@/lib/mock/prescriptions";

export const dynamic = "force-dynamic";

export default function ResultPage({ params }: { params: { id: string } }) {
  const result = getPrescription(params.id);
  if (!result) notFound();

  return (
    <div className="container-padded pt-10">
      <FadeIn>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-semibold tracking-tight">Result</h2>
              <Badge variant="subtle">ID: {result.id}</Badge>
            </div>
            <p className="mt-2 text-sm text-muted-foreground">
              Clean interpretation with medicine structure, comparison, and actions.
            </p>
          </div>
          <div className="text-sm text-muted-foreground">
            {new Date(result.createdAt).toLocaleString()}
          </div>
        </div>
      </FadeIn>

      <div className="mt-8 grid gap-6 lg:grid-cols-12">
        <FadeIn className="lg:col-span-4">
          <div className="space-y-6">
            <PrescriptionViewer src={result.sourcePreviewUrl} />
            <ResultActions />
          </div>
        </FadeIn>

        <FadeIn delay={0.05} className="lg:col-span-8">
          <div className="space-y-6">
            <Card className="glass-card">
              <CardHeader className="pb-4">
                <CardTitle>Structured interpretation</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-border bg-background/50 p-4">
                  <div className="text-xs font-medium text-muted-foreground">
                    Patient-friendly summary
                  </div>
                  <div className="mt-2 text-sm leading-7">{result.patientSummary}</div>
                </div>
                {result.doctorNote ? (
                  <div className="rounded-xl border border-border bg-background/50 p-4">
                    <div className="text-xs font-medium text-muted-foreground">
                      Doctor notes
                    </div>
                    <div className="mt-2 text-sm text-muted-foreground">
                      {result.doctorNote}
                    </div>
                  </div>
                ) : null}
                <Separator />
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border border-border bg-muted/30 px-3 py-1">
                    Source: {result.sourceKind.toUpperCase()}
                  </span>
                  <span className="rounded-full border border-border bg-muted/30 px-3 py-1">
                    Language: {result.language.toUpperCase()}
                  </span>
                  <span className="rounded-full border border-border bg-muted/30 px-3 py-1">
                    File: {result.sourceFileName}
                  </span>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 sm:grid-cols-2">
              {result.medicines.map((m) => (
                <MedicineCard key={m.id} medicine={m} />
              ))}
            </div>

            <div className="grid gap-6 lg:grid-cols-2">
              <PriceComparison links={result.priceLinks} />
              <ReminderCard reminders={result.reminders} />
            </div>
          </div>
        </FadeIn>
      </div>
    </div>
  );
}

