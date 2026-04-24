import { useState } from "react";
import { normalizeLabels, getPrimaryPhone, getPrimaryEmail, type ContactRow, type LabelRow } from "./contact-search";
import { detectCountryFromE164, type PhoneCountry } from "./phone-country";
import { IconMoreHorizontal } from "./icons";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { cn } from "./lib/cn";

const LABEL_COLOR_CLASSES: Record<string, string> = {
  "#2563eb": "bg-[#2563eb]/20 text-[#2563eb]",
  "#7c3aed": "bg-[#7c3aed]/20 text-[#7c3aed]",
  "#db2777": "bg-[#db2777]/20 text-[#db2777]",
  "#dc2626": "bg-[#dc2626]/20 text-[#dc2626]",
  "#ea580c": "bg-[#ea580c]/20 text-[#ea580c]",
  "#ca8a04": "bg-[#ca8a04]/20 text-[#ca8a04]",
  "#16a34a": "bg-[#16a34a]/20 text-[#16a34a]",
  "#0891b2": "bg-[#0891b2]/20 text-[#0891b2]",
  "#64748b": "bg-[#64748b]/20 text-[#64748b]",
  "#0f172a": "bg-[#0f172a]/20 text-[#0f172a]",
};

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
  setContactPhoneCountry: (value: PhoneCountry) => void;
  softDeleteContact: (id: string) => void;
  restoreContact: (id: string) => void;
  permanentlyDeleteContact: (id: string) => void;
  toggleContactLabel: (contactId: string, labelId: string, currentlyAssigned: boolean) => void;
};

export function ContactsSection(props: ContactsSectionProps) {
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (props.dataBusy) {
    return (
      <Card className="p-4">
        <p className="m-0 text-sm text-muted-foreground">Loading…</p>
      </Card>
    );
  }

  if (props.displayedContacts.length === 0) {
    return (
      <Card className="p-12 text-center">
        <p className="m-0 text-sm text-muted-foreground">
          {props.showTrash
            ? "Trash is empty."
            : "No contacts yet — add your first one above."}
        </p>
      </Card>
    );
  }

  const count = props.displayedContacts.length;

  return (
    <Card>
      <ul className="m-0 list-none p-0">
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
              <div
                className={cn(
                  "flex items-center gap-3 px-4 py-3",
                  (isExpanded || !isLast) && "border-b",
                )}
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/15 text-xs font-semibold text-primary">
                  {contact.display_name.slice(0, 2).toUpperCase()}
                </div>

                <div className="flex min-w-0 flex-1 items-center gap-2 overflow-hidden">
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-sm font-semibold text-foreground">
                      {contact.display_name}
                    </div>
                    {(getPrimaryPhone(contact) ?? getPrimaryEmail(contact)) && (
                      <div className="mt-0.5 truncate text-xs text-muted-foreground">
                        {[getPrimaryPhone(contact), getPrimaryEmail(contact)]
                          .filter(Boolean)
                          .join(" · ")}
                      </div>
                    )}
                  </div>

                  {assignedLabels.length > 0 && (
                    <div className="flex shrink-0 gap-1">
                      {assignedLabels.map((l) => (
                        <span
                          key={l.id}
                          className={cn(
                            "rounded-full px-2 py-0.5 text-[11px] font-medium",
                            l.color ? LABEL_COLOR_CLASSES[l.color] : "bg-muted text-muted-foreground",
                          )}
                        >
                          {l.name}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className={cn(isExpanded ? "text-primary" : "text-muted-foreground")}
                  onClick={() =>
                    setExpandedId(isExpanded ? null : contact.id)
                  }
                  aria-label="More actions"
                >
                  <IconMoreHorizontal size={16} />
                </Button>
              </div>

              {isExpanded && (
                <div
                  className={cn(
                    "flex flex-wrap items-center gap-1.5 bg-muted px-4 pb-2 pt-2",
                    !isLast && "border-b",
                    "pl-[60px]",
                  )}
                >
                  {props.showTrash ? (
                    <>
                      <Button
                        onClick={() => {
                          props.restoreContact(contact.id);
                          setExpandedId(null);
                        }}
                        variant="secondary"
                        size="sm"
                      >
                        Restore
                      </Button>
                      <Button
                        onClick={() => {
                          props.permanentlyDeleteContact(contact.id);
                          setExpandedId(null);
                        }}
                        variant="destructive"
                        size="sm"
                      >
                        Delete forever
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        onClick={() => {
                          props.setEditingId(contact.id);
                          props.setDisplayName(contact.display_name);
                          props.setContactPhone(getPrimaryPhone(contact) ?? "");
                          props.setContactEmail(getPrimaryEmail(contact) ?? "");
                          props.setContactPhoneCountry(
                            detectCountryFromE164(getPrimaryPhone(contact) ?? ""),
                          );
                          setExpandedId(null);
                        }}
                        variant="secondary"
                        size="sm"
                      >
                        Edit
                      </Button>
                      <Button
                        onClick={() => {
                          props.softDeleteContact(contact.id);
                          setExpandedId(null);
                        }}
                        variant="destructive"
                        size="sm"
                      >
                        Move to trash
                      </Button>

                      {props.labels.length > 0 && (
                        <span className="mt-1 flex w-full flex-wrap gap-1">
                          {props.labels.map((l) => (
                            <Button
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
                              variant="secondary"
                              size="sm"
                              className={cn(assignedIds.has(l.id) && "border-primary text-primary")}
                            >
                              {assignedIds.has(l.id) ? "✓ " : "+ "}
                              {l.name}
                            </Button>
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

      <div className="border-t px-4 py-2 text-xs text-muted-foreground">
        {count} {count === 1 ? "contact" : "contacts"}
        {props.showTrash ? " in trash" : ""}
      </div>
    </Card>
  );
}
