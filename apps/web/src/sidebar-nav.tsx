import { Link, useRouterState } from "@tanstack/react-router";
import { ui } from "./ui-styles";
import { IconUser, IconMerge, IconUpload, IconTrash, IconTag } from "./icons";

type SidebarNavProps = {
  sessionEmail: string | null;
  authBusy: boolean;
  onSignOut: () => void;
};

// Order matches the mockup: Contacts → Fix & Merge → Import → Trash → Manage Labels
const ACTIVE_ROUTES = [
  { to: "/contacts",       label: "Contacts",       Icon: IconUser  },
  { to: "/trash",          label: "Trash",           Icon: IconTrash },
  { to: "/manage-labels",  label: "Manage Labels",   Icon: IconTag   },
] as const;

const STUB_ITEMS = [
  { label: "Fix & Merge", Icon: IconMerge  },
  { label: "Import",      Icon: IconUpload },
] as const;

// Rendered in the correct visual order: Contacts, Fix & Merge, Import, Trash, Manage Labels
const NAV_ORDER: Array<
  | { kind: "route"; to: string; label: string; Icon: (p: { size?: number }) => JSX.Element }
  | { kind: "stub";  label: string; Icon: (p: { size?: number }) => JSX.Element }
> = [
  { kind: "route", ...ACTIVE_ROUTES[0] },           // Contacts
  { kind: "stub",  ...STUB_ITEMS[0]   },             // Fix & Merge
  { kind: "stub",  ...STUB_ITEMS[1]   },             // Import
  { kind: "route", ...ACTIVE_ROUTES[1] },            // Trash
  { kind: "route", ...ACTIVE_ROUTES[2] },            // Manage Labels
];

export function SidebarNav({ sessionEmail, authBusy, onSignOut }: SidebarNavProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav style={ui.sidebar}>
      {/* Header */}
      <div style={ui.sidebarHeader}>
        <p style={ui.sidebarAppName}>WidadOS</p>
        {sessionEmail ? <p style={ui.sidebarEmail}>{sessionEmail}</p> : null}
      </div>

      {/* Nav list */}
      <ul style={ui.navList}>
        {NAV_ORDER.map((item) => {
          if (item.kind === "route") {
            const isActive = pathname === item.to || pathname.startsWith(item.to + "/");
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  style={{ ...ui.navItem, ...(isActive ? ui.navItemActive : {}) }}
                >
                  <item.Icon size={16} />
                  {item.label}
                </Link>
              </li>
            );
          }
          return (
            <li key={item.label}>
              <span style={{ ...ui.navItem, ...ui.navItemDisabled }}>
                <item.Icon size={16} />
                {item.label}
                <span style={ui.navBadge}>soon</span>
              </span>
            </li>
          );
        })}
      </ul>

      {/* Footer */}
      <div style={ui.sidebarFooter}>
        <button onClick={onSignOut} disabled={authBusy} style={ui.signOutBtn}>
          {authBusy ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </nav>
  );
}
