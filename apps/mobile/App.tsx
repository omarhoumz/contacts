import { useMemo, useState } from "react";
import { Button, SafeAreaView, Text, TextInput, View } from "react-native";
import { createClient } from "@supabase/supabase-js";
import { contactSchema } from "@widados/shared";
import { MobileCard } from "@widados/ui-lib-mobile";

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL ?? "";
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY ?? "";

export function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<Array<{ id: string; display_name: string }>>([]);
  const [message, setMessage] = useState("");
  const client = useMemo(
    () => createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: true } }),
    [],
  );

  const signIn = async () => {
    const { error } = await client.auth.signInWithPassword({ email, password });
    setMessage(error ? error.message : "Signed in");
  };

  const loadContacts = async () => {
    const baseQuery = client
      .from("contacts")
      .select("id,display_name")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });
    const { data, error } = query
      ? await baseQuery.ilike("display_name", `%${query}%`)
      : await baseQuery;
    setMessage(error ? error.message : "Contacts loaded");
    setContacts(data ?? []);
  };

  const createContact = async () => {
    const parsed = contactSchema.safeParse({ display_name: displayName });
    if (!parsed.success) {
      setMessage("Display name required");
      return;
    }
    const { error } = await client.from("contacts").insert(parsed.data);
    setMessage(error ? error.message : "Contact created");
    setDisplayName("");
    await loadContacts();
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
    await loadContacts();
  };

  const softDeleteContact = async (id: string) => {
    const { error } = await client
      .from("contacts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    setMessage(error ? error.message : "Contact deleted");
    await loadContacts();
  };

  return (
    <SafeAreaView style={{ flex: 1, padding: 16, gap: 12 }}>
      <Text style={{ fontSize: 26, fontWeight: "700" }}>WidadOS Mobile</Text>
      <MobileCard label="Auth + contact create MVP" />
      <View style={{ gap: 8 }}>
        <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
        <TextInput placeholder="Password" value={password} secureTextEntry onChangeText={setPassword} />
        <Button title="Sign in" onPress={signIn} />
      </View>
      <View style={{ gap: 8 }}>
        <TextInput placeholder="Search contacts" value={query} onChangeText={setQuery} />
        <TextInput placeholder="Display name" value={displayName} onChangeText={setDisplayName} />
        {editingId ? (
          <Button title="Update contact" onPress={updateContact} />
        ) : (
          <Button title="Create contact" onPress={createContact} />
        )}
        <Button title="Refresh contacts" onPress={loadContacts} />
      </View>
      {contacts.map((contact) => (
        <View key={contact.id} style={{ marginTop: 6 }}>
          <Text>{contact.display_name}</Text>
          <Button
            title="Edit"
            onPress={() => {
              setEditingId(contact.id);
              setDisplayName(contact.display_name);
            }}
          />
          <Button title="Delete" onPress={() => softDeleteContact(contact.id)} />
        </View>
      ))}
      <Text>{message}</Text>
    </SafeAreaView>
  );
}
