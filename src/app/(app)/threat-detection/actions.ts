
'use server';

import { threatDetection, type ThreatDetectionInput, type ThreatDetectionOutput } from '@/ai/flows/threat-detection';

export async function threatDetectionAction(input: ThreatDetectionInput): Promise<{ success: true, data: ThreatDetectionOutput } | { success: false, error: string }> {
  try {
    if (!input.extractedData.trim()) {
      return { success: false, error: "Extracted data cannot be empty." };
    }
    const result = await threatDetection(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in threatDetectionAction:", error);
    return { success: false, error: (error instanceof Error ? error.message : "An unknown error occurred") };
  }
}
