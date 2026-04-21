import { useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { contactSchema } from "@widados/shared";
import { Card } from "@widados/ui-lib";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

type ContactRow = {
  id: string;
  display_name: string;
};

export function App() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [displayName, setDisplayName] = useState("");
  const [query, setQuery] = useState("");
  const [editingId, setEditingId] = useState<string | null>(null);
  const [contacts, setContacts] = useState<ContactRow[]>([]);
  const [error, setError] = useState("");
  const client = useMemo(
    () => createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: true } }),
    [],
  );

  const loadContacts = async () => {
    const baseQuery = client
      .from("contacts")
      .select("id,display_name")
      .is("deleted_at", null)
      .order("updated_at", { ascending: false });
    const { data, error: queryError } = query
      ? await baseQuery.ilike("display_name", `%${query}%`)
      : await baseQuery;
    if (queryError) {
      setError(queryError.message);
      return;
    }
    setContacts(data ?? []);
  };

  const signUp = async () => {
    setError("");
    const { error: signError } = await client.auth.signUp({ email, password });
    if (signError) setError(signError.message);
  };

  const signIn = async () => {
    setError("");
    const { error: signError } = await client.auth.signInWithPassword({ email, password });
    if (signError) setError(signError.message);
    await loadContacts();
  };

  const createContact = async () => {
    setError("");
    const parsed = contactSchema.safeParse({ display_name: displayName });
    if (!parsed.success) {
      setError("Display name is required");
      return;
    }
    const { error: insertError } = await client.from("contacts").insert(parsed.data);
    if (insertError) setError(insertError.message);
    setDisplayName("");
    await loadContacts();
  };

  const updateContact = async () => {
    if (!editingId) return;
    setError("");
    const parsed = contactSchema.safeParse({ display_name: displayName });
    if (!parsed.success) {
      setError("Display name is required");
      return;
    }
    const { error: updateError } = await client
      .from("contacts")
      .update({ display_name: parsed.data.display_name })
      .eq("id", editingId);
    if (updateError) setError(updateError.message);
    setEditingId(null);
    setDisplayName("");
    await loadContacts();
  };

  const softDeleteContact = async (id: string) => {
    const { error: deleteError } = await client
      .from("contacts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (deleteError) setError(deleteError.message);
    await loadContacts();
  };

  return (
    <main style={{ maxWidth: 720, margin: "24px auto", fontFamily: "Inter, sans-serif" }}>
      <h1>WidadOS</h1>
      <p>Email/password auth + contacts CRUD MVP.</p>
      {error ? <p style={{ color: "crimson" }}>{error}</p> : null}
      <Card>
        <h3>Auth</h3>
        <input
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <input
          placeholder="Password"
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <button onClick={signUp}>Sign up</button>
        <button onClick={signIn} style={{ marginLeft: 8 }}>
          Sign in
        </button>
      </Card>
      <Card>
        <h3>Contacts</h3>
        <input
          placeholder="Search contacts"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
        <input
          placeholder="Display name"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
        {editingId ? (
          <button onClick={updateContact}>Update contact</button>
        ) : (
          <button onClick={createContact}>Create contact</button>
        )}
        <button onClick={loadContacts} style={{ marginLeft: 8 }}>
          Refresh
        </button>
        <ul>
          {contacts.map((contact) => (
            <li key={contact.id}>
              {contact.display_name}
              <button
                onClick={() => {
                  setEditingId(contact.id);
                  setDisplayName(contact.display_name);
                }}
                style={{ marginLeft: 8 }}
              >
                Edit
              </button>
              <button onClick={() => softDeleteContact(contact.id)} style={{ marginLeft: 8 }}>
                Delete
              </button>
            </li>
          ))}
        </ul>
      </Card>
    </main>
  );
}
