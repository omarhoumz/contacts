import { useMemo, useState } from "react";
import { Button, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { createClient } from "@supabase/supabase-js";
import { contactSchema, labelCreateSchema } from "@widados/shared";
import { MobileCard } from "@widados/ui-lib-mobile";

const env = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process?.env;
const supabaseUrl = env?.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = env?.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

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
  const [message, setMessage] = useState("");
  const client = useMemo(
    () => createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: true } }),
    [],
  );

  const displayedContacts = contactRows.filter((c) => contactMatchesQuery(c, query));

  const loadLabels = async () => {
    const { data, error } = await client.from("labels").select("id,name,color").order("name");
    if (error) setMessage(error.message);
    setLabels((data ?? []) as LabelRow[]);
  };

  const loadContacts = async (trashMode: boolean) => {
    let qb = client.from("contacts").select(CONTACT_SELECT).order("updated_at", { ascending: false });
    qb = trashMode ? qb.not("deleted_at", "is", null) : qb.is("deleted_at", null);
    const { data, error } = await qb;
    setMessage(error ? error.message : "Contacts loaded");
    setContactRows((data ?? []) as ContactRow[]);
  };

  const refreshData = async (trashMode: boolean) => {
    await Promise.all([loadContacts(trashMode), loadLabels()]);
  };

  const signUp = async () => {
    setMessage("");
    const { error } = await client.auth.signUp({ email, password });
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Account created. Confirm your email if required, then sign in.");
  };

  const signIn = async () => {
    setMessage("");
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error) {
      setMessage(error.message);
      return;
    }
    setMessage("Signed in");
    await refreshData(showTrash);
  };

  const createContact = async () => {
    const parsed = contactSchema.safeParse({ display_name: displayName });
    if (!parsed.success) {
      setMessage("Display name required");
      return;
    }
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) {
      setMessage(userError?.message ?? "Sign in required");
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
    setMessage(error ? error.message : "Contact created");
    setDisplayName("");
    await refreshData(showTrash);
  };

  const updateContact = async () => {
    if (!editingId) return;
    const parsed = contactSchema.safeParse({ display_name: displayName });
    if (!parsed.success) {
      setMessage("Display name required");
      return;
    }
    const { error } = await client
      .from("contacts")
      .update({ display_name: parsed.data.display_name })
      .eq("id", editingId);
    setMessage(error ? error.message : "Contact updated");
    setDisplayName("");
    setEditingId(null);
    await refreshData(showTrash);
  };

  const softDeleteContact = async (id: string) => {
    const { error } = await client
      .from("contacts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    setMessage(error ? error.message : "Moved to trash");
    await refreshData(showTrash);
  };

  const restoreContact = async (id: string) => {
    const { error } = await client.from("contacts").update({ deleted_at: null }).eq("id", id);
    setMessage(error ? error.message : "Restored");
    await refreshData(showTrash);
  };

  const permanentlyDeleteContact = async (id: string) => {
    const { error } = await client.from("contacts").delete().eq("id", id);
    setMessage(error ? error.message : "Deleted permanently");
    await refreshData(showTrash);
  };

  const createLabel = async () => {
    const parsed = labelCreateSchema.safeParse({ name: newLabelName, color: newLabelColor });
    if (!parsed.success) {
      setMessage(parsed.error.issues.map((e) => e.message).join("; "));
      return;
    }
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) {
      setMessage(userError?.message ?? "Sign in required");
      return;
    }
    const { error } = await client.from("labels").insert({
      name: parsed.data.name,
      color: parsed.data.color,
      user_id: userData.user.id,
    });
    setMessage(error ? error.message : "Label created");
    setNewLabelName("");
    setNewLabelColor("#4f46e5");
    await loadLabels();
  };

  const toggleContactLabel = async (contactId: string, labelId: string, currentlyAssigned: boolean) => {
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) {
      setMessage(userError?.message ?? "Sign in required");
      return;
    }
    if (currentlyAssigned) {
      const { error } = await client
        .from("contact_labels")
        .delete()
        .eq("contact_id", contactId)
        .eq("label_id", labelId);
      setMessage(error ? error.message : "Label removed");
    } else {
      const { error } = await client.from("contact_labels").insert({
        contact_id: contactId,
        label_id: labelId,
        user_id: userData.user.id,
      });
      setMessage(error ? error.message : "Label added");
    }
    await refreshData(showTrash);
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}>
        <Text style={{ fontSize: 26, fontWeight: "700" }}>WidadOS Mobile</Text>
        <MobileCard label="Auth, contacts, labels, and trash" />
        <View style={{ gap: 8 }}>
          <TextInput placeholder="Email" value={email} onChangeText={setEmail} autoCapitalize="none" />
          <TextInput
            placeholder="Password"
            value={password}
            secureTextEntry
            onChangeText={setPassword}
          />
          <Button title="Sign up" onPress={signUp} />
          <Button title="Sign in" onPress={signIn} />
        </View>
        <View style={{ flexDirection: "row", gap: 16 }}>
          <Button
            title="Active"
            onPress={() => {
              setShowTrash(false);
              setEditingId(null);
              void loadContacts(false);
            }}
          />
          <Button
            title="Trash"
            onPress={() => {
              setShowTrash(true);
              setEditingId(null);
              void loadContacts(true);
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
          <Button title="Add label" onPress={createLabel} />
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
              <Button title="Update contact" onPress={updateContact} />
            ) : (
              <Button title="Create contact" onPress={createContact} />
            )}
          </>
        ) : null}
        <Button title="Refresh" onPress={() => refreshData(showTrash)} />
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
        <Text>{message}</Text>
      </ScrollView>
    </SafeAreaView>
  );
}
