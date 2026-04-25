import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { labelCreateSchema } from "@widados/shared";
import type { LabelRow } from "./mobile-contact-search";
import { mobileContactsQueryKeyRoot } from "./use-mobile-contacts-domain";

type Feedback = { tone: "error" | "success" | "info"; text: string };

type UseMobileLabelsDomainParams = {
  client: SupabaseClient;
  setFeedback: (feedback: Feedback | null) => void;
};

export function useMobileLabelsDomain(params: UseMobileLabelsDomainParams) {
  const queryClient = useQueryClient();
  const [labels, setLabels] = useState<LabelRow[]>([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#2563eb");
  const [labelBusy, setLabelBusy] = useState(false);

  const loadLabels = async () => {
    const { data, error } = await params.client.from("labels").select("id,name,color").order("name");
    if (error) throw new Error(error.message);
    setLabels((data ?? []) as LabelRow[]);
  };

  const clearLabels = () => {
    setLabels([]);
  };

  const invalidateContacts = () =>
    queryClient.invalidateQueries({ queryKey: [...mobileContactsQueryKeyRoot] });

  const createLabel = async (input?: { name: string; color: string }) => {
    setLabelBusy(true);
    try {
      const parsed = labelCreateSchema.safeParse({
        name: input?.name ?? newLabelName,
        color: input?.color ?? newLabelColor,
      });
      if (!parsed.success) {
        params.setFeedback({ tone: "error", text: parsed.error.issues.map((e) => e.message).join("; ") });
        return false;
      }
      const { data: userData, error: userError } = await params.client.auth.getUser();
      if (userError || !userData.user) {
        params.setFeedback({ tone: "error", text: userError?.message ?? "Sign in required." });
        return false;
      }
      const { error } = await params.client.from("labels").insert({
        name: parsed.data.name,
        color: parsed.data.color,
        user_id: userData.user.id,
      });
      if (error) {
        params.setFeedback({ tone: "error", text: error.message });
        return false;
      }
      params.setFeedback({ tone: "success", text: "Label created." });
      setNewLabelName("");
      setNewLabelColor("#2563eb");
      await loadLabels();
      await invalidateContacts();
      return true;
    } finally {
      setLabelBusy(false);
    }
  };

  return {
    labels,
    newLabelName,
    newLabelColor,
    labelBusy,
    setNewLabelName,
    setNewLabelColor,
    loadLabels,
    clearLabels,
    createLabel,
  };
}
