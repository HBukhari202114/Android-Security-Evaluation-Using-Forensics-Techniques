
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, ShieldCheck, Recycle, DatabaseZap, ScanSearch, ShieldAlert } from 'lucide-react';

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
};

export const siteConfig = {
  name: "Mobile Forensics Hub",
  description: "Android security evaluation using forensic techniques.",
  sidebarNav: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Wipe Accuracy",
      href: "/wipe-accuracy",
      icon: ShieldCheck,
    },
    {
      title: "Recovery Potential",
      href: "/recovery-potential",
      icon: Recycle,
    },
    {
      title: "Data Extraction",
      href: "/data-extraction",
      icon: DatabaseZap,
    },
    {
      title: "Threat Detection",
      href: "/threat-detection",
      icon: ScanSearch,
    },
  ] satisfies NavItem[],
};
