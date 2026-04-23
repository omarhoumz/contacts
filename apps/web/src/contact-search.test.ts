import { describe, expect, it } from "vitest";
import { contactMatchesQuery, normalizeLabels, type ContactRow, type LabelRow } from "./contact-search";

function buildContact(labels: LabelRow[] | LabelRow | null): ContactRow {
  return {
    id: "c1",
    display_name: "Jane Doe",
    deleted_at: null,
    contact_labels: [{ label_id: "l1", labels }],
  };
}

describe("normalizeLabels", () => {
  it("normalizes a single object into an array", () => {
    const value: LabelRow = { id: "l1", name: "vip", color: "#000000" };
    expect(normalizeLabels(value)).toEqual([value]);
  });

  it("returns empty array for nullish values", () => {
    expect(normalizeLabels(null)).toEqual([]);
    expect(normalizeLabels(undefined)).toEqual([]);
  });
});

describe("contactMatchesQuery", () => {
  it("matches display name search", () => {
    const contact = buildContact(null);
    expect(contactMatchesQuery(contact, "jane")).toBe(true);
  });

  it("matches nested label name from array payload", () => {
    const contact = buildContact([{ id: "l1", name: "Family", color: "#111111" }]);
    expect(contactMatchesQuery(contact, "family")).toBe(true);
  });

  it("matches nested label name from object payload", () => {
    const contact = buildContact({ id: "l1", name: "Work", color: "#222222" });
    expect(contactMatchesQuery(contact, "work")).toBe(true);
  });

  it("does not throw and returns false when no match", () => {
    const contact = buildContact({ id: "l1", name: "Friends", color: "#333333" });
    expect(() => contactMatchesQuery(contact, "unknown")).not.toThrow();
    expect(contactMatchesQuery(contact, "unknown")).toBe(false);
  });
});
