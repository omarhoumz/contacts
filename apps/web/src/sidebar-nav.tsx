import { Link, useRouterState } from "@tanstack/react-router";
import { ui, SIDEBAR_W, SIDEBAR_W_COLLAPSED } from "./ui-styles";
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

type SidebarNavProps = {
  sessionEmail: string | null;
  authBusy: boolean;
  collapsed: boolean;
  onToggleCollapse: () => void;
  onSignOut: () => void;
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
}: SidebarNavProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const w = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W;

  return (
    <nav style={{ ...ui.sidebar, width: w }}>
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div
        style={{
          ...ui.sidebarHeader,
          ...(collapsed ? ui.sidebarHeaderCollapsed : {}),
        }}
      >
        {!collapsed && (
          <div style={ui.sidebarBranding}>
            <p style={ui.sidebarAppName}>WidadOS</p>
            {sessionEmail ? <p style={ui.sidebarEmail}>{sessionEmail}</p> : null}
          </div>
        )}

        <button
          onClick={onToggleCollapse}
          style={ui.sidebarToggleBtn}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <IconChevronsRight size={16} /> : <IconChevronsLeft size={16} />}
        </button>
      </div>

      {/* ── Nav list ──────────────────────────────────────────────────────── */}
      <ul style={ui.navList}>
        {NAV_ORDER.map((item) => {
          const itemStyle = {
            ...ui.navItem,
            ...(collapsed ? ui.navItemCollapsed : {}),
          };

          if (item.kind === "route") {
            const isActive = pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  style={{ ...itemStyle, ...(isActive ? ui.navItemActive : {}) }}
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
                style={{ ...itemStyle, ...ui.navItemDisabled }}
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

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <div
        style={{
          ...ui.sidebarFooter,
          ...(collapsed ? ui.sidebarFooterCollapsed : {}),
        }}
      >
        <button
          onClick={onSignOut}
          disabled={authBusy}
          style={ui.signOutBtn}
          title={collapsed ? "Sign out" : undefined}
          aria-label={collapsed ? "Sign out" : undefined}
        >
          <IconLogOut size={14} />
          {!collapsed && (authBusy ? "Signing out…" : "Sign out")}
        </button>
      </div>
    </nav>
  );
}
