import { useState } from "react";
import { normalizeLabels, getPrimaryPhone, getPrimaryEmail, type ContactRow, type LabelRow } from "./contact-search";
import { ui } from "./ui-styles";
import { IconMoreHorizontal } from "./icons";

type ContactsSectionProps = {
  showTrash: boolean;
  displayedContacts: ContactRow[];
  labels: LabelRow[];
  dataBusy: boolean;
  mutationBusy: boolean;
  setEditingId: (value: string | null) => void;
  setDisplayName: (value: string) => void;
  setContactPhone: (value: string) => void;
  setContactEmail: (value: string) => void;
  softDeleteContact: (id: string) => void;
  restoreContact: (id: string) => void;
  permanentlyDeleteContact: (id: string) => void;
  toggleContactLabel: (contactId: string, labelId: string, currentlyAssigned: boolean) => void;
};

export function ContactsSection(props: ContactsSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (props.dataBusy) {
    return (
      <div style={{ ...ui.listCard, padding: "20px 16px" }}>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: 14 }}>Loading…</p>
      </div>
    );
  }

  if (props.displayedContacts.length === 0) {
    return (
      <div style={{ ...ui.listCard, padding: "48px 24px", textAlign: "center" }}>
        <p style={{ margin: 0, color: "#94a3b8", fontSize: 14 }}>
          {props.showTrash
            ? "Trash is empty."
            : "No contacts yet — add your first one above."}
        </p>
      </div>
    );
  }

  const count = props.displayedContacts.length;

  return (
    <div style={ui.listCard}>
      <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
        {props.displayedContacts.map((contact, idx) => {
          const isLast = idx === props.displayedContacts.length - 1;
          const isExpanded = expandedId === contact.id;
          const assignedIds = new Set(
            (contact.contact_labels ?? []).map((cl) => cl.label_id),
          );
          const assignedLabels = (contact.contact_labels ?? []).flatMap((cl) =>
            normalizeLabels(cl.labels),
          );

          return (
            <li key={contact.id}>
              {/* ── Main row (always 48px) ───────────────────────────── */}
              <div
                style={{
                  ...ui.contactRow,
                  borderBottom: isExpanded || !isLast ? "1px solid #f1f5f9" : "none",
                }}
              >
                {/* Avatar */}
                <div style={ui.avatar}>
                  {contact.display_name.slice(0, 2).toUpperCase()}
                </div>

                {/* Name + secondary line + label pills */}
                <div
                  style={{
                    flex: 1,
                    minWidth: 0,
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    overflow: "hidden",
                  }}
                >
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        fontSize: 14,
                        fontWeight: 600,
                        color: "#0f172a",
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                      }}
                    >
                      {contact.display_name}
                    </div>
                    {(getPrimaryPhone(contact) ?? getPrimaryEmail(contact)) && (
                      <div
                        style={{
                          fontSize: 12,
                          color: "#64748b",
                          whiteSpace: "nowrap",
                          overflow: "hidden",
                          textOverflow: "ellipsis",
                          marginBlockStart: 1,
                        }}
                      >
                        {[getPrimaryPhone(contact), getPrimaryEmail(contact)]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    )}
                  </div>

                  {/* Pills pushed to inline-end */}
                  {assignedLabels.length > 0 && (
                    <div
                      style={{
                        display: "flex",
                        gap: 4,
                        flexShrink: 0,
                      }}
                    >
                      {assignedLabels.map((l) => (
                        <span
                          key={l.id}
                          style={{
                            ...ui.labelPill,
                            background: l.color ? `${l.color}33` : "#f1f5f9",
                            color: l.color ?? "#64748b",
                          }}
                        >
                          {l.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Overflow menu toggle */}
                <button
                  style={{
                    ...ui.iconButton,
                    color: isExpanded ? "#2563eb" : "#94a3b8",
                  }}
                  onClick={() =>
                    setExpandedId(isExpanded ? null : contact.id)
                  }
                  aria-label="More actions"
                >
                  <IconMoreHorizontal size={16} />
                </button>
              </div>

              {/* ── Expanded actions panel ───────────────────────────── */}
              {isExpanded && (
                <div
                  style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 6,
                  paddingBlock: "8px 10px",
                  paddingInlineStart: 60,
                  paddingInlineEnd: 16,
                  flexWrap: "wrap" as const,
                  borderBottom: isLast ? "none" : "1px solid #f1f5f9",
                  background: "#fafbfc",
                  }}
                >
                  {props.showTrash ? (
                    <>
                      <button
                        onClick={() => {
                          props.restoreContact(contact.id);
                          setExpandedId(null);
                        }}
                        style={ui.smallButton}
                      >
                        Restore
                      </button>
                      <button
                        onClick={() => {
                          props.permanentlyDeleteContact(contact.id);
                          setExpandedId(null);
                        }}
                        style={{
                          ...ui.smallButton,
                          color: "#ef4444",
                          borderColor: "#fecaca",
                        }}
                      >
                        Delete forever
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => {
                          props.setEditingId(contact.id);
                          props.setDisplayName(contact.display_name);
                          props.setContactPhone(getPrimaryPhone(contact) ?? "");
                          props.setContactEmail(getPrimaryEmail(contact) ?? "");
                          setExpandedId(null);
                        }}
                        style={ui.smallButton}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => {
                          props.softDeleteContact(contact.id);
                          setExpandedId(null);
                        }}
                        style={{
                          ...ui.smallButton,
                          color: "#ef4444",
                          borderColor: "#fecaca",
                        }}
                      >
                        Move to trash
                      </button>

                      {/* Label toggles — only shown in expanded panel */}
                      {props.labels.length > 0 && (
                        <span
                          style={{
                            width: "100%",
                            display: "flex",
                            gap: 4,
                            flexWrap: "wrap" as const,
                            marginTop: 4,
                          }}
                        >
                          {props.labels.map((l) => (
                            <button
                              key={l.id}
                              type="button"
                              onClick={() =>
                                props.toggleContactLabel(
                                  contact.id,
                                  l.id,
                                  assignedIds.has(l.id),
                                )
                              }
                              disabled={props.mutationBusy}
                              style={{
                                ...ui.smallButton,
                                borderColor: assignedIds.has(l.id)
                                  ? "#2563eb"
                                  : "#e2e8f0",
                                color: assignedIds.has(l.id)
                                  ? "#2563eb"
                                  : "#64748b",
                              }}
                            >
                              {assignedIds.has(l.id) ? "✓ " : "+ "}
                              {l.name}
                            </button>
                          ))}
                        </span>
                      )}
                    </>
                  )}
                </div>
              )}
            </li>
          );
        })}
      </ul>

      {/* Contact count footer */}
      <div style={ui.listCardFooter}>
        {count} {count === 1 ? "contact" : "contacts"}
        {props.showTrash ? " in trash" : ""}
      </div>
    </div>
  );
}
