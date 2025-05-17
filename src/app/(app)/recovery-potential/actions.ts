
'use server';

import { recoveryPotentialAnalysis, type RecoveryPotentialAnalysisInput, type RecoveryPotentialAnalysisOutput } from '@/ai/flows/recovery-potential-analysis';

export async function recoveryPotentialAnalysisAction(input: RecoveryPotentialAnalysisInput): Promise<{ success: true, data: RecoveryPotentialAnalysisOutput } | { success: false, error: string }> {
  try {
    if (!input.deviceImageUri) {
      return { success: false, error: "Device image file is required." };
    }
    if (!input.deviceDescription) {
      return { success: false, error: "Device description is required." };
    }
    // wipeAccuracyReport is optional
    const result = await recoveryPotentialAnalysis(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in recoveryPotentialAnalysisAction:", error);
    return { success: false, error: (error instanceof Error ? error.message : "An unknown error occurred") };
  }
}
