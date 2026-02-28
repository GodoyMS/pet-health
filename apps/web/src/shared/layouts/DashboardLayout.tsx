import {
  SidebarInset,
  SidebarProvider,
  Sidebar,
  SidebarTrigger,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  TooltipProvider,
  Button,
  Icon,
  useSidebar,
} from "@repo/ui";
import NavMain from "@shared/components/NavMain";
import NavUser from "@shared/components/NavUser";
import { menuItems } from "@shared/constants/menu";
import React from "react";
import { Link, Outlet } from "react-router-dom";

const DashboardLayout = () => {
  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <TooltipProvider>
        <AppSidebar variant="inset" />
        <SidebarInset>
          <SidebarTrigger />
          <Outlet />
        </SidebarInset>
      </TooltipProvider>
    </SidebarProvider>
  );
};

export default DashboardLayout;

export function AppSidebar({ ...props }: React.ComponentProps<typeof Sidebar>) {
    const {state  } = useSidebar();
  return (
    <Sidebar className="gradient-sidebar"  collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              asChild
              className="data-[slot=sidebar-menu-button]:!p-1.5"
            >
              <Link to="/dashboard">
                <span className="text-base text-center w-full text-secondary  font-semibold">Pet Health</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent className="flex flex-col gap-4">
            <SidebarMenu>
              <SidebarMenuItem className="flex items-center gap-2">
                <Button className="w-full text-secondary"  variant="flat">{state === "expanded" && "Create Pet" } <Icon name="add" /></Button>
              </SidebarMenuItem>
            </SidebarMenu>
            <SidebarMenu className="flex flex-col gap-1">
              <NavMain items={menuItems} />
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter>
        <NavUser/>
        {/* <NavUser user={data.user} /> */}</SidebarFooter>
    </Sidebar>
  );
}
