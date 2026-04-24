import { createRootRoute, Outlet } from "@tanstack/react-router";
import { useWebAppState } from "../use-web-app-state";
import { WebAppContext } from "../web-app-context";
import { AppShell } from "../app-shell";
import { Card } from "../components/ui/card";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { cn } from "../lib/cn";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const s = useWebAppState();

  if (!s.authResolved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!s.isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-5">
        <div className="w-full max-w-md">
          <h1 className="mb-1 text-3xl font-bold tracking-tight text-foreground">WidadOS</h1>
          <p className="mb-7 text-sm text-muted-foreground">Your contacts, private and organised.</p>

          {s.feedback ? (
            <p
              className={cn(
                "mb-3 text-sm",
                s.feedback.tone === "error" && "text-destructive",
                s.feedback.tone === "success" && "text-success",
                s.feedback.tone === "info" && "text-info",
              )}
            >
              {s.feedback.text}
            </p>
          ) : null}

          <Card className="p-5">
            <Input
              placeholder="Email"
              value={s.email}
              onChange={(e) => s.setEmail(e.target.value)}
              disabled={s.authBusy}
              className="mb-2.5"
            />
            <Input
              placeholder="Password"
              type="password"
              value={s.password}
              onChange={(e) => s.setPassword(e.target.value)}
              disabled={s.authBusy}
              className="mb-3.5"
            />
            <div className="flex gap-2">
              <Button onClick={s.signIn} disabled={s.authBusy} className="flex-1">
                {s.authBusy ? "Working…" : "Sign in"}
              </Button>
              <Button onClick={s.signUp} disabled={s.authBusy} variant="secondary" className="flex-1">
                {s.authBusy ? "Working…" : "Sign up"}
              </Button>
            </div>
            {s.canResendVerification ? (
              <Button
                onClick={s.resendVerification}
                disabled={s.authBusy}
                variant="secondary"
                className="mt-2.5 w-full"
              >
                {s.authBusy ? "Sending…" : "Resend verification"}
              </Button>
            ) : null}
          </Card>
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
