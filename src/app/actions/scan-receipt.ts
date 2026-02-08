"use server";

import { google } from "@ai-sdk/google";
import { generateText } from "ai";
import { z } from "zod";

/**
 * Utility to clean JSON from markdown code fences and other artifacts
 */
function cleanJsonResponse(text: string): string {
  let cleaned = text.trim();
  
  // Remove markdown code fences (```json ... ``` or ``` ... ```)
  const codeBlockRegex = /^```(?:json)?\s*\n?([\s\S]*?)\n?```$/;
  const match = cleaned.match(codeBlockRegex);
  if (match) {
    cleaned = match[1].trim();
  }
  
  // Also handle case where there might be text before/after the JSON
  // Try to extract JSON object from the response
  const jsonObjectRegex = /\{[\s\S]*\}/;
  const jsonMatch = cleaned.match(jsonObjectRegex);
  if (jsonMatch) {
    cleaned = jsonMatch[0];
  }
  
  return cleaned;
}

// Schema for receipt data extraction
const receiptSchema = z.object({
  merchant: z.string().describe("The merchant or store name from the receipt"),
  amount: z.number().describe("The total amount as a raw number (e.g., 50000 for Rp 50.000)"),
  date: z.string().describe("The transaction date in YYYY-MM-DD format"),
  category: z
    .enum([
      "Food & Dining",
      "Groceries",
      "Transportation",
      "Shopping",
      "Entertainment",
      "Bills & Utilities",
      "Health & Medical",
      "Education",
      "Travel",
      "Other",
    ])
    .describe("Suggested category based on the merchant and items"),
  items: z
    .array(
      z.object({
        name: z.string().describe("Item name"),
        price: z.number().describe("Item price as a raw number"),
      })
    )
    .optional()
    .describe("Individual line items from the receipt if visible"),
});

export type ReceiptData = z.infer<typeof receiptSchema>;

export interface ScanReceiptResult {
  success: boolean;
  data?: ReceiptData;
  error?: string;
}

export async function scanReceipt(imageBase64: string): Promise<ScanReceiptResult> {
  try {
    // Validate that we have the API key
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      return {
        success: false,
        error: "Google AI API key is not configured. Please add GOOGLE_GENERATIVE_AI_API_KEY to your environment variables.",
      };
    }

    // Get today's date for fallback
    const today = new Date().toISOString().split("T")[0];

    // Define the expected JSON structure for the prompt
    const jsonStructure = `{
  "merchant": "string (store/merchant name)",
  "amount": number (total amount as raw number, e.g., 50000 for Rp 50.000),
  "date": "string (YYYY-MM-DD format)",
  "category": "one of: Food & Dining, Groceries, Transportation, Shopping, Entertainment, Bills & Utilities, Health & Medical, Education, Travel, Other",
  "items": [{"name": "string", "price": number}] (optional, include if visible)
}`;

    const { text } = await generateText({
      model: google("gemma-3-4b-it"),
      messages: [
        {
          role: "user",
          content: [
            {
              type: "text",
              text: `You are a receipt analyzer. Analyze this receipt image and extract the transaction details.

Instructions:
- Extract the merchant/store name accurately
- Extract the TOTAL amount as a raw number (e.g., 50000 for "Rp 50.000" or "IDR 50,000")
- If the currency shows "Rp", "IDR", or Indonesian Rupiah, return the amount as-is without any conversion
- Extract the date in YYYY-MM-DD format. If no date is visible, use today's date: ${today}
- Suggest an appropriate category based on the merchant type and items purchased
- If individual items are visible, extract them with their prices

IMPORTANT: Return ONLY raw JSON. Do not use markdown code blocks. Do not add any explanations or text before or after the JSON.

Expected JSON structure:
${jsonStructure}

Analyze the receipt and return the JSON now:`,
            },
            {
              type: "image",
              image: imageBase64,
            },
          ],
        },
      ],
    });

    // Clean the response from any markdown artifacts
    const cleanedJson = cleanJsonResponse(text);

    // Parse the JSON
    let parsedData: unknown;
    try {
      parsedData = JSON.parse(cleanedJson);
    } catch {
      console.error("Failed to parse JSON response:", text);
      return {
        success: false,
        error: "Failed to parse receipt data. The AI response was not valid JSON.",
      };
    }

    // Validate with Zod schema
    const validationResult = receiptSchema.safeParse(parsedData);
    
    if (!validationResult.success) {
      console.error("Zod validation failed:", validationResult.error.issues);
      return {
        success: false,
        error: `Invalid receipt data structure: ${validationResult.error.issues.map((e: { message: string }) => e.message).join(", ")}`,
      };
    }

    return {
      success: true,
      data: validationResult.data,
    };
  } catch (error) {
    console.error("Error scanning receipt:", error);
    
    // Provide more specific error messages
    if (error instanceof Error) {
      if (error.message.includes("API key")) {
        return {
          success: false,
          error: "Invalid or missing API key. Please check your GOOGLE_GENERATIVE_AI_API_KEY.",
        };
      }
      if (error.message.includes("image")) {
        return {
          success: false,
          error: "Could not process the image. Please try a clearer photo.",
        };
      }
      return {
        success: false,
        error: `Failed to scan receipt: ${error.message}`,
      };
    }
    
    return {
      success: false,
      error: "Failed to scan receipt. Please try again.",
    };
  }
}
