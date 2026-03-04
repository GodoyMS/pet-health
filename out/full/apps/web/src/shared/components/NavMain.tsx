import { SidebarMenuButton, SidebarMenuItem } from "@repo/ui";
import { MenuItem } from "@shared/constants/menu";
import { Link, useLocation } from "react-router-dom";

const NavMain = ({ items }: { items: MenuItem[] }) => {
  const pathname = useLocation().pathname;
  console.log(pathname);
  return (
    <>
      {items.map((item) => (
        <SidebarMenuItem key={item.title}>
          <SidebarMenuButton
            asChild
            variant="sidebar-item"
            isActive={pathname === item.url}
            tooltip={item.title}
            size="lg"
          >
            <Link to={item.url}>
              {item.icon}
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ))}
    </>
  );
};

export default NavMain;
