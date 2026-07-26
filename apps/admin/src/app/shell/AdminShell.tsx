import { NavLink, Outlet, useLocation, useNavigate } from "react-router-dom";
import { useQueryClient } from "@tanstack/react-query";
import {
  Activity,
  BookOpenText,
  Brain,
  ClipboardList,
  Dog,
  HeartPulse,
  LayoutDashboard,
  LogOut,
  PawPrint,
  ServerCog,
  Users
} from "lucide-react";

import {
  Badge,
  Button,
  Separator,
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarInset,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarProvider,
  SidebarTrigger,
  TooltipProvider
} from "@repo/ui";

import { authApi } from "@modules/auth/api/authApi";
import { useAdminAuth, useResetAdminAuth } from "@modules/auth/hooks/useAdminAuth";

const NAV_SECTIONS = [
  {
    label: "Monitor",
    items: [
      { to: "/", label: "Overview", icon: LayoutDashboard, end: true },
      { to: "/system", label: "System & Logs", icon: ServerCog }
    ]
  },
  {
    label: "Data",
    items: [
      { to: "/users", label: "Users", icon: Users },
      { to: "/pets", label: "Pets", icon: Dog },
      { to: "/health-logs", label: "Health Logs", icon: HeartPulse },
      { to: "/ai-reports", label: "AI Reports", icon: Brain }
    ]
  },
  {
    label: "Knowledge Base",
    items: [
      // { to: "/preventive-care-rules", label: "Preventive Care", icon: ClipboardList },
      // { to: "/lifestyle-rules", label: "Lifestyle Rules", icon: Activity },
      // { to: "/species", label: "Species & Breeds", icon: BookOpenText }
    ]
  }
] as const;

function currentPageTitle(pathname: string): string {
  for (const section of NAV_SECTIONS) {
    for (const item of section.items) {
      if (item.to === "/" ? pathname === "/" : pathname.startsWith(item.to)) {
        return item.label;
      }
    }
  }
  return "Backoffice";
}

export function AdminShell() {
  const { user } = useAdminAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const queryClient = useQueryClient();
  const resetAuth = useResetAdminAuth();

  const handleLogout = async () => {
    await authApi.logout().catch(() => undefined);
    queryClient.clear();
    resetAuth();
    navigate("/login", { replace: true });
  };

  return (
    <TooltipProvider delayDuration={300}>
      <SidebarProvider>
      <Sidebar collapsible="icon">
        <SidebarHeader>
          <div className="flex items-center gap-2 px-2 py-1.5">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary/15 text-primary">
              <PawPrint className="size-4" />
            </div>
            <div className="min-w-0 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-sm font-semibold">Pet Health</p>
              <p className="truncate text-xs text-muted-foreground">Backoffice</p>
            </div>
          </div>
        </SidebarHeader>

        <SidebarContent>
          {NAV_SECTIONS.map((section) => (
            <SidebarGroup key={section.label}>
              <SidebarGroupLabel>{section.label}</SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {section.items.map((item) => {
                    const isActive =
                      item.to === "/"
                        ? location.pathname === "/"
                        : location.pathname.startsWith(item.to);
                    return (
                      <SidebarMenuItem key={item.to}>
                        <SidebarMenuButton
                          asChild
                          isActive={isActive}
                          tooltip={item.label}
                        >
                          <NavLink to={item.to}>
                            <item.icon className="size-4" />
                            <span>{item.label}</span>
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </SidebarContent>

        <SidebarFooter>
          <div className="flex items-center gap-2 rounded-lg px-2 py-1.5 group-data-[collapsible=icon]:justify-center">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-secondary text-xs font-semibold uppercase">
              {user?.name?.slice(0, 2) ?? "??"}
            </div>
            <div className="min-w-0 flex-1 group-data-[collapsible=icon]:hidden">
              <p className="truncate text-xs font-medium">{user?.name}</p>
              <p className="truncate text-xs text-muted-foreground">
                {user?.email}
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={handleLogout}
              title="Sign out"
              className="group-data-[collapsible=icon]:hidden"
            >
              <LogOut className="size-4" />
            </Button>
          </div>
        </SidebarFooter>
      </Sidebar>

      <SidebarInset>
        <header className="sticky top-0 z-10 flex h-14 items-center gap-3 border-b border-border bg-background/90 px-4 backdrop-blur">
          <SidebarTrigger />
          <Separator orientation="vertical" className="h-5" />
          <h2 className="text-sm font-medium">{currentPageTitle(location.pathname)}</h2>
          <div className="ml-auto flex items-center gap-2">
            <Badge variant="secondary">admin</Badge>
          </div>
        </header>
        <main className="flex-1 space-y-6 p-4 md:p-6">
          <Outlet />
        </main>
      </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
