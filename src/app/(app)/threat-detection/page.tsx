
"use client";

import { useState, useTransition, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { SubmitButton } from '@/components/common/SubmitButton';
import { ResultDisplayCard, ResultItem } from '@/components/common/ResultDisplayCard';
import { type ThreatDetectionOutput } from '@/ai/flows/threat-detection'; // Keep this type import
import { threatDetectionAction } from './actions'; // Import the action
import { ScanSearch, ShieldAlert, FileText, ListChecks, AlertTriangle, Activity, ShieldCheck } from 'lucide-react';
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
      case 'medium': return 'secondary'; // Using secondary for orange/yellowish
      case 'low': return 'default'; // Using default for green/blue or less prominent
      default: return 'outline';
    }
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
        </>
      )}
    </div>
  );
}
