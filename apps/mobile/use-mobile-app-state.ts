import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { contactSchema, labelCreateSchema } from "@widados/shared";
import { supabaseAuthStorage } from "./supabase-storage";
import { contactMatchesQuery, type ContactRow, type LabelRow } from "./mobile-contact-search";

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
const supabaseUrl = env?.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabasePublishableKey = env?.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

const CONTACT_SELECT = `
  id,
  display_name,
  deleted_at,
  contact_labels (
    label_id,
    labels ( id, name, color )
  )
`;

type Feedback = { tone: "error" | "success" | "info"; text: string };

export function useMobileAppState() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [contactRows, setContactRows] = useState<ContactRow[]>([]);
  const [labels, setLabels] = useState<LabelRow[]>([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#4f46e5");
  const [showTrash, setShowTrash] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [dataBusy, setDataBusy] = useState(false);
  const [mutationBusy, setMutationBusy] = useState(false);

  const client = useMemo(
    () =>
      createClient(supabaseUrl, supabasePublishableKey, {
        auth: { persistSession: true, storage: supabaseAuthStorage },
      }),
    [],
  );

  const displayedContacts = contactRows.filter((c) => contactMatchesQuery(c, query));

  const syncSession = async () => {
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) {
      setSessionEmail(null);
      return;
    }
    setSessionEmail(data.user.email ?? null);
  };

  const loadLabels = async () => {
    const { data, error } = await client.from("labels").select("id,name,color").order("name");
    if (error) throw new Error(error.message);
    setLabels((data ?? []) as LabelRow[]);
  };

  const loadContacts = async (trashMode: boolean) => {
    let qb = client.from("contacts").select(CONTACT_SELECT).order("updated_at", { ascending: false });
    qb = trashMode ? qb.not("deleted_at", "is", null) : qb.is("deleted_at", null);
    const { data, error } = await qb;
    if (error) throw new Error(error.message);
    setContactRows((data ?? []) as ContactRow[]);
  };

  const refreshData = async (trashMode = showTrash) => {
    setDataBusy(true);
    try {
      await Promise.all([loadContacts(trashMode), loadLabels()]);
    } catch (e) {
      setFeedback({ tone: "error", text: e instanceof Error ? e.message : "Failed to refresh data" });
    } finally {
      setDataBusy(false);
    }
  };

  useEffect(() => {
    void syncSession();
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(() => {
      void syncSession();
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (sessionEmail) {
      void refreshData(showTrash);
      return;
    }
    setContactRows([]);
    setLabels([]);
  }, [sessionEmail]);

  const signUp = async () => {
    setAuthBusy(true);
    setFeedback(null);
    const { error } = await client.auth.signUp({ email, password });
    if (error) {
      setFeedback({ tone: "error", text: error.message });
      setAuthBusy(false);
      return;
    }
    await syncSession();
    setFeedback({ tone: "info", text: "Account created. Confirm email if required, then sign in." });
    setAuthBusy(false);
  };

  const signIn = async () => {
    setAuthBusy(true);
    setFeedback(null);
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      setFeedback({ tone: "error", text: error.message });
      setAuthBusy(false);
      return;
    }
    await syncSession();
    setFeedback({ tone: "success", text: "Signed in." });
    await refreshData(showTrash);
    setAuthBusy(false);
  };

  const signOut = async () => {
    setAuthBusy(true);
    setFeedback(null);
    const { error } = await client.auth.signOut();
    if (error) {
      setFeedback({ tone: "error", text: error.message });
      setAuthBusy(false);
      return;
    }
    await syncSession();
    setContactRows([]);
    setLabels([]);
    setFeedback({ tone: "info", text: "Signed out." });
    setAuthBusy(false);
  };

  const createContact = async () => {
    setMutationBusy(true);
    const parsed = contactSchema.safeParse({ display_name: displayName });
    if (!parsed.success) {
      setFeedback({ tone: "error", text: "Display name required." });
      setMutationBusy(false);
      return;
    }
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) {
      setFeedback({ tone: "error", text: userError?.message ?? "Sign in required." });
      setMutationBusy(false);
      return;
    }
    const { error } = await client.from("contacts").insert({
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
      setFeedback({ tone: "error", text: error.message });
      setMutationBusy(false);
      return;
    }
    setFeedback({ tone: "success", text: "Contact created." });
    setDisplayName("");
    await refreshData(showTrash);
    setMutationBusy(false);
  };

  const updateContact = async () => {
    if (!editingId) return;
    setMutationBusy(true);
    const parsed = contactSchema.safeParse({ display_name: displayName });
    if (!parsed.success) {
      setFeedback({ tone: "error", text: "Display name required." });
      setMutationBusy(false);
      return;
    }
    const { error } = await client
      .from("contacts")
      .update({ display_name: parsed.data.display_name })
      .eq("id", editingId);
    if (error) {
      setFeedback({ tone: "error", text: error.message });
      setMutationBusy(false);
      return;
    }
    setFeedback({ tone: "success", text: "Contact updated." });
    setDisplayName("");
    setEditingId(null);
    await refreshData(showTrash);
    setMutationBusy(false);
  };

  const softDeleteContact = async (id: string) => {
    setMutationBusy(true);
    const { error } = await client
      .from("contacts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      setFeedback({ tone: "error", text: error.message });
      setMutationBusy(false);
      return;
    }
    setFeedback({ tone: "success", text: "Moved to trash." });
    await refreshData(showTrash);
    setMutationBusy(false);
  };

  const restoreContact = async (id: string) => {
    setMutationBusy(true);
    const { error } = await client.from("contacts").update({ deleted_at: null }).eq("id", id);
    if (error) {
      setFeedback({ tone: "error", text: error.message });
      setMutationBusy(false);
      return;
    }
    setFeedback({ tone: "success", text: "Restored." });
    await refreshData(showTrash);
    setMutationBusy(false);
  };

  const permanentlyDeleteContact = async (id: string) => {
    setMutationBusy(true);
    const { error } = await client.from("contacts").delete().eq("id", id);
    if (error) {
      setFeedback({ tone: "error", text: error.message });
      setMutationBusy(false);
      return;
    }
    setFeedback({ tone: "success", text: "Deleted permanently." });
    await refreshData(showTrash);
    setMutationBusy(false);
  };

  const createLabel = async () => {
    setMutationBusy(true);
    const parsed = labelCreateSchema.safeParse({ name: newLabelName, color: newLabelColor });
    if (!parsed.success) {
      setFeedback({ tone: "error", text: parsed.error.issues.map((e) => e.message).join("; ") });
      setMutationBusy(false);
      return;
    }
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) {
      setFeedback({ tone: "error", text: userError?.message ?? "Sign in required." });
      setMutationBusy(false);
      return;
    }
    const { error } = await client.from("labels").insert({
      name: parsed.data.name,
      color: parsed.data.color,
      user_id: userData.user.id,
    });
    if (error) {
      setFeedback({ tone: "error", text: error.message });
      setMutationBusy(false);
      return;
    }
    setFeedback({ tone: "success", text: "Label created." });
    setNewLabelName("");
    setNewLabelColor("#4f46e5");
    await loadLabels();
    setMutationBusy(false);
  };

  const toggleContactLabel = async (contactId: string, labelId: string, currentlyAssigned: boolean) => {
    setMutationBusy(true);
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) {
      setFeedback({ tone: "error", text: userError?.message ?? "Sign in required." });
      setMutationBusy(false);
      return;
    }
    if (currentlyAssigned) {
      const { error } = await client
        .from("contact_labels")
        .delete()
        .eq("contact_id", contactId)
        .eq("label_id", labelId);
      if (error) {
        setFeedback({ tone: "error", text: error.message });
        setMutationBusy(false);
        return;
      }
      setFeedback({ tone: "success", text: "Label removed." });
    } else {
      const { error } = await client.from("contact_labels").insert({
        contact_id: contactId,
        label_id: labelId,
        user_id: userData.user.id,
      });
      if (error) {
        setFeedback({ tone: "error", text: error.message });
        setMutationBusy(false);
        return;
      }
      setFeedback({ tone: "success", text: "Label added." });
    }
    await refreshData(showTrash);
    setMutationBusy(false);
  };

  return {
    email,
    password,
    displayName,
    query,
    editingId,
    labels,
    newLabelName,
    newLabelColor,
    showTrash,
    feedback,
    sessionEmail,
    authBusy,
    dataBusy,
    mutationBusy,
    displayedContacts,
    setEmail,
    setPassword,
    setDisplayName,
    setQuery,
    setEditingId,
    setNewLabelName,
    setNewLabelColor,
    setShowTrash,
    signUp,
    signIn,
    signOut,
    createContact,
    updateContact,
    softDeleteContact,
    restoreContact,
    permanentlyDeleteContact,
    createLabel,
    toggleContactLabel,
    refreshData,
  };
}
