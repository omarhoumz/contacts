import { Link, useRouterState } from "@tanstack/react-router";
import {
  IconUser,
  IconMerge,
  IconUpload,
  IconTrash,
  IconTag,
  IconChevronsLeft,
  IconChevronsRight,
  IconLogOut,
} from "./icons";
import { Button } from "./components/ui/button";
import { cn } from "./lib/cn";

type SidebarNavProps = {
  sessionEmail: string | null;
  authBusy: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSignOut: () => void;
  themeMode: "light" | "dark";
  onToggleTheme: () => void;
};

// Order matches the mockup: Contacts → Fix & Merge → Import → Trash → Manage Labels
const NAV_ORDER: Array<
  | { kind: "route"; to: string; label: string; Icon: (p: { size?: number }) => JSX.Element }
  | { kind: "stub"; label: string; Icon: (p: { size?: number }) => JSX.Element }
> = [
  { kind: "route", to: "/contacts",      label: "Contacts",      Icon: IconUser   },
  { kind: "stub",  label: "Fix & Merge",                          Icon: IconMerge  },
  { kind: "stub",  label: "Import",                               Icon: IconUpload },
  { kind: "route", to: "/trash",         label: "Trash",          Icon: IconTrash  },
  { kind: "route", to: "/manage-labels", label: "Manage Labels",  Icon: IconTag    },
];

export function SidebarNav({
  sessionEmail,
  authBusy,
  collapsed,
  onToggleCollapse,
  onSignOut,
  themeMode,
  onToggleTheme,
}: SidebarNavProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav
      className={cn(
        "fixed inset-y-0 left-0 z-30 flex flex-col overflow-hidden border-r bg-background transition-[width]",
        collapsed ? "w-12" : "w-[220px]",
      )}
    >
      <div
        className={cn(
          "flex w-full items-center gap-2 overflow-hidden border-b px-5 pb-3 pt-5",
          collapsed && "justify-center px-0",
        )}
      >
        {!collapsed && (
          <div className="min-w-0 flex-1 overflow-hidden">
            <p className="m-0 whitespace-nowrap text-xl font-bold tracking-tight text-foreground">WidadOS</p>
            {sessionEmail ? (
              <p className="m-0 mt-1 truncate text-xs text-muted-foreground">{sessionEmail}</p>
            ) : null}
          </div>
        )}

        <Button
          onClick={onToggleCollapse}
          variant="ghost"
          size="icon"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <IconChevronsRight size={16} /> : <IconChevronsLeft size={16} />}
        </Button>
      </div>

      <ul className="m-0 flex flex-1 list-none flex-col overflow-hidden p-0 py-1">
        {NAV_ORDER.map((item) => {
          if (item.kind === "route") {
            const isActive = pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={cn(
                    "flex w-full items-center gap-2 overflow-hidden border-l-4 border-transparent px-4 py-3 text-sm text-muted-foreground no-underline",
                    collapsed && "justify-center px-0",
                    isActive && "border-l-primary bg-secondary text-primary font-semibold",
                  )}
                  title={collapsed ? item.label : undefined}
                  aria-label={collapsed ? item.label : undefined}
                >
                  <item.Icon size={16} />
                  {!collapsed && item.label}
                </Link>
              </li>
            );
          }

          return (
            <li key={item.label}>
              <span
                className={cn(
                  "pointer-events-none flex w-full items-center gap-2 overflow-hidden border-l-4 border-transparent px-4 py-3 text-sm text-muted-foreground opacity-70",
                  collapsed && "justify-center px-0",
                )}
                title={collapsed ? item.label : undefined}
                aria-label={collapsed ? item.label : undefined}
              >
                <item.Icon size={16} />
                {!collapsed && item.label}
              </span>
            </li>
          );
        })}
      </ul>

      <div
        className={cn(
          "border-t px-5 py-3",
          collapsed && "flex justify-center px-0",
        )}
      >
        {!collapsed && (
          <Button
            onClick={onToggleTheme}
            variant="secondary"
            size="sm"
            className="mb-2 w-full"
            aria-label="Toggle theme"
          >
            {themeMode === "dark" ? "Light mode" : "Dark mode"}
          </Button>
        )}
        <Button
          onClick={onSignOut}
          disabled={authBusy}
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          className={cn(
            "hover:bg-transparent",
            collapsed
              ? "text-destructive"
              : "w-full justify-start px-1 text-sm font-medium text-destructive/90 hover:text-destructive",
          )}
          title={collapsed ? "Sign out" : undefined}
          aria-label={collapsed ? "Sign out" : undefined}
        >
          {collapsed ? <IconLogOut size={14} /> : (authBusy ? "Signing out…" : "Sign out")}
        </Button>
      </div>
    </nav>
  );
}
