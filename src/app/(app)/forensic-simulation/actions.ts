
'use server';

import { simulateRecovery, type SimulateRecoveryInput, type SimulateRecoveryOutput } from '@/ai/flows/simulate-recovery-flow';

export async function simulateRecoveryAction(input: SimulateRecoveryInput): Promise<{ success: true, data: SimulateRecoveryOutput } | { success: false, error: string }> {
  try {
    if (!input.originalData.trim()) {
      return { success: false, error: "Original file content for recovery cannot be empty." };
    }
    const result = await simulateRecovery(input);
    return { success: true, data: result };
  } catch (error) {
    console.error("Error in simulateRecoveryAction:", error);
    return { success: false, error: (error instanceof Error ? error.message : "An unknown error occurred during recovery simulation") };
  }
}

