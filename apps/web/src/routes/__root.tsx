import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useWebAppState } from "../use-web-app-state";
import { WebAppContext } from "../web-app-context";
import { AppShell } from "../app-shell";
import { ui, feedbackColor } from "../ui-styles";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const s = useWebAppState();

  if (!s.authResolved) {
    return (
      <div style={{ ...ui.signedOutPage }}>
        <p style={{ color: "#94a3b8", fontFamily: "Inter, sans-serif" }}>Loading…</p>
      </div>
    );
  }

  if (!s.isAuthenticated) {
    return (
      <div style={ui.signedOutPage}>
        <div style={ui.signedOutInner}>
          <h1 style={ui.signedOutTitle}>WidadOS</h1>
          <p style={ui.signedOutSubtitle}>Your contacts, private and organised.</p>

          {s.feedback ? (
            <p style={{ color: feedbackColor(s.feedback.tone), fontSize: 14, marginBottom: 12 }}>
              {s.feedback.text}
            </p>
          ) : null}

          <div style={ui.signedOutCard}>
            <input
              placeholder="Email"
              value={s.email}
              onChange={(e) => s.setEmail(e.target.value)}
              disabled={s.authBusy}
              style={{ ...ui.input, marginBottom: 10 }}
            />
            <input
              placeholder="Password"
              type="password"
              value={s.password}
              onChange={(e) => s.setPassword(e.target.value)}
              disabled={s.authBusy}
              style={{ ...ui.input, marginBottom: 14 }}
            />
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={s.signIn} disabled={s.authBusy} style={{ ...ui.primaryButton, flex: 1 }}>
                {s.authBusy ? "Working…" : "Sign in"}
              </button>
              <button onClick={s.signUp} disabled={s.authBusy} style={{ ...ui.secondaryButton, flex: 1 }}>
                {s.authBusy ? "Working…" : "Sign up"}
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <WebAppContext.Provider value={s}>
      <AppShell>
        <Outlet />
      </AppShell>
    </WebAppContext.Provider>
  );
}
