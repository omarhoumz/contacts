export type SharedLabelRow = { id: string; name: string; color: string };
export type SharedContactEmailRow = { email: string; is_primary: boolean };
export type SharedContactPhoneRow = { e164_phone: string; is_primary: boolean };

export function normalizeSharedLabels(
  value: SharedLabelRow | SharedLabelRow[] | null | undefined,
): SharedLabelRow[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function pickPrimaryEmail(rows: SharedContactEmailRow[] | null | undefined): string | null {
  const allRows = rows ?? [];
  return (allRows.find((row) => row.is_primary) ?? allRows[0])?.email ?? null;
}

export function pickPrimaryPhone(rows: SharedContactPhoneRow[] | null | undefined): string | null {
  const allRows = rows ?? [];
  return (allRows.find((row) => row.is_primary) ?? allRows[0])?.e164_phone ?? null;
}
