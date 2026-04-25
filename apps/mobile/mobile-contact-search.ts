import {
  normalizeSharedLabels,
  pickPrimaryEmail,
  pickPrimaryPhone,
  type SharedLabelRow,
} from "@widados/shared";

export type LabelRow = SharedLabelRow;
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

export function normalizeLabels(value: LabelRow | LabelRow[] | null | undefined): LabelRow[] {
  return normalizeSharedLabels(value);
}

export function getPrimaryEmail(c: ContactRow): string | null {
  return pickPrimaryEmail(c.contact_emails);
}

export function getPrimaryPhone(c: ContactRow): string | null {
  return pickPrimaryPhone(c.contact_phones);
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
