import { Request, Response } from "express";
import { validationResult } from "express-validator";
import {
  IResponse,
  SupportedLanguage,
  SUPPORTED_LANGUAGES,
  IUser,
} from "../types";
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
    let userId = req.headers["x-user-id"] as string;

    if (!userId && req.user) {
      // Fallback if there is an actual req.user set by some other middleware
      userId = req.user._id;
    }

    if (!userId) {
      res.status(401).json({
        success: false,
        message: "Unauthorized: Missing user authentication headers.",
      } as IResponse);
      return;
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
    const language = (req.body.language || "en") as SupportedLanguage;
    const pipeline = (req.body.pipeline || "gemini") as "gemini" | "ml_pipeline";
    const privacyConsent =
      req.body.privacyConsent === "true" || req.body.privacyConsent === true;

    if (!privacyConsent) {
      res.status(400).json({
        success: false,
        message: "Privacy consent is required to process prescription.",
      } as IResponse);
      return;
    }

    if (!SUPPORTED_LANGUAGES[language]) {
      res.status(400).json({
        success: false,
        message: `Unsupported language. Supported: ${Object.keys(SUPPORTED_LANGUAGES).join(", ")}`,
      } as IResponse);
      return;
    }

    const prescription = await prescriptionService.processPrescription(
      userId,
      req.file.path, // This is the Cloudinary URL
      req.file.originalname, // Original filename
      language,
      privacyConsent,
      pipeline,
    );

    const statusCode = prescription.status === "error" ? 422 : 201;

    res.status(statusCode).json({
      success: prescription.status !== "error",
      message:
        prescription.status === "error"
          ? `Processing failed: ${prescription.processingError}`
          : "Prescription processed successfully",
      data: { prescription },
    } as IResponse);
  } catch (error) {
    console.error("Error in uploadPrescription:", error);
    res.status(500).json({
      success: false,
      message:
        error instanceof Error
          ? error.message
          : "Internal server error while processing prescription",
    } as IResponse);
  }
};

export const getPrescriptionById = async (req: Request, res: Response) => {
  try {
    let userId = req.headers["x-user-id"] as string;
    if (!userId && req.user) userId = req.user._id;

    const prescriptionId = req.params.id as string;
    const prescription = await prescriptionService.getPrescriptionById(prescriptionId, userId);

    if (!prescription) {
      res.status(404).json({ success: false, message: "Prescription not found" } as IResponse);
      return;
    }

    res.status(200).json({
      success: true,
      message: "Prescription retrieved",
      data: { prescription },
    } as IResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch prescription",
    } as IResponse);
  }
};

export const getUserPrescriptions = async (req: Request, res: Response) => {
  try {
    // The user recently changed the URL to /userPrescriptions/:id on the frontend
    let userId = (req.params.id as string) || (req.headers["x-user-id"] as string);
    if (!userId && req.user) userId = req.user._id;

    if (!userId || userId === 'undefined' || userId === 'null') {
      res.status(401).json({ success: false, message: "Unauthorized: Invalid or missing userId" } as IResponse);
      return;
    }

    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(
      50,
      Math.max(1, parseInt(req.query.limit as string) || 10),
    );

    const { prescriptions, total } =
      await prescriptionService.getUserPrescriptions(
        userId,
        page,
        limit,
      );

    res.status(200).json({
      success: true,
      message: "Prescriptions retrieved",
      data: { prescriptions },
      meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
    } as IResponse);
  } catch (error) {
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch prescriptions",
      } as IResponse);
  }
};

export const verifyPrescription = async (req: Request, res: Response) => {
  try {
    let userId = req.headers["x-user-id"] as string;
    if (!userId && req.user) userId = req.user._id;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" } as IResponse);
      return;
    }

    const prescription = await prescriptionService.verifyPrescription(
      req.params._id as string,
      userId,
      req.body.notes,
    );

    if (!prescription) {
      res
        .status(404)
        .json({
          success: false,
          message: "Prescription not found",
        } as IResponse);
      return;
    }

    console.info(`Prescription ${req.params._id} verified by ${userId}`);

    res.status(200).json({
      success: true,
      message: "Prescription verified successfully",
      data: { prescription },
    } as IResponse);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    } as IResponse);
  }
};

export const rejectPrescription = async (req: Request, res: Response) => {
  try {
    let userId = req.headers["x-user-id"] as string;
    if (!userId && req.user) userId = req.user._id;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" } as IResponse);
      return;
    }

    const prescription = await prescriptionService.rejectPrescription(
      req.params._id as string,
      userId,
      req.body.reason,
    );

    if (!prescription) {
      res
        .status(404)
        .json({
          success: false,
          message: "Prescription not found",
        } as IResponse);
      return;
    }

    console.info(`Prescription ${req.params._id} rejected by ${userId}`);

    res.status(200).json({
      success: true,
      message: "Prescription rejected successfully",
      data: { prescription },
    } as IResponse);
  } catch (error) {
    res.status(400).json({
      success: false,
      message: (error as Error).message,
    } as IResponse);
  }
};

export const translatePrescription = async (req: Request, res: Response) => {
  try {
    let userId = req.headers["x-user-id"] as string;
    if (!userId && req.user) userId = req.user._id;

    if (!userId) {
      res.status(401).json({ success: false, message: "Unauthorized" } as IResponse);
      return;
    }

    const language = req.body.language as SupportedLanguage;

    if (!SUPPORTED_LANGUAGES[language]) {
      res.status(400).json({
        success: false,
        message: `Unsupported language. Supported: ${Object.keys(SUPPORTED_LANGUAGES).join(", ")}`,
      } as IResponse);
      return;
    }
    const prescription = await prescriptionService.translatePrescription(
      req.params._id as string,
      userId,
      language,
    );
    if (!prescription) {
      res
        .status(404)
        .json({
          success: false,
          message: "Prescription not found or not extracted yet",
        } as IResponse);
      return;
    }
    res.status(200).json({
      success: true,
      message: "Prescription translated successfully",
      data: { prescription },
    } as IResponse);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: (error as Error).message,
    } as IResponse);
  }
};
