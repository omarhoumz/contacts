import { createFileRoute, Outlet, useRouterState } from "@tanstack/react-router";
import { ContactsRoute } from "../contacts-route";

export const Route = createFileRoute("/contacts")({
  component: ContactsShell,
});

function ContactsShell() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (pathname === "/contacts") {
    return <ContactsRoute />;
  }
  return <Outlet />;
}
