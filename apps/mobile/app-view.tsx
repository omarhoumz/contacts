import { SafeAreaView, ScrollView, Text, View } from "react-native";
import { MobileCard } from "@widados/ui-lib-mobile";
import { useMobileAppState } from "./use-mobile-app-state";
import { AuthSection } from "./auth-section";
import { ContactsSection } from "./contacts-section";

export function App() {
  const s = useMobileAppState();
  return (
    <SafeAreaView style={{ flex: 1 }}>
      <ScrollView contentContainerStyle={{ padding: 16, gap: 12, paddingBottom: 32 }}>
        <Text style={{ fontSize: 26, fontWeight: "700" }}>WidadOS Mobile</Text>
        <MobileCard label="Auth, contacts, labels, and trash" />
        <AuthSection
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
        {s.sessionEmail ? (
          <>
            <ContactsSection
              showTrash={s.showTrash}
              setShowTrash={s.setShowTrash}
              setEditingId={s.setEditingId}
              refreshData={s.refreshData}
              newLabelName={s.newLabelName}
              setNewLabelName={s.setNewLabelName}
              newLabelColor={s.newLabelColor}
              setNewLabelColor={s.setNewLabelColor}
              createLabel={s.createLabel}
              mutationBusy={s.mutationBusy}
              dataBusy={s.dataBusy}
              query={s.query}
              setQuery={s.setQuery}
              showCompose={!s.showTrash}
              displayName={s.displayName}
              setDisplayName={s.setDisplayName}
              editingId={s.editingId}
              updateContact={s.updateContact}
              createContact={s.createContact}
              displayedContacts={s.displayedContacts}
              labels={s.labels}
              toggleContactLabel={s.toggleContactLabel}
              softDeleteContact={s.softDeleteContact}
              restoreContact={s.restoreContact}
              permanentlyDeleteContact={s.permanentlyDeleteContact}
            />
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
