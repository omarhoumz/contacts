import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { useWebContactsDomain } from "./use-web-contacts-domain";
import { useWebLabelsDomain } from "./use-web-labels-domain";
import { applyTheme, type ThemeMode } from "./ui-styles";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

type Feedback = { tone: "error" | "success" | "info"; text: string };

export function useWebAppState() {
  const [themeMode, setThemeMode] = useState<ThemeMode>(() => {
    if (typeof window === "undefined") return "light";
    const stored = localStorage.getItem("theme-mode");
    if (stored === "light" || stored === "dark") return stored;
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });
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

  // Initial session check on mount — calls getUser() once to avoid relying
  // on potentially stale localStorage token without server verification.
  const syncInitialSession = async () => {
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) {
      setSessionEmail(null);
    } else {
      setSessionEmail(data.user.email ?? null);
    }
    setAuthResolved(true);
  };

  useEffect(() => {
    void syncInitialSession();
    // onAuthStateChange carries the session object — read it directly
    // instead of calling getUser() again, which would create a request loop.
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, session) => {
      setSessionEmail(session?.user?.email ?? null);
      setAuthResolved(true);
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    applyTheme(themeMode);
    try {
      localStorage.setItem("theme-mode", themeMode);
    } catch {
      // ignore
    }
  }, [themeMode]);

  useEffect(() => {
    if (!feedback) return;
    const timeoutMs = feedback.tone === "error" ? 3500 : 1500;
    const timer = window.setTimeout(() => {
      setFeedback((current) => (current === feedback ? null : current));
    }, timeoutMs);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const toggleTheme = () => {
    setThemeMode((prev) => (prev === "dark" ? "light" : "dark"));
  };

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
    const emailRedirectTo = `${window.location.origin}/contacts`;
    const { data, error: signError } = await client.auth.signUp({
      email,
      password,
      options: { emailRedirectTo },
    });
    if (signError) {
      setFeedback({ tone: "error", text: signError.message });
      setAuthBusy(false);
      return;
    }
    setSessionEmail(data.user?.email ?? null);
    setFeedback({ tone: "info", text: "Check your email to confirm the address if required, then sign in." });
    setAuthBusy(false);
  };

  const signIn = async () => {
    setAuthBusy(true);
    setFeedback(null);
    const { data, error: signError } = await client.auth.signInWithPassword({ email, password });
    if (signError) {
      setFeedback({ tone: "error", text: signError.message });
      setAuthBusy(false);
      return;
    }
    setSessionEmail(data.user?.email ?? null);
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
    setSessionEmail(null);
    setFeedback({ tone: "info", text: "Signed out." });
    labelsDomain.clearLabels();
    setAuthBusy(false);
  };

  return {
    email,
    password,
    displayName: contacts.displayName,
    contactPhone: contacts.phone,
    contactEmail: contacts.email,
    contactPhoneCountry: contacts.phoneCountry,
    query: contacts.query,
    editingId: contacts.editingId,
    labels: labelsDomain.labels,
    newLabelName: labelsDomain.newLabelName,
    newLabelColor: labelsDomain.newLabelColor,
    editingLabelId: labelsDomain.editingLabelId,
    editLabelName: labelsDomain.editLabelName,
    editLabelColor: labelsDomain.editLabelColor,
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
    themeMode,
    setEmail,
    setPassword,
    setDisplayName: contacts.setDisplayName,
    setContactPhone: contacts.setPhone,
    setContactEmail: contacts.setEmail,
    setContactPhoneCountry: contacts.setPhoneCountry,
    setQuery: contacts.setQuery,
    setEditingId: contacts.setEditingId,
    setNewLabelName: labelsDomain.setNewLabelName,
    setNewLabelColor: labelsDomain.setNewLabelColor,
    setEditLabelName: labelsDomain.setEditLabelName,
    setEditLabelColor: labelsDomain.setEditLabelColor,
    setShowTrash: contacts.setShowTrash,
    toggleTheme,
    signUp,
    signIn,
    signOut,
    createContact: contacts.createContact,
    updateContact: contacts.updateContact,
    softDeleteContact: contacts.softDeleteContact,
    restoreContact: contacts.restoreContact,
    permanentlyDeleteContact: contacts.permanentlyDeleteContact,
    createLabel: labelsDomain.createLabel,
    beginEditLabel: labelsDomain.beginEditLabel,
    cancelEditLabel: labelsDomain.cancelEditLabel,
    saveLabelEdit: labelsDomain.saveLabelEdit,
    deleteLabel: labelsDomain.deleteLabel,
    toggleContactLabel: contacts.toggleContactLabel,
    refreshData: contacts.refreshData,
  };
}
