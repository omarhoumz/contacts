import { useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { contactSchema, labelCreateSchema } from "@widados/shared";
import { Card } from "@widados/ui-lib";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY ?? "";

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
type ContactLabelJoin = { label_id: string; labels: LabelRow | null };
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
    const name = cl.labels?.name?.toLowerCase();
    if (name?.includes(needle)) return true;
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
  const [error, setError] = useState("");
  const client = useMemo(
    () => createClient(supabaseUrl, supabaseAnonKey, { auth: { persistSession: true } }),
    [],
  );

  const displayedContacts = useMemo(
    () => contactRows.filter((c) => contactMatchesQuery(c, query)),
    [contactRows, query],
  );

  const loadLabels = async () => {
    const { data, error: err } = await client.from("labels").select("id,name,color").order("name");
    if (err) {
      setError(err.message);
      return;
    }
    setLabels((data ?? []) as LabelRow[]);
  };

  const loadContacts = async (trashMode: boolean) => {
    let qb = client.from("contacts").select(CONTACT_SELECT).order("updated_at", { ascending: false });
    qb = trashMode ? qb.not("deleted_at", "is", null) : qb.is("deleted_at", null);
    const { data, error: queryError } = await qb;
    if (queryError) {
      setError(queryError.message);
      return;
    }
    setContactRows((data ?? []) as ContactRow[]);
  };

  const refreshData = async () => {
    setError("");
    await Promise.all([loadContacts(showTrash), loadLabels()]);
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
    await refreshData();
  };

  const createContact = async () => {
    setError("");
    const parsed = contactSchema.safeParse({ display_name: displayName });
    if (!parsed.success) {
      setError("Display name is required");
      return;
    }
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) {
      setError(userError?.message ?? "Sign in required");
      return;
    }
    const { error: insertError } = await client.from("contacts").insert({
      display_name: parsed.data.display_name,
      first_name: parsed.data.first_name,
      last_name: parsed.data.last_name,
      company: parsed.data.company,
      job_title: parsed.data.job_title,
      notes: parsed.data.notes,
      birthday: parsed.data.birthday ?? null,
      user_id: userData.user.id,
    });
    if (insertError) setError(insertError.message);
    setDisplayName("");
    await refreshData();
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
    await refreshData();
  };

  const softDeleteContact = async (id: string) => {
    const { error: deleteError } = await client
      .from("contacts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (deleteError) setError(deleteError.message);
    await refreshData();
  };

  const restoreContact = async (id: string) => {
    setError("");
    const { error: restoreError } = await client.from("contacts").update({ deleted_at: null }).eq("id", id);
    if (restoreError) setError(restoreError.message);
    await refreshData();
  };

  const permanentlyDeleteContact = async (id: string) => {
    setError("");
    const { error: delError } = await client.from("contacts").delete().eq("id", id);
    if (delError) setError(delError.message);
    await refreshData();
  };

  const createLabel = async () => {
    setError("");
    const parsed = labelCreateSchema.safeParse({ name: newLabelName, color: newLabelColor });
    if (!parsed.success) {
      setError(parsed.error.issues.map((e) => e.message).join("; "));
      return;
    }
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) {
      setError(userError?.message ?? "Sign in required");
      return;
    }
    const { error: insertError } = await client.from("labels").insert({
      name: parsed.data.name,
      color: parsed.data.color,
      user_id: userData.user.id,
    });
    if (insertError) setError(insertError.message);
    setNewLabelName("");
    setNewLabelColor("#4f46e5");
    await loadLabels();
  };

  const toggleContactLabel = async (contactId: string, labelId: string, currentlyAssigned: boolean) => {
    setError("");
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) {
      setError(userError?.message ?? "Sign in required");
      return;
    }
    if (currentlyAssigned) {
      const { error: delError } = await client
        .from("contact_labels")
        .delete()
        .eq("contact_id", contactId)
        .eq("label_id", labelId);
      if (delError) setError(delError.message);
    } else {
      const { error: insError } = await client.from("contact_labels").insert({
        contact_id: contactId,
        label_id: labelId,
        user_id: userData.user.id,
      });
      if (insError) setError(insError.message);
    }
    await refreshData();
  };

  return (
    <main style={{ maxWidth: 720, margin: "24px auto", fontFamily: "Inter, sans-serif" }}>
      <h1>WidadOS</h1>
      <p>Email/password auth, contacts, labels, and trash.</p>
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
        <h3>Labels</h3>
        <p style={{ fontSize: 13, color: "#555", marginTop: 0 }}>
          Create labels, then assign them to contacts from the list below.
        </p>
        <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
          <input
            placeholder="New label name"
            value={newLabelName}
            onChange={(e) => setNewLabelName(e.target.value)}
            style={{ flex: 1, minWidth: 120 }}
          />
          <input type="color" value={newLabelColor} onChange={(e) => setNewLabelColor(e.target.value)} />
          <button onClick={createLabel}>Add label</button>
        </div>
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          {labels.map((l) => (
            <li key={l.id} style={{ marginBottom: 4 }}>
              <span
                style={{
                  display: "inline-block",
                  width: 10,
                  height: 10,
                  borderRadius: 2,
                  background: l.color,
                  marginRight: 8,
                  verticalAlign: "middle",
                }}
              />
              {l.name}
            </li>
          ))}
        </ul>
      </Card>
      <Card>
        <h3>Contacts</h3>
        <div style={{ marginBottom: 8, display: "flex", gap: 12, alignItems: "center" }}>
          <label>
            <input
              type="radio"
              checked={!showTrash}
              onChange={() => {
                setShowTrash(false);
                setEditingId(null);
                void loadContacts(false);
              }}
            />{" "}
            Active
          </label>
          <label>
            <input
              type="radio"
              checked={showTrash}
              onChange={() => {
                setShowTrash(true);
                setEditingId(null);
                void loadContacts(true);
              }}
            />{" "}
            Trash
          </label>
        </div>
        <input
          placeholder="Search by name or label"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ width: "100%", marginBottom: 8 }}
        />
        {!showTrash ? (
          <>
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
          </>
        ) : null}
        <button onClick={() => refreshData()} style={{ marginLeft: 8 }}>
          Refresh
        </button>
        <ul>
          {displayedContacts.map((contact) => {
            const assignedIds = new Set((contact.contact_labels ?? []).map((cl) => cl.label_id));
            return (
              <li key={contact.id} style={{ marginBottom: 12 }}>
                <strong>{contact.display_name}</strong>
                {!showTrash ? (
                  <>
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
                      Move to trash
                    </button>
                    <div style={{ marginTop: 6, fontSize: 13 }}>
                      {(contact.contact_labels ?? [])
                        .map((cl) => cl.labels)
                        .filter(Boolean)
                        .map((l) => (
                          <span
                            key={l!.id}
                            style={{
                              display: "inline-block",
                              marginRight: 6,
                              marginBottom: 4,
                              padding: "2px 8px",
                              borderRadius: 999,
                              background: `${l!.color}22`,
                              border: `1px solid ${l!.color}`,
                            }}
                          >
                            {l!.name}
                          </span>
                        ))}
                      {labels.length ? (
                        <div style={{ marginTop: 6 }}>
                          <span style={{ color: "#666" }}>Labels: </span>
                          {labels.map((l) => (
                            <button
                              key={l.id}
                              type="button"
                              onClick={() => toggleContactLabel(contact.id, l.id, assignedIds.has(l.id))}
                              style={{
                                marginRight: 6,
                                marginBottom: 4,
                                fontSize: 12,
                                opacity: assignedIds.has(l.id) ? 1 : 0.55,
                                border: assignedIds.has(l.id) ? `2px solid ${l.color}` : "1px solid #ccc",
                                borderRadius: 6,
                                background: assignedIds.has(l.id) ? `${l.color}18` : "#fafafa",
                              }}
                            >
                              {assignedIds.has(l.id) ? "✓ " : "+ "}
                              {l.name}
                            </button>
                          ))}
                        </div>
                      ) : null}
                    </div>
                  </>
                ) : (
                  <span style={{ marginLeft: 8 }}>
                    <button onClick={() => restoreContact(contact.id)}>Restore</button>
                    <button onClick={() => permanentlyDeleteContact(contact.id)} style={{ marginLeft: 8 }}>
                      Delete forever
                    </button>
                  </span>
                )}
              </li>
            );
          })}
        </ul>
      </Card>
    </main>
  );
}
