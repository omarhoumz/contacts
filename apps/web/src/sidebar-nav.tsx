import { Link, useRouterState } from "@tanstack/react-router";
import { ui } from "./ui-styles";

type SidebarNavProps = {
  sessionEmail: string | null;
  authBusy: boolean;
  onSignOut: () => void;
};

const ACTIVE_ROUTES = [
  { to: "/contacts", label: "Contacts" },
  { to: "/trash", label: "Trash" },
] as const;

const STUB_ITEMS = ["Fix & Merge", "Import", "Manage Labels"] as const;

export function SidebarNav({ sessionEmail, authBusy, onSignOut }: SidebarNavProps) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });

  return (
    <nav style={ui.sidebar}>
      <div style={ui.sidebarHeader}>
        <p style={ui.sidebarAppName}>WidadOS</p>
        {sessionEmail ? <p style={ui.sidebarEmail}>{sessionEmail}</p> : null}
      </div>

      <ul style={ui.navList}>
        {ACTIVE_ROUTES.map(({ to, label }) => {
          const isActive = pathname === to || pathname.startsWith(to + "/");
          return (
            <li key={to}>
              <Link
                to={to}
                style={{
                  ...ui.navItem,
                  ...(isActive ? ui.navItemActive : {}),
                }}
              >
                {label}
              </Link>
            </li>
          );
        })}

        {STUB_ITEMS.map((label) => (
          <li key={label}>
            <span style={{ ...ui.navItem, ...ui.navItemDisabled }}>
              {label}
              <span style={ui.navBadge}>soon</span>
            </span>
          </li>
        ))}
      </ul>

      <div style={ui.sidebarFooter}>
        <button onClick={onSignOut} disabled={authBusy} style={ui.signOutBtn}>
          {authBusy ? "Signing out…" : "Sign out"}
        </button>
      </div>
    </nav>
  );
}
