import { useEffect, useState } from "react";
import { useWebApp } from "./web-app-context";
import { ContactsSection } from "./contacts-section";
import { ui } from "./ui-styles";
import { IconSearch } from "./icons";
import { PHONE_COUNTRIES, formatDialPrefix } from "./phone-country";

export function ContactsRoute() {
  const s = useWebApp();
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
    s.setContactPhoneCountry("US");
  };

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div style={ui.topBar}>
        <h2 style={ui.topBarTitle}>Contacts</h2>

        <div style={ui.searchWrapper}>
          <span style={ui.searchIcon}>
            <IconSearch size={14} />
          </span>
          <input
            placeholder="Search by name, phone, email, or label…"
            value={s.query}
            onChange={(e) => s.setQuery(e.target.value)}
            disabled={s.dataBusy}
            style={ui.topBarSearch}
          />
        </div>

        <button
          onClick={() => {
            setShowCompose(true);
            s.setEditingId(null);
            s.setDisplayName("");
            s.setContactPhone("");
            s.setContactEmail("");
            s.setContactPhoneCountry("US");
          }}
          style={ui.primaryButton}
          disabled={s.mutationBusy}
        >
          + New contact
        </button>
      </div>

      {/* ── Compose / edit form ──────────────────────────────────────── */}
      {(showCompose || s.editingId) && (
        <div style={ui.composeSection}>
          <p style={ui.composeSectionTitle}>
            {s.editingId ? "Edit contact" : "New contact"}
          </p>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                placeholder="Display name *"
                value={s.displayName}
                onChange={(e) => s.setDisplayName(e.target.value)}
                disabled={s.mutationBusy}
                style={{ ...ui.compactInput, flex: 2 }}
                autoFocus
              />
              <input
                placeholder="Phone"
                value={s.contactPhone}
                onChange={(e) => s.setContactPhone(e.target.value)}
                disabled={s.mutationBusy}
                style={{ ...ui.compactInput, flex: 1 }}
              />
              <select
                value={s.contactPhoneCountry}
                onChange={(e) => s.setContactPhoneCountry(e.target.value as (typeof PHONE_COUNTRIES)[number]["code"])}
                disabled={s.mutationBusy}
                style={{ ...ui.compactInput, flex: 1 }}
              >
                {PHONE_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} ({formatDialPrefix(c.code)})
                  </option>
                ))}
              </select>
              <input
                placeholder="Email"
                type="email"
                value={s.contactEmail}
                onChange={(e) => s.setContactEmail(e.target.value)}
                disabled={s.mutationBusy}
                style={{ ...ui.compactInput, flex: 2 }}
              />
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              {s.editingId ? (
                <>
                  <button
                    onClick={handleUpdate}
                    disabled={s.mutationBusy || s.dataBusy}
                    style={ui.primaryButton}
                  >
                    {s.mutationBusy ? "Saving…" : "Save"}
                  </button>
                  <button onClick={handleCancelEdit} style={ui.secondaryButton}>
                    Cancel
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={handleCreate}
                    disabled={s.mutationBusy || s.dataBusy}
                    style={ui.primaryButton}
                  >
                    {s.mutationBusy ? "Saving…" : "Create"}
                  </button>
                  <button
                    onClick={() => {
                      setShowCompose(false);
                      s.setDisplayName("");
                      s.setContactPhone("");
                      s.setContactEmail("");
                      s.setContactPhoneCountry("US");
                    }}
                    style={ui.secondaryButton}
                  >
                    Cancel
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ── Contact list ─────────────────────────────────────────────── */}
      <div style={ui.mainBody}>
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
    </>
  );
}
