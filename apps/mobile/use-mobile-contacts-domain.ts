import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { contactSchema } from "@widados/shared";
import { contactMatchesQuery, type ContactRow } from "./mobile-contact-search";

type Feedback = { tone: "error" | "success" | "info"; text: string };

const CONTACT_SELECT = `
  id,
  display_name,
  deleted_at,
  contact_labels (
    label_id,
    labels ( id, name, color )
  )
`;

type UseMobileContactsDomainParams = {
  client: SupabaseClient;
  sessionEmail: string | null;
  loadLabels: () => Promise<void>;
  setFeedback: (feedback: Feedback | null) => void;
};

export function useMobileContactsDomain(params: UseMobileContactsDomainParams) {
  const [displayName, setDisplayName] = useState("");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [showTrash, setShowTrash] = useState(false);
  const [dataBusy, setDataBusy] = useState(false);
  const [mutationBusy, setMutationBusy] = useState(false);
  const [contactRows, setContactRows] = useState<ContactRow[]>([]);

  const displayedContacts = useMemo(
    () => contactRows.filter((c) => contactMatchesQuery(c, query)),
    [contactRows, query],
  );

  const loadContacts = async (trashMode: boolean) => {
    let qb = params.client
      .from("contacts")
      .select(CONTACT_SELECT)
      .order("updated_at", { ascending: false });
    qb = trashMode ? qb.not("deleted_at", "is", null) : qb.is("deleted_at", null);
    const { data, error } = await qb;
    if (error) throw new Error(error.message);
    setContactRows((data ?? []) as ContactRow[]);
  };

  const refreshData = async (trashMode = showTrash) => {
    setDataBusy(true);
    try {
      await Promise.all([loadContacts(trashMode), params.loadLabels()]);
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
    if (params.sessionEmail) {
      void refreshData(showTrash);
      return;
    }
    setContactRows([]);
  }, [params.sessionEmail]);

  const createContact = async () => {
    setMutationBusy(true);
    const parsed = contactSchema.safeParse({ display_name: displayName });
    if (!parsed.success) {
      params.setFeedback({ tone: "error", text: "Display name required." });
      setMutationBusy(false);
      return;
    }
    const { data: userData, error: userError } = await params.client.auth.getUser();
    if (userError || !userData.user) {
      params.setFeedback({ tone: "error", text: userError?.message ?? "Sign in required." });
      setMutationBusy(false);
      return;
    }
    const { error } = await params.client.from("contacts").insert({
      display_name: parsed.data.display_name,
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      company: parsed.data.company,
      job_title: parsed.data.job_title,
      notes: parsed.data.notes,
      birthday: parsed.data.birthday ?? null,
      user_id: userData.user.id,
    });
    if (error) {
      params.setFeedback({ tone: "error", text: error.message });
      setMutationBusy(false);
      return;
    }
    params.setFeedback({ tone: "success", text: "Contact created." });
    setDisplayName("");
    await refreshData(showTrash);
    setMutationBusy(false);
  };

  const updateContact = async () => {
    if (!editingId) return;
    setMutationBusy(true);
    const parsed = contactSchema.safeParse({ display_name: displayName });
    if (!parsed.success) {
      params.setFeedback({ tone: "error", text: "Display name required." });
      setMutationBusy(false);
      return;
    }
    const { error } = await params.client
      .from("contacts")
      .update({ display_name: parsed.data.display_name })
      .eq("id", editingId);
    if (error) {
      params.setFeedback({ tone: "error", text: error.message });
      setMutationBusy(false);
      return;
    }
    params.setFeedback({ tone: "success", text: "Contact updated." });
    setDisplayName("");
    setEditingId(null);
    await refreshData(showTrash);
    setMutationBusy(false);
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
    await refreshData(showTrash);
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
    await refreshData(showTrash);
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
    await refreshData(showTrash);
    setMutationBusy(false);
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
    await refreshData(showTrash);
    setMutationBusy(false);
  };

  return {
    displayName,
    query,
    editingId,
    showTrash,
    dataBusy,
    mutationBusy,
    displayedContacts,
    setDisplayName,
    setQuery,
    setEditingId,
    setShowTrash,
    refreshData,
    createContact,
    updateContact,
    softDeleteContact,
    restoreContact,
    permanentlyDeleteContact,
    toggleContactLabel,
  };
}
