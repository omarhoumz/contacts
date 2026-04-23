import { Card } from "@widados/ui-lib";
import { normalizeLabels, type ContactRow, type LabelRow } from "./contact-search";

type ContactsSectionProps = {
  showTrash: boolean;
  setShowTrash: (value: boolean) => void;
  setEditingId: (value: string | null) => void;
  query: string;
  setQuery: (value: string) => void;
  dataBusy: boolean;
  displayName: string;
  setDisplayName: (value: string) => void;
  mutationBusy: boolean;
  editingId: string | null;
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
    <Card>
      <h3>Contacts</h3>
      <div style={{ marginBottom: 8, display: "flex", gap: 12, alignItems: "center" }}>
        <label>
          <input
            type="radio"
            checked={!props.showTrash}
            onChange={() => {
              props.setShowTrash(false);
              props.setEditingId(null);
              void props.refreshData(false);
            }}
          />{" "}
          Active
        </label>
        <label>
          <input
            type="radio"
            checked={props.showTrash}
            onChange={() => {
              props.setShowTrash(true);
              props.setEditingId(null);
              void props.refreshData(true);
            }}
          />{" "}
          Trash
        </label>
      </div>
      <input
        placeholder="Search by name or label"
        value={props.query}
        onChange={(e) => props.setQuery(e.target.value)}
        disabled={props.dataBusy}
        style={{ width: "100%", marginBottom: 8 }}
      />
      {!props.showTrash ? (
        <>
          <input
            placeholder="Display name"
            value={props.displayName}
            onChange={(e) => props.setDisplayName(e.target.value)}
            disabled={props.mutationBusy}
            style={{ width: "100%", marginBottom: 8 }}
          />
          {props.editingId ? (
            <button onClick={props.updateContact} disabled={props.mutationBusy || props.dataBusy}>
              {props.mutationBusy ? "Saving..." : "Update contact"}
            </button>
          ) : (
            <button onClick={props.createContact} disabled={props.mutationBusy || props.dataBusy}>
              {props.mutationBusy ? "Saving..." : "Create contact"}
            </button>
          )}
        </>
      ) : null}
      <button onClick={() => props.refreshData()} style={{ marginLeft: 8 }} disabled={props.dataBusy}>
        {props.dataBusy ? "Refreshing..." : "Refresh"}
      </button>
      <ul>
        {props.displayedContacts.map((contact) => {
          const assignedIds = new Set((contact.contact_labels ?? []).map((cl) => cl.label_id));
          return (
            <li key={contact.id} style={{ marginBottom: 12 }}>
              <strong>{contact.display_name}</strong>
              {!props.showTrash ? (
                <>
                  <button
                    onClick={() => {
                      props.setEditingId(contact.id);
                      props.setDisplayName(contact.display_name);
                    }}
                    style={{ marginLeft: 8 }}
                  >
                    Edit
                  </button>
                  <button onClick={() => props.softDeleteContact(contact.id)} style={{ marginLeft: 8 }}>
                    Move to trash
                  </button>
                  <div style={{ marginTop: 6, fontSize: 13 }}>
                    {(contact.contact_labels ?? []).flatMap((cl) => normalizeLabels(cl.labels)).map((l) => (
                      <span key={l.id} style={{ marginRight: 6 }}>
                        {l.name}
                      </span>
                    ))}
                    {props.labels.length ? (
                      <div style={{ marginTop: 6 }}>
                        <span style={{ color: "#666" }}>Labels: </span>
                        {props.labels.map((l) => (
                          <button
                            key={l.id}
                            type="button"
                            onClick={() => props.toggleContactLabel(contact.id, l.id, assignedIds.has(l.id))}
                            style={{ marginRight: 6 }}
                          >
                            {assignedIds.has(l.id) ? "✓ " : "+ "}
                            {l.name}
                          </button>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </>
              ) : (
                <span style={{ marginLeft: 8 }}>
                  <button onClick={() => props.restoreContact(contact.id)}>Restore</button>
                  <button onClick={() => props.permanentlyDeleteContact(contact.id)} style={{ marginLeft: 8 }}>
                    Delete forever
                  </button>
                </span>
              )}
            </li>
          );
        })}
      </ul>
    </Card>
  );
}
