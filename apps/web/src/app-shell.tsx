import type { ReactNode } from "react";
import { ui, feedbackColor } from "./ui-styles";
import { SidebarNav } from "./sidebar-nav";
import { useWebApp } from "./web-app-context";

type AppShellProps = { children: ReactNode };

export function AppShell({ children }: AppShellProps) {
  const s = useWebApp();

  return (
    <div style={ui.shell}>
      <SidebarNav
        sessionEmail={s.sessionEmail}
        authBusy={s.authBusy}
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

      <aside style={ui.rightAside}>
        <div style={ui.asidePlaceholder}>
          <p style={ui.asidePlaceholderTitle}>Contact details</p>
          <p style={ui.asidePlaceholderText}>Select a contact to view details.</p>
          <span style={ui.postMvpBadge}>Post-MVP</span>
        </div>
      </aside>
    </div>
  );
}
