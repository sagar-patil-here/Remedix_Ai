import { Request, Response } from "express";
import { validationResult } from "express-validator";
import { IResponse, SupportedLanguage, SUPPORTED_LANGUAGES, IUser } from "../types";
import prescriptionService from "../services/prescriptionService";

declare global {
  namespace Express {
    interface Request {
      user?: IUser;
    }
  }
}

export const uploadPrescription = async (req: Request, res: Response) => {
  try {
    // Mock user for testing if not present
    if (!req.user) {
      console.warn("No user found in request, using mock user for testing.");
      req.user = {
        _id: "67c1b5a5b5a5b5a5b5a5b5a5", // Mock MongoDB ID
        name: "Test User",
        email: "test@example.com",
        role: "patient",
      } as any;
    }

    if (!req.file) {
      res.status(400).json({
        success: false,
        message: "No prescription image uploaded. Please attach an image file.",
      } as IResponse);
      return;
    }
    const errors = validationResult(req);

    if (!errors.isEmpty()) {
      res.status(400).json({
        success: false,
        message: errors
          .array()
          .map((e) => e.msg)
          .join(", "),
      } as IResponse);
      return;
    }
    const language = (req.body.language || 'en') as SupportedLanguage;
    const privacyConsent = req.body.privacyConsent === 'true' || req.body.privacyConsent === true;

    if (!privacyConsent) {
      res.status(400).json({
        success: false,
        message: 'Privacy consent is required to process prescription.',
      } as IResponse);
      return;
    }

    if (!SUPPORTED_LANGUAGES[language]) {
      res.status(400).json({
        success: false,
        message: `Unsupported language. Supported: ${Object.keys(SUPPORTED_LANGUAGES).join(', ')}`,
      } as IResponse);
      return;
    }

    const prescription = await prescriptionService.processPrescription(
      req.user!._id,
      req.file.path, // This is the Cloudinary URL
      req.file.originalname, // Original filename
      language,
      privacyConsent
    );

    const statusCode = prescription.status === 'error' ? 422 : 201;

    res.status(statusCode).json({
      success: prescription.status !== 'error',
      message: prescription.status === 'error'
        ? `Processing failed: ${prescription.processingError}`
        : 'Prescription processed successfully',
      data: { prescription },
    } as IResponse);
  } catch (error) {
    console.error("Error in uploadPrescription:", error);
    res.status(500).json({
      success: false,
      message: error instanceof Error ? error.message : "Internal server error while processing prescription",
    } as IResponse);
  }
};
