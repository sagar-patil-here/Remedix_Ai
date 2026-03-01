export type UploadKind = "image" | "pdf";

export type PrescriptionLanguage =
  | "en" | "hi" | "bn" | "te" | "mr" | "ta"
  | "gu" | "ur" | "kn" | "ml" | "pa" | "or";

export type PriceVendor = "amazon" | "tata1mg" | "pharmeasy";

export type PrescriptionStatus = "processing" | "extracted" | "verified" | "rejected" | "error";

export interface BackendMedication {
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  duration: string;
  route?: string;
  instructions?: string;
  confidence: number;
}

// ─── Backend extraction result ───
export interface BackendExtraction {
  patientName?: string;
  patientAge?: string;
  doctorName?: string;
  doctorRegistration?: string;
  date?: string;
  diagnosis?: string;
  medications: BackendMedication[];
  additionalNotes?: string;
  overallConfidence: number;
  uncertainFields: string[];
  isLowConfidence?: boolean;
  isUnreadable?: boolean;
}

// ─── Backend patient-friendly medication ───
export interface BackendPatientFriendlyMedication {
  name: string;
  whatIsIt: string;
  howToTake: string;
  whenToTake: string;
  howLong: string;
  importantWarnings: string[];
  commonSideEffects: string[];
}


export interface BackendPatientFriendly {
  summary: string;
  medications: BackendPatientFriendlyMedication[];
  generalInstructions: string[];
  followUpAdvice?: string;
  translatedLanguage: string;
}


export interface BackendPrescription {
  _id: string;
  userId: string;
  originalImageUrl: string;
  imageHash: string;
  status: PrescriptionStatus;
  extraction?: BackendExtraction;
  patientFriendly?: BackendPatientFriendly;
  verifiedBy?: string;
  verifiedAt?: string;
  verificationNotes?: string;
  isVerified: boolean;
  processingError?: string;
  requestedLanguage: string;
  privacyConsent: boolean;
  processingDurationMs?: number;
  createdAt: string;
  updatedAt: string;
}

export interface BackendResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
    totalPages?: number;
  };
}



export interface GenericAlternative {
  name: string;
  price: string;
  savings: string;
  link: string;
}

export interface Medicine {
  id: string;
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions?: string;
  route?: string;
  confidence?: number;
  whatIsIt?: string;
  howToTake?: string;
  whenToTake?: string;
  howLong?: string;
  importantWarnings?: string[];
  commonSideEffects?: string[];
  genericAlternatives?: GenericAlternative[];
}

export interface PriceLink {
  vendor: PriceVendor;
  label: string;
  href: string;
  price?: string;
  note?: string;
}

export interface Reminder {
  id: string;
  title: string;
  time: string;
  schedule: string;
}

export interface CalendarEvent {
  id: string;
  title: string;
  description: string;
  startDate: string;
  startTime: string;
  endTime: string;
  recurrence?: "DAILY" | "WEEKLY" | "NONE";
  recurrenceCount?: number;
  type: "medicine" | "reexamination";
}

export interface PrescriptionResult {
  id: string;
  backendId?: string;
  createdAt: string;
  sourceFileName: string;
  sourceKind: UploadKind;
  sourcePreviewUrl: string;
  status: PrescriptionStatus;
  doctorNote?: string;
  language: PrescriptionLanguage;
  patientSummary: string;
  generalInstructions?: string[];
  followUpAdvice?: string;
  medicines: Medicine[];
  priceLinks: PriceLink[];
  reminders: Reminder[];
  calendarEvents: CalendarEvent[];
  reExaminationDate?: string;

  // Extraction metadata
  patientName?: string;
  patientAge?: string;
  doctorName?: string;
  diagnosis?: string;
  overallConfidence?: number;
  uncertainFields?: string[];
  isLowConfidence?: boolean;
  isUnreadable?: boolean;

  // Feature flags
  audioUrl?: string;
  pdfUrl?: string;
  telegramStatus?: "connected" | "disconnected";
  calendarStatus?: "synced" | "unsynced";
  modelUsed?: "gemini-2-flash" | "local-llama";
}
