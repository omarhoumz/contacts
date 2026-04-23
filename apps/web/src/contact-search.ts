export type LabelRow = { id: string; name: string; color: string };
export type ContactLabelJoin = { label_id: string; labels: LabelRow | LabelRow[] | null };
export type ContactRow = {
  id: string;
  display_name: string;
  deleted_at: string | null;
  contact_labels: ContactLabelJoin[] | null;
};

export function normalizeLabels(value: LabelRow | LabelRow[] | null | undefined): LabelRow[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function contactMatchesQuery(c: ContactRow, q: string) {
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
