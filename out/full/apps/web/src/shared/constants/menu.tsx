import { Icon } from "@repo/ui"
export interface MenuItem {
    title: string;
    url: string;
    icon: React.ReactNode;
}
export const menuItems: MenuItem[] = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <Icon name="dashboard" />,
    },
    {
      title:"Pets",
      url:"/dashboard/pets",
      icon: <Icon name="pets" />,
    },
    {
      title:"Settings",
      url:"/dashboard/settings",
      icon: <Icon name="settings" />,
    },
  ]