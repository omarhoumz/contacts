import { useEffect, useState } from "react";
import { useWebApp } from "./web-app-context";
import { ContactsSection } from "./contacts-section";
import { ui } from "./ui-styles";
import { IconSearch } from "./icons";
import {
  PHONE_COUNTRIES,
  formatDialPrefix,
  getDefaultPhoneCountryFromLocale,
  type PhoneCountry,
} from "./phone-country";
import { useBreakpoint } from "./use-breakpoint";

export function ContactsRoute() {
  const s = useWebApp();
  const bp = useBreakpoint();
  const isMobile = bp === "mobile";
  const composeGridColumns = isMobile
    ? "1fr"
    : bp === "tablet"
      ? "minmax(0,1fr) minmax(0,1fr)"
      : "minmax(180px,2fr) minmax(180px,1fr) minmax(180px,1fr) minmax(220px,2fr)";
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
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div style={ui.topBar}>
        <h2 style={ui.topBarTitle}>Contacts</h2>

        {!isMobile && (
          <>
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
              onClick={openCompose}
              style={ui.primaryButton}
              disabled={s.mutationBusy}
            >
              + New contact
            </button>
          </>
        )}
      </div>

      {isMobile && (
        <div style={{ ...ui.composeSection, padding: "10px 14px", borderBottom: "none" }}>
          <div style={{ ...ui.searchWrapper, width: "100%" }}>
            <span style={ui.searchIcon}>
              <IconSearch size={14} />
            </span>
            <input
              placeholder="Search…"
              value={s.query}
              onChange={(e) => s.setQuery(e.target.value)}
              disabled={s.dataBusy}
              style={{ ...ui.topBarSearch, width: "100%" }}
            />
          </div>
        </div>
      )}

      {/* ── Compose / edit form ──────────────────────────────────────── */}
      {(showCompose || s.editingId) && (
        <div style={ui.composeSection}>
          <p style={ui.composeSectionTitle}>
            {s.editingId ? "Edit contact" : "New contact"}
          </p>
          <div style={{ display: "flex", flexDirection: "column" as const, gap: 8 }}>
            <div
              style={{
                display: "grid",
                gap: 8,
                gridTemplateColumns: composeGridColumns,
                alignItems: "center",
              }}
            >
              <input
                placeholder="Display name *"
                value={s.displayName}
                onChange={(e) => s.setDisplayName(e.target.value)}
                disabled={s.mutationBusy}
                style={{ ...ui.compactInput, minWidth: 0 }}
                autoFocus
              />
              <input
                placeholder="Phone"
                value={s.contactPhone}
                onChange={(e) => s.setContactPhone(e.target.value)}
                disabled={s.mutationBusy}
                style={{ ...ui.compactInput, minWidth: 0 }}
              />
              <select
                value={s.contactPhoneCountry}
                onChange={(e) => s.setContactPhoneCountry(e.target.value as PhoneCountry)}
                disabled={s.mutationBusy}
                style={{ ...ui.compactInput, minWidth: 0 }}
              >
                {PHONE_COUNTRIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.label} ({c.code}) {formatDialPrefix(c.code)}
                  </option>
                ))}
              </select>
              <input
                placeholder="Email"
                type="email"
                value={s.contactEmail}
                onChange={(e) => s.setContactEmail(e.target.value)}
                disabled={s.mutationBusy}
                style={{ ...ui.compactInput, minWidth: 0 }}
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
                      s.setContactPhoneCountry(getDefaultPhoneCountryFromLocale());
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

      {isMobile && !showCompose && !s.editingId && (
        <button
          onClick={openCompose}
          disabled={s.mutationBusy}
          style={{
            ...ui.primaryButton,
            position: "fixed",
            insetInlineEnd: 14,
            bottom: 74,
            borderRadius: 999,
            paddingInline: 14,
            paddingBlock: 10,
            zIndex: 30,
            boxShadow: "0 8px 18px rgba(37, 99, 235, 0.28)",
          }}
        >
          + New
        </button>
      )}
    </>
  );
}
