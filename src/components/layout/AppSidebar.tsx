
"use client";

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LogOut, ShieldHalf } from 'lucide-react';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { siteConfig } from '@/config/site';
import { useAuth } from '@/contexts/AuthContext';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

export function AppSidebar() {
  const pathname = usePathname();
  const { logout } = useAuth();

  return (
    <Sidebar collapsible="icon" variant="sidebar" className="border-r border-sidebar-border shadow-lg">
      <SidebarHeader className="p-4 flex items-center gap-3 group-data-[collapsible=icon]:justify-center">
        <ShieldHalf className="h-8 w-8 text-sidebar-primary flex-shrink-0" />
        <h1 className={cn(
            "text-xl font-semibold text-sidebar-foreground group-data-[collapsible=icon]:hidden",
            "transition-opacity duration-300 ease-in-out"
          )}>
          {siteConfig.name}
        </h1>
      </SidebarHeader>
      
      <SidebarContent className="p-2">
        <SidebarMenu>
          {siteConfig.sidebarNav.map((item) => (
            <SidebarMenuItem key={item.href}>
              <Link href={item.href} passHref legacyBehavior>
                <SidebarMenuButton
                  isActive={pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))}
                  tooltip={{ children: item.title, className: "bg-sidebar text-sidebar-foreground border-sidebar-border" }}
                  className={cn(
                    "justify-start text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                    (pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href))) && 
                    "bg-sidebar-accent text-sidebar-accent-foreground font-semibold"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  <span className="group-data-[collapsible=icon]:hidden">{item.title}</span>
                </SidebarMenuButton>
              </Link>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="p-4 mt-auto group-data-[collapsible=icon]:p-2">
        <Button
          variant="ghost"
          onClick={logout}
          className={cn(
            "w-full justify-start gap-2 text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:justify-center",
            "group-data-[collapsible=icon]:w-auto group-data-[collapsible=icon]:h-auto group-data-[collapsible=icon]:p-2"
          )}
        >
          <LogOut className="h-5 w-5" />
          <span className="group-data-[collapsible=icon]:hidden">Logout</span>
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
