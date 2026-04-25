import {
  AsYouType,
  getCountries,
  parsePhoneNumberFromString,
  getCountryCallingCode,
  type CountryCode,
} from "libphonenumber-js";

export type PhoneCountry = CountryCode;
export type PhoneCountryOption = { code: PhoneCountry; label: string; dialCode: string };

const fallbackCountry = "US" as PhoneCountry;
const countries = getCountries() as PhoneCountry[];

function getCountryLabeler() {
  try {
    return new Intl.DisplayNames(["en"], { type: "region" });
  } catch {
    return null;
  }
}

const labeler = getCountryLabeler();

export const PHONE_COUNTRIES: PhoneCountryOption[] = countries
  .map((code) => ({
    code,
    label: labeler?.of(code) ?? code,
    dialCode: getCountryCallingCode(code),
  }))
  .sort((a, b) => a.label.localeCompare(b.label));

const countrySet = new Set(PHONE_COUNTRIES.map((c) => c.code));

export function getDefaultPhoneCountryFromLocale(): PhoneCountry {
  const candidates: string[] = [];
  if (typeof navigator !== "undefined") {
    if (Array.isArray(navigator.languages)) candidates.push(...navigator.languages);
    if (navigator.language) candidates.push(navigator.language);
  }
  for (const locale of candidates) {
    const region = locale.split("-").at(-1)?.toUpperCase();
    if (!region) continue;
    if (countrySet.has(region as PhoneCountry)) return region as PhoneCountry;
  }
  return fallbackCountry;
}

export function formatDialPrefix(country: PhoneCountry): string {
  return `+${getCountryCallingCode(country)}`;
}

export function normalizePhoneE164(raw: string, country: PhoneCountry): string {
  const trimmed = raw.trim();
  if (!trimmed) return "";
  const dial = getCountryCallingCode(country);
  // Accept user input that duplicates selected dial code without '+' (e.g. "2123400..." with MA selected).
  if (!trimmed.startsWith("+")) {
    const digitsOnly = trimmed.replace(/[^\d]/g, "");
    if (digitsOnly.startsWith(dial)) {
      const withPlus = `+${digitsOnly}`;
      const parsedPlus = parsePhoneNumberFromString(withPlus);
      if (parsedPlus?.isValid()) return parsedPlus.number;
    }
  }
  const parsed = parsePhoneNumberFromString(trimmed, country);
  if (parsed?.isValid()) return parsed.number;
  const formatter = new AsYouType(country);
  formatter.input(trimmed);
  const maybe = formatter.getNumber();
  return maybe?.isValid() ? maybe.number : "";
}

export function isLikelyValidE164(value: string): boolean {
  const parsed = parsePhoneNumberFromString(value);
  return Boolean(parsed?.isValid());
}

export function detectCountryFromE164(value: string): PhoneCountry {
  const normalized = value.trim();
  if (!normalized.startsWith("+")) return fallbackCountry;
  const digits = normalized.slice(1);
  const sorted = [...PHONE_COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length);
  const match = sorted.find((c) => digits.startsWith(c.dialCode));
  return match?.code ?? fallbackCountry;
}

/** Infer calling country from a single phone input (E.164 or national with default). */
export function tryUpdateCountryFromPhoneInput(raw: string, defaultCountry: PhoneCountry): PhoneCountry {
  const t = raw.trim();
  if (!t) return defaultCountry;
  const parsed = parsePhoneNumberFromString(t, defaultCountry);
  if (parsed?.country) return parsed.country as PhoneCountry;
  if (t.startsWith("+")) return detectCountryFromE164(t);
  return defaultCountry;
}
