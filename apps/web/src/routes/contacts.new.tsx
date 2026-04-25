import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect } from "react";
import { useWebApp } from "../web-app-context";
import { ContactEditorPanel } from "../contact-editor-panel";
import { buttonVariants } from "../components/ui/button";
import { cn } from "../lib/cn";

export const Route = createFileRoute("/contacts/new")({
  component: ContactsNewPage,
});

function ContactsNewPage() {
  const s = useWebApp();

  useEffect(() => {
    s.resetContactForm();
  }, [s]);

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Link to="/contacts" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
          ← Contacts
        </Link>
        <h2 className="text-xl font-semibold tracking-tight">New contact</h2>
      </div>
      <ContactEditorPanel title="Add a contact" />
    </>
  );
}
