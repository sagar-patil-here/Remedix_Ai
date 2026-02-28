
export interface IUser {
  _id: string;
  email: string;
  name: string;
  role: 'patient' | 'doctor' | 'pharmacist';
  createdAt: Date;
  updatedAt: Date;
}

export interface IMedication {
  name: string;
  genericName?: string;
  dosage: string;
  frequency: string;
  duration: string;
  route?: string; // oral, topical, injection, etc.
  instructions?: string; // take with food, avoid alcohol, etc.
  confidence: number; // 0-1 confidence score for this field
}

export interface IPrescriptionExtraction {
  patientName?: string;
  patientAge?: string;
  doctorName?: string;
  doctorRegistration?: string;
  date?: string;
  diagnosis?: string;
  medications: IMedication[];
  additionalNotes?: string;
  overallConfidence: number; // 0-1 overall extraction confidence
  uncertainFields: string[]; // fields with low confidence
  isLowConfidence?: boolean; // Flag for messy handwriting
  isUnreadable?: boolean; // Flag for completely illegible handwriting
}

export interface IPatientFriendlyMedication {
  name: string;
  whatIsIt: string; // plain language explanation
  howToTake: string; // plain dosage instructions
  whenToTake: string; // timing in simple words
  howLong: string; // duration explanation
  importantWarnings: string[]; // side effects, interactions
  commonSideEffects: string[];
}

export interface IPatientFriendlyPrescription {
  summary: string;
  medications: IPatientFriendlyMedication[];
  generalInstructions: string[];
  followUpAdvice?: string;
  translatedLanguage: string;
}

export interface IPrescription {
  _id: string;
  userId: string;
  originalImageUrl: string;
  imageHash: string; // for deduplication
  status: 'processing' | 'extracted' | 'verified' | 'rejected' | 'error';
  extraction?: IPrescriptionExtraction;
  patientFriendly?: IPatientFriendlyPrescription;
  verifiedBy?: string; // userId of verifying professional
  verifiedAt?: Date;
  verificationNotes?: string;
  isVerified: boolean;
  processingError?: string;
  requestedLanguage: string;
  privacyConsent: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
  error?: string;
  meta?: {
    page?: number;
    limit?: number;
    total?: number;
  };
}

export interface IUploadedFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  size: number;
  path: string;
  filename: string;
}

export type SupportedLanguage =
  | 'en' | 'hi' | 'bn' | 'te' | 'mr' | 'ta'
  | 'gu' | 'ur' | 'kn' | 'ml' | 'pa' | 'or';

export const SUPPORTED_LANGUAGES: Record<SupportedLanguage, string> = {
  en: 'English',
  hi: 'Hindi',
  bn: 'Bengali',
  te: 'Telugu',
  mr: 'Marathi',
  ta: 'Tamil',
  gu: 'Gujarati',
  ur: 'Urdu',
  kn: 'Kannada',
  ml: 'Malayalam',
  pa: 'Punjabi',
  or: 'Odia',
};