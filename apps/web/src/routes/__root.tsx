import { createRootRoute, Outlet, useNavigate, useRouterState } from "@tanstack/react-router";
import { useEffect } from "react";
import { toast } from "sonner";
import { useWebAppState } from "../use-web-app-state";
import { WebAppContext } from "../web-app-context";
import { AppShell } from "../app-shell";

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  const s = useWebAppState();
  const navigate = useNavigate();
  const pathname = useRouterState({ select: (st) => st.location.pathname });
  const isAuthPage = pathname === "/sign-in" || pathname === "/sign-up";

  useEffect(() => {
    if (!s.authResolved || !s.isAuthenticated || !isAuthPage) return;
    const params = new URLSearchParams(window.location.search);
    const raw = params.get("redirect");
    const safe =
      raw && raw.startsWith("/") && !raw.startsWith("//") ? raw : "/contacts";
    void navigate({ to: safe as "/contacts", replace: true });
  }, [s.authResolved, s.isAuthenticated, isAuthPage, navigate]);

  useEffect(() => {
    if (!s.authResolved || s.isAuthenticated || isAuthPage) return;
    void navigate({
      to: "/sign-in",
      search: { redirect: pathname } as Record<string, string>,
      replace: true,
    });
  }, [s.authResolved, s.isAuthenticated, isAuthPage, pathname, navigate]);

  useEffect(() => {
    if (!s.feedback) return;
    if (s.feedback.tone === "success" && s.feedback.text === "Signed in.") return;
    if (s.feedback.tone === "error") {
      toast.error(s.feedback.text);
      return;
    }
    if (s.feedback.tone === "success") {
      toast.success(s.feedback.text);
      return;
    }
    toast.message(s.feedback.text);
  }, [s.feedback]);

  if (!s.authResolved) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  if (!s.isAuthenticated) {
    if (!isAuthPage) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background">
          <p className="text-sm text-muted-foreground">Loading…</p>
        </div>
      );
    }
    return (
      <WebAppContext.Provider value={s}>
        <div className="flex min-h-screen items-center justify-center bg-background px-5">
          <Outlet />
        </div>
      </WebAppContext.Provider>
    );
  }

  if (isAuthPage) {
    return <div className="min-h-screen bg-background" />;
  }

  return (
    <WebAppContext.Provider value={s}>
      <AppShell>
        <Outlet />
      </AppShell>
    </WebAppContext.Provider>
  );
}
