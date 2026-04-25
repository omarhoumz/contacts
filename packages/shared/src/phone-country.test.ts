import { describe, expect, it } from "vitest";
import {
  detectCountryFromE164,
  formatDialPrefix,
  isLikelyValidE164,
  normalizePhoneE164,
} from "./phone-country";
import { normalizeSharedLabels, pickPrimaryEmail, pickPrimaryPhone } from "./contact-helpers";

describe("phone-country helpers", () => {
  it("formats dial prefix", () => {
    expect(formatDialPrefix("US")).toBe("+1");
  });

  it("normalizes local and international formats", () => {
    expect(normalizePhoneE164("+14155552671", "US")).toBe("+14155552671");
    expect(normalizePhoneE164("4155552671", "US")).toBe("+14155552671");
  });

  it("detects country from e164", () => {
    expect(detectCountryFromE164("+212612345678")).toBe("MA");
  });

  it("validates likely e164 values", () => {
    expect(isLikelyValidE164("+14155552671")).toBe(true);
    expect(isLikelyValidE164("+1")).toBe(false);
  });

  it("normalizes shared label payload and primary fields", () => {
    expect(normalizeSharedLabels({ id: "l1", name: "Family", color: "#111111" })).toHaveLength(1);
    expect(pickPrimaryEmail([{ email: "a@x.com", is_primary: false }])).toBe("a@x.com");
    expect(pickPrimaryPhone([{ e164_phone: "+1415", is_primary: false }])).toBe("+1415");
  });
});
