import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { supabaseAuthStorage } from "./supabase-storage";
import { useMobileContactsDomain } from "./use-mobile-contacts-domain";
import { useMobileLabelsDomain } from "./use-mobile-labels-domain";

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
const supabaseUrl = env?.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabasePublishableKey = env?.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

type Feedback = { tone: "error" | "success" | "info"; text: string };

export function useMobileAppState() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);

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

  const labelsDomain = useMobileLabelsDomain({ client, setFeedback });

  const contacts = useMobileContactsDomain({
    client,
    sessionEmail,
    loadLabels: labelsDomain.loadLabels,
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
      labelsDomain.clearLabels();
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
    labelsDomain.clearLabels();
    setFeedback({ tone: "info", text: "Signed out." });
    setAuthBusy(false);
  };

  return {
    email,
    password,
    displayName: contacts.displayName,
    query: contacts.query,
    editingId: contacts.editingId,
    labels: labelsDomain.labels,
    newLabelName: labelsDomain.newLabelName,
    newLabelColor: labelsDomain.newLabelColor,
    showTrash: contacts.showTrash,
    feedback,
    sessionEmail,
    authBusy,
    dataBusy: contacts.dataBusy,
    mutationBusy: contacts.mutationBusy || labelsDomain.labelBusy,
    displayedContacts: contacts.displayedContacts,
    setEmail,
    setPassword,
    setDisplayName: contacts.setDisplayName,
    setQuery: contacts.setQuery,
    setEditingId: contacts.setEditingId,
    setNewLabelName: labelsDomain.setNewLabelName,
    setNewLabelColor: labelsDomain.setNewLabelColor,
    setShowTrash: contacts.setShowTrash,
    signUp,
    signIn,
    signOut,
    createContact: contacts.createContact,
    updateContact: contacts.updateContact,
    softDeleteContact: contacts.softDeleteContact,
    restoreContact: contacts.restoreContact,
    permanentlyDeleteContact: contacts.permanentlyDeleteContact,
    createLabel: labelsDomain.createLabel,
    toggleContactLabel: contacts.toggleContactLabel,
    refreshData: contacts.refreshData,
  };
}
