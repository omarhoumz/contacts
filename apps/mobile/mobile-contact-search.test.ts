import { describe, expect, it } from "vitest";
import { contactMatchesQuery, getPrimaryEmail, getPrimaryPhone, normalizeLabels, type ContactRow } from "./mobile-contact-search";

const baseContact: ContactRow = {
  id: "c1",
  display_name: "Jane Doe",
  deleted_at: null,
  contact_labels: [{ label_id: "l1", labels: { id: "l1", name: "Family", color: "#111111" } }],
  contact_emails: [{ email: "jane@example.com", is_primary: true }],
  contact_phones: [{ e164_phone: "+14155551234", is_primary: true }],
};

describe("mobile contact search helpers", () => {
  it("normalizes single and array label payloads", () => {
    expect(normalizeLabels(baseContact.contact_labels?.[0].labels)).toHaveLength(1);
    expect(normalizeLabels([{ id: "l2", name: "Work", color: "#222222" }])).toHaveLength(1);
  });

  it("matches query against display name and labels", () => {
    expect(contactMatchesQuery(baseContact, "jane")).toBe(true);
    expect(contactMatchesQuery(baseContact, "family")).toBe(true);
    expect(contactMatchesQuery(baseContact, "missing")).toBe(false);
  });

  it("returns primary email and phone", () => {
    expect(getPrimaryEmail(baseContact)).toBe("jane@example.com");
    expect(getPrimaryPhone(baseContact)).toBe("+14155551234");
  });
});
