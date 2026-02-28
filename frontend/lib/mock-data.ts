import type { PrescriptionResult, PriceLink, Reminder, Medicine, GenericAlternative, CalendarEvent } from "@/lib/types";

// Mock data store for client-side persistence simulation
declare global {
  // eslint-disable-next-line no-var
  var __remedixStore: Map<string, PrescriptionResult> | undefined;
}

const store: Map<string, PrescriptionResult> =
  globalThis.__remedixStore ?? new Map<string, PrescriptionResult>();
globalThis.__remedixStore = store;

// Helper to create mock price links
function mockPriceLinks(): PriceLink[] {
  return [
    {
      vendor: "amazon",
      label: "Amazon Pharmacy",
      href: "https://www.amazon.in/pharmacy",
      price: "₹89",
      note: "Best for Prime members",
    },
    {
      vendor: "tata1mg",
      label: "Tata 1mg",
      href: "https://www.1mg.com",
      price: "₹72",
      note: "Fastest delivery",
    },
    {
      vendor: "pharmeasy",
      label: "PharmEasy",
      href: "https://pharmeasy.in",
      price: "₹65",
      note: "Lowest price",
    },
  ];
}

// Helper to create mock reminders
function mockReminders(): Reminder[] {
  return [
    {
      id: "r1",
      title: "Morning Dose - Amoxicillin",
      time: "09:00 AM",
      schedule: "Daily for 5 days",
    },
    {
      id: "r2",
      title: "Evening Dose - Amoxicillin",
      time: "09:00 PM",
      schedule: "Daily for 5 days",
    },
    {
      id: "r3",
      title: "Before Breakfast - Pantoprazole",
      time: "08:30 AM",
      schedule: "Daily for 7 days",
    },
  ];
}

// Helper to create mock generic alternatives
function mockGenericAlternatives(medicineName: string): GenericAlternative[] {
  return [
    {
      name: `Generic ${medicineName}`,
      price: "₹45",
      savings: "40% cheaper",
      link: "#",
    },
    {
      name: `${medicineName} (Local Brand)`,
      price: "₹50",
      savings: "35% cheaper",
      link: "#",
    },
  ];
}

// Helper to create mock medicines
function mockMedicines(): Medicine[] {
  return [
    {
      id: "m1",
      name: "Amoxicillin",
      dosage: "500 mg",
      frequency: "Twice daily",
      duration: "5 days",
      instructions: "Take after meals to avoid stomach upset.",
      genericAlternatives: mockGenericAlternatives("Amoxicillin"),
    },
    {
      id: "m2",
      name: "Pantoprazole",
      dosage: "40 mg",
      frequency: "Once daily",
      duration: "7 days",
      instructions: "Take on an empty stomach, 30 mins before breakfast.",
      genericAlternatives: mockGenericAlternatives("Pantoprazole"),
    },
    {
      id: "m3",
      name: "Paracetamol",
      dosage: "650 mg",
      frequency: "As needed",
      duration: "3 days",
      instructions: "Take for fever or pain. Do not exceed 4 doses in 24 hours.",
      genericAlternatives: [],
    },
  ];
}

function mockCalendarEvents(): CalendarEvent[] {
  const today = new Date();
  const startDate = today.toISOString().split("T")[0];

  const reExamDate = new Date(today);
  reExamDate.setDate(reExamDate.getDate() + 10);
  const reExamDateStr = reExamDate.toISOString().split("T")[0];

  return [
    {
      id: "cal1",
      title: "Morning Dose - Amoxicillin 500mg",
      description: "Take Amoxicillin 500mg after breakfast. Complete full 5-day course.",
      startDate,
      startTime: "09:00",
      endTime: "09:15",
      recurrence: "DAILY",
      recurrenceCount: 5,
      type: "medicine",
    },
    {
      id: "cal2",
      title: "Evening Dose - Amoxicillin 500mg",
      description: "Take Amoxicillin 500mg after dinner.",
      startDate,
      startTime: "21:00",
      endTime: "21:15",
      recurrence: "DAILY",
      recurrenceCount: 5,
      type: "medicine",
    },
    {
      id: "cal3",
      title: "Before Breakfast - Pantoprazole 40mg",
      description: "Take Pantoprazole 40mg on empty stomach, 30 mins before breakfast.",
      startDate,
      startTime: "08:30",
      endTime: "08:45",
      recurrence: "DAILY",
      recurrenceCount: 7,
      type: "medicine",
    },
    {
      id: "cal4",
      title: "Follow-up / Re-examination",
      description: "Scheduled re-examination with doctor. Bring previous prescription and this analysis report.",
      startDate: reExamDateStr,
      startTime: "10:00",
      endTime: "10:30",
      recurrence: "NONE",
      type: "reexamination",
    },
  ];
}

export function createMockAnalysis(input: { fileName: string }): PrescriptionResult {
  const id = `rx_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
  const fileName = input.fileName || "prescription.jpg";

  const result: PrescriptionResult = {
    id,
    createdAt: new Date().toISOString(),
    sourceFileName: fileName,
    sourceKind: fileName.toLowerCase().endsWith(".pdf") ? "pdf" : "image",
    sourcePreviewUrl: "/prescription-placeholder.svg",
    status: "extracted",
    doctorNote: "Drink plenty of water. Avoid spicy food. Complete the full course of antibiotics.",
    language: "en",
    patientSummary:
      "The doctor has prescribed an antibiotic (Amoxicillin) for 5 days and an antacid (Pantoprazole) for 7 days. Paracetamol is included for fever or pain as needed. Please follow the timing instructions carefully.",
    medicines: mockMedicines(),
    priceLinks: mockPriceLinks(),
    reminders: mockReminders(),
    calendarEvents: mockCalendarEvents(),
    reExaminationDate: (() => {
      const d = new Date();
      d.setDate(d.getDate() + 10);
      return d.toISOString();
    })(),
    
    // New features mock data
    audioUrl: "/mock-audio.mp3", // Placeholder
    pdfUrl: "/mock-report.pdf", // Placeholder
    telegramStatus: "disconnected",
    calendarStatus: "unsynced",
    modelUsed: "gemini-2-flash",
  };

  store.set(id, result);
  return result;
}

export function getPrescription(id: string): PrescriptionResult | null {
  return store.get(id) ?? null;
}

export function listPrescriptions(): PrescriptionResult[] {
  return Array.from(store.values()).sort((a, b) =>
    a.createdAt < b.createdAt ? 1 : -1
  );
}

// Pre-seed mock data for dashboard
const SEED_ID = "rx_demo_001";
if (!store.has(SEED_ID)) {
  store.set(SEED_ID, createMockAnalysis({ fileName: "sample-prescription.jpg" }));
}
