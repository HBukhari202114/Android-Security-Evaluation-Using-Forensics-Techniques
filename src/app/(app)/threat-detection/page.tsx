
"use client";

import { useState, useTransition, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from '@/components/common/SubmitButton';
import { Button } from '@/components/ui/button';
import { ResultDisplayCard, ResultItem } from '@/components/common/ResultDisplayCard';
import { type ThreatDetectionOutput } from '@/ai/flows/threat-detection';
import { threatDetectionAction } from './actions';
import { ScanSearch, ShieldAlert, FileText, ListChecks, AlertTriangle, Activity, ShieldCheck, Download } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const ORIGINAL_DATA_LS_KEY = 'forensic_simulation_original_data';
const ORIGINAL_FILENAME_LS_KEY = 'forensic_simulation_original_filename';
const RECOVERED_DATA_LS_KEY = 'forensic_simulation_recovered_data';

export default function ThreatDetectionPage() {
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<ThreatDetectionOutput | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [extractedData, setExtractedData] = useState<string>('');
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const dataFromQuery = searchParams.get('extractedData');
    if (dataFromQuery) {
      try {
        setExtractedData(decodeURIComponent(dataFromQuery));
        toast({ title: "Data Pre-filled", description: "Extracted data loaded from previous step." });
      } catch (e) {
        console.error("Failed to decode extracted data from query:", e);
        toast({ variant:"destructive", title: "Error", description: "Failed to load pre-filled data." });
      }
    }
  }, [searchParams, toast]);

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setResult(null);

    if (!extractedData.trim()) {
      setError("Please provide extracted data for analysis.");
      toast({ variant: "destructive", title: "Input Error", description: "Extracted data field is empty." });
      return;
    }

    startTransition(async () => {
      const actionResult = await threatDetectionAction({ extractedData });
      if (actionResult.success) {
        setResult(actionResult.data);
        toast({ title: "Analysis Complete", description: "Threat detection scan finished." });
      } else {
        setError(actionResult.error);
        toast({ variant: "destructive", title: "Analysis Failed", description: actionResult.error });
      }
    });
  };
  
  const getThreatLevelBadgeVariant = (level: string) => {
    switch (level.toLowerCase()) {
      case 'high': return 'destructive';
      case 'medium': return 'secondary'; 
      case 'low': return 'default'; 
      default: return 'outline';
    }
  };

  const handleDownloadReport = () => {
    if (!result) {
      toast({ variant: "destructive", title: "No Results", description: "Please run a threat analysis first." });
      return;
    }

    let reportContent = "Forensic Simulation & Threat Analysis Report\n";
    reportContent += "============================================\n\n";
    
    const originalFileName = localStorage.getItem(ORIGINAL_FILENAME_LS_KEY) || "Unknown File";
    reportContent += `Original File: ${originalFileName}\n`;
    reportContent += `Date of Report: ${new Date().toLocaleString()}\n\n`;

    reportContent += "--------------------------------------------\n";
    reportContent += "1. Original File Content (Snapshot from Simulation)\n";
    reportContent += "--------------------------------------------\n";
    const originalData = localStorage.getItem(ORIGINAL_DATA_LS_KEY);
    if (originalData) {
      reportContent += originalData.substring(0, 1000) + (originalData.length > 1000 ? "\n... (content truncated for report)" : "");
    } else {
      reportContent += "Original file content not found in simulation storage.";
    }
    reportContent += "\n\n";

    reportContent += "--------------------------------------------\n";
    reportContent += "2. Simulated Recovered File Content (Used for this Analysis)\n";
    reportContent += "--------------------------------------------\n";
    const recoveredData = localStorage.getItem(RECOVERED_DATA_LS_KEY);
     if (recoveredData) {
      reportContent += recoveredData;
    } else {
      reportContent += "Recovered file content not found in simulation storage (this should be the data analyzed).";
    }
    reportContent += "\n\n";
    
    reportContent += "--------------------------------------------\n";
    reportContent += "3. Threat Detection Analysis\n";
    reportContent += "--------------------------------------------\n\n";

    reportContent += `Summary:\n${result.summary}\n\n`;

    reportContent += "Identified Threats:\n";
    if (result.threatsIdentified && result.threatsIdentified.length > 0) {
      result.threatsIdentified.forEach(threat => {
        reportContent += `  - Threat Name: ${threat.threatName}\n`;
        reportContent += `    Severity: ${threat.threatLevel}\n`;
        reportContent += `    Description: ${threat.description}\n\n`;
      });
    } else {
      reportContent += "  No specific threats identified in the analyzed data.\n\n";
    }

    reportContent += "--------------------------------------------\n";
    reportContent += "End of Report\n";

    const blob = new Blob([reportContent], { type: 'text/plain;charset=utf-8' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `Forensic-Report-for-${originalFileName.replace(/\.[^/.]+$/, "")}.txt`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);

    toast({ title: "Report Downloaded", description: `Report for ${originalFileName} has been generated.` });
  };


  return (
    <div className="space-y-6">
      <PageHeader 
        title="Threat Detection"
        description="Analyze extracted mobile data for viruses, malware, and vulnerabilities."
        icon={ScanSearch}
      />

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <FileText className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">Extracted Data Input</CardTitle>
          </div>
          <CardDescription>Paste or provide the extracted mobile data for scanning.</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-1.5">
              <Label htmlFor="extractedData">Extracted Data (Required)</Label>
              <Textarea
                id="extractedData"
                placeholder="Paste the extracted data content here..."
                value={extractedData}
                onChange={(e) => setExtractedData(e.target.value)}
                required
                rows={10}
                className="font-mono text-xs"
              />
            </div>
            <SubmitButton isPending={isPending} pendingText="Scanning..." className="w-full sm:w-auto">
              Scan for Threats
            </SubmitButton>
          </form>
        </CardContent>
      </Card>

      {isPending && (
        <ResultDisplayCard title="Scanning for Threats" icon={Activity} className="animate-pulse">
            <p className="text-muted-foreground">Please wait while the AI analyzes the data for potential threats...</p>
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
        <>
          <ResultDisplayCard title="Threat Detection Summary" icon={ListChecks}>
            <ResultItem label="Overall Summary" value={result.summary} />
          </ResultDisplayCard>

          {result.threatsIdentified && result.threatsIdentified.length > 0 && (
            <Card className="shadow-lg">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <ShieldAlert className="h-6 w-6 text-destructive" />
                  <CardTitle className="text-xl">Identified Threats</CardTitle>
                </div>
                <CardDescription>Detailed list of potential threats found in the data.</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Threat Name</TableHead>
                      <TableHead>Severity</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {result.threatsIdentified.map((threat, index) => (
                      <TableRow key={index}>
                        <TableCell className="font-medium">{threat.threatName}</TableCell>
                        <TableCell>
                          <Badge variant={getThreatLevelBadgeVariant(threat.threatLevel)}>
                            {threat.threatLevel}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">{threat.description}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
          {result.threatsIdentified && result.threatsIdentified.length === 0 && (
             <Card className="shadow-lg">
              <CardContent className="pt-6 text-center">
                <ShieldCheck className="mx-auto h-12 w-12 text-green-500" />
                <p className="mt-4 font-semibold text-foreground">No Threats Identified</p>
                <p className="text-muted-foreground">The analysis did not find any specific threats in the provided data.</p>
              </CardContent>
            </Card>
          )}
          <Card className="shadow-lg">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <Download className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Download Report</CardTitle>
                </div>
              <CardDescription>Download a consolidated text report of the forensic simulation and threat analysis.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleDownloadReport} className="w-full sm:w-auto">
                <Download className="mr-2 h-4 w-4" />
                Download Forensic Report
              </Button>
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}

    