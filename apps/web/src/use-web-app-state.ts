import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { contactSchema, labelCreateSchema } from "@widados/shared";
import { contactMatchesQuery, type ContactRow, type LabelRow } from "./contact-search";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

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

export function useWebAppState() {
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
  const [authResolved, setAuthResolved] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [dataBusy, setDataBusy] = useState(false);
  const [mutationBusy, setMutationBusy] = useState(false);
  const client = useMemo(
    () => createClient(supabaseUrl, supabasePublishableKey, { auth: { persistSession: true } }),
    [],
  );

  const displayedContacts = useMemo(
    () => contactRows.filter((c) => contactMatchesQuery(c, query)),
    [contactRows, query],
  );
  const isAuthenticated = authResolved && Boolean(sessionEmail);

  const syncSession = async () => {
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) {
      setSessionEmail(null);
      setAuthResolved(true);
      return;
    }
    setSessionEmail(data.user.email ?? null);
    setAuthResolved(true);
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

  const loadLabels = async () => {
    const { data, error: err } = await client.from("labels").select("id,name,color").order("name");
    if (err) throw new Error(err.message);
    setLabels((data ?? []) as LabelRow[]);
  };

  const loadContacts = async (trashMode: boolean) => {
    let qb = client.from("contacts").select(CONTACT_SELECT).order("updated_at", { ascending: false });
    qb = trashMode ? qb.not("deleted_at", "is", null) : qb.is("deleted_at", null);
    const { data, error: queryError } = await qb;
    if (queryError) throw new Error(queryError.message);
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
    if (!sessionEmail) {
      setContactRows([]);
      setLabels([]);
    }
  }, [sessionEmail]);

  useEffect(() => {
    if (isAuthenticated) {
      void refreshData(showTrash);
    }
  }, [isAuthenticated]);

  const signUp = async () => {
    setAuthBusy(true);
    setFeedback(null);
    const { error: signError } = await client.auth.signUp({ email, password });
    if (signError) {
      setFeedback({ tone: "error", text: signError.message });
      setAuthBusy(false);
      return;
    }
    await syncSession();
    setFeedback({ tone: "info", text: "Check your email to confirm the address if required, then sign in." });
    setAuthBusy(false);
  };

  const signIn = async () => {
    setAuthBusy(true);
    setFeedback(null);
    const { error: signError } = await client.auth.signInWithPassword({ email, password });
    if (signError) {
      setFeedback({ tone: "error", text: signError.message });
      setAuthBusy(false);
      return;
    }
    await syncSession();
    setFeedback({ tone: "success", text: "Signed in." });
    await refreshData();
    setAuthBusy(false);
  };

  const signOut = async () => {
    setAuthBusy(true);
    setFeedback(null);
    const { error: outError } = await client.auth.signOut();
    if (outError) {
      setFeedback({ tone: "error", text: outError.message });
      setAuthBusy(false);
      return;
    }
    await syncSession();
    setFeedback({ tone: "info", text: "Signed out." });
    setContactRows([]);
    setLabels([]);
    setAuthBusy(false);
  };

  const createContact = async () => {
    setMutationBusy(true);
    setFeedback(null);
    const parsed = contactSchema.safeParse({ display_name: displayName });
    if (!parsed.success) {
      setFeedback({ tone: "error", text: "Display name is required." });
      setMutationBusy(false);
      return;
    }
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) {
      setFeedback({ tone: "error", text: userError?.message ?? "Sign in required." });
      setMutationBusy(false);
      return;
    }
    const { error: insertError } = await client.from("contacts").insert({
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
      setFeedback({ tone: "error", text: insertError.message });
      setMutationBusy(false);
      return;
    }
    setFeedback({ tone: "success", text: "Contact created." });
    setDisplayName("");
    await refreshData();
    setMutationBusy(false);
  };

  const updateContact = async () => {
    if (!editingId) return;
    setMutationBusy(true);
    setFeedback(null);
    const parsed = contactSchema.safeParse({ display_name: displayName });
    if (!parsed.success) {
      setFeedback({ tone: "error", text: "Display name is required." });
      setMutationBusy(false);
      return;
    }
    const { error: updateError } = await client
      .from("contacts")
      .update({ display_name: parsed.data.display_name })
      .eq("id", editingId);
    if (updateError) {
      setFeedback({ tone: "error", text: updateError.message });
      setMutationBusy(false);
      return;
    }
    setFeedback({ tone: "success", text: "Contact updated." });
    setEditingId(null);
    setDisplayName("");
    await refreshData();
    setMutationBusy(false);
  };

  const softDeleteContact = async (id: string) => {
    setMutationBusy(true);
    const { error: deleteError } = await client
      .from("contacts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (deleteError) {
      setFeedback({ tone: "error", text: deleteError.message });
      setMutationBusy(false);
      return;
    }
    setFeedback({ tone: "success", text: "Moved to trash." });
    await refreshData();
    setMutationBusy(false);
  };

  const restoreContact = async (id: string) => {
    setMutationBusy(true);
    setFeedback(null);
    const { error: restoreError } = await client.from("contacts").update({ deleted_at: null }).eq("id", id);
    if (restoreError) {
      setFeedback({ tone: "error", text: restoreError.message });
      setMutationBusy(false);
      return;
    }
    setFeedback({ tone: "success", text: "Contact restored." });
    await refreshData();
    setMutationBusy(false);
  };

  const permanentlyDeleteContact = async (id: string) => {
    setMutationBusy(true);
    setFeedback(null);
    const { error: delError } = await client.from("contacts").delete().eq("id", id);
    if (delError) {
      setFeedback({ tone: "error", text: delError.message });
      setMutationBusy(false);
      return;
    }
    setFeedback({ tone: "success", text: "Contact deleted forever." });
    await refreshData();
    setMutationBusy(false);
  };

  const createLabel = async () => {
    setMutationBusy(true);
    setFeedback(null);
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
    const { error: insertError } = await client.from("labels").insert({
      name: parsed.data.name,
      color: parsed.data.color,
      user_id: userData.user.id,
    });
    if (insertError) {
      setFeedback({ tone: "error", text: insertError.message });
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
    setFeedback(null);
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) {
      setFeedback({ tone: "error", text: userError?.message ?? "Sign in required." });
      setMutationBusy(false);
      return;
    }
    if (currentlyAssigned) {
      const { error: delError } = await client
        .from("contact_labels")
        .delete()
        .eq("contact_id", contactId)
        .eq("label_id", labelId);
      if (delError) {
        setFeedback({ tone: "error", text: delError.message });
        setMutationBusy(false);
        return;
      }
      setFeedback({ tone: "success", text: "Label removed." });
    } else {
      const { error: insError } = await client.from("contact_labels").insert({
        contact_id: contactId,
        label_id: labelId,
        user_id: userData.user.id,
      });
      if (insError) {
        setFeedback({ tone: "error", text: insError.message });
        setMutationBusy(false);
        return;
      }
      setFeedback({ tone: "success", text: "Label added." });
    }
    await refreshData();
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
    authResolved,
    authBusy,
    dataBusy,
    mutationBusy,
    displayedContacts,
    isAuthenticated,
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
