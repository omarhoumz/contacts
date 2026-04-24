export type LabelRow = { id: string; name: string; color: string };
export type ContactLabelJoin = { label_id: string; labels: LabelRow | LabelRow[] | null };
export type ContactEmailRow = { email: string; is_primary: boolean };
export type ContactPhoneRow = { e164_phone: string; is_primary: boolean };
export type ContactRow = {
  id: string;
  display_name: string;
  deleted_at: string | null;
  contact_labels: ContactLabelJoin[] | null;
  contact_emails: ContactEmailRow[] | null;
  contact_phones: ContactPhoneRow[] | null;
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
  for (const e of c.contact_emails ?? []) {
    if (e.email.toLowerCase().includes(needle)) return true;
  }
  for (const p of c.contact_phones ?? []) {
    if (p.e164_phone.toLowerCase().includes(needle)) return true;
  }
  return false;
}

// ── Phone / email accessors ────────────────────────────────────────────────────

/** Returns the primary email address, falling back to the first one. */
export function getPrimaryEmail(c: ContactRow): string | null {
  const rows = c.contact_emails ?? [];
  return (rows.find((e) => e.is_primary) ?? rows[0])?.email ?? null;
}

/** Returns the primary phone number, falling back to the first one. */
export function getPrimaryPhone(c: ContactRow): string | null {
  const rows = c.contact_phones ?? [];
  return (rows.find((p) => p.is_primary) ?? rows[0])?.e164_phone ?? null;
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
