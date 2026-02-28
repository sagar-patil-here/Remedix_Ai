
import crypto from 'crypto';
import fs from 'fs';
import sharp from 'sharp';
import Prescription, { IPrescriptionDocument } from '../models/prescriptionModel';
import geminiService from './geminiService';
import { SupportedLanguage } from '../types';


export class PrescriptionService {

  async processPrescription(
    userId: string,
    filePath: string,
    originalName: string,
    language: SupportedLanguage,
    privacyConsent: boolean
  ): Promise<IPrescriptionDocument> {
    const startTime = Date.now();

    // Create prescription record
    const prescription = await Prescription.create({
      userId,
      originalImageUrl: filePath, // This is the Cloudinary URL
      imageHash: `cloud_${Date.now()}`, // Temporary hash for Cloudinary
      status: 'processing',
      requestedLanguage: language,
      privacyConsent,
    });

    try {
      // Step 1: Extract from image using Claude Vision
      console.log(`Extracting prescription ${prescription._id}`);
      const extraction = await geminiService.extractPrescription(filePath);

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

  /**
   * Get prescriptions for a user with pagination
   */
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
    userId: string
  ): Promise<IPrescriptionDocument | null> {
    return Prescription.findOne({
      _id: prescriptionId,
      userId,
    }).populate('verifiedBy', 'name email role');
  }

  /**
   * Verify a prescription (doctor/pharmacist only)
   */
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

  /**
   * Reject a prescription with reason
   */
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

  /**
   * Re-process a prescription in a different language
   */
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

  /**
   * Get prescription statistics for admin/analytics
   */
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

  // ─── Private Helpers ────────────────────────────────────────────────────

  private async computeFileHash(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash('sha256');
      const stream = fs.createReadStream(filePath);
      stream.on('data', (data) => hash.update(data));
      stream.on('end', () => resolve(hash.digest('hex')));
      stream.on('error', reject);
    });
  }

  private async optimizeImage(filePath: string): Promise<string> {
    const optimizedPath = filePath.replace(/(\.[^.]+)$/, '_optimized$1');

    try {
      await sharp(filePath)
        .resize(2048, 2048, { fit: 'inside', withoutEnlargement: true })
        .sharpen() // enhance text clarity
        .normalize() // improve contrast
        .toFile(optimizedPath);

      return optimizedPath;
    } catch (error) {
      console.error('Image optimization failed, using original:', error);
      return filePath;
    }
  }
}

export default new PrescriptionService();