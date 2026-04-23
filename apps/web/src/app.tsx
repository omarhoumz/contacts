import { useEffect, useMemo, useState } from "react";
import { createClient } from "@supabase/supabase-js";
import { contactSchema, labelCreateSchema } from "@widados/shared";
import { Card } from "@widados/ui-lib";

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL ?? "";
const supabasePublishableKey = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "";

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
      if (label.name.toLowerCase().includes(needle)) return true;
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
  const [authResolved, setAuthResolved] = useState(false);
  const [authBusy, setAuthBusy] = useState(false);
  const [dataBusy, setDataBusy] = useState(false);
  const [mutationBusy, setMutationBusy] = useState(false);
  const client = useMemo(
    () => createClient(supabaseUrl, supabasePublishableKey, { auth: { persistSession: true } }),
    [],
  );

  const displayedContacts = useMemo(
    () => contactRows.filter((c) => contactMatchesQuery(c, query)),
    [contactRows, query],
  );
  const isAuthenticated = authResolved && Boolean(sessionEmail);

  const syncSession = async () => {
    const { data, error } = await client.auth.getUser();
    if (error || !data.user) {
      setSessionEmail(null);
      setAuthResolved(true);
      return;
    }
    setSessionEmail(data.user.email ?? null);
    setAuthResolved(true);
  };

  useEffect(() => {
    void syncSession();
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange(() => {
      void syncSession();
    });
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    if (!sessionEmail) {
      setContactRows([]);
      setLabels([]);
    }
  }, [sessionEmail]);

  const loadLabels = async () => {
    const { data, error: err } = await client.from("labels").select("id,name,color").order("name");
    if (err) throw new Error(err.message);
    setLabels((data ?? []) as LabelRow[]);
  };

  const loadContacts = async (trashMode: boolean) => {
    let qb = client.from("contacts").select(CONTACT_SELECT).order("updated_at", { ascending: false });
    qb = trashMode ? qb.not("deleted_at", "is", null) : qb.is("deleted_at", null);
    const { data, error: queryError } = await qb;
    if (queryError) throw new Error(queryError.message);
    setContactRows((data ?? []) as ContactRow[]);
  };

  const refreshData = async (trashMode = showTrash) => {
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
    const { error: signError } = await client.auth.signUp({ email, password });
    if (signError) {
      setFeedback({ tone: "error", text: signError.message });
      setAuthBusy(false);
      return;
    }
    await syncSession();
    setFeedback({ tone: "info", text: "Check your email to confirm the address if required, then sign in." });
    setAuthBusy(false);
  };

  const signIn = async () => {
    setAuthBusy(true);
    setFeedback(null);
    const { error: signError } = await client.auth.signInWithPassword({ email, password });
    if (signError) {
      setFeedback({ tone: "error", text: signError.message });
      setAuthBusy(false);
      return;
    }
    await syncSession();
    setFeedback({ tone: "success", text: "Signed in." });
    await refreshData();
    setAuthBusy(false);
  };

  const signOut = async () => {
    setAuthBusy(true);
    setFeedback(null);
    const { error: outError } = await client.auth.signOut();
    if (outError) {
      setFeedback({ tone: "error", text: outError.message });
      setAuthBusy(false);
      return;
    }
    await syncSession();
    setFeedback({ tone: "info", text: "Signed out." });
    setContactRows([]);
    setLabels([]);
    setAuthBusy(false);
  };

  const createContact = async () => {
    setMutationBusy(true);
    setFeedback(null);
    const parsed = contactSchema.safeParse({ display_name: displayName });
    if (!parsed.success) {
      setFeedback({ tone: "error", text: "Display name is required." });
      setMutationBusy(false);
      return;
    }
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) {
      setFeedback({ tone: "error", text: userError?.message ?? "Sign in required." });
      setMutationBusy(false);
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
    if (insertError) {
      setFeedback({ tone: "error", text: insertError.message });
      setMutationBusy(false);
      return;
    }
    setFeedback({ tone: "success", text: "Contact created." });
    setDisplayName("");
    await refreshData();
    setMutationBusy(false);
  };

  const updateContact = async () => {
    if (!editingId) return;
    setMutationBusy(true);
    setFeedback(null);
    const parsed = contactSchema.safeParse({ display_name: displayName });
    if (!parsed.success) {
      setFeedback({ tone: "error", text: "Display name is required." });
      setMutationBusy(false);
      return;
    }
    const { error: updateError } = await client
      .from("contacts")
      .update({ display_name: parsed.data.display_name })
      .eq("id", editingId);
    if (updateError) {
      setFeedback({ tone: "error", text: updateError.message });
      setMutationBusy(false);
      return;
    }
    setFeedback({ tone: "success", text: "Contact updated." });
    setEditingId(null);
    setDisplayName("");
    await refreshData();
    setMutationBusy(false);
  };

  const softDeleteContact = async (id: string) => {
    setMutationBusy(true);
    const { error: deleteError } = await client
      .from("contacts")
      .update({ deleted_at: new Date().toISOString() })
      .eq("id", id);
    if (deleteError) {
      setFeedback({ tone: "error", text: deleteError.message });
      setMutationBusy(false);
      return;
    }
    setFeedback({ tone: "success", text: "Moved to trash." });
    await refreshData();
    setMutationBusy(false);
  };

  const restoreContact = async (id: string) => {
    setMutationBusy(true);
    setFeedback(null);
    const { error: restoreError } = await client.from("contacts").update({ deleted_at: null }).eq("id", id);
    if (restoreError) {
      setFeedback({ tone: "error", text: restoreError.message });
      setMutationBusy(false);
      return;
    }
    setFeedback({ tone: "success", text: "Contact restored." });
    await refreshData();
    setMutationBusy(false);
  };

  const permanentlyDeleteContact = async (id: string) => {
    setMutationBusy(true);
    setFeedback(null);
    const { error: delError } = await client.from("contacts").delete().eq("id", id);
    if (delError) {
      setFeedback({ tone: "error", text: delError.message });
      setMutationBusy(false);
      return;
    }
    setFeedback({ tone: "success", text: "Contact deleted forever." });
    await refreshData();
    setMutationBusy(false);
  };

  const createLabel = async () => {
    setMutationBusy(true);
    setFeedback(null);
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
    const { error: insertError } = await client.from("labels").insert({
      name: parsed.data.name,
      color: parsed.data.color,
      user_id: userData.user.id,
    });
    if (insertError) {
      setFeedback({ tone: "error", text: insertError.message });
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
    setFeedback(null);
    const { data: userData, error: userError } = await client.auth.getUser();
    if (userError || !userData.user) {
      setFeedback({ tone: "error", text: userError?.message ?? "Sign in required." });
      setMutationBusy(false);
      return;
    }
    if (currentlyAssigned) {
      const { error: delError } = await client
        .from("contact_labels")
        .delete()
        .eq("contact_id", contactId)
        .eq("label_id", labelId);
      if (delError) {
        setFeedback({ tone: "error", text: delError.message });
        setMutationBusy(false);
        return;
      }
      setFeedback({ tone: "success", text: "Label removed." });
    } else {
      const { error: insError } = await client.from("contact_labels").insert({
        contact_id: contactId,
        label_id: labelId,
        user_id: userData.user.id,
      });
      if (insError) {
        setFeedback({ tone: "error", text: insError.message });
        setMutationBusy(false);
        return;
      }
      setFeedback({ tone: "success", text: "Label added." });
    }
    await refreshData();
    setMutationBusy(false);
  };

  return (
    <main style={{ maxWidth: 720, margin: "24px auto", fontFamily: "Inter, sans-serif" }}>
      <h1>WidadOS</h1>
      <p>Email/password auth, contacts, labels, and trash.</p>
      <p style={{ color: isAuthenticated ? "#166534" : "#6b7280", marginBottom: 8 }}>
        Auth: {isAuthenticated ? `signed in as ${sessionEmail}` : authResolved ? "signed out" : "checking session..."}
      </p>
      {feedback ? (
        <p style={{ color: feedback.tone === "error" ? "crimson" : feedback.tone === "success" ? "#166534" : "#0f766e" }}>
          {feedback.text}
        </p>
      ) : null}
      {!isAuthenticated && authResolved ? (
        <Card>
          <h3>Sign in / Sign up</h3>
          <input
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={authBusy}
            style={{ width: "100%", marginBottom: 8 }}
          />
          <input
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={authBusy}
            style={{ width: "100%", marginBottom: 8 }}
          />
          <button onClick={signUp} disabled={authBusy}>
            {authBusy ? "Working..." : "Sign up"}
          </button>
          <button onClick={signIn} style={{ marginLeft: 8 }} disabled={authBusy}>
            {authBusy ? "Working..." : "Sign in"}
          </button>
        </Card>
      ) : isAuthenticated ? (
        <Card>
          <h3>Session</h3>
          <p style={{ marginTop: 0, color: "#555" }}>You are signed in.</p>
          <button onClick={signOut} disabled={authBusy}>
            {authBusy ? "Working..." : "Sign out"}
          </button>
        </Card>
      ) : null}
      {isAuthenticated ? (
        <>
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
                disabled={mutationBusy}
                style={{ flex: 1, minWidth: 120 }}
              />
              <input type="color" value={newLabelColor} onChange={(e) => setNewLabelColor(e.target.value)} disabled={mutationBusy} />
              <button onClick={createLabel} disabled={mutationBusy || dataBusy}>
                {mutationBusy ? "Saving..." : "Add label"}
              </button>
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
                    void refreshData(false);
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
                    void refreshData(true);
                  }}
                />{" "}
                Trash
              </label>
            </div>
            <input
              placeholder="Search by name or label"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              disabled={dataBusy}
              style={{ width: "100%", marginBottom: 8 }}
            />
            {!showTrash ? (
              <>
                <input
                  placeholder="Display name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={mutationBusy}
                  style={{ width: "100%", marginBottom: 8 }}
                />
                {editingId ? (
                  <button onClick={updateContact} disabled={mutationBusy || dataBusy}>
                    {mutationBusy ? "Saving..." : "Update contact"}
                  </button>
                ) : (
                  <button onClick={createContact} disabled={mutationBusy || dataBusy}>
                    {mutationBusy ? "Saving..." : "Create contact"}
                  </button>
                )}
              </>
            ) : null}
            <button onClick={() => refreshData()} style={{ marginLeft: 8 }} disabled={dataBusy}>
              {dataBusy ? "Refreshing..." : "Refresh"}
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
                            .flatMap((cl) => cl.labels ?? [])
                            .map((l) => (
                              <span
                                key={l.id}
                                style={{
                                  display: "inline-block",
                                  marginRight: 6,
                                  marginBottom: 4,
                                  padding: "2px 8px",
                                  borderRadius: 999,
                                  background: `${l.color}22`,
                                  border: `1px solid ${l.color}`,
                                }}
                              >
                                {l.name}
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
        </>
      ) : authResolved ? (
        <Card>
          <h3>Sign in to manage contacts</h3>
          <p style={{ margin: 0, color: "#555" }}>
            Labels and contacts are hidden until you are signed in.
          </p>
        </Card>
      ) : null}
    </main>
  );
}
