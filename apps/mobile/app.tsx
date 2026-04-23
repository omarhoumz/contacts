import { useEffect, useMemo, useState } from "react";
import { Button, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { createClient } from "@supabase/supabase-js";
import { contactSchema, labelCreateSchema } from "@widados/shared";
import { MobileCard } from "@widados/ui-lib-mobile";
import { supabaseAuthStorage } from "./supabaseStorage";

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
const supabaseUrl = env?.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabasePublishableKey = env?.EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? "";

const CONTACT_SELECT = `
  id,
  display_name,
  deleted_at,
  contact_labels (
    label_id,
    labels ( id, name, color )
  )
`;

type LabelRow = { id: string; name: string; color: string };
type ContactLabelJoin = { label_id: string; labels: LabelRow[] | null };
type ContactRow = {
  id: string;
  display_name: string;
  deleted_at: string | null;
  contact_labels: ContactLabelJoin[] | null;
};

type Feedback = { tone: "error" | "success" | "info"; text: string };

function contactMatchesQuery(c: ContactRow, q: string) {
  const needle = q.trim().toLowerCase();
  if (!needle) return true;
  if (c.display_name.toLowerCase().includes(needle)) return true;
  for (const cl of c.contact_labels ?? []) {
    for (const label of cl.labels ?? []) {
      const name = label.name.toLowerCase();
      if (name.includes(needle)) return true;
    }
  }
  return false;
}

export function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [contactRows, setContactRows] = useState<ContactRow[]>([]);
  const [labels, setLabels] = useState<LabelRow[]>([]);
  const [newLabelName, setNewLabelName] = useState("");
  const [newLabelColor, setNewLabelColor] = useState("#4f46e5");
  const [showTrash, setShowTrash] = useState(false);
  const [feedback, setFeedback] = useState<Feedback | null>(null);
  const [sessionEmail, setSessionEmail] = useState<string | null>(null);
  const [authBusy, setAuthBusy] = useState(false);
  const [dataBusy, setDataBusy] = useState(false);
  const [mutationBusy, setMutationBusy] = useState(false);
  const client = useMemo(
    () =>
      createClient(supabaseUrl, supabasePublishableKey, {
        auth: { persistSession: true, storage: supabaseAuthStorage },
      }),
    [],
  );

  const displayedContacts = contactRows.filter((c) => contactMatchesQuery(c, query));

  const syncSession = async () => {
    const { data, error } = await client.auth.getSession();
    if (error) {
      setSessionEmail(null);
      return;
    }
    setSessionEmail(data.session?.user?.email ?? null);
  };

  useEffect(() => {
    void syncSession();
  }, []);

  const loadLabels = async () => {
    const { data, error } = await client.from("labels").select("id,name,color").order("name");
    if (error) throw new Error(error.message);
    setLabels((data ?? []) as LabelRow[]);
  };

  const loadContacts = async (trashMode: boolean) => {
    let qb = client.from("contacts").select(CONTACT_SELECT).order("updated_at", { ascending: false });
    qb = trashMode ? qb.not("deleted_at", "is", null) : qb.is("deleted_at", null);
    const { data, error } = await qb;
    if (error) throw new Error(error.message);
    setContactRows((data ?? []) as ContactRow[]);
  };

  const refreshData = async (trashMode: boolean) => {
    setDataBusy(true);
    try {
      await Promise.all([loadContacts(trashMode), loadLabels()]);
    } catch (e) {
      setFeedback({ tone: "error", text: e instanceof Error ? e.message : "Failed to refresh data" });
    } finally {
      setDataBusy(false);
    }
  };

  const signUp = async () => {
    setAuthBusy(true);
    setFeedback(null);
    const { error } = await client.auth.signUp({ email, password });
    if (error) {
      setFeedback({ tone: "error", text: error.message });
      setAuthBusy(false);
      return;
    }
    await syncSession();
    setFeedback({ tone: "info", text: "Account created. Confirm email if required, then sign in." });
    setAuthBusy(false);
  };

  const signIn = async () => {
    setAuthBusy(true);
    setFeedback(null);
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      setFeedback({ tone: "error", text: error.message });
      setAuthBusy(false);
      return;
    }
    await syncSession();
    setFeedback({ tone: "success", text: "Signed in." });
    await refreshData(showTrash);
    setAuthBusy(false);
  };

  const signOut = async () => {
    setAuthBusy(true);
    setFeedback(null);
    const { error } = await client.auth.signOut();
    if (error) {
      setFeedback({ tone: "error", text: error.message });
      setAuthBusy(false);
      return;
    }
    await syncSession();
    setContactRows([]);
    setLabels([]);
    setFeedback({ tone: "info", text: "Signed out." });
    setAuthBusy(false);
  };

  const createContact = async () => {
    setMutationBusy(true);
    const parsed = contactSchema.safeParse({ display_name: displayName });
    if (!parsed.success) {
      setFeedback({ tone: "error", text: "Display name required." });
      setMutationBusy(false);
      return;
    }
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) {
      setFeedback({ tone: "error", text: userError?.message ?? "Sign in required." });
      setMutationBusy(false);
      return;
    }
    const { error } = await client.from("contacts").insert({
      display_name: parsed.data.display_name,
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      company: parsed.data.company,
      job_title: parsed.data.job_title,
      notes: parsed.data.notes,
      birthday: parsed.data.birthday ?? null,
      user_id: userData.user.id,
    });
    if (error) {
      setFeedback({ tone: "error", text: error.message });
      setMutationBusy(false);
      return;
    }
    setFeedback({ tone: "success", text: "Contact created." });
    setDisplayName("");
    await refreshData(showTrash);
    setMutationBusy(false);
  };
    setMutationBusy(true);

  const updateContact = async () => {
    if (!editingId) return;
    const parsed = contactSchema.safeParse({ display_name: displayName });
    if (!parsed.success) {
      setFeedback({ tone: "error", text: "Display name required." });
      setMutationBusy(false);
      return;
    }
    const { error } = await client
      .from("contacts")
      .update({ display_name: parsed.data.display_name })
      .eq("id", editingId);
    if (error) {
      setFeedback({ tone: "error", text: error.message });
      setMutationBusy(false);
      return;
    }
    setFeedback({ tone: "success", text: "Contact updated." });
    setDisplayName("");
    setEditingId(null);
    await refreshData(showTrash);
    setMutationBusy(false);
  };

  const softDeleteContact = async (id: string) => {
    setMutationBusy(true);
    const { error } = await client
      .from("contacts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (error) {
      setFeedback({ tone: "error", text: error.message });
      setMutationBusy(false);
      return;
    }
    setFeedback({ tone: "success", text: "Moved to trash." });
    await refreshData(showTrash);
    setMutationBusy(false);
  };

  const restoreContact = async (id: string) => {
    setMutationBusy(true);
    const { error } = await client.from("contacts").update({ deleted_at: null }).eq("id", id);
    if (error) {
      setFeedback({ tone: "error", text: error.message });
      setMutationBusy(false);
      return;
    }
    setFeedback({ tone: "success", text: "Restored." });
    await refreshData(showTrash);
    setMutationBusy(false);
  };

  const permanentlyDeleteContact = async (id: string) => {
    setMutationBusy(true);
    const { error } = await client.from("contacts").delete().eq("id", id);
    if (error) {
      setFeedback({ tone: "error", text: error.message });
      setMutationBusy(false);
      return;
    }
    setFeedback({ tone: "success", text: "Deleted permanently." });
    await refreshData(showTrash);
    setMutationBusy(false);
  };
    setMutationBusy(true);

  const createLabel = async () => {
    const parsed = labelCreateSchema.safeParse({ name: newLabelName, color: newLabelColor });
    if (!parsed.success) {
      setFeedback({ tone: "error", text: parsed.error.issues.map((e) => e.message).join("; ") });
      setMutationBusy(false);
      return;
    }
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) {
      setFeedback({ tone: "error", text: userError?.message ?? "Sign in required." });
      setMutationBusy(false);
      return;
    }
    const { error } = await client.from("labels").insert({
      name: parsed.data.name,
      color: parsed.data.color,
      user_id: userData.user.id,
    });
    if (error) {
      setFeedback({ tone: "error", text: error.message });
      setMutationBusy(false);
      return;
    }
    setFeedback({ tone: "success", text: "Label created." });
    setNewLabelName("");
    setNewLabelColor("#4f46e5");
    await loadLabels();
    setMutationBusy(false);
  };

  const toggleContactLabel = async (contactId: string, labelId: string, currentlyAssigned: boolean) => {
    setMutationBusy(true);
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) {
      setFeedback({ tone: "error", text: userError?.message ?? "Sign in required." });
      setMutationBusy(false);
      return;
    }
    if (currentlyAssigned) {
      const { error } = await client
        .from("contact_labels")
        .delete()
        .eq("contact_id", contactId)
        .eq("label_id", labelId);
      if (error) {
        setFeedback({ tone: "error", text: error.message });
        setMutationBusy(false);
        return;
      }
      setFeedback({ tone: "success", text: "Label removed." });
    } else {
      const { error } = await client.from("contact_labels").insert({
        contact_id: contactId,
        label_id: labelId,
        user_id: userData.user.id,
      });
      if (error) {
        setFeedback({ tone: "error", text: error.message });
        setMutationBusy(false);
        return;
      }
      setFeedback({ tone: "success", text: "Label added." });
    }
    await refreshData(showTrash);
    setMutationBusy(false);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}>
        <Text style={{ fontSize: 26, fontWeight: "700" }}>WidadOS Mobile</Text>
        <MobileCard label="Auth, contacts, labels, and trash" />
        <Text style={{ color: sessionEmail ? "#166534" : "#6b7280" }}>
          Auth: {sessionEmail ? `signed in as ${sessionEmail}` : "signed out"}
        </Text>
        {feedback ? (
          <Text style={{ color: feedback.tone === "error" ? "crimson" : feedback.tone === "success" ? "#166534" : "#0f766e" }}>
            {feedback.text}
          </Text>
        ) : null}
        {!sessionEmail ? (
          <View style={{ gap: 8 }}>
            <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" editable={!authBusy} />
            <TextInput
              placeholder="Password"
              value={password}
              secureTextEntry
              onChangeText={setPassword}
              editable={!authBusy}
            />
            <Button title={authBusy ? "Working..." : "Sign up"} onPress={signUp} disabled={authBusy} />
            <Button title={authBusy ? "Working..." : "Sign in"} onPress={signIn} disabled={authBusy} />
          </View>
        ) : (
          <View style={{ gap: 8 }}>
            <Text style={{ color: "#555" }}>You are signed in.</Text>
            <Button title={authBusy ? "Working..." : "Sign out"} onPress={signOut} disabled={authBusy} />
          </View>
        )}
        {sessionEmail ? (
          <>
            <View style={{ flexDirection: "row", gap: 16 }}>
              <Button
                title="Active"
                onPress={() => {
                  setShowTrash(false);
                  setEditingId(null);
                  void refreshData(false);
                }}
              />
              <Button
                title="Trash"
                onPress={() => {
                  setShowTrash(true);
                  setEditingId(null);
                  void refreshData(true);
                }}
              />
            </View>
            <Text style={{ fontWeight: "600" }}>Labels</Text>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <TextInput
                placeholder="New label"
                value={newLabelName}
                onChangeText={setNewLabelName}
                style={{ flex: 1, minWidth: 120, borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 6 }}
              />
              <TextInput
                placeholder="#hex"
                value={newLabelColor}
                onChangeText={setNewLabelColor}
                autoCapitalize="characters"
                style={{ width: 88, borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 6 }}
              />
              <Button title={mutationBusy ? "Saving..." : "Add label"} onPress={createLabel} disabled={mutationBusy || dataBusy} />
            </View>
            <TextInput
              placeholder="Search name or label"
              value={query}
              onChangeText={setQuery}
              style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 6 }}
            />
            {!showTrash ? (
              <>
                <TextInput
                  placeholder="Display name"
                  value={displayName}
                  onChangeText={setDisplayName}
                  style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 6 }}
                />
                {editingId ? (
                  <Button title={mutationBusy ? "Saving..." : "Update contact"} onPress={updateContact} disabled={mutationBusy || dataBusy} />
                ) : (
                  <Button title={mutationBusy ? "Saving..." : "Create contact"} onPress={createContact} disabled={mutationBusy || dataBusy} />
                )}
              </>
            ) : null}
            <Button title={dataBusy ? "Refreshing..." : "Refresh"} onPress={() => refreshData(showTrash)} disabled={dataBusy} />
            {displayedContacts.map((contact) => {
              const assignedIds = new Set((contact.contact_labels ?? []).map((cl) => cl.label_id));
              return (
                <View key={contact.id} style={{ marginTop: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#eee" }}>
                  <Text style={{ fontSize: 17, fontWeight: "600" }}>{contact.display_name}</Text>
                  {!showTrash ? (
                    <>
                      <Button
                        title="Edit"
                        onPress={() => {
                          setEditingId(contact.id);
                          setDisplayName(contact.display_name);
                        }}
                      />
                      <Button title="Move to trash" onPress={() => softDeleteContact(contact.id)} />
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                        {labels.map((l) => (
                          <Button
                            key={l.id}
                            title={`${assignedIds.has(l.id) ? "✓ " : "+ "}${l.name}`}
                            onPress={() => toggleContactLabel(contact.id, l.id, assignedIds.has(l.id))}
                          />
                        ))}
                      </View>
                    </>
                  ) : (
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                      <Button title="Restore" onPress={() => restoreContact(contact.id)} />
                      <Button title="Delete forever" onPress={() => permanentlyDeleteContact(contact.id)} />
                    </View>
                  )}
                </View>
              );
            })}
          </>
        ) : (
          <View style={{ padding: 12, borderWidth: 1, borderColor: "#e5e7eb", borderRadius: 8 }}>
            <Text style={{ fontWeight: "600", marginBottom: 6 }}>Sign in to manage contacts</Text>
            <Text style={{ color: "#555" }}>Labels and contacts are hidden until you are signed in.</Text>
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}
