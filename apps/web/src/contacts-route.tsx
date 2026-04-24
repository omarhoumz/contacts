import { useEffect, useState } from "react";
import { useWebApp } from "./web-app-context";
import { ContactsSection } from "./contacts-section";
import { ui } from "./ui-styles";

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

  const handleCancelEdit = () => {
    s.setEditingId(null);
    s.setDisplayName("");
  };

  const handleUpdate = async () => {
    await s.updateContact();
  };

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div style={ui.topBar}>
        <h2 style={ui.topBarTitle}>Contacts</h2>
        <input
          placeholder="Search by name or label…"
          value={s.query}
          onChange={(e) => s.setQuery(e.target.value)}
          disabled={s.dataBusy}
          style={ui.topBarSearch}
        />
        <button
          onClick={() => { setShowCompose(true); s.setEditingId(null); s.setDisplayName(""); }}
          style={ui.primaryButton}
          disabled={s.mutationBusy}
        >
          + New contact
        </button>
      </div>

      {/* ── Compose / edit form ──────────────────────────────────────── */}
      {(showCompose || s.editingId) && (
        <div style={ui.composeSection}>
          <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: "#374151" }}>
            {s.editingId ? "Edit contact" : "New contact"}
          </p>
          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
            <input
              placeholder="Display name"
              value={s.displayName}
              onChange={(e) => s.setDisplayName(e.target.value)}
              disabled={s.mutationBusy}
              style={{ ...ui.compactInput, flex: 1 }}
              autoFocus
            />
            {s.editingId ? (
              <>
                <button onClick={handleUpdate} disabled={s.mutationBusy || s.dataBusy} style={ui.primaryButton}>
                  {s.mutationBusy ? "Saving…" : "Save"}
                </button>
                <button onClick={handleCancelEdit} style={ui.secondaryButton}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                <button onClick={handleCreate} disabled={s.mutationBusy || s.dataBusy} style={ui.primaryButton}>
                  {s.mutationBusy ? "Saving…" : "Create"}
                </button>
                <button onClick={() => { setShowCompose(false); s.setDisplayName(""); }} style={ui.secondaryButton}>
                  Cancel
                </button>
              </>
            )}
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
          setEditingId={(id) => { s.setEditingId(id); if (id) setShowCompose(false); }}
          setDisplayName={s.setDisplayName}
          softDeleteContact={s.softDeleteContact}
          restoreContact={s.restoreContact}
          permanentlyDeleteContact={s.permanentlyDeleteContact}
          toggleContactLabel={s.toggleContactLabel}
        />
      </div>
    </>
  );
}
