
import type { LucideIcon } from 'lucide-react';
import { SidebarTrigger } from '@/components/ui/sidebar';

interface PageHeaderProps {
  title: string;
  description?: string;
  icon?: LucideIcon;
}

export function PageHeader({ title, description, icon: Icon }: PageHeaderProps) {
  return (
    <div className="mb-6 p-4 bg-card border-b border-border rounded-lg shadow">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
           <div className="md:hidden"> {/* Show trigger only on mobile as sidebar is collapsible by default on desktop */}
            <SidebarTrigger />
          </div>
          {Icon && <Icon className="h-8 w-8 text-primary" />}
          <div>
            <h1 className="text-2xl font-bold text-foreground">{title}</h1>
            {description && <p className="text-muted-foreground">{description}</p>}
          </div>
        </div>
        {/* Add actions here if needed, e.g. <Button>New Scan</Button> */}
      </div>
    </div>
  );
}
