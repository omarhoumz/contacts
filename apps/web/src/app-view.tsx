import { Card } from "@widados/ui-lib";
import { useWebAppState } from "./use-web-app-state";
import { AuthSection } from "./auth-section";
import { ContactsSection } from "./contacts-section";

export function App() {
  const s = useWebAppState();
  return (
    <main style={{ maxWidth: 720, margin: "24px auto", fontFamily: "Inter, sans-serif" }}>
      <h1>WidadOS</h1>
      <p>Email/password auth, contacts, labels, and trash.</p>
      <AuthSection
        isAuthenticated={s.isAuthenticated}
        authResolved={s.authResolved}
        sessionEmail={s.sessionEmail}
        authBusy={s.authBusy}
        email={s.email}
        password={s.password}
        feedback={s.feedback}
        onEmailChange={s.setEmail}
        onPasswordChange={s.setPassword}
        onSignUp={s.signUp}
        onSignIn={s.signIn}
        onSignOut={s.signOut}
      />
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
          <ContactsSection
            showTrash={s.showTrash}
            setShowTrash={s.setShowTrash}
            setEditingId={s.setEditingId}
            query={s.query}
            setQuery={s.setQuery}
            dataBusy={s.dataBusy}
            displayName={s.displayName}
            setDisplayName={s.setDisplayName}
            mutationBusy={s.mutationBusy}
            editingId={s.editingId}
            createContact={s.createContact}
            updateContact={s.updateContact}
            refreshData={s.refreshData}
            displayedContacts={s.displayedContacts}
            labels={s.labels}
            softDeleteContact={s.softDeleteContact}
            restoreContact={s.restoreContact}
            permanentlyDeleteContact={s.permanentlyDeleteContact}
            toggleContactLabel={s.toggleContactLabel}
          />
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
