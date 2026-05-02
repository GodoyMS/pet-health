import React, { useMemo, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

import {
  Button,
  Icon,
  Item,
  ItemContent,
  ItemDescription,
  ItemMedia,
  ItemTitle,
  Popover,
  PopoverContent,
  PopoverTrigger,
  ScrollArea,
  Separator,
  SidebarTrigger,
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@repo/ui";

import { petsApi } from "@modules/pets/api/petsApi";
import { useGetUser } from "@shared/hooks/useGetUser";
import { useLogout } from "@shared/hooks/useLogout";
import { buildDashboardBreadcrumbs } from "@shared/utils/dashboardBreadcrumbs";

const MOCK_NOTIFICATIONS = [
  {
    id: "1",
    title: "Vaccination reminder",
    description: "Buddy is due for a booster shot this month.",
    time: "2h ago",
    unread: true
  },
  {
    id: "2",
    title: "Weight logged",
    description: "New entry recorded for Whiskers.",
    time: "Yesterday",
    unread: true
  },
  {
    id: "3",
    title: "AI Summary ready",
    description: "Your weekly health digest is available.",
    time: "3 days ago",
    unread: false
  }
] as const;

export function DashboardHeader() {
  const { pathname } = useLocation();
  const { data: user } = useGetUser();
  const logoutMutation = useLogout();
  const [notifOpen, setNotifOpen] = useState(false);
  const [userOpen, setUserOpen] = useState(false);

  const petIdFromPath = useMemo(() => {
    const m = pathname.match(/^\/dashboard\/pets\/([^/]+)/);
    return m?.[1];
  }, [pathname]);

  const { data: petForCrumb } = useQuery({
    queryKey: ["pets", petIdFromPath],
    enabled: Boolean(petIdFromPath),
    queryFn: async () => {
      const res = await petsApi.get(petIdFromPath!);
      return res.data;
    }
  });

  const crumbs = useMemo(
    () =>
      buildDashboardBreadcrumbs(pathname, {
        petName: petForCrumb?.name
      }),
    [pathname, petForCrumb?.name]
  );

  const unreadCount = MOCK_NOTIFICATIONS.filter((n) => n.unread).length;

  const initials =
    user?.name?.trim()?.slice(0, 2).toUpperCase() ?? user?.email?.[0]?.toUpperCase() ?? "U";

  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-3 border-b border-border/50 bg-background/85 px-3 backdrop-blur-md supports-[backdrop-filter]:bg-background/70 sm:px-4">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Tooltip>
          <TooltipTrigger asChild>
            <SidebarTrigger className="-ml-1 text-muted-foreground hover:text-foreground [&_svg]:size-5" />
          </TooltipTrigger>
          <TooltipContent side="bottom" className="text-xs">
            Toggle sidebar
          </TooltipContent>
        </Tooltip>

        <Separator orientation="vertical" className="mx-0.5 hidden h-6 sm:block" />

        <nav
          className="flex min-w-0 flex-1 items-center gap-1 overflow-x-auto py-1 text-sm sm:gap-1.5"
          aria-label="Breadcrumb"
        >
          <ol className="flex min-w-0 items-center gap-1">
            {crumbs.map((c, i) => {
              const isLast = i === crumbs.length - 1;
              return (
                <li key={`${c.label}-${i}`} className="flex min-w-0 items-center gap-1">
                  {i > 0 ? (
                    <Icon
                      name="chevron_right"
                      className="size-3.5 shrink-0 text-muted-foreground/70"
                      aria-hidden
                    />
                  ) : null}
                  {c.href && !isLast ? (
                    <Link
                      to={c.href}
                      className="truncate text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {c.label}
                    </Link>
                  ) : (
                    <span
                      className={
                        isLast
                          ? "truncate font-medium text-foreground"
                          : "truncate text-muted-foreground"
                      }
                      aria-current={isLast ? "page" : undefined}
                    >
                      {c.label}
                    </span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      </div>

      <div className="flex shrink-0 items-center gap-1 sm:gap-2">
        <Popover open={notifOpen} onOpenChange={setNotifOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="icon-sm"
              className="relative text-muted-foreground hover:text-foreground"
              aria-label="Notifications"
            >
              <Icon name="notifications" className="size-[1.35rem]" />
              {unreadCount > 0 ? (
                <span className="absolute -right-0.5 -top-0.5 flex size-4 items-center justify-center rounded-full bg-primary text-[10px] font-semibold text-primary-foreground ring-2 ring-background">
                  {unreadCount}
                </span>
              ) : null}
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-[min(100vw-2rem,22rem)] p-0 shadow-lg ring-1 ring-border/60"
          >
            <div className="border-b border-border/60 px-3 py-2.5">
              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                Notifications
              </p>
            </div>
            <ScrollArea className="max-h-[min(70vh,320px)]">
              <div className="flex flex-col gap-0.5 p-1.5">
                {MOCK_NOTIFICATIONS.map((n) => (
                  <button
                    key={n.id}
                    type="button"
                    className="w-full rounded-lg text-left outline-none transition-colors hover:bg-muted/80 focus-visible:ring-2 focus-visible:ring-ring"
                    onClick={() => setNotifOpen(false)}
                  >
                    <Item size="sm" variant="muted" className="border-0">
                      <ItemMedia variant="icon" className="bg-primary/10">
                        <Icon
                          name={n.unread ? "mark_email_unread" : "notifications"}
                          className="size-4 text-primary"
                        />
                      </ItemMedia>
                      <ItemContent>
                        <ItemTitle className="text-sm font-medium leading-snug">
                          {n.title}
                        </ItemTitle>
                        <ItemDescription className="line-clamp-2 text-xs">
                          {n.description}
                        </ItemDescription>
                        <span className="mt-1 block text-[10px] text-muted-foreground">
                          {n.time}
                        </span>
                      </ItemContent>
                    </Item>
                  </button>
                ))}
              </div>
            </ScrollArea>
            <div className="border-t border-border/60 p-2">
              <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground">
                View all activity
              </Button>
            </div>
          </PopoverContent>
        </Popover>

        <Separator orientation="vertical" className="hidden h-6 sm:block" />

        <Popover open={userOpen} onOpenChange={setUserOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="ghost"
              size="sm"
              className="gap-2 rounded-full pl-1 pr-2 text-muted-foreground hover:text-foreground"
              aria-label="Account menu"
            >
              <span className="flex size-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                {initials}
              </span>
              <span className="hidden max-w-[9rem] truncate text-sm font-medium text-foreground lg:inline">
                {user?.name ?? user?.email ?? "Account"}
              </span>
              <Icon name="expand_more" className="size-4 opacity-60" aria-hidden />
            </Button>
          </PopoverTrigger>
          <PopoverContent
            align="end"
            sideOffset={8}
            className="w-56 p-1 shadow-lg ring-1 ring-border/60"
          >
            <div className="border-b border-border/50 px-2 py-2">
              <p className="truncate text-sm font-medium text-foreground">
                {user?.name ?? "Signed in"}
              </p>
              {user?.email ? (
                <p className="truncate text-xs text-muted-foreground">{user.email}</p>
              ) : null}
            </div>
            <div className="flex flex-col gap-0.5 p-1">
              <Button variant="ghost" size="sm" className="justify-start font-normal" asChild>
                <Link to="/dashboard/account" onClick={() => setUserOpen(false)}>
                  <Icon name="person" className="mr-2 size-4 opacity-70" aria-hidden />
                  Account
                </Link>
              </Button>
              <Separator className="my-0.5" />
              <Button
                variant="ghost"
                size="sm"
                className="justify-start font-normal text-destructive hover:bg-destructive/10 hover:text-destructive"
                disabled={logoutMutation.isPending}
                onClick={() => {
                  setUserOpen(false);
                  logoutMutation.mutate();
                }}
              >
                {logoutMutation.isPending ? (
                  <Icon name="progress_activity" className="mr-2 size-4 animate-spin" />
                ) : (
                  <Icon name="logout" className="mr-2 size-4 opacity-70" aria-hidden />
                )}
                Logout
              </Button>
            </div>
          </PopoverContent>
        </Popover>
      </div>
    </header>
  );
}
