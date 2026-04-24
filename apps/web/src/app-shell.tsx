import { useState, useCallback, type ReactNode } from "react";
import { ui, feedbackColor, SIDEBAR_W, SIDEBAR_W_COLLAPSED } from "./ui-styles";
import { SidebarNav } from "./sidebar-nav";
import { useWebApp } from "./web-app-context";

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
  const [collapsed, setCollapsed] = useState<boolean>(readCollapsed);

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

  const sidebarW = collapsed ? SIDEBAR_W_COLLAPSED : SIDEBAR_W;

  return (
    <div style={{ ...ui.shell, marginInlineStart: sidebarW }}>
      <SidebarNav
        sessionEmail={s.sessionEmail}
        authBusy={s.authBusy}
        collapsed={collapsed}
        onToggleCollapse={toggleCollapsed}
        onSignOut={s.signOut}
      />

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
    </div>
  );
}
