import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useWebContactsDomain } from "./use-web-contacts-domain";
import { useWebLabelsDomain } from "./use-web-labels-domain";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

type Feedback = { tone: "error" | "success" | "info"; text: string };

export function useWebAppState() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [authResolved, setAuthResolved] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
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

  const labelsDomain = useWebLabelsDomain({ client, setFeedback });

  const contacts = useWebContactsDomain({
    client,
    isAuthenticated,
    sessionEmail,
    loadLabels: labelsDomain.loadLabels,
    setFeedback,
  });

  useEffect(() => {
    if (!sessionEmail) {
      labelsDomain.clearLabels();
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
    labelsDomain.clearLabels();
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
    authResolved,
    authBusy,
    dataBusy: contacts.dataBusy,
    mutationBusy: contacts.mutationBusy,
    labelBusy: labelsDomain.labelBusy,
    displayedContacts: contacts.displayedContacts,
    isAuthenticated,
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
