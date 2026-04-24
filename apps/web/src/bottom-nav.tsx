import { Link, useRouterState } from "@tanstack/react-router";
import { IconUser, IconTrash, IconTag, IconLogOut } from "./icons";

type BottomNavProps = { onSignOut: () => void };

type NavItem = {
  to: string;
  label: string;
  icon: React.ReactNode;
};

const NAV_ITEMS: NavItem[] = [
  { to: "/contacts", label: "Contacts", icon: <IconUser size={22} /> },
  { to: "/trash", label: "Trash", icon: <IconTrash size={22} /> },
  { to: "/manage-labels", label: "Labels", icon: <IconTag size={22} /> },
];

const TAB: React.CSSProperties = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  justifyContent: "center",
  gap: 3,
  minHeight: 44,
  fontSize: 10,
  fontWeight: 500,
  color: "#64748b",
  textDecoration: "none",
  border: "none",
  background: "none",
  cursor: "pointer",
  padding: 0,
};

const TAB_ACTIVE: React.CSSProperties = {
  ...TAB,
  color: "#4f46e5",
};

const BAR: React.CSSProperties = {
  position: "fixed",
  insetInlineStart: 0,
  insetInlineEnd: 0,
  bottom: 0,
  height: 64,
  background: "#ffffff",
  borderBlockStart: "1px solid #e2e8f0",
  display: "flex",
  zIndex: 40,
};

export function BottomNav({ onSignOut }: BottomNavProps) {
  const router = useRouterState();
  const current = router.location.pathname;

  return (
    <nav style={BAR}>
      {NAV_ITEMS.map(({ to, label, icon }) => {
        const active = current === to || current.startsWith(to + "/");
        return (
          <Link key={to} to={to} style={active ? TAB_ACTIVE : TAB}>
            {icon}
            <span>{label}</span>
          </Link>
        );
      })}
      <button style={TAB} onClick={onSignOut} aria-label="Sign out">
        <IconLogOut size={22} />
        <span>Sign out</span>
      </button>
    </nav>
  );
}
