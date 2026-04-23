import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { labelCreateSchema } from "@widados/shared";
import { supabaseAuthStorage } from "./supabase-storage";
import type { LabelRow } from "./mobile-contact-search";
import { useMobileContactsDomain } from "./use-mobile-contacts-domain";

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
const supabaseUrl = env?.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabasePublishableKey = env?.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

type Feedback = { tone: "error" | "success" | "info"; text: string };

export function useMobileAppState() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [labels, setLabels] = useState<LabelRow[]>([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#4f46e5");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [labelBusy, setLabelBusy] = useState(false);

  const client = useMemo(
    () =>
      createClient(supabaseUrl, supabasePublishableKey, {
        auth: { persistSession: true, storage: supabaseAuthStorage },
      }),
    [],
  );

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

  const contacts = useMobileContactsDomain({
    client,
    sessionEmail,
    loadLabels,
    setFeedback,
  });

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
    if (!sessionEmail) {
      setLabels([]);
    }
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
    await contacts.refreshData(contacts.showTrash);
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
    setLabels([]);
    setFeedback({ tone: "info", text: "Signed out." });
    setAuthBusy(false);
  };

  const createLabel = async () => {
    setLabelBusy(true);
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
      const { error } = await client.from("labels").insert({
        name: parsed.data.name,
        color: parsed.data.color,
        user_id: userData.user.id,
      });
      if (error) {
        setFeedback({ tone: "error", text: error.message });
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
    authBusy,
    dataBusy: contacts.dataBusy,
    mutationBusy: contacts.mutationBusy || labelBusy,
    displayedContacts: contacts.displayedContacts,
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
