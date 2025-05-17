
"use client";

import { useState, useTransition, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { FileUploadToDataUri } from '@/components/common/FileUploadToDataUri';
import { SubmitButton } from '@/components/common/SubmitButton';
import { ResultDisplayCard, ResultItem } from '@/components/common/ResultDisplayCard';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { type SimulateRecoveryOutput, type SimulateRecoveryInput } from '@/ai/flows/simulate-recovery-flow';
import { simulateRecoveryAction } from './actions';
import { Microscope, Eraser, ShieldQuestion, Activity, AlertTriangle, FileUp, Recycle, DatabaseZap } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const ORIGINAL_DATA_LS_KEY = 'forensic_simulation_original_data';
const RECOVERED_DATA_LS_KEY = 'forensic_simulation_recovered_data';

export default function ForensicSimulationPage() {
  const [isPendingWipe, startWipeTransition] = useTransition();
  const [isPendingRecovery, startRecoveryTransition] = useTransition();
  const [originalDataContent, setOriginalDataContent] = useState<string | null>(null);
  const [uploadedFileName, setUploadedFileName] = useState<string | null>(null);
  const [isWiped, setIsWiped] = useState(false);
  
  const [recoveryResult, setRecoveryResult] = useState<SimulateRecoveryOutput | null>(null);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [recoveryEffort, setRecoveryEffort] = useState<SimulateRecoveryInput['recoveryEffort']>('medium');

  const router = useRouter();
  const { toast } = useToast();

  useEffect(() => {
    // Check if data was previously wiped to maintain state across refreshes (optional)
    const storedOriginalData = localStorage.getItem(ORIGINAL_DATA_LS_KEY);
    if (storedOriginalData) {
      setOriginalDataContent(storedOriginalData);
      setIsWiped(true); // Assume if original data exists, it was "wiped"
      // setUploadedFileName("previously loaded data"); // Could store filename too
    }
  }, []);

  const handleFileLoad = (dataUri: string, fileName: string) => {
    // Assuming text file, extract content. For binary, this would be more complex.
    // Simple split for text-based data URIs.
    const base64Marker = ';base64,';
    const rawContent = atob(dataUri.substring(dataUri.indexOf(base64Marker) + base64Marker.length));
    setOriginalDataContent(rawContent);
    setUploadedFileName(fileName);
    setIsWiped(false); // New file upload resets wipe state
    setRecoveryResult(null); // Reset recovery state
    if (dataUri) {
      toast({ title: "File Ready", description: `"${fileName}" loaded and ready for wipe simulation.` });
    }
  };

  const handleSimulateWipe = () => {
    if (!originalDataContent) {
      toast({ variant: "destructive", title: "No Data", description: "Please upload a file first." });
      return;
    }
    startWipeTransition(() => {
      localStorage.setItem(ORIGINAL_DATA_LS_KEY, originalDataContent);
      localStorage.removeItem(RECOVERED_DATA_LS_KEY); // Clear any old recovered data
      setIsWiped(true);
      setRecoveryResult(null);
      toast({ title: "Wipe Simulated", description: `Data from "${uploadedFileName}" has been "wiped". You can now attempt recovery.` });
    });
  };

  const handleSimulateRecovery = async () => {
    setRecoveryError(null);
    setRecoveryResult(null);
    const dataToRecover = localStorage.getItem(ORIGINAL_DATA_LS_KEY);

    if (!dataToRecover) {
      toast({ variant: "destructive", title: "No Wiped Data", description: "Please simulate a wipe first." });
      return;
    }

    startRecoveryTransition(async () => {
      const actionResult = await simulateRecoveryAction({ 
        originalData: dataToRecover, 
        recoveryEffort 
      });
      if (actionResult.success) {
        setRecoveryResult(actionResult.data);
        localStorage.setItem(RECOVERED_DATA_LS_KEY, actionResult.data.recoveredData);
        toast({ title: "Recovery Simulated", description: "Data recovery attempt complete. View results below." });
      } else {
        setRecoveryError(actionResult.error);
        toast({ variant: "destructive", title: "Recovery Failed", description: actionResult.error });
      }
    });
  };

  const handleProceedToExtraction = () => {
    if (localStorage.getItem(RECOVERED_DATA_LS_KEY)) {
      router.push('/data-extraction?source=simulation');
    } else {
      toast({ variant: "destructive", title: "No Recovered Data", description: "Please simulate recovery first or ensure recovery was successful." });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Forensic Simulation: Wipe & Recovery"
        description="Simulate data wiping from a device and then attempt to recover it."
        icon={Microscope}
      />

      {/* Step 1: Upload and Wipe */}
      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileUp className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">Step 1: Upload Data for Wipe Simulation</CardTitle>
          </div>
          <CardDescription>Upload a text file representing the data on a mobile device.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <FileUploadToDataUri
            id="deviceDataFile"
            label="Device Data File (e.g., .txt, .log)"
            onFileLoad={handleFileLoad}
            accept=".txt,.log,text/plain"
          />
          {uploadedFileName && originalDataContent && (
            <div className="p-3 border rounded-md bg-secondary/30">
              <p className="text-sm font-medium">File: {uploadedFileName}</p>
              <p className="text-xs text-muted-foreground">Content preview (first 200 chars):</p>
              <Textarea 
                value={originalDataContent.substring(0, 200) + (originalDataContent.length > 200 ? '...' : '')} 
                readOnly 
                rows={3}
                className="font-mono text-xs mt-1" 
              />
            </div>
          )}
          <Button onClick={handleSimulateWipe} disabled={!originalDataContent || isPendingWipe || isWiped} className="w-full sm:w-auto">
            {isPendingWipe ? <><Activity className="mr-2 h-4 w-4 animate-spin" />Simulating Wipe...</> : <><Eraser className="mr-2 h-4 w-4" />Simulate Data Wipe</>}
          </Button>
          {isWiped && (
            <div className="p-3 border border-green-500 rounded-md bg-green-50 dark:bg-green-900/30">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">Data Wipe Simulated Successfully!</p>
              <p className="text-xs text-muted-foreground">The content of "{uploadedFileName || 'uploaded file'}" has been marked as 'wiped'. Proceed to recovery.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Recover Data */}
      {isWiped && (
        <Card className="shadow-lg">
          <CardHeader>
            <div className="flex items-center gap-3">
              <Recycle className="h-6 w-6 text-primary" />
              <CardTitle className="text-xl">Step 2: Simulate Data Recovery</CardTitle>
            </div>
            <CardDescription>Attempt to recover the 'wiped' data. Choose a recovery effort level.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="recoveryEffort">Recovery Effort Level</Label>
              <Select value={recoveryEffort} onValueChange={(value: SimulateRecoveryInput['recoveryEffort']) => setRecoveryEffort(value)}>
                <SelectTrigger id="recoveryEffort" className="w-full sm:w-[200px]">
                  <SelectValue placeholder="Select effort" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Low</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="high">High</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button onClick={handleSimulateRecovery} disabled={isPendingRecovery || !isWiped} className="w-full sm:w-auto">
              {isPendingRecovery ? <><Activity className="mr-2 h-4 w-4 animate-spin" />Attempting Recovery...</> : "Attempt Data Recovery"}
            </Button>
          </CardContent>
        </Card>
      )}

      {isPendingRecovery && (
        <ResultDisplayCard title="Recovery in Progress..." icon={Activity} className="animate-pulse">
            <p className="text-muted-foreground">AI is simulating data recovery...</p>
             <div className="space-y-2 mt-2">
                <div className="h-4 bg-muted rounded w-3/4"></div>
                <div className="h-4 bg-muted rounded w-1/2"></div>
                <div className="h-4 bg-muted rounded w-5/6"></div>
            </div>
        </ResultDisplayCard>
      )}

      {recoveryError && !isPendingRecovery && (
        <ResultDisplayCard title="Recovery Simulation Error" icon={AlertTriangle} className="border-destructive">
          <p className="text-destructive">{recoveryError}</p>
        </ResultDisplayCard>
      )}

      {recoveryResult && !isPendingRecovery && (
        <>
          <ResultDisplayCard title="Recovery Simulation Results" icon={ShieldQuestion}>
            <ResultItem label="Recovery Log" value={recoveryResult.recoveryLog} />
          </ResultDisplayCard>
          <Card className="shadow-lg">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <DatabaseZap className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Step 3: Proceed to Data Extraction</CardTitle>
                </div>
              <CardDescription>The "recovered" data is now available. Proceed to extract and analyze it.</CardDescription>
            </CardHeader>
            <CardContent>
              <Textarea 
                value={recoveryResult.recoveredData} 
                readOnly 
                rows={10}
                className="font-mono text-xs bg-secondary/30 mb-4"
                placeholder="Recovered data will appear here..."
              />
              <Button onClick={handleProceedToExtraction} className="w-full sm:w-auto">
                <DatabaseZap className="mr-2 h-4 w-4" />
                Go to Data Extraction & Analysis
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
