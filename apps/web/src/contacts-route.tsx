import { useEffect, useState } from "react";
import { useWebApp } from "./web-app-context";
import { ContactsSection } from "./contacts-section";
import { IconSearch } from "./icons";
import {
  PHONE_COUNTRIES,
  formatDialPrefix,
  getDefaultPhoneCountryFromLocale,
  type PhoneCountry,
} from "./phone-country";
import { useBreakpoint } from "./use-breakpoint";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card } from "./components/ui/card";

export function ContactsRoute() {
  const s = useWebApp();
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const [showCompose, setShowCompose] = useState(false);

  useEffect(() => {
    s.setShowTrash(false);
    void s.refreshData(false);
  }, []);

  const handleCreate = async () => {
    await s.createContact();
    setShowCompose(false);
  };

  const handleUpdate = async () => {
    await s.updateContact();
  };

  const handleCancelEdit = () => {
    s.setEditingId(null);
    s.setDisplayName("");
    s.setContactPhone("");
    s.setContactEmail("");
    s.setContactPhoneCountry(getDefaultPhoneCountryFromLocale());
  };

  const openCompose = () => {
    setShowCompose(true);
    s.setEditingId(null);
    s.setDisplayName("");
    s.setContactPhone("");
    s.setContactEmail("");
    s.setContactPhoneCountry(getDefaultPhoneCountryFromLocale());
  };

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

            <Button
              onClick={openCompose}
              disabled={s.mutationBusy}
            >
              + New contact
            </Button>
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

      {(showCompose || s.editingId) && (
        <Card className="mb-4 p-4">
          <p className="mb-2 text-sm font-semibold text-foreground">
            {s.editingId ? "Edit contact" : "New contact"}
          </p>
          <div className="flex flex-col gap-2">
            <div
              className="grid grid-cols-1 items-center gap-2 md:grid-cols-2 xl:grid-cols-4"
            >
              <Input
                placeholder="Display name *"
                value={s.displayName}
                onChange={(e) => s.setDisplayName(e.target.value)}
                disabled={s.mutationBusy}
                className="min-w-0"
                autoFocus
              />
              <Input
                placeholder="Phone"
                value={s.contactPhone}
                onChange={(e) => s.setContactPhone(e.target.value)}
                disabled={s.mutationBusy}
                className="min-w-0"
              />
              <select
                value={s.contactPhoneCountry}
                onChange={(e) => s.setContactPhoneCountry(e.target.value as PhoneCountry)}
                disabled={s.mutationBusy}
                className="flex h-9 min-w-0 w-full rounded-md border border-input bg-background px-3 py-1 text-sm text-foreground shadow-sm outline-none"
              >
                {PHONE_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label} ({c.code}) {formatDialPrefix(c.code)}
                  </option>
                ))}
              </select>
              <Input
                placeholder="Email"
                type="email"
                value={s.contactEmail}
                onChange={(e) => s.setContactEmail(e.target.value)}
                disabled={s.mutationBusy}
                className="min-w-0"
              />
            </div>
            <div className="flex gap-2">
              {s.editingId ? (
                <>
                  <Button
                    onClick={handleUpdate}
                    disabled={s.mutationBusy || s.dataBusy}
                  >
                    {s.mutationBusy ? "Saving…" : "Save"}
                  </Button>
                  <Button onClick={handleCancelEdit} variant="secondary">
                    Cancel
                  </Button>
                </>
              ) : (
                <>
                  <Button
                    onClick={handleCreate}
                    disabled={s.mutationBusy || s.dataBusy}
                  >
                    {s.mutationBusy ? "Saving…" : "Create"}
                  </Button>
                  <Button
                    onClick={() => {
                      setShowCompose(false);
                      s.setDisplayName("");
                      s.setContactPhone("");
                      s.setContactEmail("");
                      s.setContactPhoneCountry(getDefaultPhoneCountryFromLocale());
                    }}
                    variant="secondary"
                  >
                    Cancel
                  </Button>
                </>
              )}
            </div>
          </div>
        </Card>
      )}

      <div>
        <ContactsSection
          showTrash={false}
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

      {isMobile && !showCompose && !s.editingId && (
        <Button
          onClick={openCompose}
          disabled={s.mutationBusy}
          className="fixed bottom-[74px] right-3 z-30 rounded-full px-4 py-2 shadow-lg"
        >
          + New
        </Button>
      )}
    </>
  );
}
