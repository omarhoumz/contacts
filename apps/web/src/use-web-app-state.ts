import { useEffect, useMemo, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { useWebContactsDomain } from "./use-web-contacts-domain";
import { useWebLabelsDomain } from "./use-web-labels-domain";
import { useWebThemeState } from "./use-web-theme-state";
import { useWebAuthSession } from "./use-web-auth-session";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

type Feedback = { tone: "error" | "success" | "info"; text: string };

export function useWebAppState() {
  const trashList = useRouterState({ select: (st) => st.location.pathname === "/trash" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [canResendVerification, setCanResendVerification] = useState(false);
  const client = useMemo(
    () => createClient(supabaseUrl, supabasePublishableKey, { auth: { persistSession: true } }),
    [],
  );
  const { themeMode, toggleTheme } = useWebThemeState();
  const { sessionEmail, setSessionEmail, authResolved } = useWebAuthSession(client);
  const isAuthenticated = authResolved && Boolean(sessionEmail);

  useEffect(() => {
    if (!feedback) return;
    const timeoutMs = feedback.tone === "error" ? 3500 : 1500;
    const timer = window.setTimeout(() => {
      setFeedback((current) => (current === feedback ? null : current));
    }, timeoutMs);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const labelsDomain = useWebLabelsDomain({ client, setFeedback });

  const contacts = useWebContactsDomain({
    client,
    isAuthenticated,
    sessionEmail,
    trashList,
    loadLabels: labelsDomain.loadLabels,
    setFeedback,
  });

  useEffect(() => {
    if (!sessionEmail) {
      labelsDomain.clearLabels();
    }
  }, [sessionEmail, labelsDomain]);

  const signUp = async (creds?: { email: string; password: string }) => {
    setAuthBusy(true);
    setFeedback(null);
    setCanResendVerification(false);
    const em = (creds?.email ?? email).trim();
    const pw = creds?.password ?? password;
    setEmail(em);
    setPassword(pw);
    const emailRedirectTo = `${window.location.origin}/contacts`;
    const { data, error: signError } = await client.auth.signUp({
      email: em,
      password: pw,
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

  const signIn = async (creds?: { email: string; password: string }) => {
    setAuthBusy(true);
    setFeedback(null);
    setCanResendVerification(false);
    const em = (creds?.email ?? email).trim();
    const pw = creds?.password ?? password;
    setEmail(em);
    setPassword(pw);
    const { data, error: signError } = await client.auth.signInWithPassword({ email: em, password: pw });
    if (signError) {
      if (signError.message.toLowerCase().includes("email not confirmed")) {
        setCanResendVerification(true);
      }
      setFeedback({ tone: "error", text: signError.message });
      setAuthBusy(false);
      return;
    }
    setSessionEmail(data.user?.email ?? null);
    setFeedback(null);
    setAuthBusy(false);
  };

  const resendVerification = async (overrideEmail?: string) => {
    const trimmedEmail = (overrideEmail ?? email).trim();
    if (!trimmedEmail) {
      setFeedback({ tone: "error", text: "Enter your email first." });
      return;
    }
    setAuthBusy(true);
    const emailRedirectTo = `${window.location.origin}/contacts`;
    const { error } = await client.auth.resend({
      type: "signup",
      email: trimmedEmail,
      options: { emailRedirectTo },
    });
    if (error) {
      setFeedback({ tone: "error", text: error.message });
      setAuthBusy(false);
      return;
    }
    setFeedback({ tone: "success", text: "Verification email sent. Check your inbox." });
    setCanResendVerification(false);
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
    canResendVerification,
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
    toggleTheme,
    signUp,
    signIn,
    signOut,
    resendVerification,
    resetContactForm: contacts.resetContactForm,
    prepareEditContact: contacts.prepareEditContact,
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
