import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { labelCreateSchema } from "@widados/shared";
import type { LabelRow } from "./contact-search";

type Feedback = { tone: "error" | "success" | "info"; text: string };

type UseWebLabelsDomainParams = {
  client: SupabaseClient;
  setFeedback: (feedback: Feedback | null) => void;
};

export function useWebLabelsDomain(params: UseWebLabelsDomainParams) {
  const [labels, setLabels] = useState<LabelRow[]>([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#4f46e5");
  const [labelBusy, setLabelBusy] = useState(false);

  const loadLabels = async () => {
    const { data, error: err } = await params.client
      .from("labels")
      .select("id,name,color")
      .order("name");
    if (err) throw new Error(err.message);
    setLabels((data ?? []) as LabelRow[]);
  };

  const clearLabels = () => {
    setLabels([]);
  };

  const createLabel = async () => {
    setLabelBusy(true);
    params.setFeedback(null);
    try {
      const parsed = labelCreateSchema.safeParse({
        name: newLabelName,
        color: newLabelColor,
      });
      if (!parsed.success) {
        params.setFeedback({
          tone: "error",
          text: parsed.error.issues.map((e) => e.message).join("; "),
        });
        return;
      }
      const { data: userData, error: userError } = await params.client.auth.getUser();
      if (userError || !userData.user) {
        params.setFeedback({
          tone: "error",
          text: userError?.message ?? "Sign in required.",
        });
        return;
      }
      const { error: insertError } = await params.client.from("labels").insert({
        name: parsed.data.name,
        color: parsed.data.color,
        user_id: userData.user.id,
      });
      if (insertError) {
        params.setFeedback({ tone: "error", text: insertError.message });
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
