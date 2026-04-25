import { useState } from "react";
import type { SupabaseClient } from "@supabase/supabase-js";
import { useQueryClient } from "@tanstack/react-query";
import { labelCreateSchema } from "@widados/shared";
import type { LabelRow } from "./contact-search";
import { webContactsQueryKeyRoot } from "./use-web-contacts-domain";

type Feedback = { tone: "error" | "success" | "info"; text: string };

type UseWebLabelsDomainParams = {
  client: SupabaseClient;
  setFeedback: (feedback: Feedback | null) => void;
};

export function useWebLabelsDomain(params: UseWebLabelsDomainParams) {
  const queryClient = useQueryClient();
  const [labels, setLabels] = useState<LabelRow[]>([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#2563eb");
  const [editingLabelId, setEditingLabelId] = useState<string | null>(null);
  const [editLabelName, setEditLabelName] = useState("");
  const [editLabelColor, setEditLabelColor] = useState("#2563eb");
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

  const invalidateContacts = () =>
    queryClient.invalidateQueries({ queryKey: [...webContactsQueryKeyRoot] });

  const createLabel = async (input?: { name: string; color: string }) => {
    setLabelBusy(true);
    params.setFeedback(null);
    try {
      const parsed = labelCreateSchema.safeParse({
        name: input?.name ?? newLabelName,
        color: input?.color ?? newLabelColor,
      });
      if (!parsed.success) {
        params.setFeedback({
          tone: "error",
          text: parsed.error.issues.map((e) => e.message).join("; "),
        });
        return false;
      }
      const { data: userData, error: userError } = await params.client.auth.getUser();
      if (userError || !userData.user) {
        params.setFeedback({
          tone: "error",
          text: userError?.message ?? "Sign in required.",
        });
        return false;
      }
      const { error: insertError } = await params.client.from("labels").insert({
        name: parsed.data.name,
        color: parsed.data.color,
        user_id: userData.user.id,
      });
      if (insertError) {
        params.setFeedback({ tone: "error", text: insertError.message });
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

  const beginEditLabel = (label: LabelRow) => {
    setEditingLabelId(label.id);
    setEditLabelName(label.name);
    setEditLabelColor(label.color ?? "#2563eb");
  };

  const cancelEditLabel = () => {
    setEditingLabelId(null);
    setEditLabelName("");
    setEditLabelColor("#2563eb");
  };

  const saveLabelEdit = async (input?: { name: string; color: string }) => {
    if (!editingLabelId) return false;
    setLabelBusy(true);
    params.setFeedback(null);
    try {
      const parsed = labelCreateSchema.safeParse({
        name: input?.name ?? editLabelName,
        color: input?.color ?? editLabelColor,
      });
      if (!parsed.success) {
        params.setFeedback({
          tone: "error",
          text: parsed.error.issues.map((e) => e.message).join("; "),
        });
        return false;
      }
      const { data: userData, error: userError } = await params.client.auth.getUser();
      if (userError || !userData.user) {
        params.setFeedback({
          tone: "error",
          text: userError?.message ?? "Sign in required.",
        });
        return false;
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
        return false;
      }
      params.setFeedback({ tone: "success", text: "Label updated." });
      cancelEditLabel();
      await loadLabels();
      await invalidateContacts();
      return true;
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
      await invalidateContacts();
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
