import { useEffect } from "react";
import { useWebApp } from "./web-app-context";
import { ContactsSection } from "./contacts-section";
import { ui } from "./ui-styles";
import { IconSearch } from "./icons";

export function TrashRoute() {
  const s = useWebApp();

  useEffect(() => {
    s.setShowTrash(true);
    void s.refreshData(true);
  }, []);

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div style={ui.topBar}>
        <h2 style={ui.topBarTitle}>Trash</h2>

        <div style={ui.searchWrapper}>
          <span style={ui.searchIcon}>
            <IconSearch size={14} />
          </span>
          <input
            placeholder="Search trash…"
            value={s.query}
            onChange={(e) => s.setQuery(e.target.value)}
            disabled={s.dataBusy}
            style={ui.topBarSearch}
          />
        </div>
      </div>

      {/* ── Trash list ───────────────────────────────────────────────── */}
      <div style={ui.mainBody}>
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
