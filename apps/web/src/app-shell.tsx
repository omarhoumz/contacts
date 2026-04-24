import { useState, useCallback, useEffect, type ReactNode } from "react";
import { SidebarNav } from "./sidebar-nav";
import { BottomNav } from "./bottom-nav";
import { useWebApp } from "./web-app-context";
import { useBreakpoint } from "./use-breakpoint";
import { cn } from "./lib/cn";
import { AlertCircle, CheckCircle2, Info } from "lucide-react";

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
        {s.feedback ? (
          <div
            className={cn(
              "mb-3 flex items-center gap-2 rounded-md border px-3 py-2 text-sm",
              s.feedback.tone === "error" && "border-destructive/40 bg-destructive/10 text-destructive",
              s.feedback.tone === "success" && "border-success/40 bg-success/10 text-success",
              s.feedback.tone === "info" && "border-info/40 bg-info/10 text-info",
            )}
          >
            {s.feedback.tone === "error" ? (
              <AlertCircle size={14} />
            ) : s.feedback.tone === "success" ? (
              <CheckCircle2 size={14} />
            ) : (
              <Info size={14} />
            )}
            {s.feedback.text}
          </div>
        ) : null}
        {children}
      </main>

      {isMobile && <BottomNav onSignOut={s.signOut} />}
    </div>
  );
}
