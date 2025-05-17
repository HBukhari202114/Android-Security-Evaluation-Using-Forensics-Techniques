
"use client";

import { useState, useTransition } from 'react';
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { FileUploadToDataUri } from '@/components/common/FileUploadToDataUri';
import { SubmitButton } from '@/components/common/SubmitButton';
import { ResultDisplayCard, ResultItem } from '@/components/common/ResultDisplayCard';
import { assessWipeAccuracy, type AssessWipeAccuracyInput, type AssessWipeAccuracyOutput } from '@/ai/flows/wipe-accuracy-assessment';
import { ShieldCheck, FileText, AlertTriangle, Activity } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

async function assessWipeAccuracyAction(input: AssessWipeAccuracyInput): Promise<{ success: true, data: AssessWipeAccuracyOutput } | { success: false, error: string }> {
  'use server';
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

export default function WipeAccuracyPage() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<AssessWipeAccuracyOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [wipeLogDataUri, setWipeLogDataUri] = useState<string>('');
  const { toast } = useToast();

  const handleFileLoad = (dataUri: string, fileName: string) => {
    setWipeLogDataUri(dataUri);
    if(dataUri) {
       toast({ title: "File Loaded", description: `${fileName} is ready for analysis.` });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!wipeLogDataUri) {
      setError("Please upload a wipe log file.");
      toast({ variant: "destructive", title: "Input Error", description: "Wipe log file is required." });
      return;
    }

    startTransition(async () => {
      const actionResult = await assessWipeAccuracyAction({ wipeLogDataUri });
      if (actionResult.success) {
        setResult(actionResult.data);
        toast({ title: "Analysis Complete", description: "Wipe accuracy assessment is ready." });
      } else {
        setError(actionResult.error);
        toast({ variant: "destructive", title: "Analysis Failed", description: actionResult.error });
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Wipe Accuracy Assessment"
        description="Upload data wipe logs to assess the accuracy of the data wipe process."
        icon={ShieldCheck}
      />

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">Upload Wipe Logs</CardTitle>
          </div>
          <CardDescription>Provide the wipe log file for AI-powered analysis.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FileUploadToDataUri
              id="wipeLogFile"
              label="Wipe Log File (.log, .txt)"
              onFileLoad={handleFileLoad}
              accept=".log,.txt,text/plain"
            />
            <SubmitButton isPending={isPending} pendingText="Analyzing..." className="w-full sm:w-auto">
              Assess Accuracy
            </SubmitButton>
          </form>
        </CardContent>
      </Card>

      {isPending && (
        <ResultDisplayCard title="Analyzing Wipe Accuracy" icon={Activity} className="animate-pulse">
            <p className="text-muted-foreground">Please wait while the AI analyzes the provided wipe logs...</p>
            <div className="space-y-2 mt-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
        </ResultDisplayCard>
      )}

      {error && !isPending && (
         <ResultDisplayCard title="Analysis Error" icon={AlertTriangle} className="border-destructive">
          <p className="text-destructive">{error}</p>
        </ResultDisplayCard>
      )}

      {result && !isPending && (
        <ResultDisplayCard title="Wipe Accuracy Assessment Results" icon={ShieldCheck}>
          <ResultItem label="Overall Accuracy" value={result.accuracyAssessment.overallAccuracy} />
          <ResultItem label="Detailed Analysis" value={result.accuracyAssessment.detailedAnalysis} />
          <ResultItem label="Confidence Level" value={result.accuracyAssessment.confidenceLevel} />
          <ResultItem label="Recommendations" value={result.accuracyAssessment.recommendations} />
        </ResultDisplayCard>
      )}
    </div>
  );
}
