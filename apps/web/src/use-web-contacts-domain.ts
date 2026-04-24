import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { contactSchema } from "@widados/shared";
import type { ContactRow } from "./contact-search";
import {
  detectCountryFromE164,
  getDefaultPhoneCountryFromLocale,
  isLikelyValidE164,
  normalizePhoneE164,
  type PhoneCountry,
} from "./phone-country";

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

type UseWebContactsDomainParams = {
  client: SupabaseClient;
  isAuthenticated: boolean;
  sessionEmail: string | null;
  loadLabels: () => Promise<void>;
  setFeedback: (feedback: Feedback | null) => void;
};

export function useWebContactsDomain(params: UseWebContactsDomainParams) {
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountry>(() => getDefaultPhoneCountryFromLocale());
  const [showTrash, setShowTrash] = useState(false);
  const [dataBusy, setDataBusy] = useState(false);
  const [mutationBusy, setMutationBusy] = useState(false);
  const [contactRows, setContactRows] = useState<ContactRow[]>([]);

  const displayedContacts = useMemo(() => contactRows, [contactRows]);

  const escapeLike = (value: string) => value.replaceAll("%", "\\%").replaceAll("_", "\\_");

  const loadContacts = async (trashMode: boolean, searchTerm: string) => {
    const trimmed = searchTerm.trim();
    let qb = params.client.from("contacts").select(CONTACT_SELECT).order("updated_at", { ascending: false });
    qb = trashMode ? qb.not("deleted_at", "is", null) : qb.is("deleted_at", null);
    if (!trimmed) {
      const { data, error: queryError } = await qb;
      if (queryError) throw new Error(queryError.message);
      setContactRows((data ?? []) as ContactRow[]);
      return;
    }

    const like = `%${escapeLike(trimmed)}%`;
    const [nameMatch, emailMatch, phoneMatch, labelMatch] = await Promise.all([
      params.client.from("contacts").select("id").ilike("display_name", like),
      params.client.from("contact_emails").select("contact_id").ilike("email", like),
      params.client.from("contact_phones").select("contact_id").ilike("e164_phone", like),
      params.client.from("contact_labels").select("contact_id,labels!inner(name)").ilike("labels.name", like),
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
      setContactRows([]);
      return;
    }
    qb = qb.in("id", [...idSet]);
    const { data, error: queryError } = await qb;
    if (queryError) throw new Error(queryError.message);
    setContactRows((data ?? []) as ContactRow[]);
  };

  const refreshData = async (trashMode = showTrash, searchTerm = query) => {
    setDataBusy(true);
    try {
      await Promise.all([loadContacts(trashMode, searchTerm), params.loadLabels()]);
    } catch (e) {
      params.setFeedback({
        tone: "error",
        text: e instanceof Error ? e.message : "Failed to refresh data",
      });
    } finally {
      setDataBusy(false);
    }
  };

  useEffect(() => {
    if (!params.sessionEmail) {
      setContactRows([]);
    }
  }, [params.sessionEmail]);

  useEffect(() => {
    if (params.isAuthenticated) {
      const timer = setTimeout(() => {
        void refreshData(showTrash, query);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [params.isAuthenticated, showTrash, query]);

  // Replace primary email/phone for a contact (delete-then-insert, MVP simplicity).
  const upsertContactFields = async (contactId: string, userId: string) => {
    const trimmedEmail = email.trim();
    const normalizedPhone = normalizePhoneE164(phone, phoneCountry);

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

  const createContact = async () => {
    setMutationBusy(true);
    params.setFeedback(null);
    const normalizedPhone = normalizePhoneE164(phone, phoneCountry);
    const parsed = contactSchema.safeParse({
      display_name: displayName,
      email: email.trim(),
      phone,
    });
    if (!parsed.success) {
      params.setFeedback({ tone: "error", text: "Enter valid display name and email." });
      setMutationBusy(false);
      return;
    }
    if (phone.trim() && !isLikelyValidE164(normalizedPhone)) {
      params.setFeedback({
        tone: "error",
        text: "Enter a valid phone number including area code.",
      });
      setMutationBusy(false);
      return;
    }
    const { data: userData, error: userError } = await params.client.auth.getUser();
    if (userError || !userData.user) {
      params.setFeedback({ tone: "error", text: userError?.message ?? "Sign in required." });
      setMutationBusy(false);
      return;
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
      return;
    }
    await upsertContactFields(inserted.id, userData.user.id);
    params.setFeedback({ tone: "success", text: "Contact created." });
    setDisplayName("");
    setPhone("");
    setEmail("");
    setPhoneCountry(getDefaultPhoneCountryFromLocale());
    await refreshData();
    setMutationBusy(false);
  };

  const updateContact = async () => {
    if (!editingId) return;
    setMutationBusy(true);
    params.setFeedback(null);
    const normalizedPhone = normalizePhoneE164(phone, phoneCountry);
    const parsed = contactSchema.safeParse({
      display_name: displayName,
      email: email.trim(),
      phone,
    });
    if (!parsed.success) {
      params.setFeedback({ tone: "error", text: "Enter valid display name and email." });
      setMutationBusy(false);
      return;
    }
    if (phone.trim() && !isLikelyValidE164(normalizedPhone)) {
      params.setFeedback({
        tone: "error",
        text: "Enter a valid phone number including area code.",
      });
      setMutationBusy(false);
      return;
    }
    const { data: userData2, error: userError2 } = await params.client.auth.getUser();
    if (userError2 || !userData2.user) {
      params.setFeedback({ tone: "error", text: userError2?.message ?? "Sign in required." });
      setMutationBusy(false);
      return;
    }
    const { error: updateError } = await params.client
      .from("contacts")
      .update({ display_name: parsed.data.display_name })
      .eq("id", editingId);
    if (updateError) {
      params.setFeedback({ tone: "error", text: updateError.message });
      setMutationBusy(false);
      return;
    }
    await upsertContactFields(editingId, userData2.user.id);
    params.setFeedback({ tone: "success", text: "Contact updated." });
    setEditingId(null);
    setDisplayName("");
    setPhone("");
    setEmail("");
    setPhoneCountry(getDefaultPhoneCountryFromLocale());
    await refreshData();
    setMutationBusy(false);
  };

  const softDeleteContact = async (id: string) => {
    setMutationBusy(true);
    const { error: deleteError } = await params.client
      .from("contacts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (deleteError) {
      params.setFeedback({ tone: "error", text: deleteError.message });
      setMutationBusy(false);
      return;
    }
    params.setFeedback({ tone: "success", text: "Moved to trash." });
    await refreshData();
    setMutationBusy(false);
  };

  const restoreContact = async (id: string) => {
    setMutationBusy(true);
    params.setFeedback(null);
    const { error: restoreError } = await params.client
      .from("contacts")
      .update({ deleted_at: null })
      .eq("id", id);
    if (restoreError) {
      params.setFeedback({ tone: "error", text: restoreError.message });
      setMutationBusy(false);
      return;
    }
    params.setFeedback({ tone: "success", text: "Contact restored." });
    await refreshData();
    setMutationBusy(false);
  };

  const permanentlyDeleteContact = async (id: string) => {
    setMutationBusy(true);
    params.setFeedback(null);
    const { error: delError } = await params.client.from("contacts").delete().eq("id", id);
    if (delError) {
      params.setFeedback({ tone: "error", text: delError.message });
      setMutationBusy(false);
      return;
    }
    params.setFeedback({ tone: "success", text: "Contact deleted forever." });
    await refreshData();
    setMutationBusy(false);
  };

  const toggleContactLabel = async (contactId: string, labelId: string, currentlyAssigned: boolean) => {
    setMutationBusy(true);
    params.setFeedback(null);
    const { data: userData, error: userError } = await params.client.auth.getUser();
    if (userError || !userData.user) {
      params.setFeedback({ tone: "error", text: userError?.message ?? "Sign in required." });
      setMutationBusy(false);
      return;
    }
    if (currentlyAssigned) {
      const { error: delError } = await params.client
        .from("contact_labels")
        .delete()
        .eq("contact_id", contactId)
        .eq("label_id", labelId);
      if (delError) {
        params.setFeedback({ tone: "error", text: delError.message });
        setMutationBusy(false);
        return;
      }
      params.setFeedback({ tone: "success", text: "Label removed." });
    } else {
      const { error: insError } = await params.client.from("contact_labels").insert({
        contact_id: contactId,
        label_id: labelId,
        user_id: userData.user.id,
      });
      if (insError) {
        params.setFeedback({ tone: "error", text: insError.message });
        setMutationBusy(false);
        return;
      }
      params.setFeedback({ tone: "success", text: "Label added." });
    }
    await refreshData();
    setMutationBusy(false);
  };

  return {
    query,
    editingId,
    displayName,
    phone,
    email,
    phoneCountry,
    showTrash,
    dataBusy,
    mutationBusy,
    displayedContacts,
    setQuery,
    setEditingId,
    setDisplayName,
    setPhone,
    setEmail,
    setPhoneCountry,
    setShowTrash,
    refreshData,
    createContact,
    updateContact,
    softDeleteContact,
    restoreContact,
    permanentlyDeleteContact,
    toggleContactLabel,
    detectCountryFromE164,
  };
}
