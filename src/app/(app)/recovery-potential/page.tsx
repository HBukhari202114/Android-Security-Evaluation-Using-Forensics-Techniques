
"use client";

import { useState, useTransition } from 'react';
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUploadToDataUri } from '@/components/common/FileUploadToDataUri';
import { SubmitButton } from '@/components/common/SubmitButton';
import { ResultDisplayCard, ResultItem } from '@/components/common/ResultDisplayCard';
import { recoveryPotentialAnalysis, type RecoveryPotentialAnalysisInput, type RecoveryPotentialAnalysisOutput } from '@/ai/flows/recovery-potential-analysis';
import { Recycle, FileImage, FileText, Smartphone, AlertTriangle, Activity } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

async function recoveryPotentialAnalysisAction(input: RecoveryPotentialAnalysisInput): Promise<{ success: true, data: RecoveryPotentialAnalysisOutput } | { success: false, error: string }> {
  'use server';
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

export default function RecoveryPotentialPage() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<RecoveryPotentialAnalysisOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  
  const [deviceImageUri, setDeviceImageUri] = useState<string>('');
  const [wipeAccuracyReport, setWipeAccuracyReport] = useState<string>('');
  const [deviceDescription, setDeviceDescription] = useState<string>('');
  const { toast } = useToast();

  const handleFileLoad = (dataUri: string, fileName: string) => {
    setDeviceImageUri(dataUri);
     if(dataUri) {
       toast({ title: "File Loaded", description: `Device image "${fileName}" is ready.` });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!deviceImageUri) {
      setError("Please upload a device image file.");
      toast({ variant: "destructive", title: "Input Error", description: "Device image file is required." });
      return;
    }
    if (!deviceDescription.trim()) {
      setError("Please provide a device description.");
      toast({ variant: "destructive", title: "Input Error", description: "Device description is required." });
      return;
    }

    startTransition(async () => {
      const actionResult = await recoveryPotentialAnalysisAction({ 
        deviceImageUri, 
        wipeAccuracyReport, 
        deviceDescription 
      });
      if (actionResult.success) {
        setResult(actionResult.data);
        toast({ title: "Analysis Complete", description: "Recovery potential assessment is ready." });
      } else {
        setError(actionResult.error);
        toast({ variant: "destructive", title: "Analysis Failed", description: actionResult.error });
      }
    });
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Recovery Potential Analysis"
        description="Upload device image and details to assess data recovery potential."
        icon={Recycle}
      />

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Smartphone className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">Device Information</CardTitle>
          </div>
          <CardDescription>Provide device image, wipe report (optional), and description.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <FileUploadToDataUri
              id="deviceImageFile"
              label="Device Image File (.img, .bin, etc.)"
              onFileLoad={handleFileLoad}
              accept="image/*,.img,.bin" 
            />
            <div className="space-y-1.5">
              <Label htmlFor="wipeAccuracyReport">Wipe Accuracy Report (Optional)</Label>
              <Textarea
                id="wipeAccuracyReport"
                placeholder="Enter details from any wipe accuracy report, if available..."
                value={wipeAccuracyReport}
                onChange={(e) => setWipeAccuracyReport(e.target.value)}
                rows={3}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="deviceDescription">Device Description (Required)</Label>
              <Textarea
                id="deviceDescription"
                placeholder="e.g., Samsung Galaxy S21, Android 12, 128GB storage, factory reset performed."
                value={deviceDescription}
                onChange={(e) => setDeviceDescription(e.target.value)}
                required
                rows={3}
              />
            </div>
            <SubmitButton isPending={isPending} pendingText="Analyzing..." className="w-full sm:w-auto">
              Analyze Potential
            </SubmitButton>
          </form>
        </CardContent>
      </Card>

      {isPending && (
        <ResultDisplayCard title="Analyzing Recovery Potential" icon={Activity} className="animate-pulse">
            <p className="text-muted-foreground">Please wait while the AI analyzes the provided information...</p>
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
        <ResultDisplayCard title="Recovery Potential Analysis Results" icon={Recycle}>
          <ResultItem label="Overall Potential" value={result.overallPotential} />
          <ResultItem label="Likelihood of Recovering Sensitive Data" value={result.sensitiveDataLikelihood} />
          <ResultItem label="Recommendations for Investigation & Recovery" value={result.recommendations} />
        </ResultDisplayCard>
      )}
    </div>
  );
}
