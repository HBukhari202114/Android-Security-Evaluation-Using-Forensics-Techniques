
"use client";

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation'; // Added useSearchParams
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label"; // Added Label
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { DatabaseZap, FileText, Terminal, PlayCircle, ScanSearch, AlertTriangle, Activity } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const MOCK_EXTRACTED_DATA = `Contacts:
- John Doe: +1-555-1234, john.doe@email.com
- Jane Smith: +1-555-5678, jane.smith@email.com

Call Logs:
- Incoming: +1-555-9876 (2023-10-26 10:30 AM) - Duration: 5m 12s
- Outgoing: +1-555-4321 (2023-10-26 11:15 AM) - Duration: 2m 45s

SMS Messages:
- From +1-555-1122: "Hello, are you available for a meeting?" (2023-10-25 03:45 PM)
- To +1-555-3344: "Yes, I will be there." (2023-10-25 03:50 PM)

App Data (Partial):
- com.example.app/files/user_prefs.xml: <user_preferences><setting_a>true</setting_a><setting_b>false</setting_b></user_preferences>
- com.another.app/databases/messages.db: (Binary content placeholder)
`;

const MOCK_EXTRACTION_LOGS = `[INFO] Starting data extraction process...
[INFO] Connecting to device... Device detected: Generic Android Device.
[INFO] Mounting /data partition... Success.
[INFO] Extracting contacts database (contacts2.db)... Done.
[INFO] Extracting call logs (calllog.db)... Done.
[INFO] Extracting SMS/MMS messages (mmssms.db)... Done.
[WARN] Some app data directories are encrypted or inaccessible. Skipping.
[INFO] Extracting /sdcard/DCIM/... Photos extracted: 15, Videos extracted: 3.
[INFO] Extracting /sdcard/Downloads/... Files extracted: 7.
[INFO] Data extraction process completed.
[SUMMARY] Total data extracted: 1.2 GB. Issues encountered: 2 (minor).
`;

const RECOVERED_DATA_LS_KEY = 'forensic_simulation_recovered_data';


export default function DataExtractionPage() {
  const [isExtracting, setIsExtracting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [extractedData, setExtractedData] = useState<string>('');
  const [extractionLogs, setExtractionLogs] = useState<string>('');
  const [dataSource, setDataSource] = useState<'mock' | 'simulation'>('mock');

  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const sourceParam = searchParams.get('source');
    if (sourceParam === 'simulation') {
      const recoveredDataFromStorage = localStorage.getItem(RECOVERED_DATA_LS_KEY);
      if (recoveredDataFromStorage) {
        setExtractedData(recoveredDataFromStorage);
        setExtractionLogs(`[INFO] Data loaded from forensic simulation recovery process.\n[INFO] Displaying recovered data for analysis.`);
        setDataSource('simulation');
        toast({ title: "Recovered Data Loaded", description: "Displaying data from the recovery simulation." });
      } else {
        toast({ variant: "destructive", title: "Simulation Data Missing", description: "Could not load data from simulation. Using mock data." });
        setExtractedData(MOCK_EXTRACTED_DATA);
        setExtractionLogs(MOCK_EXTRACTION_LOGS);
        setDataSource('mock');
      }
    } else {
      // Default to mock data if no source or other source specified
      setExtractedData(MOCK_EXTRACTED_DATA);
      setExtractionLogs(MOCK_EXTRACTION_LOGS);
      setDataSource('mock');
    }
  }, [searchParams, toast]);


  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isExtracting && dataSource === 'mock') { // Only run progress for mock extraction
      setProgress(0);
      let currentProgress = 0;
      timer = setInterval(() => {
        currentProgress += 10;
        if (currentProgress <= 100) {
          setProgress(currentProgress);
        } else {
          clearInterval(timer);
          setIsExtracting(false);
          // Data already set by initial useEffect
          toast({ title: "Mock Extraction Complete", description: "Mock data extraction finished." });
        }
      }, 300);
    } else if (dataSource === 'simulation') {
        setIsExtracting(false); // Data is already "extracted" from simulation
    }
    return () => clearInterval(timer);
  }, [isExtracting, toast, dataSource]);

  const handleStartExtraction = () => {
    if (dataSource === 'simulation') {
        toast({ title: "Data Already Loaded", description: "Recovered data from simulation is already displayed."});
        return;
    }
    setIsExtracting(true);
    // setExtractedData(''); // Keep existing mock data until "extraction" completes
    // setExtractionLogs('');
    toast({ title: "Extraction Started", description: "Simulating mock data extraction..." });
  };

  const handleAnalyzeThreats = () => {
    if (extractedData) {
      const encodedData = encodeURIComponent(extractedData);
      router.push(`/threat-detection?extractedData=${encodedData}`);
    } else {
      toast({ variant: "destructive", title: "No Data", description: "Extract data first before analyzing threats." });
    }
  };

  return (
    <div className="space-y-6">
      <PageHeader 
        title="Data Extraction"
        description={dataSource === 'simulation' ? "Viewing recovered data from simulation." : "Simulate the mobile data extraction process and view mock results."}
        icon={DatabaseZap}
      />

      <Card className="shadow-lg">
        <CardHeader>
          <div className="flex items-center gap-3">
            <PlayCircle className="h-6 w-6 text-primary" />
            <CardTitle className="text-xl">Extraction Control</CardTitle>
          </div>
          <CardDescription>
            {dataSource === 'simulation' 
              ? "Data below is from the forensic recovery simulation."
              : "Initiate the simulated data extraction from a mobile device."}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {dataSource === 'mock' && (
            <Button onClick={handleStartExtraction} disabled={isExtracting} className="w-full sm:w-auto">
              {isExtracting ? (
                <>
                  <Activity className="mr-2 h-4 w-4 animate-spin" />
                  Extracting Mock Data...
                </>
              ) : (
                "Start Mock Extraction Process"
              )}
            </Button>
          )}
          {isExtracting && dataSource === 'mock' && (
            <div className="space-y-2">
              <Label>Mock Extraction Progress:</Label>
              <Progress value={progress} className="w-full" />
              <p className="text-sm text-muted-foreground text-center">{progress}% complete</p>
            </div>
          )}
           {dataSource === 'simulation' && (
             <p className="text-sm text-muted-foreground">Data was loaded from the recovery simulation. No further "extraction" needed here.</p>
           )}
        </CardContent>
      </Card>

      {((dataSource === 'mock' && !isExtracting && extractedData) || (dataSource === 'simulation' && extractedData)) && (
        <>
          <ResultDisplayCard title={dataSource === 'simulation' ? "Recovered Data (from Simulation)" : "Extracted Data (Mock)"} icon={FileText}>
            <Textarea value={extractedData} readOnly rows={15} className="font-mono text-xs bg-secondary/30" />
          </ResultDisplayCard>
          
          <ResultDisplayCard title={dataSource === 'simulation' ? "Simulation Load Log" : "Extraction Logs (Mock)"} icon={Terminal}>
            <Textarea value={extractionLogs} readOnly rows={10} className="font-mono text-xs bg-secondary/30" />
          </ResultDisplayCard>

          <Card className="shadow-lg">
            <CardHeader>
                <div className="flex items-center gap-3">
                    <ScanSearch className="h-6 w-6 text-primary" />
                    <CardTitle className="text-xl">Next Steps</CardTitle>
                </div>
              <CardDescription>Proceed to analyze the extracted data for potential threats.</CardDescription>
            </CardHeader>
            <CardContent>
              <Button onClick={handleAnalyzeThreats} className="w-full sm:w-auto">
                <ScanSearch className="mr-2 h-4 w-4" />
                Analyze with Threat Detection
              </Button>
            </CardContent>
          </Card>
        </>
      )}
      
      {dataSource === 'mock' && !isExtracting && !extractedData && (
         <Card className="shadow-lg">
            <CardContent className="pt-6 text-center">
              <DatabaseZap className="mx-auto h-12 w-12 text-muted-foreground opacity-50" />
              <p className="mt-4 text-muted-foreground">
                Click "Start Mock Extraction Process" to simulate data extraction.
              </p>
            </CardContent>
          </Card>
      )}

    </div>
  );
}
