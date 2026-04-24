import { useEffect } from "react";
import { useWebApp } from "./web-app-context";
import { ContactsSection } from "./contacts-section";
import { IconSearch } from "./icons";
import { Input } from "./components/ui/input";

export function TrashRoute() {
  const s = useWebApp();

  useEffect(() => {
    s.setShowTrash(true);
    void s.refreshData(true);
  }, []);

  return (
    <>
      <div className="mb-4 flex items-center gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Trash</h2>

        <div className="relative ml-auto w-full max-w-md">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
            <IconSearch size={14} />
          </span>
          <Input
            placeholder="Search trash…"
            value={s.query}
            onChange={(e) => s.setQuery(e.target.value)}
            disabled={s.dataBusy}
            className="pl-8"
          />
        </div>
      </div>

      <div>
        <ContactsSection
          showTrash={true}
          displayedContacts={s.displayedContacts}
          labels={s.labels}
          dataBusy={s.dataBusy}
          mutationBusy={s.mutationBusy}
          setEditingId={s.setEditingId}
          setDisplayName={s.setDisplayName}
          setContactPhone={s.setContactPhone}
          setContactEmail={s.setContactEmail}
          setContactPhoneCountry={s.setContactPhoneCountry}
          softDeleteContact={s.softDeleteContact}
          restoreContact={s.restoreContact}
          permanentlyDeleteContact={s.permanentlyDeleteContact}
          toggleContactLabel={s.toggleContactLabel}
        />
      </div>
    </>
  );
}
