"use client";

import * as React from "react";
import {
  FileText,
  MessageCircle,
  Calendar,
  Volume2,
  Save,
  ExternalLink,
  TrendingDown,
  CheckCircle2,
  CalendarPlus,
  CalendarCheck,
  Clock,
  Stethoscope,
  Pill,
  AlertTriangle,
  Shield,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import type { PrescriptionResult, CalendarEvent } from "@/lib/types";
import { addToGoogleCalendar, addAllToGoogleCalendar } from "@/lib/calendar";
import { cn } from "@/lib/utils";

interface AnalysisDashboardProps {
  result: PrescriptionResult;
}

export function AnalysisDashboard({ result }: AnalysisDashboardProps) {
  const [isPlaying, setIsPlaying] = React.useState(false);
  const [isSaved, setIsSaved] = React.useState(false);
  const [addedEvents, setAddedEvents] = React.useState<Set<string>>(new Set());
  const [allAdded, setAllAdded] = React.useState(false);

  const handlePlayAudio = () => {
    setIsPlaying(!isPlaying);
    setTimeout(() => setIsPlaying(false), 3000);
  };

  const handleSave = () => {
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 2000);
  };

  const handleAddEvent = (event: CalendarEvent) => {
    addToGoogleCalendar(event);
    setAddedEvents((prev) => new Set(prev).add(event.id));
  };

  const handleAddAll = () => {
    addAllToGoogleCalendar(result.calendarEvents);
    setAllAdded(true);
    setAddedEvents(new Set(result.calendarEvents.map((e) => e.id)));
  };

  const medicineEvents = result.calendarEvents.filter((e) => e.type === "medicine");
  const reExamEvents = result.calendarEvents.filter((e) => e.type === "reexamination");
  const confidencePercent = result.overallConfidence
    ? Math.round(result.overallConfidence * 100)
    : null;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* 1. Patient Info & Summary */}
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="shadow-cal-sm bg-card md:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Patient Summary</span>
              <Button variant="outline" size="sm" className="gap-2" onClick={handlePlayAudio}>
                <Volume2 className={cn("h-4 w-4", isPlaying && "animate-pulse text-primary")} />
                {isPlaying ? "Playing..." : "Listen in My Language"}
              </Button>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {(result.patientName || result.doctorName || result.diagnosis) && (
              <div className="grid gap-3 sm:grid-cols-3 text-sm">
                {result.patientName && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <User className="h-3.5 w-3.5" />
                    <span className="font-medium text-foreground">{result.patientName}</span>
                    {result.patientAge && <span>({result.patientAge})</span>}
                  </div>
                )}
                {result.doctorName && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Stethoscope className="h-3.5 w-3.5" />
                    Dr. {result.doctorName}
                  </div>
                )}
                {result.diagnosis && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <FileText className="h-3.5 w-3.5" />
                    {result.diagnosis}
                  </div>
                )}
              </div>
            )}

            <div className="text-sm leading-relaxed text-muted-foreground">
              {result.patientSummary}
            </div>

            {result.generalInstructions && result.generalInstructions.length > 0 && (
              <div className="rounded-lg bg-blue-50/50 border border-blue-100 p-3 dark:bg-blue-900/10 dark:border-blue-900/30">
                <div className="text-xs font-semibold text-blue-700 dark:text-blue-400 mb-1">General Instructions</div>
                <ul className="text-sm text-muted-foreground list-disc list-inside space-y-1">
                  {result.generalInstructions.map((inst, i) => (
                    <li key={i}>{inst}</li>
                  ))}
                </ul>
              </div>
            )}

            {result.followUpAdvice && (
              <div className="rounded-lg bg-orange-50/50 border border-orange-100 p-3 dark:bg-orange-900/10 dark:border-orange-900/30">
                <div className="text-xs font-semibold text-orange-700 dark:text-orange-400 mb-1">Follow-up Advice</div>
                <div className="text-sm text-muted-foreground">{result.followUpAdvice}</div>
              </div>
            )}

            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="gap-1">
                <CheckCircle2 className="h-3 w-3 text-green-500" />
                {result.modelUsed ?? "AI Analyzed"}
              </Badge>
              <Badge variant="outline" className="gap-1">
                <Calendar className="h-3 w-3 text-blue-500" />
                {new Date(result.createdAt).toLocaleDateString()}
              </Badge>
              {confidencePercent !== null && (
                <Badge
                  variant="outline"
                  className={cn("gap-1", confidencePercent >= 80 ? "text-green-600" : confidencePercent >= 60 ? "text-yellow-600" : "text-red-600")}
                >
                  <Shield className="h-3 w-3" />
                  Confidence: {confidencePercent}%
                </Badge>
              )}
              {result.status && (
                <Badge variant="secondary" className="capitalize">
                  {result.status}
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-cal-sm bg-card flex flex-col justify-center gap-3 p-6">
          <Button className="w-full justify-start gap-3" variant="outline" onClick={handleAddAll} disabled={allAdded}>
            <CalendarPlus className="h-4 w-4 text-blue-500" />
            {allAdded ? "All Added to Calendar" : "Add All to Google Calendar"}
          </Button>
          <Button className="w-full justify-start gap-3" variant="outline">
            <MessageCircle className="h-4 w-4 text-sky-500" />
            Send to Telegram Bot
          </Button>
          <Button className="w-full justify-start gap-3" variant="outline">
            <FileText className="h-4 w-4 text-red-500" />
            Download PDF Report
          </Button>
          <Button className="w-full justify-start gap-3" onClick={handleSave} disabled={isSaved}>
            <Save className="h-4 w-4" />
            {isSaved ? "Saved!" : "Save Analysis"}
          </Button>
        </Card>
      </div>

      {/* 2. Google Calendar Schedule */}
      {(medicineEvents.length > 0 || reExamEvents.length > 0) && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-semibold tracking-tight">Google Calendar Schedule</h3>
            <Button size="sm" variant="secondary" className="gap-2" onClick={handleAddAll} disabled={allAdded}>
              <CalendarPlus className="h-4 w-4" />
              {allAdded ? "All Synced" : "Sync All Events"}
            </Button>
          </div>

          {medicineEvents.length > 0 && (
            <Card className="shadow-cal-sm bg-card">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Pill className="h-4 w-4 text-primary" />
                  Medicine Reminders
                </CardTitle>
                <CardDescription>Auto-extracted medicine timings from your prescription</CardDescription>
              </CardHeader>
              <CardContent className="p-0">
                {medicineEvents.map((event, idx) => {
                  const isAdded = addedEvents.has(event.id);
                  return (
                    <div key={event.id}>
                      <div className="flex items-center justify-between gap-4 px-6 py-4">
                        <div className="flex items-center gap-4 min-w-0">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-blue-100 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400">
                            <Clock className="h-5 w-5" />
                          </div>
                          <div className="min-w-0">
                            <div className="font-medium truncate">{event.title}</div>
                            <div className="text-sm text-muted-foreground">{event.description}</div>
                            <div className="mt-1 flex flex-wrap gap-2">
                              <Badge variant="secondary" className="text-xs">{event.startTime} - {event.endTime}</Badge>
                              {event.recurrence !== "NONE" && (
                                <Badge variant="secondary" className="text-xs">{event.recurrence} x{event.recurrenceCount}</Badge>
                              )}
                            </div>
                          </div>
                        </div>
                        <Button size="sm" variant={isAdded ? "secondary" : "outline"} className="shrink-0 gap-2" disabled={isAdded} onClick={() => handleAddEvent(event)}>
                          {isAdded ? <><CalendarCheck className="h-4 w-4 text-green-500" />Added</> : <><CalendarPlus className="h-4 w-4" />Add</>}
                        </Button>
                      </div>
                      {idx < medicineEvents.length - 1 && <Separator />}
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}

          {reExamEvents.length > 0 && (
            <Card className="shadow-cal-sm bg-orange-50/50 dark:bg-orange-950/20 border-orange-200 dark:border-orange-900/40">
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Stethoscope className="h-4 w-4 text-orange-500" />
                  Re-examination Date
                </CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {reExamEvents.map((event) => {
                  const isAdded = addedEvents.has(event.id);
                  return (
                    <div key={event.id} className="flex items-center justify-between gap-4 px-6 py-4">
                      <div className="flex items-center gap-4 min-w-0">
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-orange-100 text-orange-600 dark:bg-orange-900/30 dark:text-orange-400">
                          <Stethoscope className="h-5 w-5" />
                        </div>
                        <div>
                          <div className="font-medium">{event.title}</div>
                          <Badge variant="secondary" className="mt-1 text-xs">{event.startDate} at {event.startTime}</Badge>
                        </div>
                      </div>
                      <Button size="sm" variant={isAdded ? "secondary" : "outline"} className="shrink-0 gap-2" disabled={isAdded} onClick={() => handleAddEvent(event)}>
                        {isAdded ? <><CalendarCheck className="h-4 w-4 text-green-500" />Added</> : <><CalendarPlus className="h-4 w-4" />Add</>}
                      </Button>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          )}
        </div>
      )}

      {/* 3. Medicines & Generics */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight">Prescribed Medicines</h3>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {result.medicines.map((med) => (
            <Card key={med.id} className="shadow-cal-sm border-border bg-card flex flex-col">
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <CardTitle className="text-lg">{med.name}</CardTitle>
                    <CardDescription>{med.dosage} &bull; {med.frequency} &bull; {med.duration}</CardDescription>
                  </div>
                  {med.confidence !== undefined && (
                    <Badge variant="outline" className={cn("text-xs shrink-0", med.confidence >= 0.8 ? "text-green-600" : med.confidence >= 0.6 ? "text-yellow-600" : "text-red-600")}>
                      {Math.round(med.confidence * 100)}%
                    </Badge>
                  )}
                </div>
              </CardHeader>
              <CardContent className="flex-1 space-y-3">
                {med.whatIsIt && (
                  <div className="text-sm text-muted-foreground bg-primary/5 p-3 rounded-lg">
                    <span className="font-medium text-foreground">What is it: </span>
                    {med.whatIsIt}
                  </div>
                )}

                {med.instructions && (
                  <div className="text-sm text-muted-foreground bg-muted/30 p-3 rounded-lg">
                    <span className="font-medium text-foreground">Instructions: </span>
                    {med.instructions}
                  </div>
                )}

                {med.whenToTake && (
                  <div className="text-sm text-muted-foreground">
                    <Clock className="inline h-3 w-3 mr-1" />
                    <span className="font-medium text-foreground">When: </span>
                    {med.whenToTake}
                  </div>
                )}

                {med.importantWarnings && med.importantWarnings.length > 0 && (
                  <div className="rounded-lg bg-amber-50/50 border border-amber-100 p-2 dark:bg-amber-900/10 dark:border-amber-900/30">
                    <div className="flex items-center gap-1 text-xs font-medium text-amber-700 dark:text-amber-400 mb-1">
                      <AlertTriangle className="h-3 w-3" /> Warnings
                    </div>
                    <ul className="text-xs text-muted-foreground list-disc list-inside">
                      {med.importantWarnings.map((w, i) => <li key={i}>{w}</li>)}
                    </ul>
                  </div>
                )}

                {med.genericAlternatives && med.genericAlternatives.length > 0 && (
                  <div className="space-y-2">
                    <Separator />
                    <div className="flex items-center gap-2 text-xs font-medium text-green-600">
                      <TrendingDown className="h-3 w-3" />
                      Generic Alternatives
                    </div>
                    {med.genericAlternatives.map((alt, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm rounded-md border border-green-100 bg-green-50/50 p-2 dark:border-green-900/30 dark:bg-green-900/10">
                        <div>
                          <div className="font-medium">{alt.name}</div>
                          <div className="text-xs text-muted-foreground">{alt.savings}</div>
                        </div>
                        <Button size="sm" variant="ghost" className="h-7 px-2 text-green-700 hover:text-green-800 hover:bg-green-100 dark:text-green-400">
                          Buy <ExternalLink className="ml-1 h-3 w-3" />
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* 4. Price Comparison */}
      <div className="space-y-4">
        <h3 className="text-xl font-semibold tracking-tight">Price Comparison</h3>
        <div className="grid gap-4 sm:grid-cols-3">
          {result.priceLinks.map((link) => (
            <Card key={link.vendor} className="shadow-cal-sm bg-card hover:border-primary/30 transition-colors">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{link.label}</div>
                    <div className="text-2xl font-bold mt-2">{link.price ?? "Check"}</div>
                    <div className="text-xs text-muted-foreground mt-1">{link.note}</div>
                  </div>
                  <Button size="icon" variant="secondary" asChild>
                    <a href={link.href} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4" />
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
