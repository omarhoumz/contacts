import { useEffect, useMemo, useState } from "react";
import { useRouterState } from "@tanstack/react-router";
import { createClient } from "@supabase/supabase-js";
import { useWebContactsDomain } from "./use-web-contacts-domain";
import { useWebLabelsDomain } from "./use-web-labels-domain";
import { useWebThemeState } from "./use-web-theme-state";
import { useWebAuthSession } from "./use-web-auth-session";
import { useWebFeedbackState } from "./use-web-feedback-state";
import { useWebAuthActions } from "./use-web-auth-actions";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

export function useWebAppState() {
  const trashList = useRouterState({ select: (st) => st.location.pathname === "/trash" });
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const { feedback, setFeedback } = useWebFeedbackState();
  const client = useMemo(
    () => createClient(supabaseUrl, supabasePublishableKey, { auth: { persistSession: true } }),
    [],
  );
  const { themeMode, toggleTheme } = useWebThemeState();
  const { sessionEmail, setSessionEmail, authResolved } = useWebAuthSession(client);
  const isAuthenticated = authResolved && Boolean(sessionEmail);

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
  const { authBusy, canResendVerification, signUp, signIn, resendVerification, signOut } = useWebAuthActions({
    client,
    email,
    password,
    setEmail,
    setPassword,
    setFeedback,
    setSessionEmail,
    clearLabels: labelsDomain.clearLabels,
  });

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
