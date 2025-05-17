// Implemented by AI
'use server';

/**
 * @fileOverview An AI-powered threat detection flow for analyzing extracted mobile data.
 *
 * - threatDetection - A function that analyzes extracted mobile data for potential threats.
 * - ThreatDetectionInput - The input type for the threatDetection function.
 * - ThreatDetectionOutput - The return type for the threatDetection function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ThreatDetectionInputSchema = z.object({
  extractedData: z
    .string()
    .describe('Extracted mobile data to be analyzed for threats.'),
});
export type ThreatDetectionInput = z.infer<typeof ThreatDetectionInputSchema>;

const ThreatDetectionOutputSchema = z.object({
  threatsIdentified: z.array(
    z.object({
      threatName: z.string().describe('Name of the identified threat.'),
      threatLevel: z.string().describe('Severity level of the threat.'),
      description: z.string().describe('Detailed description of the threat.'),
    })
  ).describe('List of threats identified in the extracted data.'),
  summary: z.string().describe('A summary of the threat detection analysis.'),
});
export type ThreatDetectionOutput = z.infer<typeof ThreatDetectionOutputSchema>;

export async function threatDetection(input: ThreatDetectionInput): Promise<ThreatDetectionOutput> {
  return threatDetectionFlow(input);
}

const threatDetectionPrompt = ai.definePrompt({
  name: 'threatDetectionPrompt',
  input: {schema: ThreatDetectionInputSchema},
  output: {schema: ThreatDetectionOutputSchema},
  prompt: `You are a mobile security expert analyzing extracted mobile data for potential threats.

  Analyze the following extracted data for viruses, malware, and other security vulnerabilities. Identify any potential threats, their severity level, and provide a detailed description of each.

  Extracted Data:
  {{extractedData}}

  Based on your analysis, provide a summary of the overall security posture of the device.
  `, // Changed prompt to include more specific instructions and context
});

const threatDetectionFlow = ai.defineFlow(
  {
    name: 'threatDetectionFlow',
    inputSchema: ThreatDetectionInputSchema,
    outputSchema: ThreatDetectionOutputSchema,
  },
  async input => {
    const {output} = await threatDetectionPrompt(input);
    return output!;
  }
);
