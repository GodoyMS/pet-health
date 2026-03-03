import { authApi } from "@modules/auth/api/authApi";
import { Icon, SidebarMenuButton, SidebarMenuItem, useSidebar } from "@repo/ui";
import { useGetUser } from "@shared/hooks/useGetUser";
import { useLogout } from "@shared/hooks/useLogout";
import { useQuery } from "@tanstack/react-query";

const NavUser = () => {
  const { data: user, isLoading, isError } = useGetUser();
  const { mutate: logout, isPending } = useLogout();
  const { state } = useSidebar();

  if (isLoading) {
    return (
      <div className="flex items-center text-xs justify-center">
        Loading user...
      </div>
    );
  }
  if (isError) {
    return <div className="flex text-xs items-center justify-center">Error fetching user</div>;
  }
  if (!user) {
    return (
      <div className="flex text-xs items-center justify-center">
        <Icon name="user" className="w-4 h-4" />
      </div>
    );
  }

  return (
    <div className=" py-4 border-t border-sidebar-border">
      <div className="flex items-center gap-3  mb-3">
        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-xs font-bold text-primary-foreground">
          {user?.name?.[0] || "U"}
        </div>
        {state === "expanded" && (
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium text-sidebar-foreground truncate">
              {user?.name}
            </p>
            <p className="text-[10px] text-sidebar-foreground/50 truncate">
              {user?.email}
            </p>
          </div>
        )}
      </div>
      <SidebarMenuItem>
        <SidebarMenuButton
          variant="sidebar-item"
          tooltip={"Logout"}
          size="lg"
          onClick={() => logout()}
        >
          {state === "expanded" ? (
            <>
              {isPending ? (
                <Icon name="loader" className="w-4 h-4 animate-spin" />
              ) : (
                <Icon name="logout" className="w-4 h-4" />
              )}
              {isPending ? "Signing out..." : "Sign Out"}
            </>
          ) : (
            <span>
              <Icon name="logout" className="w-4 h-4 animate-spin" />
            </span>
          )}
        </SidebarMenuButton>
      </SidebarMenuItem>
    </div>
  );
};

export default NavUser;
