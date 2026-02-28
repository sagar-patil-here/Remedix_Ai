import Link from "next/link";
import { FadeIn } from "@/components/motion/fade-in";
import { MedicineCard } from "@/components/MedicineCard";
import { PriceComparison } from "@/components/PriceComparison";
import { ReminderCard } from "@/components/ReminderCard";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { listPrescriptions } from "@/lib/mock/prescriptions";
import type { PrescriptionLanguage } from "@/lib/types";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  const prescriptions = listPrescriptions();
  const latest = prescriptions[0] ?? null;

  return (
    <div className="container-padded pt-10">
      <FadeIn>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h2 className="text-2xl font-semibold tracking-tight">Dashboard</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              A productivity view of your prescriptions, comparisons, exports, and reminders.
            </p>
          </div>
          <Button asChild variant="secondary">
            <Link href="/upload">New upload</Link>
          </Button>
        </div>
      </FadeIn>

      {!latest ? (
        <FadeIn delay={0.06}>
          <Card className="glass-card mt-8">
            <CardHeader className="pb-4">
              <CardTitle>No prescriptions yet</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="text-sm text-muted-foreground">
                Upload a prescription to see medicine structure, price links, exports, and reminders here.
              </div>
              <Button asChild>
                <Link href="/upload">Upload prescription</Link>
              </Button>
            </CardContent>
          </Card>
        </FadeIn>
      ) : (
        <div className="mt-8 grid gap-6 lg:grid-cols-12">
          <FadeIn className="lg:col-span-5">
            <Card className="glass-card">
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between gap-3">
                  Prescription summary
                  <Badge variant="subtle">{latest.medicines.length} medicines</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="rounded-xl border border-border bg-background/50 p-4">
                  <div className="text-xs font-medium text-muted-foreground">
                    Patient summary
                  </div>
                  <div className="mt-2 text-sm leading-7">{latest.patientSummary}</div>
                </div>
                <div className="flex flex-wrap gap-2 text-xs text-muted-foreground">
                  <span className="rounded-full border border-border bg-muted/30 px-3 py-1">
                    {new Date(latest.createdAt).toLocaleDateString()}
                  </span>
                  <span className="rounded-full border border-border bg-muted/30 px-3 py-1">
                    {latest.sourceKind.toUpperCase()}
                  </span>
                  <span className="rounded-full border border-border bg-muted/30 px-3 py-1">
                    {latest.sourceFileName}
                  </span>
                </div>
                <Button asChild className="w-full">
                  <Link href={`/result/${latest.id}`}>Open result</Link>
                </Button>
              </CardContent>
            </Card>

            <div className="mt-6">
              <ReminderCard reminders={latest.reminders} />
            </div>
          </FadeIn>

          <FadeIn delay={0.05} className="lg:col-span-7">
            <div className="space-y-6">
              <Card className="glass-card">
                <CardHeader className="pb-4">
                  <CardTitle>Medicine comparison table</CardTitle>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Dosage</TableHead>
                        <TableHead>Frequency</TableHead>
                        <TableHead>Duration</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {latest.medicines.map((m) => (
                        <TableRow key={m.id}>
                          <TableCell className="font-medium">{m.name}</TableCell>
                          <TableCell>{m.dosage}</TableCell>
                          <TableCell>{m.frequency}</TableCell>
                          <TableCell>{m.duration}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <div className="grid gap-6 lg:grid-cols-2">
                <Card className="glass-card">
                  <CardHeader className="pb-4">
                    <CardTitle>Export options</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button asChild variant="outline" className="w-full justify-start">
                      <Link href={`/result/${latest.id}`}>Export PDF (from result)</Link>
                    </Button>
                    <Button asChild variant="secondary" className="w-full justify-start">
                      <Link href={`/result/${latest.id}`}>Share link (placeholder)</Link>
                    </Button>
                    <div className="text-xs text-muted-foreground">
                      Export will be enhanced with server-side PDF in Phase 2.
                    </div>
                  </CardContent>
                </Card>

                <Card className="glass-card">
                  <CardHeader className="pb-4">
                    <CardTitle>Language selector</CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Select defaultValue={latest.language as PrescriptionLanguage}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select language" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="en">English</SelectItem>
                        <SelectItem value="hi">Hindi</SelectItem>
                        <SelectItem value="mr">Marathi</SelectItem>
                        <SelectItem value="ta">Tamil</SelectItem>
                        <SelectItem value="te">Telugu</SelectItem>
                      </SelectContent>
                    </Select>
                    <div className="text-xs text-muted-foreground">
                      Placeholder: real multi-language content will be fetched from backend.
                    </div>
                  </CardContent>
                </Card>
              </div>

              <PriceComparison links={latest.priceLinks} />

              <Card className="glass-card">
                <CardHeader className="pb-4">
                  <CardTitle>Telegram sync</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="rounded-xl border border-dashed border-border bg-muted/20 p-6 text-sm text-muted-foreground">
                    Coming soon: push reminders and summaries to Telegram.
                  </div>
                  <Button variant="secondary" className="w-full" disabled>
                    Connect Telegram (placeholder)
                  </Button>
                </CardContent>
              </Card>

              <div className="grid gap-4 sm:grid-cols-2">
                {latest.medicines.slice(0, 2).map((m) => (
                  <MedicineCard key={m.id} medicine={m} />
                ))}
              </div>
            </div>
          </FadeIn>
        </div>
      )}
    </div>
  );
}

