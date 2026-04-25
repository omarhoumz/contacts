import { useEffect, useMemo, useRef, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import {
  contactSchema,
  detectCountryFromE164,
  getDefaultPhoneCountryFromLocale,
  isLikelyValidE164,
  normalizePhoneE164,
  type PhoneCountry,
} from "@widados/shared";
import { getPrimaryEmail, getPrimaryPhone, type ContactRow } from "./mobile-contact-search";

type Feedback = { tone: "error" | "success" | "info"; text: string };

const CONTACT_SELECT = `
  id,
  display_name,
  deleted_at,
  contact_labels (
    label_id,
    labels ( id, name, color )
  ),
  contact_emails ( email, is_primary ),
  contact_phones ( e164_phone, is_primary )
`;

export const mobileContactsQueryKeyRoot = ["mobile", "contacts"] as const;

export function mobileContactsQueryKey(trashList: boolean, search: string) {
  return [...mobileContactsQueryKeyRoot, trashList, search] as const;
}

async function fetchMobileContactRows(
  client: SupabaseClient,
  trashMode: boolean,
  searchTerm: string,
): Promise<ContactRow[]> {
  const escapeLike = (value: string) => value.replaceAll("%", "\\%").replaceAll("_", "\\_");
  const trimmed = searchTerm.trim();
  let qb = client.from("contacts").select(CONTACT_SELECT).order("updated_at", { ascending: false });
  qb = trashMode ? qb.not("deleted_at", "is", null) : qb.is("deleted_at", null);
  if (!trimmed) {
    const { data, error } = await qb;
    if (error) throw new Error(error.message);
    return (data ?? []) as ContactRow[];
  }

  const like = `%${escapeLike(trimmed)}%`;
  const [nameMatch, emailMatch, phoneMatch, labelMatch] = await Promise.all([
    client.from("contacts").select("id").ilike("display_name", like),
    client.from("contact_emails").select("contact_id").ilike("email", like),
    client.from("contact_phones").select("contact_id").ilike("e164_phone", like),
    client.from("contact_labels").select("contact_id,labels!inner(name)").ilike("labels.name", like),
  ]);
  if (nameMatch.error) throw new Error(nameMatch.error.message);
  if (emailMatch.error) throw new Error(emailMatch.error.message);
  if (phoneMatch.error) throw new Error(phoneMatch.error.message);
  if (labelMatch.error) throw new Error(labelMatch.error.message);

  const idSet = new Set<string>();
  for (const row of nameMatch.data ?? []) idSet.add(row.id);
  for (const row of emailMatch.data ?? []) idSet.add(row.contact_id);
  for (const row of phoneMatch.data ?? []) idSet.add(row.contact_id);
  for (const row of labelMatch.data ?? []) idSet.add(row.contact_id);
  if (idSet.size === 0) {
    return [];
  }
  qb = qb.in("id", [...idSet]);
  const { data, error } = await qb;
  if (error) throw new Error(error.message);
  return (data ?? []) as ContactRow[];
}

type UseMobileContactsDomainParams = {
  client: SupabaseClient;
  sessionEmail: string | null;
  loadLabels: () => Promise<void>;
  setFeedback: (feedback: Feedback | null) => void;
};

type ContactSubmitValues = {
  display_name: string;
  email: string;
  phone: string;
  phoneCountry: PhoneCountry;
};

export function useMobileContactsDomain(params: UseMobileContactsDomainParams) {
  const queryClient = useQueryClient();
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountry>(() => getDefaultPhoneCountryFromLocale());
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showTrash, setShowTrash] = useState(false);
  const [mutationBusy, setMutationBusy] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query), 300);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    if (!params.sessionEmail) {
      setDebouncedQuery("");
    }
  }, [params.sessionEmail]);

  const listQuery = useQuery({
    queryKey: mobileContactsQueryKey(showTrash, debouncedQuery),
    queryFn: async () => {
      const rows = await fetchMobileContactRows(params.client, showTrash, debouncedQuery);
      await params.loadLabels();
      return rows;
    },
    enabled: Boolean(params.sessionEmail),
    staleTime: 30_000,
    networkMode: "online",
    retry: 1,
  });

  useEffect(() => {
    if (!listQuery.isError || !listQuery.error) return;
    params.setFeedback({
      tone: "error",
      text: listQuery.error instanceof Error ? listQuery.error.message : "Failed to load contacts",
    });
  }, [listQuery.isError, listQuery.error, params.setFeedback]);

  const contactRows = listQuery.data ?? [];
  const contactRowsRef = useRef<ContactRow[]>([]);
  contactRowsRef.current = contactRows;

  const displayedContacts = useMemo(() => contactRows, [contactRows]);

  const dataBusy = listQuery.isPending && contactRows.length === 0;

  const invalidateContacts = () =>
    queryClient.invalidateQueries({ queryKey: [...mobileContactsQueryKeyRoot] });

  const refreshData = async (trashMode?: boolean) => {
    if (trashMode !== undefined) {
      setShowTrash(trashMode);
    }
    await new Promise<void>((r) => setTimeout(r, 0));
    await invalidateContacts();
  };

  const upsertContactFields = async (
    contactId: string,
    userId: string,
    values: ContactSubmitValues,
  ) => {
    const trimmedEmail = values.email.trim();
    const normalizedPhone = normalizePhoneE164(values.phone, values.phoneCountry);

    await params.client.from("contact_emails").delete().eq("contact_id", contactId);
    if (trimmedEmail) {
      await params.client.from("contact_emails").insert({
        contact_id: contactId,
        user_id: userId,
        email: trimmedEmail,
        is_primary: true,
        label: "other",
      });
    }

    await params.client.from("contact_phones").delete().eq("contact_id", contactId);
    if (normalizedPhone) {
      await params.client.from("contact_phones").insert({
        contact_id: contactId,
        user_id: userId,
        e164_phone: normalizedPhone,
        is_primary: true,
        label: "other",
      });
    }
  };

  const createContact = async (input?: Partial<ContactSubmitValues>): Promise<boolean> => {
    setMutationBusy(true);
    params.setFeedback(null);
    const values: ContactSubmitValues = {
      display_name: input?.display_name ?? displayName,
      email: input?.email ?? email,
      phone: input?.phone ?? phone,
      phoneCountry: input?.phoneCountry ?? phoneCountry,
    };
    const normalizedPhone = normalizePhoneE164(values.phone, values.phoneCountry);
    const parsed = contactSchema.safeParse({
      display_name: values.display_name,
      email: values.email.trim(),
      phone: values.phone,
    });
    if (!parsed.success) {
      params.setFeedback({ tone: "error", text: "Enter valid display name and email." });
      setMutationBusy(false);
      return false;
    }
    if (values.phone.trim() && !isLikelyValidE164(normalizedPhone)) {
      params.setFeedback({
        tone: "error",
        text: "Enter a valid phone number including area code.",
      });
      setMutationBusy(false);
      return false;
    }
    const { data: userData, error: userError } = await params.client.auth.getUser();
    if (userError || !userData.user) {
      params.setFeedback({ tone: "error", text: userError?.message ?? "Sign in required." });
      setMutationBusy(false);
      return false;
    }
    const { data: inserted, error: insertError } = await params.client
      .from("contacts")
      .insert({
        display_name: parsed.data.display_name,
        first_name: parsed.data.first_name,
        last_name: parsed.data.last_name,
        company: parsed.data.company,
        job_title: parsed.data.job_title,
        notes: parsed.data.notes,
        birthday: parsed.data.birthday ?? null,
        user_id: userData.user.id,
      })
      .select("id")
      .single();
    if (insertError || !inserted) {
      params.setFeedback({ tone: "error", text: insertError?.message ?? "Insert failed." });
      setMutationBusy(false);
      return false;
    }
    await upsertContactFields(inserted.id, userData.user.id, values);
    params.setFeedback({ tone: "success", text: "Contact created." });
    setDisplayName("");
    setPhone("");
    setEmail("");
    setPhoneCountry(getDefaultPhoneCountryFromLocale());
    await invalidateContacts();
    setMutationBusy(false);
    return true;
  };

  const updateContact = async (input?: Partial<ContactSubmitValues>): Promise<boolean> => {
    if (!editingId) return false;
    setMutationBusy(true);
    params.setFeedback(null);
    const values: ContactSubmitValues = {
      display_name: input?.display_name ?? displayName,
      email: input?.email ?? email,
      phone: input?.phone ?? phone,
      phoneCountry: input?.phoneCountry ?? phoneCountry,
    };
    const normalizedPhone = normalizePhoneE164(values.phone, values.phoneCountry);
    const parsed = contactSchema.safeParse({
      display_name: values.display_name,
      email: values.email.trim(),
      phone: values.phone,
    });
    if (!parsed.success) {
      params.setFeedback({ tone: "error", text: "Enter valid display name and email." });
      setMutationBusy(false);
      return false;
    }
    if (values.phone.trim() && !isLikelyValidE164(normalizedPhone)) {
      params.setFeedback({
        tone: "error",
        text: "Enter a valid phone number including area code.",
      });
      setMutationBusy(false);
      return false;
    }
    const { data: userData2, error: userError2 } = await params.client.auth.getUser();
    if (userError2 || !userData2.user) {
      params.setFeedback({ tone: "error", text: userError2?.message ?? "Sign in required." });
      setMutationBusy(false);
      return false;
    }
    const { error: updateError } = await params.client
      .from("contacts")
      .update({ display_name: parsed.data.display_name })
      .eq("id", editingId);
    if (updateError) {
      params.setFeedback({ tone: "error", text: updateError.message });
      setMutationBusy(false);
      return false;
    }
    await upsertContactFields(editingId, userData2.user.id, values);
    params.setFeedback({ tone: "success", text: "Contact updated." });
    setEditingId(null);
    setDisplayName("");
    setPhone("");
    setEmail("");
    setPhoneCountry(getDefaultPhoneCountryFromLocale());
    await invalidateContacts();
    setMutationBusy(false);
    return true;
  };

  const softDeleteContact = async (id: string) => {
    setMutationBusy(true);
    const { error } = await params.client
      .from("contacts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      params.setFeedback({ tone: "error", text: error.message });
      setMutationBusy(false);
      return;
    }
    params.setFeedback({ tone: "success", text: "Moved to trash." });
    await invalidateContacts();
    setMutationBusy(false);
  };

  const restoreContact = async (id: string) => {
    setMutationBusy(true);
    const { error } = await params.client.from("contacts").update({ deleted_at: null }).eq("id", id);
    if (error) {
      params.setFeedback({ tone: "error", text: error.message });
      setMutationBusy(false);
      return;
    }
    params.setFeedback({ tone: "success", text: "Restored." });
    await invalidateContacts();
    setMutationBusy(false);
  };

  const permanentlyDeleteContact = async (id: string) => {
    setMutationBusy(true);
    const { error } = await params.client.from("contacts").delete().eq("id", id);
    if (error) {
      params.setFeedback({ tone: "error", text: error.message });
      setMutationBusy(false);
      return;
    }
    params.setFeedback({ tone: "success", text: "Deleted permanently." });
    await invalidateContacts();
    setMutationBusy(false);
  };

  const populateFormFromContactRow = (row: ContactRow) => {
    setDisplayName(row.display_name);
    const p = getPrimaryPhone(row) ?? "";
    setPhone(p);
    setEmail(getPrimaryEmail(row) ?? "");
    setPhoneCountry(detectCountryFromE164(p));
  };

  const resetContactForm = () => {
    setEditingId(null);
    setDisplayName("");
    setPhone("");
    setEmail("");
    setPhoneCountry(getDefaultPhoneCountryFromLocale());
  };

  const prepareEditContact = async (contactId: string): Promise<boolean> => {
    setEditingId(contactId);
    const cached = contactRowsRef.current.find((c) => c.id === contactId);
    if (cached && cached.deleted_at === null) {
      populateFormFromContactRow(cached);
      return true;
    }
    const { data, error } = await params.client
      .from("contacts")
      .select(CONTACT_SELECT)
      .eq("id", contactId)
      .is("deleted_at", null)
      .maybeSingle();
    if (error) {
      params.setFeedback({ tone: "error", text: error.message });
      resetContactForm();
      return false;
    }
    if (!data) {
      params.setFeedback({ tone: "error", text: "Contact not found." });
      resetContactForm();
      return false;
    }
    populateFormFromContactRow(data as ContactRow);
    return true;
  };

  const toggleContactLabel = async (contactId: string, labelId: string, currentlyAssigned: boolean) => {
    setMutationBusy(true);
    const { data: userData, error: userError } = await params.client.auth.getUser();
    if (userError || !userData.user) {
      params.setFeedback({ tone: "error", text: userError?.message ?? "Sign in required." });
      setMutationBusy(false);
      return;
    }
    if (currentlyAssigned) {
      const { error } = await params.client
        .from("contact_labels")
        .delete()
        .eq("contact_id", contactId)
        .eq("label_id", labelId);
      if (error) {
        params.setFeedback({ tone: "error", text: error.message });
        setMutationBusy(false);
        return;
      }
      params.setFeedback({ tone: "success", text: "Label removed." });
    } else {
      const { error } = await params.client.from("contact_labels").insert({
        contact_id: contactId,
        label_id: labelId,
        user_id: userData.user.id,
      });
      if (error) {
        params.setFeedback({ tone: "error", text: error.message });
        setMutationBusy(false);
        return;
      }
      params.setFeedback({ tone: "success", text: "Label added." });
    }
    await invalidateContacts();
    setMutationBusy(false);
  };

  return {
    displayName,
    phone,
    email,
    phoneCountry,
    query,
    editingId,
    showTrash,
    dataBusy,
    mutationBusy,
    displayedContacts,
    setDisplayName,
    setPhone,
    setEmail,
    setPhoneCountry,
    setQuery,
    setEditingId,
    setShowTrash,
    refreshData,
    resetContactForm,
    prepareEditContact,
    createContact,
    updateContact,
    softDeleteContact,
    restoreContact,
    permanentlyDeleteContact,
    toggleContactLabel,
  };
}
