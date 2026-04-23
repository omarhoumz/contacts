import { Card } from "@widados/ui-lib";
import { normalizeLabels } from "./contact-search";
import { useWebAppState } from "./use-web-app-state";

export function App() {
  const s = useWebAppState();
  return (
    <main style={{ maxWidth: 720, margin: "24px auto", fontFamily: "Inter, sans-serif" }}>
      <h1>WidadOS</h1>
      <p>Email/password auth, contacts, labels, and trash.</p>
      <p style={{ color: s.isAuthenticated ? "#166534" : "#6b7280", marginBottom: 8 }}>
        Auth: {s.isAuthenticated ? `signed in as ${s.sessionEmail}` : s.authResolved ? "signed out" : "checking session..."}
      </p>
      {s.feedback ? <p style={{ color: s.feedback.tone === "error" ? "crimson" : s.feedback.tone === "success" ? "#166534" : "#0f766e" }}>{s.feedback.text}</p> : null}
      {!s.isAuthenticated && s.authResolved ? (
        <Card>
          <h3>Sign in / Sign up</h3>
          <input placeholder="Email" value={s.email} onChange={(e) => s.setEmail(e.target.value)} disabled={s.authBusy} style={{ width: "100%", marginBottom: 8 }} />
          <input placeholder="Password" type="password" value={s.password} onChange={(e) => s.setPassword(e.target.value)} disabled={s.authBusy} style={{ width: "100%", marginBottom: 8 }} />
          <button onClick={s.signUp} disabled={s.authBusy}>{s.authBusy ? "Working..." : "Sign up"}</button>
          <button onClick={s.signIn} style={{ marginLeft: 8 }} disabled={s.authBusy}>{s.authBusy ? "Working..." : "Sign in"}</button>
        </Card>
      ) : s.isAuthenticated ? (
        <Card>
          <h3>Session</h3>
          <p style={{ marginTop: 0, color: "#555" }}>You are signed in.</p>
          <button onClick={s.signOut} disabled={s.authBusy}>{s.authBusy ? "Working..." : "Sign out"}</button>
        </Card>
      ) : null}
      {s.isAuthenticated ? (
        <>
          <Card>
            <h3>Labels</h3>
            <p style={{ fontSize: 13, color: "#555", marginTop: 0 }}>Create labels, then assign them to contacts from the list below.</p>
            <div style={{ display: "flex", gap: 8, alignItems: "center", flexWrap: "wrap", marginBottom: 8 }}>
              <input placeholder="New label name" value={s.newLabelName} onChange={(e) => s.setNewLabelName(e.target.value)} disabled={s.mutationBusy} style={{ flex: 1, minWidth: 120 }} />
              <input type="color" value={s.newLabelColor} onChange={(e) => s.setNewLabelColor(e.target.value)} disabled={s.mutationBusy} />
              <button onClick={s.createLabel} disabled={s.mutationBusy || s.dataBusy}>{s.mutationBusy ? "Saving..." : "Add label"}</button>
            </div>
            <ul style={{ paddingLeft: 18, margin: 0 }}>{s.labels.map((l) => <li key={l.id} style={{ marginBottom: 4 }}>{l.name}</li>)}</ul>
          </Card>
          <Card>
            <h3>Contacts</h3>
            <div style={{ marginBottom: 8, display: "flex", gap: 12, alignItems: "center" }}>
              <label><input type="radio" checked={!s.showTrash} onChange={() => { s.setShowTrash(false); s.setEditingId(null); void s.refreshData(false); }} /> Active</label>
              <label><input type="radio" checked={s.showTrash} onChange={() => { s.setShowTrash(true); s.setEditingId(null); void s.refreshData(true); }} /> Trash</label>
            </div>
            <input placeholder="Search by name or label" value={s.query} onChange={(e) => s.setQuery(e.target.value)} disabled={s.dataBusy} style={{ width: "100%", marginBottom: 8 }} />
            {!s.showTrash ? (
              <>
                <input placeholder="Display name" value={s.displayName} onChange={(e) => s.setDisplayName(e.target.value)} disabled={s.mutationBusy} style={{ width: "100%", marginBottom: 8 }} />
                {s.editingId ? <button onClick={s.updateContact} disabled={s.mutationBusy || s.dataBusy}>{s.mutationBusy ? "Saving..." : "Update contact"}</button> : <button onClick={s.createContact} disabled={s.mutationBusy || s.dataBusy}>{s.mutationBusy ? "Saving..." : "Create contact"}</button>}
              </>
            ) : null}
            <button onClick={() => s.refreshData()} style={{ marginLeft: 8 }} disabled={s.dataBusy}>{s.dataBusy ? "Refreshing..." : "Refresh"}</button>
            <ul>
              {s.displayedContacts.map((contact) => {
                const assignedIds = new Set((contact.contact_labels ?? []).map((cl) => cl.label_id));
                return (
                  <li key={contact.id} style={{ marginBottom: 12 }}>
                    <strong>{contact.display_name}</strong>
                    {!s.showTrash ? (
                      <>
                        <button onClick={() => { s.setEditingId(contact.id); s.setDisplayName(contact.display_name); }} style={{ marginLeft: 8 }}>Edit</button>
                        <button onClick={() => s.softDeleteContact(contact.id)} style={{ marginLeft: 8 }}>Move to trash</button>
                        <div style={{ marginTop: 6, fontSize: 13 }}>
                          {(contact.contact_labels ?? []).flatMap((cl) => normalizeLabels(cl.labels)).map((l) => <span key={l.id} style={{ marginRight: 6 }}>{l.name}</span>)}
                          {s.labels.length ? (
                            <div style={{ marginTop: 6 }}>
                              <span style={{ color: "#666" }}>Labels: </span>
                              {s.labels.map((l) => (
                                <button key={l.id} type="button" onClick={() => s.toggleContactLabel(contact.id, l.id, assignedIds.has(l.id))} style={{ marginRight: 6 }}>
                                  {assignedIds.has(l.id) ? "✓ " : "+ "}{l.name}
                                </button>
                              ))}
                            </div>
                          ) : null}
                        </div>
                      </>
                    ) : (
                      <span style={{ marginLeft: 8 }}>
                        <button onClick={() => s.restoreContact(contact.id)}>Restore</button>
                        <button onClick={() => s.permanentlyDeleteContact(contact.id)} style={{ marginLeft: 8 }}>Delete forever</button>
                      </span>
                    )}
                  </li>
                );
              })}
            </ul>
          </Card>
        </>
      ) : s.authResolved ? (
        <Card>
          <h3>Sign in to manage contacts</h3>
          <p style={{ margin: 0, color: "#555" }}>Labels and contacts are hidden until you are signed in.</p>
        </Card>
      ) : null}
    </main>
  );
}
