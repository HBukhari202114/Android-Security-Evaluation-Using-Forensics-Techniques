// RecoveryPotentialAnalysis flow
'use server';

/**
 * @fileOverview Analyzes the potential for data recovery from a mobile device image.
 *
 * - recoveryPotentialAnalysis - A function that analyzes the potential for data recovery.
 * - RecoveryPotentialAnalysisInput - The input type for the recoveryPotentialAnalysis function.
 * - RecoveryPotentialAnalysisOutput - The return type for the recoveryPotentialAnalysis function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const RecoveryPotentialAnalysisInputSchema = z.object({
  deviceImageUri: z
    .string()
    .describe(
      "A mobile device image, as a data URI that must include a MIME type and use Base64 encoding. Expected format: 'data:<mimetype>;base64,<encoded_data>'."
    ),
  wipeAccuracyReport: z
    .string()
    .describe("Report of data wipe accuracy, can be an empty string if not available."),
  deviceDescription: z.string().describe('A description of the mobile device.'),
});
export type RecoveryPotentialAnalysisInput = z.infer<
  typeof RecoveryPotentialAnalysisInputSchema
>;

const RecoveryPotentialAnalysisOutputSchema = z.object({
  overallPotential: z
    .string()
    .describe(
      'Overall potential for data recovery (High, Medium, Low) with justification.'
    ),
  sensitiveDataLikelihood: z
    .string()
    .describe(
      'Likelihood of recovering sensitive data (High, Medium, Low) with justification.'
    ),
  recommendations: z
    .string()
    .describe(
      'Recommendations for further investigation and recovery techniques.'
    ),
});
export type RecoveryPotentialAnalysisOutput = z.infer<
  typeof RecoveryPotentialAnalysisOutputSchema
>;

export async function recoveryPotentialAnalysis(
  input: RecoveryPotentialAnalysisInput
): Promise<RecoveryPotentialAnalysisOutput> {
  return recoveryPotentialAnalysisFlow(input);
}

const prompt = ai.definePrompt({
  name: 'recoveryPotentialAnalysisPrompt',
  input: {schema: RecoveryPotentialAnalysisInputSchema},
  output: {schema: RecoveryPotentialAnalysisOutputSchema},
  prompt: `You are a forensic data recovery expert.

You are provided with a mobile device image, a description of the device, and optionally a data wipe accuracy report.

Based on this information, assess the potential for data recovery.

Device Description: {{{deviceDescription}}}
Device Image: {{media url=deviceImageUri}}
Wipe Accuracy Report: {{{wipeAccuracyReport}}}

Consider factors such as the device type, storage technology, the reported accuracy of data wiping (if any), and common data recovery techniques applicable to mobile devices.

Provide an overall potential for data recovery (High, Medium, Low) and a likelihood of recovering sensitive data (High, Medium, Low), justifying your assessment.

Also, provide recommendations for further investigation and recovery techniques.

Ensure your response follows the output schema.
`,
});

const recoveryPotentialAnalysisFlow = ai.defineFlow(
  {
    name: 'recoveryPotentialAnalysisFlow',
    inputSchema: RecoveryPotentialAnalysisInputSchema,
    outputSchema: RecoveryPotentialAnalysisOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
