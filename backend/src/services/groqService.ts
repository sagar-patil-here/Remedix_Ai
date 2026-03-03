import axios from 'axios';
import fs from 'fs';
import dotenv from 'dotenv';
import { IPrescriptionExtraction, SupportedLanguage } from '../types';

dotenv.config();

const GROQ_API_KEY = process.env.GROQ_API_KEY || '';
const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';

const EXTRACTION_SYSTEM_PROMPT = `You are a medical prescription interpreter AI powered by Groq Llama 3.3 70B. Your task is to accurately structure and extract information from OCR-extracted prescription text.

IMPORTANT RULES:
1. Extract ONLY what is written. Do NOT add, infer, or modify any medical information.
2. Assign a confidence score (0.0 to 1.0) for each field based on clarity and legibility of the OCR text.
3. If a field is illegible or unclear, mark it with low confidence and flag it as "uncertain".
4. Never guess medication names — if uncertain, provide your best reading with low confidence.
5. Return ONLY valid JSON, no markdown, no explanation outside JSON.
6. Only include entries in the medications array if they are actual medicines/drugs.

Confidence scoring guide:
- 0.9-1.0: Clearly legible, high certainty
- 0.7-0.89: Mostly legible, minor uncertainty
- 0.5-0.69: Partially legible, significant uncertainty  
- 0.0-0.49: Mostly illegible, very uncertain`;

export class GroqService {
    
    /**
     * Structure OCR-extracted text using Llama 3.3 70B
     * Takes raw text from Tesseract OCR and structures it into JSON
     */
    async structurePrescriptionText(rawText: string): Promise<IPrescriptionExtraction> {
        try {
            console.info("[Groq Llama 3.3 70B] Structuring OCR-extracted text...");

            const userPrompt = `You are a medical data extraction specialist.
I have used an OCR tool (Tesseract) to extract raw text from a medical prescription image.
Your task is to carefully structure this raw OCR text into a well-organized JSON format.

IMPORTANT: Some OCR text may have errors or be hard to read. Do your best to interpret it correctly, but mark uncertain fields with lower confidence scores.

RAW PRESCRIPTION TEXT FROM OCR:
"""
${rawText}
"""

Analyze the text and calculate an "overallConfidence" score between 0.0 and 1.0:
- If the text contains clear medical terms, medicine names, dosages, and doctor info: score HIGH (0.8 to 1.0)
- If the text is partially readable with some missing medical info: score MEDIUM (0.5 to 0.7)
- If the text looks like random garbage or is severely corrupted: score LOW (< 0.25)

Return ONLY this exact JSON structure (no markdown, no extra text):

{
    "patientName": "Extracted Patient Name or null",
    "patientAge": "Extracted Age (e.g., '45', '45 years') or null",
    "patientGender": "Extracted Gender (M/F/Male/Female) or null",
    "doctorName": "Extracted Doctor Name or null",
    "doctorRegistration": "Extracted Doctor License/Registration Number or null",
    "clinicName": "Extracted Clinic/Hospital Name or null",
    "date": "Extracted Date (preserve original format) or null",
    "diagnosis": "Extracted Diagnosis or Chief Complaint or null",
    "medications": [
        {
            "name": "Medicine Name (as written)",
            "genericName": "Generic name if identifiable or null",
            "dosage": "Dosage amount (e.g., '500mg', '1 tablet', '5ml') or 'Not specified'",
            "frequency": "How often (e.g., 'OD', 'BID', 'TID', 'twice daily') or 'Not specified'",
            "duration": "How long (e.g., '5 days', '1 week', '10 days') or 'Not specified'",
            "route": "Route of administration (e.g., 'oral', 'IV', 'topical') or null",
            "instructions": "Special instructions (e.g., 'after food', 'with water', 'before bed') or null",
            "confidence": 0.8
        }
    ],
    "additionalNotes": "Any other relevant notes, warnings, or instructions from prescription or null",
    "overallConfidence": 0.85,
    "uncertainFields": ["List field names you are uncertain about, empty array if all clear"]
}`;

            const response = await axios.post(
                GROQ_API_URL,
                {
                    model: 'llama-3.3-70b-versatile', // Groq Llama 3.3 70B model
                    messages: [
                        {
                            role: 'system',
                            content: EXTRACTION_SYSTEM_PROMPT
                        },
                        {
                            role: 'user',
                            content: userPrompt
                        }
                    ],
                    temperature: 0.3, // Lower temp for more consistent structured output
                    max_tokens: 2048,
                    top_p: 0.95,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const responseText = response.data.choices[0].message.content;
            console.log(`[Groq Llama 3.3 70B] Response received. Parsing JSON...`);

            return this.parseExtractionResponse(responseText);

        } catch (error) {
            console.error('[Groq Llama 3.3 70B] Text structuring failed:', error);
            throw new Error(`Groq Llama 3.3 70B processing failed: ${(error as Error).message}`);
        }
    }

    /**
     * Extract prescription data directly from image using Llama 4 Scout vision
     * (Alternative method if needed)
     */
    async extractPrescriptionFromImage(imageUrl: string): Promise<IPrescriptionExtraction> {
        try {
            console.info("[Groq Llama 4 Scout Vision] Processing prescription image directly via vision...");

            const userPrompt = `Analyze this medical prescription image and extract all relevant information.

Provide exactly this JSON structure (do not include markdown):
{
    "patientName": "Extracted Patient Name (if any)",
    "patientAge": "Extracted Age (if any)",
    "patientGender": "Extracted Gender (if any)",
    "doctorName": "Extracted Doctor Name (if any)",
    "doctorRegistration": "Extracted Doctor Registration/License (if any)",
    "clinicName": "Extracted Clinic/Hospital Name (if any)",
    "date": "Extracted Date (if any)",
    "diagnosis": "Extracted Diagnosis or Chief Complaint (if any)",
    "medications": [
        {
            "name": "Medicine Name",
            "genericName": "Generic name if identifiable or null",
            "dosage": "Dosage (e.g., 500mg, 1 tablet)",
            "frequency": "Frequency (e.g., OD, BID, TID, twice a day)",
            "duration": "Duration (e.g., 5 days, 1 week)",
            "route": "Route if specified or null (e.g., oral, IV)",
            "instructions": "Specific instructions (e.g., after food, with water) or null",
            "confidence": 0.85
        }
    ],
    "additionalNotes": "Any other relevant notes or instructions from the prescription",
    "overallConfidence": 0.9,
    "uncertainFields": ["List of fields you are uncertain about"]
}`;

            const response = await axios.post(
                GROQ_API_URL,
                {
                    model: 'llama-4-scout-vision',
                    messages: [
                        {
                            role: 'system',
                            content: EXTRACTION_SYSTEM_PROMPT
                        },
                        {
                            role: 'user',
                            content: [
                                {
                                    type: 'image_url',
                                    image_url: {
                                        url: imageUrl
                                    }
                                },
                                {
                                    type: 'text',
                                    text: userPrompt
                                }
                            ]
                        }
                    ],
                    temperature: 0.2,
                    max_tokens: 2048,
                },
                {
                    headers: {
                        'Authorization': `Bearer ${GROQ_API_KEY}`,
                        'Content-Type': 'application/json',
                    },
                }
            );

            const responseText = response.data.choices[0].message.content;
            console.log(`[Groq Llama 4 Scout Vision] Response received. Parsing...`);

            return this.parseExtractionResponse(responseText);

        } catch (error) {
            console.error('[Groq Llama 4 Scout Vision] Vision extraction failed:', error);
            throw new Error(`Groq Llama 4 Scout vision processing failed: ${(error as Error).message}`);
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
                patientGender: parsed.patientGender || undefined,
                doctorName: parsed.doctorName || undefined,
                doctorRegistration: parsed.doctorRegistration || undefined,
                // clinicName: parsed.clinicName || undefined,
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
            console.error('Failed to parse Groq response:', error);
            throw new Error('Failed to parse Groq response as JSON.');
        }
    }

    private cleanJsonResponse(text: string): string {
        return text
            .replace(/```json\s*/gi, '')
            .replace(/```\s*/g, '')
            .trim();
    }
}

export default new GroqService();