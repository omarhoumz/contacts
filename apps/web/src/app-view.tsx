import { Card } from "@widados/ui-lib";
import { useWebAppState } from "./use-web-app-state";
import { AuthSection } from "./auth-section";
import { ContactsSection } from "./contacts-section";
import { LabelsSection } from "./labels-section";

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
          <LabelsSection
            labels={s.labels}
            newLabelName={s.newLabelName}
            setNewLabelName={s.setNewLabelName}
            newLabelColor={s.newLabelColor}
            setNewLabelColor={s.setNewLabelColor}
            createLabel={s.createLabel}
            labelBusy={s.labelBusy}
            dataBusy={s.dataBusy}
          />
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
