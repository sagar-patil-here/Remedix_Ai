
import crypto from 'crypto';
import fs from 'fs';
import sharp from 'sharp';
import Prescription, { IPrescriptionDocument } from '../models/prescriptionModel';
import geminiService from './geminiService';
import { tesseractService } from './tesseractService';
import { SupportedLanguage } from '../types';


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

    // Create prescription record
    const prescription = await Prescription.create({
      userId,
      originalImageUrl: filePath, // This is the Cloudinary URL
      imageHash: `cloud_${Date.now()}`, // Temporary hash for Cloudinary
      status: 'processing',
      pipeline,
      requestedLanguage: language,
      privacyConsent,
    });

    try {
      let extraction;
      if (pipeline === 'ml_pipeline') {
        console.log(`[ML Pipeline] Extracting text via Tesseract OCR for ${prescription._id}`);
        const rawText = await tesseractService.extractTextFromImage(filePath);
        console.log(`[ML Pipeline] Structuring text via Gemini for ${prescription._id}`);
        extraction = await geminiService.structurePrescriptionText(rawText);
      } else {
        console.log(`[Gemini Pipeline] Extracting directly via Gemini for ${prescription._id}`);
        extraction = await geminiService.extractPrescription(filePath);
      }

      if (extraction.isUnreadable) {
        throw new Error("Unable to get text from the image. The image is not clear, please upload a new image.");
      }

      // Step 2: Generate patient-friendly version
      console.log(`Generating patient-friendly output for ${prescription._id}`);
      const patientFriendly = await geminiService.generatePatientFriendly(extraction, language);

      const processingDurationMs = Date.now() - startTime;

      // Update prescription with results
      prescription.extraction = extraction;
      prescription.patientFriendly = patientFriendly;
      prescription.status = 'extracted';
      prescription.processingDurationMs = processingDurationMs;
      await prescription.save();

      console.log(`Prescription ${prescription._id} processed in ${processingDurationMs}ms`);

    } catch (error) {
      prescription.status = 'error';
      prescription.processingError = (error as Error).message;
      await prescription.save();
      console.error(`Prescription ${prescription._id} processing failed:`, error);
    }

    return prescription;
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
