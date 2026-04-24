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
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editLabelName, setEditLabelName] = useState("");
  const [editLabelColor, setEditLabelColor] = useState("#4f46e5");
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

  const beginEditLabel = (label: LabelRow) => {
    setEditingLabelId(label.id);
    setEditLabelName(label.name);
    setEditLabelColor(label.color ?? "#4f46e5");
  };

  const cancelEditLabel = () => {
    setEditingLabelId(null);
    setEditLabelName("");
    setEditLabelColor("#4f46e5");
  };

  const saveLabelEdit = async () => {
    if (!editingLabelId) return;
    setLabelBusy(true);
    params.setFeedback(null);
    try {
      const parsed = labelCreateSchema.safeParse({
        name: editLabelName,
        color: editLabelColor,
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
      const { error: updateError } = await params.client
        .from("labels")
        .update({
          name: parsed.data.name,
          color: parsed.data.color,
        })
        .eq("id", editingLabelId)
        .eq("user_id", userData.user.id);
      if (updateError) {
        params.setFeedback({ tone: "error", text: updateError.message });
        return;
      }
      params.setFeedback({ tone: "success", text: "Label updated." });
      cancelEditLabel();
      await loadLabels();
    } finally {
      setLabelBusy(false);
    }
  };

  const deleteLabel = async (label: LabelRow) => {
    setLabelBusy(true);
    params.setFeedback(null);
    try {
      const { data: userData, error: userError } = await params.client.auth.getUser();
      if (userError || !userData.user) {
        params.setFeedback({
          tone: "error",
          text: userError?.message ?? "Sign in required.",
        });
        return;
      }
      const { count, error: countError } = await params.client
        .from("contact_labels")
        .select("*", { count: "exact", head: true })
        .eq("label_id", label.id)
        .eq("user_id", userData.user.id);
      if (countError) {
        params.setFeedback({ tone: "error", text: countError.message });
        return;
      }
      const assignedCount = count ?? 0;
      if (assignedCount > 0) {
        const { error: unassignError } = await params.client
          .from("contact_labels")
          .delete()
          .eq("label_id", label.id)
          .eq("user_id", userData.user.id);
        if (unassignError) {
          params.setFeedback({ tone: "error", text: unassignError.message });
          return;
        }
      }
      const { error: deleteError } = await params.client
        .from("labels")
        .delete()
        .eq("id", label.id)
        .eq("user_id", userData.user.id);
      if (deleteError) {
        params.setFeedback({ tone: "error", text: deleteError.message });
        return;
      }
      if (editingLabelId === label.id) cancelEditLabel();
      params.setFeedback({
        tone: "success",
        text: assignedCount > 0
          ? `Label deleted. Removed from ${assignedCount} contact${assignedCount === 1 ? "" : "s"}.`
          : "Label deleted.",
      });
      await loadLabels();
    } finally {
      setLabelBusy(false);
    }
  };

  return {
    labels,
    newLabelName,
    newLabelColor,
    editingLabelId,
    editLabelName,
    editLabelColor,
    labelBusy,
    setNewLabelName,
    setNewLabelColor,
    setEditLabelName,
    setEditLabelColor,
    loadLabels,
    clearLabels,
    createLabel,
    beginEditLabel,
    cancelEditLabel,
    saveLabelEdit,
    deleteLabel,
  };
}
