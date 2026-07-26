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
      title: "Pets",
      url: "/dashboard/pets",
      icon: <Icon name="pets" />,
    },
    {
      title: "Calendar",
      url: "/dashboard/calendar",
      icon: <Icon name="calendar_month" />,
    },
    {
      title: "Nearby Care",
      url: "/dashboard/maps",
      icon: <Icon name="location_on" />,
    },
    {
      title: "Neighbourhood",
      url: "/dashboard/neighbourhood",
      icon: <Icon name="diversity_1" />,
    },
    {
      title: "Settings",
      url: "/dashboard/settings",
      icon: <Icon name="settings" />,
    },
  ]
