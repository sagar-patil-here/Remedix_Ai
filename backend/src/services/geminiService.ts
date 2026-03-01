// src/services/geminiService.ts
import { GoogleGenerativeAI, Part } from '@google/generative-ai';
import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import { IPrescriptionExtraction, IPatientFriendlyPrescription, SupportedLanguage } from '../types';

dotenv.config();

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || '');

// prompt templates
const EXTRACTION_SYSTEM_PROMPT = `You are a medical prescription interpreter AI. Your task is to accurately read and extract information from handwritten medical prescriptions. 

IMPORTANT RULES:
1. Extract ONLY what is written. Do NOT add, infer, or modify any medical information.
2. Assign a confidence score (0.0 to 1.0) for each field based on legibility.
3. If a field is illegible or unclear, mark it with low confidence and flag it as "uncertain".
4. Never guess medication names — if uncertain, provide your best reading with low confidence.
5. Return ONLY valid JSON, no markdown, no explanation outside JSON.
6. CRITICAL: If the image is NOT a medical prescription (e.g. a random photo, text document, receipt, ID card, screenshot, etc.), return an empty medications array, set overallConfidence to 0, and set isUnreadable to true. Only extract medications if the image genuinely contains a doctor's prescription with medicine names, dosages, and instructions.
7. Only include entries in the medications array if they are actual medicines/drugs. Do NOT include diagnosis, patient info, or general notes as medication entries.

Confidence scoring guide:
- 0.9-1.0: Clearly legible, high certainty
- 0.7-0.89: Mostly legible, minor uncertainty
- 0.5-0.69: Partially legible, significant uncertainty  
- 0.0-0.49: Mostly illegible, very uncertain`;

const EXTRACTION_USER_PROMPT = `Analyze this medical prescription image and extract all information into the following JSON structure. Be precise and honest about confidence levels.

Return EXACTLY this JSON structure (no markdown, no code blocks):
{
  "patientName": "string or null",
  "patientAge": "string or null",
  "doctorName": "string or null", 
  "doctorRegistration": "string or null",
  "date": "string or null",
  "diagnosis": "string or null",
  "medications": [
    {
      "name": "exact medication name as written",
      "genericName": "generic name if identifiable or null",
      "dosage": "dosage as written e.g. 500mg",
      "frequency": "frequency as written e.g. twice daily, BD, TID",
      "duration": "duration as written e.g. 5 days, 1 week",
      "route": "route if specified e.g. oral, topical or null",
      "instructions": "special instructions e.g. take after food or null",
      "confidence": 0.0
    }
  ],
  "additionalNotes": "any other notes or null",
  "overallConfidence": 0.0,
  "uncertainFields": ["list of field names with confidence below 0.7"]
}`;

const PATIENT_FRIENDLY_SYSTEM_PROMPT = `You are a patient education specialist. Convert medical prescription data into simple, clear, and compassionate language that any patient can understand — regardless of medical knowledge.

RULES:
1. Use simple everyday words. Avoid medical jargon.
2. Be warm, reassuring, and clear.
3. Include practical timing tips (e.g., "after breakfast", not "post-prandial").
4. List only general, well-known side effects — do NOT diagnose or add unreferenced warnings.
5. Return ONLY valid JSON.`;

export class GeminiService {
    private model = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-lite',
        systemInstruction: EXTRACTION_SYSTEM_PROMPT
    });

    private patientModel = genAI.getGenerativeModel({
        model: 'gemini-2.5-flash-lite',
        systemInstruction: PATIENT_FRIENDLY_SYSTEM_PROMPT
    });

    async extractPrescription(imagePath: string): Promise<IPrescriptionExtraction> {
        const startTime = Date.now();

        try {
            console.info(`Starting prescription extraction for: ${path.basename(imagePath)}`);

            let imageBuffer: Buffer;
            if (imagePath.startsWith('http')) {
                const response = await axios.get(imagePath, { responseType: 'arraybuffer' });
                imageBuffer = Buffer.from(response.data);
            } else {
                imageBuffer = fs.readFileSync(imagePath);
            }

            const mimeType = this.getMimeType(imagePath);
            const imagePart: Part = {
                inlineData: {
                    data: imageBuffer.toString('base64'),
                    mimeType,
                },
            };

            const result = await this.model.generateContent([
                EXTRACTION_USER_PROMPT,
                imagePart,
            ]);

            const responseText = result.response.text();
            const extraction = this.parseExtractionResponse(responseText);

            const duration = Date.now() - startTime;
            console.info(`Extraction completed in ${duration}ms. Confidence: ${extraction.overallConfidence}`);

            return extraction;

        } catch (error) {
            console.error('Gemini extraction failed:', error);
            throw new Error(`AI extraction failed: ${(error as Error).message}`);
        }
    }

    async structurePrescriptionText(rawText: string): Promise<IPrescriptionExtraction> {
        try {
            console.info("Structuring raw prescription text via Gemini...");

            const userPrompt = `You are a medical data extraction assistant.
I have used an OCR tool to extract the raw text from a medical prescription image.
Your job is to structure this raw text into the requested JSON format.

RAW PRESCRIPTION TEXT:
"""
${rawText}
"""

Also, thoroughly evaluate the raw text to determine its quality.
Calculate an "overallConfidence" score between 0.0 and 1.0.
If the text contains clear medical terms, medicine names, and dosages, score it high (e.g., 0.8 to 1.0).
If the text looks like random garbage, strings of letters, or is severely missing key medical terms, assign a very LOW confidence score (e.g., < 0.25).
This score is critical as it will trigger error alerts if the text is unreadable.

Provide exactly the following JSON structure (do not include markdown syntax):
{
    "patientName": "Extracted Patient Name (if any)",
    "patientAge": "Extracted Age (if any)",
    "doctorName": "Extracted Doctor Name (if any)",
    "doctorRegistration": "Extracted Doctor Registration details (if any)",
    "date": "Extracted Date (if any)",
    "diagnosis": "Extracted Diagnosis or Chief Complaint (if any)",
    "medications": [
        {
            "name": "Medicine Name",
            "dosage": "Dosage (e.g., 500mg, 1 tablet)",
            "frequency": "Frequency (e.g., OD, BID, TID, twice a day)",
            "duration": "Duration (e.g., 5 days, 1 week)",
            "instructions": "Specific instructions (e.g., after food)",
            "confidence": 0.0 to 1.0 depending on confidence for this specific medicine
        }
    ],
    "additionalNotes": "Any other relevant notes or instructions",
    "overallConfidence": 0.0 to 1.0 representing confidence in the entire extraction,
    "uncertainFields": ["List of fields you are uncertain about"]
}`;

            const result = await this.model.generateContent([userPrompt]);
            const responseText = result.response.text();

            if (!responseText) {
                throw new Error("Empty response from Gemini API");
            }

            return this.parseExtractionResponse(responseText);

        } catch (error) {
            console.error('Gemini structuring failed:', error);
            throw new Error(`AI structuring failed: ${(error as Error).message}`);
        }
    }

    async generatePatientFriendly(
        extraction: IPrescriptionExtraction,
        language: SupportedLanguage = 'en'
    ): Promise<IPatientFriendlyPrescription> {
        try {
            console.info(`Generating patient-friendly output in: ${language}`);

            const languageInstruction = language !== 'en'
                ? `Respond in ${language} language. Make sure all text including medication names explanation is in ${language}.`
                : 'Respond in English.';

            const userPrompt = `Convert this prescription data into patient-friendly format.

Prescription Data:
${JSON.stringify(extraction, null, 2)}

${languageInstruction}

Return EXACTLY this JSON structure (no markdown):
{
  "summary": "1-2 sentence overview of what the prescription is for, in simple words",
  "medications": [
    {
      "name": "medication name",
      "whatIsIt": "simple 1-sentence explanation of what this medicine does",
      "howToTake": "exact dose in simple words e.g. Take 1 tablet",
      "whenToTake": "simple timing e.g. After breakfast and dinner, every 12 hours",
      "howLong": "simple duration e.g. For 5 days, until finished",
      "importantWarnings": ["important thing to know", "drug interaction if any"],
      "commonSideEffects": ["possible side effect 1", "possible side effect 2"]
    }
  ],
  "generalInstructions": ["general tip 1", "general tip 2"],
  "followUpAdvice": "when to see doctor again or null",
  "translatedLanguage": "${language}"
}`;

            const result = await this.patientModel.generateContent(userPrompt);
            const responseText = result.response.text();

            return this.parsePatientFriendlyResponse(responseText);

        } catch (error) {
            console.error('Patient-friendly generation failed:', error);
            throw new Error(`Patient-friendly generation failed: ${(error as Error).message}`);
        }
    }

    async clarifyUncertainField(
        imagePath: string,
        fieldName: string,
        currentValue: string
    ): Promise<{ value: string; confidence: number }> {
        try {
            let imageBuffer: Buffer;
            if (imagePath.startsWith('http')) {
                const response = await axios.get(imagePath, { responseType: 'arraybuffer' });
                imageBuffer = Buffer.from(response.data);
            } else {
                imageBuffer = fs.readFileSync(imagePath);
            }

            const mimeType = this.getMimeType(imagePath);
            const imagePart: Part = {
                inlineData: {
                    data: imageBuffer.toString('base64'),
                    mimeType,
                },
            };

            const prompt = `Focus specifically on the "${fieldName}" field in this prescription. 
Current reading is: "${currentValue}" but confidence is low.
Look very carefully at this specific part and provide your best reading.
Return JSON: {"value": "your best reading", "confidence": 0.0, "reasoning": "why you think this"}`;

            const result = await this.model.generateContent([prompt, imagePart]);
            const text = result.response.text();

            const cleaned = this.cleanJsonResponse(text);
            const parsed = JSON.parse(cleaned);
            return { value: parsed.value, confidence: parsed.confidence };

        } catch (error) {
            console.error('Field clarification failed:', error);
            return { value: currentValue, confidence: 0.3 };
        }
    }

    private parseExtractionResponse(text: string): IPrescriptionExtraction {
        try {
            const cleaned = this.cleanJsonResponse(text);
            const parsed = JSON.parse(cleaned);

            const medications = Array.isArray(parsed.medications)
                ? parsed.medications.map((med: any) => ({
                    name: String(med.name || 'Unknown'),
                    genericName: med.genericName || undefined,
                    dosage: String(med.dosage || 'Not specified'),
                    frequency: String(med.frequency || 'Not specified'),
                    duration: String(med.duration || 'Not specified'),
                    route: med.route || undefined,
                    instructions: med.instructions || undefined,
                    confidence: Math.min(1, Math.max(0, Number(med.confidence) || 0.5)),
                }))
                : [];

            return {
                patientName: parsed.patientName || undefined,
                patientAge: parsed.patientAge || undefined,
                doctorName: parsed.doctorName || undefined,
                doctorRegistration: parsed.doctorRegistration || undefined,
                date: parsed.date || undefined,
                diagnosis: parsed.diagnosis || undefined,
                medications,
                additionalNotes: parsed.additionalNotes || undefined,
                overallConfidence: Math.min(1, Math.max(0, Number(parsed.overallConfidence) || 0.5)),
                uncertainFields: Array.isArray(parsed.uncertainFields) ? parsed.uncertainFields : [],
                isLowConfidence: parsed.overallConfidence < 0.5,
                isUnreadable: parsed.overallConfidence < 0.25,
            };
        } catch (error) {
            console.error('Failed to parse extraction response:', error);
            throw new Error('Failed to parse AI response. The prescription may be unreadable.');
        }
    }

    private parsePatientFriendlyResponse(text: string): IPatientFriendlyPrescription {
        try {
            const cleaned = this.cleanJsonResponse(text);
            const parsed = JSON.parse(cleaned);

            return {
                summary: String(parsed.summary || ''),
                medications: Array.isArray(parsed.medications) ? parsed.medications : [],
                generalInstructions: Array.isArray(parsed.generalInstructions) ? parsed.generalInstructions : [],
                followUpAdvice: parsed.followUpAdvice || undefined,
                translatedLanguage: String(parsed.translatedLanguage || 'en'),
            };
        } catch (error) {
            console.error('Failed to parse patient-friendly response:', error);
            throw new Error('Failed to generate patient-friendly output.');
        }
    }

    private cleanJsonResponse(text: string): string {
        return text
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/g, '')
            .trim();
    }

    private getMimeType(filePath: string): string {
        const ext = path.extname(filePath).toLowerCase();
        const mimeTypes: Record<string, string> = {
            '.jpg': 'image/jpeg',
            '.jpeg': 'image/jpeg',
            '.png': 'image/png',
            '.gif': 'image/gif',
            '.webp': 'image/webp',
            '.pdf': 'application/pdf',
        };
        return mimeTypes[ext] || 'image/jpeg';
    }
}

export default new GeminiService();
