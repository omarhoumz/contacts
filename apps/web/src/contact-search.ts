export type LabelRow = { id: string; name: string; color: string };
export type ContactLabelJoin = { label_id: string; labels: LabelRow | LabelRow[] | null };
export type ContactRow = {
  id: string;
  display_name: string;
  deleted_at: string | null;
  contact_labels: ContactLabelJoin[] | null;
};

// ── Normalisation ──────────────────────────────────────────────────────────────

export function normalizeLabels(value: LabelRow | LabelRow[] | null | undefined): LabelRow[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

// ── Search / filter ────────────────────────────────────────────────────────────

export function contactMatchesQuery(c: ContactRow, q: string): boolean {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  if (c.display_name.toLowerCase().includes(needle)) return true;
  for (const cl of c.contact_labels ?? []) {
    for (const label of normalizeLabels(cl.labels)) {
      if (label.name.toLowerCase().includes(needle)) return true;
    }
  }
  return false;
}

/** Client-side filter against a query string (empty query = show all). */
export function filterContacts(contacts: ContactRow[], query: string): ContactRow[] {
  return contacts.filter((c) => contactMatchesQuery(c, query));
}

// ── Trash classification ───────────────────────────────────────────────────────

export function isTrashContact(c: ContactRow): boolean {
  return c.deleted_at !== null;
}

export function isActiveContact(c: ContactRow): boolean {
  return c.deleted_at === null;
}

// ── Label assignment helpers ───────────────────────────────────────────────────

/** Returns all label IDs currently assigned to a contact. */
export function getAssignedLabelIds(c: ContactRow): string[] {
  return (c.contact_labels ?? []).map((cl) => cl.label_id);
}

/** Returns true if a given label is assigned to the contact. */
export function isLabelAssigned(c: ContactRow, labelId: string): boolean {
  return getAssignedLabelIds(c).includes(labelId);
}

/**
 * Returns the full LabelRow objects for all labels assigned to a contact,
 * cross-referenced against the full label list.
 */
export function getAssignedLabels(c: ContactRow, allLabels: LabelRow[]): LabelRow[] {
  const ids = new Set(getAssignedLabelIds(c));
  return allLabels.filter((l) => ids.has(l.id));
}

// ── Auth gating ────────────────────────────────────────────────────────────────

/** Pure predicate: is there an active session? */
export function isAuthenticated(sessionEmail: string | null | undefined): boolean {
  return typeof sessionEmail === "string" && sessionEmail.length > 0;
}
