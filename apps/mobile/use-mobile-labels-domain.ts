import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { labelCreateSchema } from "@widados/shared";
import type { LabelRow } from "./mobile-contact-search";

type Feedback = { tone: "error" | "success" | "info"; text: string };

type UseMobileLabelsDomainParams = {
  client: SupabaseClient;
  setFeedback: (feedback: Feedback | null) => void;
};

export function useMobileLabelsDomain(params: UseMobileLabelsDomainParams) {
  const [labels, setLabels] = useState<LabelRow[]>([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#4f46e5");
  const [labelBusy, setLabelBusy] = useState(false);

  const loadLabels = async () => {
    const { data, error } = await params.client.from("labels").select("id,name,color").order("name");
    if (error) throw new Error(error.message);
    setLabels((data ?? []) as LabelRow[]);
  };

  const clearLabels = () => {
    setLabels([]);
  };

  const createLabel = async () => {
    setLabelBusy(true);
    try {
      const parsed = labelCreateSchema.safeParse({ name: newLabelName, color: newLabelColor });
      if (!parsed.success) {
        params.setFeedback({ tone: "error", text: parsed.error.issues.map((e) => e.message).join("; ") });
        return;
      }
      const { data: userData, error: userError } = await params.client.auth.getUser();
      if (userError || !userData.user) {
        params.setFeedback({ tone: "error", text: userError?.message ?? "Sign in required." });
        return;
      }
      const { error } = await params.client.from("labels").insert({
        name: parsed.data.name,
        color: parsed.data.color,
        user_id: userData.user.id,
      });
      if (error) {
        params.setFeedback({ tone: "error", text: error.message });
        return;
      }
      params.setFeedback({ tone: "success", text: "Label created." });
      setNewLabelName("");
      setNewLabelColor("#4f46e5");
      await loadLabels();
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
