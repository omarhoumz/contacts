import { Link, useRouterState } from "@tanstack/react-router";
import { Moon, Sun } from "lucide-react";
import { IconUser, IconTrash, IconTag, IconLogOut, IconMerge, IconUpload, IconMoreHorizontal } from "./icons";
import { cn } from "./lib/cn";
import { Button } from "./components/ui/button";
import { useState } from "react";

type BottomNavProps = {
  onSignOut: () => void;
  themeMode: "light" | "dark";
  onToggleTheme: () => void;
};

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

export function BottomNav({ onSignOut, themeMode, onToggleTheme }: BottomNavProps) {
  const router = useRouterState();
  const current = router.location.pathname;
  const [menuOpen, setMenuOpen] = useState(false);

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
        type="button"
        variant="ghost"
        className="h-auto min-h-11 flex-1 flex-col gap-0.5 rounded-none p-0 text-[10px] text-muted-foreground"
        onClick={() => setMenuOpen((v) => !v)}
        aria-expanded={menuOpen}
        aria-controls="bottom-nav-more-menu"
        aria-label="More actions"
      >
        <IconMoreHorizontal size={22} />
        <span>More</span>
      </Button>
      {menuOpen ? (
        <div
          id="bottom-nav-more-menu"
          className="fixed bottom-[4.5rem] right-3 z-50 w-52 rounded-md border bg-background p-1.5 shadow-lg"
        >
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start gap-2 text-sm"
            onClick={() => {
              setMenuOpen(false);
              onToggleTheme();
            }}
          >
            {themeMode === "dark" ? <Sun size={16} /> : <Moon size={16} />}
            {themeMode === "dark" ? "Light mode" : "Dark mode"}
          </Button>
          <Button type="button" variant="ghost" className="w-full justify-start gap-2 text-sm" disabled>
            <IconMerge size={16} />
            Merge (soon)
          </Button>
          <Button type="button" variant="ghost" className="w-full justify-start gap-2 text-sm" disabled>
            <IconUpload size={16} />
            Import/Export (soon)
          </Button>
          <Button
            type="button"
            variant="ghost"
            className="w-full justify-start gap-2 text-sm text-destructive hover:text-destructive"
            onClick={() => {
              setMenuOpen(false);
              onSignOut();
            }}
          >
            <IconLogOut size={16} />
            Sign out
          </Button>
        </div>
      ) : null}
    </nav>
  );
}
