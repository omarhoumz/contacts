import { Link, useRouterState } from "@tanstack/react-router";
import { IconUser, IconTrash, IconTag, IconLogOut } from "./icons";
import { cn } from "./lib/cn";
import { Button } from "./components/ui/button";

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

export function BottomNav({ onSignOut }: BottomNavProps) {
  const router = useRouterState();
  const current = router.location.pathname;

  return (
    <nav className="fixed inset-x-0 bottom-0 z-40 flex h-16 border-t bg-background">
      {NAV_ITEMS.map(({ to, label, icon }) => {
        const active = current === to || current.startsWith(to + "/");
        return (
          <Link
            key={to}
            to={to}
            className={cn(
              "flex min-h-11 flex-1 flex-col items-center justify-center gap-0.5 text-[10px] font-medium no-underline",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            {icon}
            <span>{label}</span>
          </Link>
        );
      })}
      <Button
        variant="ghost"
        className="h-auto min-h-11 flex-1 flex-col gap-0.5 rounded-none p-0 text-[10px] text-muted-foreground"
        onClick={onSignOut}
        aria-label="Sign out"
      >
        <IconLogOut size={22} />
        <span>Sign out</span>
      </Button>
    </nav>
  );
}
