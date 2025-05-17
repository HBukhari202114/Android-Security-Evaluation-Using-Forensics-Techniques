
import type { LucideIcon } from 'lucide-react';
import { LayoutDashboard, ShieldCheck, Recycle, DatabaseZap, ScanSearch, ShieldAlert, Microscope } from 'lucide-react'; // Added Microscope

export type NavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  label?: string;
  disabled?: boolean;
};

export const siteConfig = {
  name: "Android Forensics Hub",
  description: "Android security evaluation using forensic techniques.",
  sidebarNav: [
    {
      title: "Dashboard",
      href: "/dashboard",
      icon: LayoutDashboard,
    },
    {
      title: "Forensic Simulation", // New Page
      href: "/forensic-simulation",
      icon: Microscope, 
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

