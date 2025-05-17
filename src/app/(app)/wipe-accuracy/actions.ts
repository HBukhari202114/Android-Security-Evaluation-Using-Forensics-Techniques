
'use server';

import { assessWipeAccuracy, type AssessWipeAccuracyInput, type AssessWipeAccuracyOutput } from '@/ai/flows/wipe-accuracy-assessment';

export async function assessWipeAccuracyAction(input: AssessWipeAccuracyInput): Promise<{ success: true, data: AssessWipeAccuracyOutput } | { success: false, error: string }> {
  try {
    if (!input.wipeLogDataUri) {
      return { success: false, error: "Wipe log file is required." };
    }
    const result = await assessWipeAccuracy(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in assessWipeAccuracyAction:", error);
    return { success: false, error: (error instanceof Error ? error.message : "An unknown error occurred") };
  }
}
