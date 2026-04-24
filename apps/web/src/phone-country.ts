import {
  AsYouType,
  parsePhoneNumberFromString,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";

export type PhoneCountry = "US" | "CA" | "GB" | "DE" | "FR" | "AE" | "IN" | "AU";

export const PHONE_COUNTRIES: Array<{ code: PhoneCountry; label: string; dialCode: string }> = [
  { code: "US", label: "United States", dialCode: "1" },
  { code: "CA", label: "Canada", dialCode: "1" },
  { code: "GB", label: "United Kingdom", dialCode: "44" },
  { code: "DE", label: "Germany", dialCode: "49" },
  { code: "FR", label: "France", dialCode: "33" },
  { code: "AE", label: "United Arab Emirates", dialCode: "971" },
  { code: "IN", label: "India", dialCode: "91" },
  { code: "AU", label: "Australia", dialCode: "61" },
];

const byCode = new Map(PHONE_COUNTRIES.map((c) => [c.code, c]));

export function formatDialPrefix(country: PhoneCountry): string {
  return `+${getCountryCallingCode(country as CountryCode)}`;
}

export function normalizePhoneE164(raw: string, country: PhoneCountry): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const parsed = parsePhoneNumberFromString(trimmed, country as CountryCode);
  if (parsed) return parsed.number;
  const formatter = new AsYouType(country as CountryCode);
  formatter.input(trimmed);
  const maybe = formatter.getNumber();
  return maybe?.number ?? "";
}

export function isLikelyValidE164(value: string): boolean {
  const parsed = parsePhoneNumberFromString(value);
  return Boolean(parsed?.isValid());
}

export function detectCountryFromE164(value: string): PhoneCountry {
  const normalized = value.trim();
  if (!normalized.startsWith("+")) return "US";
  const digits = normalized.slice(1);
  const sorted = [...PHONE_COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  const match = sorted.find((c) => digits.startsWith(c.dialCode));
  return match?.code ?? "US";
}
