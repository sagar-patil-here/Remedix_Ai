
import crypto from 'crypto';
import fs from 'fs';
import sharp from 'sharp';
import Prescription, { IPrescriptionDocument } from '../models/prescriptionModel';
import geminiService from './geminiService';
import { tesseractService } from './tesseractService';
import { SupportedLanguage } from '../types';

export class PrescriptionProcessingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PrescriptionProcessingError';
  }
}

export class PrescriptionService {

  async processPrescription(
    userId: string,
    filePath: string,
    originalName: string,
    language: SupportedLanguage,
    privacyConsent: boolean,
    pipeline: "gemini" | "ml_pipeline" = "gemini"
  ): Promise<IPrescriptionDocument> {
    const startTime = Date.now();
    try {
      let extraction;
      if (pipeline === 'ml_pipeline') {
        console.log(`[ML Pipeline] Extracting text via Tesseract OCR for ${originalName}`);
        const rawText = await tesseractService.extractTextFromImage(filePath);
        console.log(`[ML Pipeline] Structuring text via Gemini for ${originalName}`);
        extraction = await geminiService.structurePrescriptionText(rawText);
      } else {
        console.log(`[Gemini Pipeline] Extracting directly via Gemini for ${originalName}`);
        extraction = await geminiService.extractPrescription(filePath);
      }

      if (extraction.isUnreadable) {
        throw new PrescriptionProcessingError(
          "Unable to get text from the image. The image is not clear, please upload a new image."
        );
      }

      // Reject non-prescription images: if no medications were found, it's not a valid prescription
      if (!extraction.medications || extraction.medications.length === 0) {
        throw new PrescriptionProcessingError(
          "No medicine data found in this image. Please upload a valid medical prescription containing medication details."
        );
      }

      if (extraction.isLowConfidence || extraction.overallConfidence < 0.5) {
        throw new PrescriptionProcessingError(
          "Extraction confidence is too low. Please upload a clearer prescription image."
        );
      }

      // Step 2: Generate patient-friendly version
      console.log(`Generating patient-friendly output for ${originalName}`);
      const patientFriendly = await geminiService.generatePatientFriendly(extraction, language);

      const processingDurationMs = Date.now() - startTime;

      // Save only successful and quality-checked outputs
      const prescription = await Prescription.create({
        userId,
        originalImageUrl: filePath,
        imageHash: `cloud_${Date.now()}`,
        status: 'extracted',
        pipeline,
        requestedLanguage: language,
        privacyConsent,
        extraction,
        patientFriendly,
        processingDurationMs,
      });

      console.log(`Prescription ${prescription._id} processed in ${processingDurationMs}ms`);
      return prescription;

    } catch (error) {
      console.error(`Prescription processing failed for ${originalName}:`, error);
      if (error instanceof PrescriptionProcessingError) {
        throw error;
      }
      throw new PrescriptionProcessingError(
        `AI processing failed. Please try again. ${(error as Error).message}`
      );
    }
  }

  // Get paginated prescriptions for a user
  async getUserPrescriptions(
    userId: string,
    page = 1,
    limit = 10
  ): Promise<{ prescriptions: IPrescriptionDocument[]; total: number }> {
    const skip = (page - 1) * limit;

    const [prescriptions, total] = await Promise.all([
      Prescription.find({ userId })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .select('-extraction.medications.confidence') // hide internal confidence from list view
        .lean(),
      Prescription.countDocuments({ userId }),
    ]);

    return { prescriptions: prescriptions as IPrescriptionDocument[], total };
  }

  async getPrescriptionById(
    prescriptionId: string,
    userId?: string
  ): Promise<IPrescriptionDocument | null> {
    const query: Record<string, string> = { _id: prescriptionId };
    if (userId) {
      query.userId = userId;
    }

    return Prescription.findOne(query).populate('verifiedBy', 'name email role');
  }

  async updateEditedPrescription(
    prescriptionId: string,
    userId: string,
    editedData: any
  ): Promise<IPrescriptionDocument | null> {
    const prescription = await Prescription.findOne({ _id: prescriptionId, userId });
    if (!prescription) return null;


    const medicines = Array.isArray(editedData.medicines)
      ? editedData.medicines.map((med: any) => ({
        name: String(med.name || '').trim(),
        genericName: med.genericName ? String(med.genericName).trim() : undefined,
        dosage: String(med.dosage || 'Not specified').trim(),
        frequency: String(med.frequency || med.whenToTake || 'Not specified').trim(),
        duration: String(med.duration || 'Not specified').trim(),
        route: med.route ? String(med.route).trim() : undefined,
        instructions: med.instructions ? String(med.instructions).trim() : undefined,
        confidence: Math.min(1, Math.max(0, Number(med.confidence) || 0.9)),
      }))
      : [];

    prescription.extraction = {
      patientName: editedData.patientName ? String(editedData.patientName).trim() : undefined,
      patientAge: editedData.patientAge ? String(editedData.patientAge).trim() : undefined,
      doctorName: editedData.doctorName ? String(editedData.doctorName).trim() : undefined,
      doctorRegistration: prescription.extraction?.doctorRegistration,
      date: prescription.extraction?.date,
      diagnosis: editedData.diagnosis ? String(editedData.diagnosis).trim() : undefined,
      medications: medicines,
      additionalNotes: editedData.doctorNote ? String(editedData.doctorNote).trim() : undefined,
      overallConfidence: Math.min(
        1,
        Math.max(0, Number(editedData.overallConfidence) || prescription.extraction?.overallConfidence || 0.9)
      ),
      uncertainFields: Array.isArray(editedData.uncertainFields) ? editedData.uncertainFields : [],
    };

    prescription.patientFriendly = {
      summary: String(editedData.patientSummary || '').trim(),
      medications: medicines.map((med: any) => ({
        name: med.name,
        whatIsIt: String(med.whatIsIt || '').trim(),
        howToTake: String(med.howToTake || med.dosage || '').trim(),
        whenToTake: String(med.whenToTake || med.frequency || '').trim(),
        howLong: String(med.howLong || med.duration || '').trim(),
        importantWarnings: Array.isArray(med.importantWarnings) ? med.importantWarnings : [],
        commonSideEffects: Array.isArray(med.commonSideEffects) ? med.commonSideEffects : [],
      })),
      generalInstructions: Array.isArray(editedData.generalInstructions)
        ? editedData.generalInstructions.map((item: any) => String(item))
        : [],
      followUpAdvice: editedData.followUpAdvice ? String(editedData.followUpAdvice).trim() : undefined,
      translatedLanguage: String(editedData.language || prescription.requestedLanguage || 'en'),
    };

    prescription.requestedLanguage = String(editedData.language || prescription.requestedLanguage || 'en');

    await prescription.save();
    return prescription;
  }
  // Verify prescription (for doctors)
  async verifyPrescription(
    prescriptionId: string,
    verifierId: string,
    notes?: string
  ): Promise<IPrescriptionDocument | null> {
    const prescription = await Prescription.findById(prescriptionId);

    if (!prescription) return null;
    if (prescription.status !== 'extracted') {
      throw new Error('Only extracted prescriptions can be verified');
    }

    prescription.isVerified = true;
    prescription.verifiedBy = verifierId as unknown as IPrescriptionDocument['verifiedBy'];
    prescription.verifiedAt = new Date();
    prescription.verificationNotes = notes;
    prescription.status = 'verified';

    await prescription.save();
    return prescription;
  }

  // Reject a prescription with reason (doctor)
  async rejectPrescription(
    prescriptionId: string,
    verifierId: string,
    reason: string
  ): Promise<IPrescriptionDocument | null> {
    const prescription = await Prescription.findById(prescriptionId);
    if (!prescription) return null;

    prescription.status = 'rejected';
    prescription.verifiedBy = verifierId as unknown as IPrescriptionDocument['verifiedBy'];
    prescription.verifiedAt = new Date();
    prescription.verificationNotes = reason;
    await prescription.save();
    return prescription;
  }

  // Translate prescription to another language
  async translatePrescription(
    prescriptionId: string,
    userId: string,
    language: SupportedLanguage
  ): Promise<IPrescriptionDocument | null> {
    const prescription = await Prescription.findOne({ _id: prescriptionId, userId });
    if (!prescription || !prescription.extraction) return null;

    const patientFriendly = await geminiService.generatePatientFriendly(
      prescription.extraction,
      language
    );

    prescription.patientFriendly = patientFriendly;
    prescription.requestedLanguage = language;
    await prescription.save();
    return prescription;
  }

  /**
   * Delete a prescription (GDPR compliance)
   */
  async deletePrescription(prescriptionId: string, userId: string): Promise<boolean> {
    const result = await Prescription.deleteOne({ _id: prescriptionId, userId });
    return result.deletedCount > 0;
  }


  //Get prescription statistics for admin/analytics

  async getStats(): Promise<Record<string, number>> {
    const stats = await Prescription.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          avgConfidence: { $avg: '$extraction.overallConfidence' },
        },
      },
    ]);

    return stats.reduce((acc, curr) => {
      acc[curr._id] = curr.count;
      return acc;
    }, {} as Record<string, number>);
  }
}


export default new PrescriptionService();
