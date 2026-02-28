import type {
  BackendPrescription,
  PrescriptionResult,
  Medicine,
  CalendarEvent,
  Reminder,
  PriceLink,
  PrescriptionLanguage,
} from "@/lib/types";

/**
 * Transforms the raw backend IPrescription into the frontend PrescriptionResult.
 * This is the single point where backend shape → frontend shape mapping happens.
 * When the backend changes, only this file needs updating.
 */
export function transformBackendPrescription(bp: BackendPrescription): PrescriptionResult {
  const extraction = bp.extraction;
  const friendly = bp.patientFriendly;

  const medicines: Medicine[] = (extraction?.medications ?? []).map((med, idx) => {
    const friendlyMed = friendly?.medications?.[idx];
    return {
      id: `m${idx}`,
      name: med.name,
      genericName: med.genericName,
      dosage: med.dosage,
      frequency: med.frequency,
      duration: med.duration,
      instructions: med.instructions,
      route: med.route,
      confidence: med.confidence,
      whatIsIt: friendlyMed?.whatIsIt,
      howToTake: friendlyMed?.howToTake,
      whenToTake: friendlyMed?.whenToTake,
      howLong: friendlyMed?.howLong,
      importantWarnings: friendlyMed?.importantWarnings,
      commonSideEffects: friendlyMed?.commonSideEffects,
      genericAlternatives: med.genericName
        ? [{ name: med.genericName, price: "Check online", savings: "Generic available", link: "#" }]
        : [],
    };
  });

  const calendarEvents: CalendarEvent[] = buildCalendarEvents(medicines, extraction?.date);
  const reminders: Reminder[] = buildReminders(medicines);
  const priceLinks: PriceLink[] = buildPriceLinks();

  return {
    id: bp._id,
    backendId: bp._id,
    createdAt: bp.createdAt,
    sourceFileName: bp.originalImageUrl?.split("/").pop() ?? "prescription",
    sourceKind: bp.originalImageUrl?.toLowerCase().endsWith(".pdf") ? "pdf" : "image",
    sourcePreviewUrl: bp.originalImageUrl || "/prescription-placeholder.svg",
    status: bp.status,
    doctorNote: extraction?.additionalNotes,
    language: (bp.requestedLanguage || "en") as PrescriptionLanguage,
    patientSummary: friendly?.summary ?? "Processing your prescription...",
    generalInstructions: friendly?.generalInstructions,
    followUpAdvice: friendly?.followUpAdvice,
    medicines,
    priceLinks,
    reminders,
    calendarEvents,
    reExaminationDate: friendly?.followUpAdvice ? guessFollowUpDate() : undefined,

    patientName: extraction?.patientName,
    patientAge: extraction?.patientAge,
    doctorName: extraction?.doctorName,
    diagnosis: extraction?.diagnosis,
    overallConfidence: extraction?.overallConfidence,
    uncertainFields: extraction?.uncertainFields,

    audioUrl: undefined,
    pdfUrl: undefined,
    telegramStatus: "disconnected",
    calendarStatus: "unsynced",
    modelUsed: "gemini-2-flash",
  };
}

function buildCalendarEvents(medicines: Medicine[], prescriptionDate?: string): CalendarEvent[] {
  const startDate = prescriptionDate ?? new Date().toISOString().split("T")[0];
  const events: CalendarEvent[] = [];

  medicines.forEach((med, idx) => {
    const durationDays = parseDurationDays(med.duration);
    const times = parseFrequencyTimes(med.frequency);

    times.forEach((time, tIdx) => {
      events.push({
        id: `cal_${idx}_${tIdx}`,
        title: `${med.name} ${med.dosage}`,
        description: med.instructions || `Take ${med.name} ${med.dosage}`,
        startDate,
        startTime: time,
        endTime: addMinutes(time, 15),
        recurrence: durationDays > 1 ? "DAILY" : "NONE",
        recurrenceCount: durationDays,
        type: "medicine",
      });
    });
  });

  return events;
}

function buildReminders(medicines: Medicine[]): Reminder[] {
  const reminders: Reminder[] = [];
  medicines.forEach((med, idx) => {
    const times = parseFrequencyTimes(med.frequency);
    times.forEach((time, tIdx) => {
      reminders.push({
        id: `r_${idx}_${tIdx}`,
        title: `${med.name} ${med.dosage}`,
        time,
        schedule: `${med.frequency} for ${med.duration}`,
      });
    });
  });
  return reminders;
}

function buildPriceLinks(): PriceLink[] {
  return [
    { vendor: "amazon", label: "Amazon Pharmacy", href: "https://www.amazon.in/pharmacy", note: "Check prices" },
    { vendor: "tata1mg", label: "Tata 1mg", href: "https://www.1mg.com", note: "Check prices" },
    { vendor: "pharmeasy", label: "PharmEasy", href: "https://pharmeasy.in", note: "Check prices" },
  ];
}

function parseDurationDays(duration: string): number {
  const lower = duration.toLowerCase();
  const num = parseInt(lower.match(/\d+/)?.[0] ?? "5");
  if (lower.includes("week")) return num * 7;
  if (lower.includes("month")) return num * 30;
  return num;
}

function parseFrequencyTimes(frequency: string): string[] {
  const lower = frequency.toLowerCase();
  if (lower.includes("three") || lower.includes("tid") || lower.includes("tds") || lower.includes("3"))
    return ["08:00", "14:00", "21:00"];
  if (lower.includes("twice") || lower.includes("bd") || lower.includes("bid") || lower.includes("2"))
    return ["09:00", "21:00"];
  if (lower.includes("once") || lower.includes("od") || lower.includes("1"))
    return ["09:00"];
  if (lower.includes("needed") || lower.includes("prn") || lower.includes("sos"))
    return [];
  return ["09:00"];
}

function addMinutes(time: string, mins: number): string {
  const [h, m] = time.split(":").map(Number);
  const total = h * 60 + m + mins;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, "0")}:${String(newM).padStart(2, "0")}`;
}

function guessFollowUpDate(): string {
  const d = new Date();
  d.setDate(d.getDate() + 10);
  return d.toISOString();
}
