import { useState, useCallback, useEffect, type ReactNode } from "react";
import { ui, feedbackColor, SIDEBAR_W, SIDEBAR_W_COLLAPSED } from "./ui-styles";
import { SidebarNav } from "./sidebar-nav";
import { BottomNav } from "./bottom-nav";
import { useWebApp } from "./web-app-context";
import { useBreakpoint } from "./use-breakpoint";

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
  const sidebarW = isMobile ? 0 : collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W;

  return (
    <div
      style={{
        ...ui.shell,
        marginInlineStart: sidebarW,
        paddingBlockEnd: isMobile ? 64 : 0,
      }}
    >
      {!isMobile && (
        <SidebarNav
          sessionEmail={s.sessionEmail}
          authBusy={s.authBusy}
          collapsed={collapsed}
          onToggleCollapse={toggleCollapsed}
          onSignOut={s.signOut}
        />
      )}

      <main style={ui.mainContent}>
        {s.feedback ? (
          <div
            style={{
              ...ui.feedbackBanner,
              color: feedbackColor(s.feedback.tone),
              background:
                s.feedback.tone === "error"
                  ? "#fef2f2"
                  : s.feedback.tone === "success"
                    ? "#f0fdf4"
                    : "#f0fdfa",
            }}
          >
            {s.feedback.text}
          </div>
        ) : null}
        {children}
      </main>

      {isMobile && <BottomNav onSignOut={s.signOut} />}
    </div>
  );
}
