import Tesseract from 'tesseract.js';
import axios from 'axios';
import fs from 'fs';
import os from 'os';
import path from 'path';

class TesseractService {
    // Extracts raw text from an image using Tesseract OCR.
    async extractTextFromImage(imageUrlOrPath: string): Promise<string> {
        try {
            console.log(`[Tesseract Service] Processing image: ${imageUrlOrPath}`);

            let targetPath = imageUrlOrPath;
            let tempFilePath: string | null = null;


            if (imageUrlOrPath.startsWith('http://') || imageUrlOrPath.startsWith('https://')) {
                tempFilePath = path.join(os.tmpdir(), `tesseract_img_${Date.now()}.png`);
                const response = await axios.get(imageUrlOrPath, { responseType: 'arraybuffer' });
                fs.writeFileSync(tempFilePath, response.data);
                targetPath = tempFilePath;
            }

            const { data: { text } } = await Tesseract.recognize(
                targetPath,
                'eng',
                { logger: m => console.log(`[Tesseract] ${m.status}: ${Math.round(m.progress * 100)}%`) }
            );

            // Clean up temp file if we created one
            if (tempFilePath && fs.existsSync(tempFilePath)) {
                fs.unlinkSync(tempFilePath);
            }

            console.log(`[Tesseract Service] Extraction complete. Raw text length: ${text.length}`);
            return text;

        } catch (error) {
            console.error("[Tesseract Service] Error extracting text:", error);
            throw new Error("Failed to extract text using Tesseract OCR.");
        }
    }
}

export const tesseractService = new TesseractService();
