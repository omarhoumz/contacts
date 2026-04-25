import { useState, useCallback, useEffect, type ReactNode } from "react";
import { SidebarNav } from "./sidebar-nav";
import { BottomNav } from "./bottom-nav";
import { useWebApp } from "./web-app-context";
import { useBreakpoint } from "./use-breakpoint";
import { cn } from "./lib/cn";

const LS_KEY = "sidebar-collapsed";

function readCollapsed(): boolean {
  try {
    return localStorage.getItem(LS_KEY) === "1";
  } catch {
    return false;
  }
}

type AppShellProps = { children: ReactNode };

export function AppShell({ children }: AppShellProps) {
  const s = useWebApp();
  const bp = useBreakpoint();
  const [collapsed, setCollapsed] = useState<boolean>(readCollapsed);

  // Tablet → auto-collapse; desktop → restore user's explicit preference
  useEffect(() => {
    if (bp === "tablet") setCollapsed(true);
    if (bp === "desktop") setCollapsed(readCollapsed());
    // mobile: sidebar hidden entirely, state irrelevant
  }, [bp]);

  const toggleCollapsed = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        localStorage.setItem(LS_KEY, next ? "1" : "0");
      } catch {
        // ignore
      }
      return next;
    });
  }, []);

  const isMobile = bp === "mobile";
  const shellMarginClass = isMobile ? "ml-0" : collapsed ? "ml-12" : "ml-[220px]";

  return (
    <div
      className={cn("min-h-screen bg-background transition-[margin] rtl:mr-0", shellMarginClass)}
    >
      {!isMobile && (
        <SidebarNav
          sessionEmail={s.sessionEmail}
          authBusy={s.authBusy}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
          onSignOut={s.signOut}
          themeMode={s.themeMode}
          onToggleTheme={s.toggleTheme}
        />
      )}

      <main className={cn("mx-auto w-full max-w-5xl p-4 sm:p-5", isMobile && "min-h-0 flex-1 overflow-y-auto pb-16")}>
        {children}
      </main>

      {isMobile && (
        <BottomNav onSignOut={s.signOut} themeMode={s.themeMode} onToggleTheme={s.toggleTheme} />
      )}
    </div>
  );
}
