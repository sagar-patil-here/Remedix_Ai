import Link from "next/link";
import { FadeIn } from "@/components/motion/fade-in";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, FileText, ArrowRight } from "lucide-react";
import { listPrescriptions } from "@/lib/mock-data";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const prescriptions = listPrescriptions();

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
            <Link href="/upload">Analyze New</Link>
          </Button>
        </div>
      </FadeIn>

      <FadeIn delay={0.1}>
        {prescriptions.length === 0 ? (
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
                      <CardTitle className="text-base truncate" title={p.sourceFileName}>
                        {p.sourceFileName}
                      </CardTitle>
                      <CardDescription className="flex items-center gap-2 mt-1">
                        <Calendar className="h-3 w-3" />
                        {new Date(p.createdAt).toLocaleDateString()}
                      </CardDescription>
                    </div>
                    <Badge variant="secondary">{p.medicines.length} Meds</Badge>
                  </div>
                </CardHeader>
                <CardContent className="flex-1 flex flex-col justify-between gap-4">
                  <div className="text-sm text-muted-foreground line-clamp-3">
                    {p.patientSummary}
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
