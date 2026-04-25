import { Link } from "@tanstack/react-router";
import { useWebApp } from "./web-app-context";
import { ContactsSection } from "./contacts-section";
import { IconSearch } from "./icons";
import { useBreakpoint } from "./use-breakpoint";
import { buttonVariants } from "./components/ui/button";
import { cn } from "./lib/cn";
import { Input } from "./components/ui/input";

export function ContactsRoute() {
  const s = useWebApp();
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Contacts</h2>

        {!isMobile && (
          <>
            <div className="relative ml-auto w-full max-w-md">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                <IconSearch size={14} />
              </span>
              <Input
                placeholder="Search by name, phone, email, or label…"
                value={s.query}
                onChange={(e) => s.setQuery(e.target.value)}
                disabled={s.dataBusy}
                className="pl-8"
              />
            </div>

            <Link
              to="/contacts/new"
              className={cn(buttonVariants(), s.mutationBusy && "pointer-events-none opacity-50")}
              aria-disabled={s.mutationBusy}
            >
              + New contact
            </Link>
          </>
        )}
      </div>

      {isMobile && (
        <div className="mb-3">
          <div className="relative w-full">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
              <IconSearch size={14} />
            </span>
            <Input
              placeholder="Search…"
              value={s.query}
              onChange={(e) => s.setQuery(e.target.value)}
              disabled={s.dataBusy}
              className="pl-8"
            />
          </div>
        </div>
      )}

      <div>
        <ContactsSection
          showTrash={false}
          displayedContacts={s.displayedContacts}
          labels={s.labels}
          dataBusy={s.dataBusy}
          mutationBusy={s.mutationBusy}
          softDeleteContact={s.softDeleteContact}
          restoreContact={s.restoreContact}
          permanentlyDeleteContact={s.permanentlyDeleteContact}
          toggleContactLabel={s.toggleContactLabel}
        />
      </div>

      {isMobile && (
        <Link
          to="/contacts/new"
          className={cn(
            buttonVariants(),
            "fixed bottom-[74px] right-3 z-30 rounded-full px-4 py-2 shadow-lg",
            s.mutationBusy && "pointer-events-none opacity-50",
          )}
          aria-disabled={s.mutationBusy}
        >
          + New
        </Link>
      )}
    </>
  );
}
