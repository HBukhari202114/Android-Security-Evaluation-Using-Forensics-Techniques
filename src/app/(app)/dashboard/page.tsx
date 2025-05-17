
import { PageHeader } from "@/components/layout/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LayoutDashboard, ShieldCheck, Recycle, DatabaseZap, ScanSearch } from "lucide-react";
import Image from "next/image";

const quickLinks = [
  { title: "Wipe Accuracy", href: "/wipe-accuracy", icon: ShieldCheck, description: "Assess data wipe effectiveness.", hint: "security technology" },
  { title: "Recovery Potential", href: "/recovery-potential", icon: Recycle, description: "Analyze data recovery chances.", hint: "data analysis" },
  { title: "Data Extraction", href: "/data-extraction", icon: DatabaseZap, description: "Simulate mobile data extraction.", hint: "mobile device" },
  { title: "Threat Detection", href: "/threat-detection", icon: ScanSearch, description: "Scan data for potential threats.", hint: "cyber security" },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <PageHeader 
        title="Dashboard" 
        description="Welcome to Mobile Forensics Hub. Access tools and analysis below."
        icon={LayoutDashboard}
      />

      <Card className="shadow-lg">
        <CardHeader>
          <CardTitle className="text-xl">Overview</CardTitle>
          <CardDescription>
            Mobile Forensics Hub provides AI-powered tools for Android security evaluation.
            Navigate through the features using the sidebar or the quick links below.
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6 md:grid-cols-2">
          <div className="space-y-4">
            <p className="text-foreground">
              This platform assists in analyzing mobile device data, assessing wipe accuracy, 
              evaluating recovery potential, simulating data extraction, and detecting threats. 
              Utilize the AI-driven insights to enhance your forensic investigations.
            </p>
             <Image 
              src="https://placehold.co/600x400.png"
              alt="Forensic analysis illustration"
              width={600}
              height={400}
              className="rounded-lg object-cover"
              data-ai-hint="forensics investigation"
            />
          </div>
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Quick Access</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {quickLinks.map((link) => (
                <Link href={link.href} key={link.title} passHref>
                  <Card className="hover:shadow-md transition-shadow h-full flex flex-col">
                    <CardHeader className="flex flex-row items-center justify-between pb-2">
                       <CardTitle className="text-sm font-medium">{link.title}</CardTitle>
                       <link.icon className="h-5 w-5 text-muted-foreground" />
                    </CardHeader>
                    <CardContent className="flex-grow">
                       <p className="text-xs text-muted-foreground">{link.description}</p>
                    </CardContent>
                    <CardContent className="pt-0">
                       <Button variant="outline" size="sm" className="w-full">Go to {link.title}</Button>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
