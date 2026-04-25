import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { useWebApp } from "../web-app-context";
import { ContactEditorPanel } from "../contact-editor-panel";
import { buttonVariants } from "../components/ui/button";
import { cn } from "../lib/cn";

export const Route = createFileRoute("/contacts/$contactId/edit")({
  component: ContactEditPage,
});

function ContactEditPage() {
  const { contactId } = Route.useParams();
  const s = useWebApp();
  const navigate = useNavigate();
  const [ready, setReady] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setReady(false);
    void (async () => {
      const ok = await s.prepareEditContact(contactId);
      if (cancelled) return;
      if (!ok) {
        void navigate({ to: "/contacts" });
        return;
      }
      setReady(true);
    })();
    return () => {
      cancelled = true;
      s.resetContactForm();
    };
  }, [contactId]);

  if (!ready) {
    return (
      <p className="text-sm text-muted-foreground" aria-live="polite">
        Loading…
      </p>
    );
  }

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link to="/contacts" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          ← Contacts
        </Link>
        <h2 className="text-xl font-semibold tracking-tight">Edit contact</h2>
      </div>
      <ContactEditorPanel title="Update details" />
    </>
  );
}
