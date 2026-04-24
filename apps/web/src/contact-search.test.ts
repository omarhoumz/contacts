import { describe, expect, it } from "vitest";
import {
  normalizeLabels,
  contactMatchesQuery,
  filterContacts,
  isTrashContact,
  isActiveContact,
  isLabelAssigned,
  getAssignedLabelIds,
  getAssignedLabels,
  isAuthenticated,
  type ContactRow,
  type LabelRow,
} from "./contact-search";

// ── Fixtures ────────────────────────────────────────────────────────────────────

const LABEL_FAMILY: LabelRow = { id: "l1", name: "Family", color: "#e11d48" };
const LABEL_WORK: LabelRow = { id: "l2", name: "Work", color: "#7c3aed" };
const LABEL_VIP: LabelRow = { id: "l3", name: "VIP", color: "#0284c7" };

function makeContact(
  overrides: Partial<ContactRow> & { labels?: LabelRow[] } = {},
): ContactRow {
  const { labels, ...rest } = overrides;
  return {
    id: "c1",
    display_name: "Jane Doe",
    deleted_at: null,
    contact_labels: labels ? labels.map((l) => ({ label_id: l.id, labels: l })) : null,
    ...rest,
  };
}

// ── normalizeLabels ─────────────────────────────────────────────────────────────

describe("normalizeLabels", () => {
  it("returns a single-item array for a single object", () => {
    expect(normalizeLabels(LABEL_FAMILY)).toEqual([LABEL_FAMILY]);
  });

  it("passes through an existing array unchanged", () => {
    expect(normalizeLabels([LABEL_FAMILY, LABEL_WORK])).toEqual([LABEL_FAMILY, LABEL_WORK]);
  });

  it("returns empty array for null", () => {
    expect(normalizeLabels(null)).toEqual([]);
  });

  it("returns empty array for undefined", () => {
    expect(normalizeLabels(undefined)).toEqual([]);
  });
});

// ── contactMatchesQuery ─────────────────────────────────────────────────────────

describe("contactMatchesQuery", () => {
  it("matches on display_name (case-insensitive)", () => {
    expect(contactMatchesQuery(makeContact(), "jane")).toBe(true);
    expect(contactMatchesQuery(makeContact(), "JANE")).toBe(true);
    expect(contactMatchesQuery(makeContact(), "DOE")).toBe(true);
  });

  it("returns true when query is empty", () => {
    expect(contactMatchesQuery(makeContact(), "")).toBe(true);
    expect(contactMatchesQuery(makeContact(), "   ")).toBe(true);
  });

  it("matches nested label name from array payload", () => {
    const c = makeContact({ labels: [LABEL_FAMILY] });
    expect(contactMatchesQuery(c, "family")).toBe(true);
  });

  it("matches nested label name from single-object payload", () => {
    const c: ContactRow = {
      id: "c2",
      display_name: "Bob",
      deleted_at: null,
      contact_labels: [{ label_id: "l2", labels: LABEL_WORK }],
    };
    expect(contactMatchesQuery(c, "work")).toBe(true);
  });

  it("does not throw and returns false when nothing matches", () => {
    const c = makeContact({ labels: [LABEL_FAMILY] });
    expect(() => contactMatchesQuery(c, "unknown")).not.toThrow();
    expect(contactMatchesQuery(c, "unknown")).toBe(false);
  });

  it("returns false when contact has no labels and name does not match", () => {
    expect(contactMatchesQuery(makeContact(), "zzz")).toBe(false);
  });

  it("handles null contact_labels gracefully", () => {
    const c = makeContact({ contact_labels: null });
    expect(contactMatchesQuery(c, "family")).toBe(false);
    expect(contactMatchesQuery(c, "jane")).toBe(true);
  });
});

// ── filterContacts ──────────────────────────────────────────────────────────────

describe("filterContacts", () => {
  const contacts: ContactRow[] = [
    makeContact({ id: "c1", display_name: "Alice", labels: [LABEL_FAMILY] }),
    makeContact({ id: "c2", display_name: "Bob", labels: [LABEL_WORK] }),
    makeContact({ id: "c3", display_name: "Charlie", labels: [] }),
  ];

  it("returns all contacts when query is empty", () => {
    expect(filterContacts(contacts, "")).toHaveLength(3);
  });

  it("filters by display name", () => {
    const result = filterContacts(contacts, "alice");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("c1");
  });

  it("filters by label name", () => {
    const result = filterContacts(contacts, "work");
    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("c2");
  });

  it("returns empty array when no contacts match", () => {
    expect(filterContacts(contacts, "zzz")).toHaveLength(0);
  });

  it("returns empty array for empty input", () => {
    expect(filterContacts([], "alice")).toHaveLength(0);
  });
});

// ── Trash classification ────────────────────────────────────────────────────────

describe("isTrashContact", () => {
  it("returns true when deleted_at is a timestamp string", () => {
    const c = makeContact({ deleted_at: "2026-04-23T10:00:00.000Z" });
    expect(isTrashContact(c)).toBe(true);
  });

  it("returns false when deleted_at is null (active contact)", () => {
    expect(isTrashContact(makeContact())).toBe(false);
  });
});

describe("isActiveContact", () => {
  it("returns true when deleted_at is null", () => {
    expect(isActiveContact(makeContact())).toBe(true);
  });

  it("returns false when deleted_at is set", () => {
    const c = makeContact({ deleted_at: "2026-04-23T10:00:00.000Z" });
    expect(isActiveContact(c)).toBe(false);
  });

  it("is the logical inverse of isTrashContact", () => {
    const active = makeContact();
    const trashed = makeContact({ deleted_at: "2026-04-23T10:00:00.000Z" });
    expect(isActiveContact(active)).toBe(!isTrashContact(active));
    expect(isActiveContact(trashed)).toBe(!isTrashContact(trashed));
  });
});

// ── Label assignment helpers ────────────────────────────────────────────────────

describe("getAssignedLabelIds", () => {
  it("returns all label IDs assigned to a contact", () => {
    const c = makeContact({ labels: [LABEL_FAMILY, LABEL_WORK] });
    expect(getAssignedLabelIds(c)).toEqual(["l1", "l2"]);
  });

  it("returns empty array when contact has no labels", () => {
    expect(getAssignedLabelIds(makeContact())).toEqual([]);
  });

  it("returns empty array when contact_labels is null", () => {
    const c = makeContact({ contact_labels: null });
    expect(getAssignedLabelIds(c)).toEqual([]);
  });
});

describe("isLabelAssigned", () => {
  it("returns true when the label is assigned", () => {
    const c = makeContact({ labels: [LABEL_FAMILY, LABEL_WORK] });
    expect(isLabelAssigned(c, "l1")).toBe(true);
    expect(isLabelAssigned(c, "l2")).toBe(true);
  });

  it("returns false when the label is not assigned", () => {
    const c = makeContact({ labels: [LABEL_FAMILY] });
    expect(isLabelAssigned(c, "l3")).toBe(false);
  });

  it("returns false when contact has no labels", () => {
    expect(isLabelAssigned(makeContact(), "l1")).toBe(false);
  });
});

describe("getAssignedLabels", () => {
  const allLabels = [LABEL_FAMILY, LABEL_WORK, LABEL_VIP];

  it("returns the LabelRow objects for assigned labels", () => {
    const c = makeContact({ labels: [LABEL_FAMILY, LABEL_VIP] });
    expect(getAssignedLabels(c, allLabels)).toEqual([LABEL_FAMILY, LABEL_VIP]);
  });

  it("returns empty array when no labels are assigned", () => {
    expect(getAssignedLabels(makeContact(), allLabels)).toEqual([]);
  });

  it("ignores label IDs that are not present in allLabels (stale data safety)", () => {
    const c: ContactRow = {
      id: "c1",
      display_name: "Stale",
      deleted_at: null,
      contact_labels: [{ label_id: "l-deleted", labels: null }],
    };
    expect(getAssignedLabels(c, allLabels)).toEqual([]);
  });

  it("returns empty array when allLabels is empty", () => {
    const c = makeContact({ labels: [LABEL_FAMILY] });
    expect(getAssignedLabels(c, [])).toEqual([]);
  });
});

// ── Auth gating ─────────────────────────────────────────────────────────────────

describe("isAuthenticated", () => {
  it("returns true for a valid email string", () => {
    expect(isAuthenticated("user@example.com")).toBe(true);
  });

  it("returns false for null (signed out)", () => {
    expect(isAuthenticated(null)).toBe(false);
  });

  it("returns false for undefined", () => {
    expect(isAuthenticated(undefined)).toBe(false);
  });

  it("returns false for an empty string (cleared session)", () => {
    expect(isAuthenticated("")).toBe(false);
  });
});
