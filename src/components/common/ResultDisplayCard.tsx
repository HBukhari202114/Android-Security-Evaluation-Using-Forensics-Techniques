
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { LucideIcon } from 'lucide-react';

interface ResultDisplayCardProps {
  title: string;
  icon?: LucideIcon;
  children: React.ReactNode;
  description?: string;
  className?: string;
}

export function ResultDisplayCard({ title, icon: Icon, children, description, className }: ResultDisplayCardProps) {
  return (
    <Card className={`shadow-lg ${className}`}>
      <CardHeader>
        <div className="flex items-center gap-3">
          {Icon && <Icon className="h-6 w-6 text-primary" />}
          <CardTitle className="text-xl">{title}</CardTitle>
        </div>
        {description && <CardDescription>{description}</CardDescription>}
      </CardHeader>
      <CardContent className="space-y-3 text-sm">
        {children}
      </CardContent>
    </Card>
  );
}

export function ResultItem({ label, value }: { label: string; value?: string | number | null }) {
  if (value === undefined || value === null || value === '') {
    return null;
  }
  return (
    <div>
      <p className="font-semibold text-foreground">{label}:</p>
      <p className="text-muted-foreground whitespace-pre-wrap">{String(value)}</p>
    </div>
  );
}
