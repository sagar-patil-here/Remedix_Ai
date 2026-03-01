import mongoose, { Schema, Document } from 'mongoose';
import { IPrescriptionExtraction, IPatientFriendlyPrescription } from '../types/index';

export interface IPrescriptionDocument extends Document {
  userId: string;
  originalImageUrl: string;
  imageHash: string;
  status: 'processing' | 'extracted' | 'verified' | 'rejected' | 'error';
  extraction?: IPrescriptionExtraction;
  patientFriendly?: IPatientFriendlyPrescription;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  verificationNotes?: string;
  isVerified: boolean;
  processingError?: string;
  requestedLanguage: string;
  privacyConsent: boolean;
  processingDurationMs?: number;
  pipeline?: 'gemini' | 'ml_pipeline';
  createdAt: Date;
  updatedAt: Date;
}

const MedicationSchema = new Schema(
  {
    name: { type: String, required: true },
    genericName: String,
    dosage: { type: String, required: true },
    frequency: { type: String, required: true },
    duration: { type: String, required: true },
    route: String,
    instructions: String,
    confidence: { type: Number, min: 0, max: 1, default: 0 },
  },
  { _id: false }
);

const PatientFriendlyMedicationSchema = new Schema(
  {
    name: String,
    whatIsIt: String,
    howToTake: String,
    whenToTake: String,
    howLong: String,
    importantWarnings: [String],
    commonSideEffects: [String],
  },
  { _id: false }
);

const ExtractionSchema = new Schema(
  {
    patientName: String,
    patientAge: String,
    doctorName: String,
    doctorRegistration: String,
    date: String,
    diagnosis: String,
    medications: [MedicationSchema],
    additionalNotes: String,
    overallConfidence: { type: Number, min: 0, max: 1, default: 0 },
    uncertainFields: [String],
  },
  { _id: false }
);

const PatientFriendlySchema = new Schema(
  {
    summary: String,
    medications: [PatientFriendlyMedicationSchema],
    generalInstructions: [String],
    followUpAdvice: String,
    translatedLanguage: String,
  },
  { _id: false }
);

const PrescriptionSchema = new Schema<IPrescriptionDocument>(
  {
    userId: {
      type: String,
      required: true,
      index: true,
    },
    originalImageUrl: {
      type: String,
      required: true,
    },
    imageHash: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ['processing', 'extracted', 'verified', 'rejected', 'error'],
      default: 'processing',
      index: true,
    },
    pipeline: {
      type: String,
      enum: ['gemini', 'ml_pipeline'],
      default: 'gemini',
    },
    extraction: ExtractionSchema,
    patientFriendly: PatientFriendlySchema,
    verifiedBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    verifiedAt: Date,
    verificationNotes: String,
    isVerified: {
      type: Boolean,
      default: false,
    },
    processingError: String,
    requestedLanguage: {
      type: String,
      default: 'en',
    },
    privacyConsent: {
      type: Boolean,
      required: true,
    },
    processingDurationMs: Number,
  },
  {
    timestamps: true,
  }
);

// Compound indexes
PrescriptionSchema.index({ userId: 1, createdAt: -1 });
PrescriptionSchema.index({ status: 1, createdAt: -1 });
PrescriptionSchema.index({ imageHash: 1 });

export default mongoose.model<IPrescriptionDocument>('Prescription', PrescriptionSchema);