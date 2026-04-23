import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { labelCreateSchema } from "@widados/shared";
import type { LabelRow } from "./contact-search";
import { useWebContactsDomain } from "./use-web-contacts-domain";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

type Feedback = { tone: "error" | "success" | "info"; text: string };

export function useWebAppState() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [labels, setLabels] = useState<LabelRow[]>([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#4f46e5");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [labelBusy, setLabelBusy] = useState(false);
  const client = useMemo(
    () => createClient(supabaseUrl, supabasePublishableKey, { auth: { persistSession: true } }),
    [],
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

  const contacts = useWebContactsDomain({
    client,
    isAuthenticated,
    sessionEmail,
    loadLabels,
    setFeedback,
  });

  useEffect(() => {
    if (!sessionEmail) {
      setLabels([]);
    }
  }, [sessionEmail]);

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
    await contacts.refreshData();
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
    setLabels([]);
    setAuthBusy(false);
  };

  const createLabel = async () => {
    setLabelBusy(true);
    setFeedback(null);
    try {
      const parsed = labelCreateSchema.safeParse({ name: newLabelName, color: newLabelColor });
      if (!parsed.success) {
        setFeedback({ tone: "error", text: parsed.error.issues.map((e) => e.message).join("; ") });
        return;
      }
      const { data: userData, error: userError } = await client.auth.getUser();
      if (userError || !userData.user) {
        setFeedback({ tone: "error", text: userError?.message ?? "Sign in required." });
        return;
      }
      const { error: insertError } = await client.from("labels").insert({
        name: parsed.data.name,
        color: parsed.data.color,
        user_id: userData.user.id,
      });
      if (insertError) {
        setFeedback({ tone: "error", text: insertError.message });
        return;
      }
      setFeedback({ tone: "success", text: "Label created." });
      setNewLabelName("");
      setNewLabelColor("#4f46e5");
      await loadLabels();
    } finally {
      setLabelBusy(false);
    }
  };

  return {
    email,
    password,
    displayName: contacts.displayName,
    query: contacts.query,
    editingId: contacts.editingId,
    labels,
    newLabelName,
    newLabelColor,
    showTrash: contacts.showTrash,
    feedback,
    sessionEmail,
    authResolved,
    authBusy,
    dataBusy: contacts.dataBusy,
    mutationBusy: contacts.mutationBusy || labelBusy,
    displayedContacts: contacts.displayedContacts,
    isAuthenticated,
    setEmail,
    setPassword,
    setDisplayName: contacts.setDisplayName,
    setQuery: contacts.setQuery,
    setEditingId: contacts.setEditingId,
    setNewLabelName,
    setNewLabelColor,
    setShowTrash: contacts.setShowTrash,
    signUp,
    signIn,
    signOut,
    createContact: contacts.createContact,
    updateContact: contacts.updateContact,
    softDeleteContact: contacts.softDeleteContact,
    restoreContact: contacts.restoreContact,
    permanentlyDeleteContact: contacts.permanentlyDeleteContact,
    createLabel,
    toggleContactLabel: contacts.toggleContactLabel,
    refreshData: contacts.refreshData,
  };
}
