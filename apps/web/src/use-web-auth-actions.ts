import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { WebFeedback } from "./use-web-feedback-state";

type AuthCreds = { email: string; password: string };

type UseWebAuthActionsParams = {
  client: SupabaseClient;
  email: string;
  password: string;
  setEmail: (value: string) => void;
  setPassword: (value: string) => void;
  setFeedback: (feedback: WebFeedback | null) => void;
  setSessionEmail: (value: string | null) => void;
  clearLabels: () => void;
};

export function useWebAuthActions(params: UseWebAuthActionsParams) {
  const [authBusy, setAuthBusy] = useState(false);
  const [canResendVerification, setCanResendVerification] = useState(false);

  const signUp = async (creds?: AuthCreds) => {
    setAuthBusy(true);
    params.setFeedback(null);
    setCanResendVerification(false);
    const em = (creds?.email ?? params.email).trim();
    const pw = creds?.password ?? params.password;
    params.setEmail(em);
    params.setPassword(pw);
    const emailRedirectTo = `${window.location.origin}/contacts`;
    const { data, error: signError } = await params.client.auth.signUp({
      email: em,
      password: pw,
      options: { emailRedirectTo },
    });
    if (signError) {
      params.setFeedback({ tone: "error", text: signError.message });
      setAuthBusy(false);
      return;
    }
    params.setSessionEmail(data.user?.email ?? null);
    params.setFeedback({ tone: "info", text: "Check your email to confirm the address if required, then sign in." });
    setAuthBusy(false);
  };

  const signIn = async (creds?: AuthCreds) => {
    setAuthBusy(true);
    params.setFeedback(null);
    setCanResendVerification(false);
    const em = (creds?.email ?? params.email).trim();
    const pw = creds?.password ?? params.password;
    params.setEmail(em);
    params.setPassword(pw);
    const { data, error: signError } = await params.client.auth.signInWithPassword({ email: em, password: pw });
    if (signError) {
      if (signError.message.toLowerCase().includes("email not confirmed")) {
        setCanResendVerification(true);
      }
      params.setFeedback({ tone: "error", text: signError.message });
      setAuthBusy(false);
      return;
    }
    params.setSessionEmail(data.user?.email ?? null);
    params.setFeedback(null);
    setAuthBusy(false);
  };

  const resendVerification = async (overrideEmail?: string) => {
    const trimmedEmail = (overrideEmail ?? params.email).trim();
    if (!trimmedEmail) {
      params.setFeedback({ tone: "error", text: "Enter your email first." });
      return;
    }
    setAuthBusy(true);
    const emailRedirectTo = `${window.location.origin}/contacts`;
    const { error } = await params.client.auth.resend({
      type: "signup",
      email: trimmedEmail,
      options: { emailRedirectTo },
    });
    if (error) {
      params.setFeedback({ tone: "error", text: error.message });
      setAuthBusy(false);
      return;
    }
    params.setFeedback({ tone: "success", text: "Verification email sent. Check your inbox." });
    setCanResendVerification(false);
    setAuthBusy(false);
  };

  const signOut = async () => {
    setAuthBusy(true);
    params.setFeedback(null);
    const { error: outError } = await params.client.auth.signOut();
    if (outError) {
      params.setFeedback({ tone: "error", text: outError.message });
      setAuthBusy(false);
      return;
    }
    params.setSessionEmail(null);
    params.setFeedback({ tone: "info", text: "Signed out." });
    params.clearLabels();
    setAuthBusy(false);
  };

  return {
    authBusy,
    canResendVerification,
    signUp,
    signIn,
    resendVerification,
    signOut,
  };
}
