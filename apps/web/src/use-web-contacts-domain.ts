import { useEffect, useMemo, useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { contactSchema } from "@widados/shared";
import { contactMatchesQuery, type ContactRow } from "./contact-search";

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
    const { data, error: queryError } = await qb;
    if (queryError) throw new Error(queryError.message);
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
    if (!params.sessionEmail) {
      setContactRows([]);
    }
  }, [params.sessionEmail]);

  useEffect(() => {
    if (params.isAuthenticated) {
      void refreshData(showTrash);
    }
  }, [params.isAuthenticated]);

  const createContact = async () => {
    setMutationBusy(true);
    params.setFeedback(null);
    const parsed = contactSchema.safeParse({ display_name: displayName });
    if (!parsed.success) {
      params.setFeedback({ tone: "error", text: "Display name is required." });
      setMutationBusy(false);
      return;
    }
    const { data: userData, error: userError } = await params.client.auth.getUser();
    if (userError || !userData.user) {
      params.setFeedback({ tone: "error", text: userError?.message ?? "Sign in required." });
      setMutationBusy(false);
      return;
    }
    const { error: insertError } = await params.client.from("contacts").insert({
      display_name: parsed.data.display_name,
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      company: parsed.data.company,
      job_title: parsed.data.job_title,
      notes: parsed.data.notes,
      birthday: parsed.data.birthday ?? null,
      user_id: userData.user.id,
    });
    if (insertError) {
      params.setFeedback({ tone: "error", text: insertError.message });
      setMutationBusy(false);
      return;
    }
    params.setFeedback({ tone: "success", text: "Contact created." });
    setDisplayName("");
    await refreshData();
    setMutationBusy(false);
  };

  const updateContact = async () => {
    if (!editingId) return;
    setMutationBusy(true);
    params.setFeedback(null);
    const parsed = contactSchema.safeParse({ display_name: displayName });
    if (!parsed.success) {
      params.setFeedback({ tone: "error", text: "Display name is required." });
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
    params.setFeedback({ tone: "success", text: "Contact updated." });
    setEditingId(null);
    setDisplayName("");
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
    showTrash,
    dataBusy,
    mutationBusy,
    displayedContacts,
    setQuery,
    setEditingId,
    setDisplayName,
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
