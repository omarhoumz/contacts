import { normalizeLabels, type ContactRow, type LabelRow } from "./contact-search";
import { ui } from "./ui-styles";

type ContactsSectionProps = {
  showTrash: boolean;
  query: string;
  setQuery: (value: string) => void;
  dataBusy: boolean;
  displayName: string;
  setDisplayName: (value: string) => void;
  mutationBusy: boolean;
  editingId: string | null;
  setEditingId: (value: string | null) => void;
  createContact: () => void;
  updateContact: () => void;
  refreshData: (trashMode?: boolean) => Promise<void>;
  displayedContacts: ContactRow[];
  labels: LabelRow[];
  softDeleteContact: (id: string) => void;
  restoreContact: (id: string) => void;
  permanentlyDeleteContact: (id: string) => void;
  toggleContactLabel: (contactId: string, labelId: string, currentlyAssigned: boolean) => void;
};

export function ContactsSection(props: ContactsSectionProps) {
  return (
    <div>
      <div style={{ ...ui.row, marginBottom: 12 }}>
        <input
          placeholder="Search by name or label…"
          value={props.query}
          onChange={(e) => props.setQuery(e.target.value)}
          disabled={props.dataBusy}
          style={{ ...ui.topBarSearch, flex: 1 }}
        />
        {!props.showTrash && (
          <input
            placeholder="Display name"
            value={props.displayName}
            onChange={(e) => props.setDisplayName(e.target.value)}
            disabled={props.mutationBusy}
            style={{ ...ui.compactInput, flex: 1 }}
          />
        )}
        {!props.showTrash && (
          props.editingId ? (
            <>
              <button onClick={props.updateContact} disabled={props.mutationBusy || props.dataBusy} style={ui.primaryButton}>
                {props.mutationBusy ? "Saving…" : "Update"}
              </button>
              <button onClick={() => { props.setEditingId(null); props.setDisplayName(""); }} style={ui.secondaryButton}>
                Cancel
              </button>
            </>
          ) : (
            <button onClick={props.createContact} disabled={props.mutationBusy || props.dataBusy} style={ui.primaryButton}>
              {props.mutationBusy ? "Saving…" : "+ New contact"}
            </button>
          )
        )}
        <button onClick={() => props.refreshData()} style={ui.secondaryButton} disabled={props.dataBusy}>
          {props.dataBusy ? "Loading…" : "Refresh"}
        </button>
      </div>

      {props.displayedContacts.length === 0 && !props.dataBusy && (
        <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", marginTop: 40 }}>
          {props.showTrash ? "Trash is empty." : "No contacts yet. Add your first one above."}
        </p>
      )}

      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {props.displayedContacts.map((contact) => {
          const assignedIds = new Set((contact.contact_labels ?? []).map((cl) => cl.label_id));
          const assignedLabels = (contact.contact_labels ?? []).flatMap((cl) => normalizeLabels(cl.labels));
          return (
            <li
              key={contact.id}
              style={{
                display: "flex",
                alignItems: "flex-start",
                gap: 12,
                padding: "12px 0",
                borderBottom: "1px solid #f1f5f9",
              }}
            >
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: "#dbeafe",
                  color: "#1d4ed8",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 13,
                  fontWeight: 600,
                  flexShrink: 0,
                }}
              >
                {contact.display_name.slice(0, 2).toUpperCase()}
              </div>

              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" as const }}>
                  <strong style={{ fontSize: 14 }}>{contact.display_name}</strong>
                  {assignedLabels.map((l) => (
                    <span
                      key={l.id}
                      style={{
                        fontSize: 11,
                        background: l.color ? `${l.color}22` : "#f1f5f9",
                        color: l.color ?? "#64748b",
                        borderRadius: 4,
                        padding: "1px 7px",
                        fontWeight: 500,
                      }}
                    >
                      {l.name}
                    </span>
                  ))}
                </div>

                {!props.showTrash && props.labels.length > 0 && (
                  <div style={{ marginTop: 6, display: "flex", gap: 4, flexWrap: "wrap" as const }}>
                    {props.labels.map((l) => (
                      <button
                        key={l.id}
                        type="button"
                        onClick={() => props.toggleContactLabel(contact.id, l.id, assignedIds.has(l.id))}
                        style={{
                          ...ui.secondaryButton,
                          padding: "2px 8px",
                          fontSize: 11,
                          borderColor: assignedIds.has(l.id) ? "#2563eb" : "#e2e8f0",
                          color: assignedIds.has(l.id) ? "#2563eb" : "#64748b",
                        }}
                      >
                        {assignedIds.has(l.id) ? "✓ " : "+ "}{l.name}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div style={{ display: "flex", gap: 6, flexShrink: 0 }}>
                {props.showTrash ? (
                  <>
                    <button onClick={() => props.restoreContact(contact.id)} style={ui.secondaryButton}>Restore</button>
                    <button onClick={() => props.permanentlyDeleteContact(contact.id)} style={{ ...ui.secondaryButton, color: "#ef4444", borderColor: "#fecaca" }}>
                      Delete forever
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => { props.setEditingId(contact.id); props.setDisplayName(contact.display_name); }}
                      style={ui.secondaryButton}
                    >
                      Edit
                    </button>
                    <button onClick={() => props.softDeleteContact(contact.id)} style={{ ...ui.secondaryButton, color: "#ef4444", borderColor: "#fecaca" }}>
                      Trash
                    </button>
                  </>
                )}
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
