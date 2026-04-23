import { Button, SafeAreaView, ScrollView, Text, TextInput, View } from "react-native";
import { MobileCard } from "@widados/ui-lib-mobile";
import { useMobileAppState } from "./use-mobile-app-state";
import { AuthSection } from "./auth-section";

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
            <View style={{ flexDirection: "row", gap: 16 }}>
              <Button title="Active" onPress={() => { s.setShowTrash(false); s.setEditingId(null); void s.refreshData(false); }} />
              <Button title="Trash" onPress={() => { s.setShowTrash(true); s.setEditingId(null); void s.refreshData(true); }} />
            </View>
            <Text style={{ fontWeight: "600" }}>Labels</Text>
            <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
              <TextInput placeholder="New label" value={s.newLabelName} onChangeText={s.setNewLabelName} style={{ flex: 1, minWidth: 120, borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 6 }} />
              <TextInput placeholder="#hex" value={s.newLabelColor} onChangeText={s.setNewLabelColor} autoCapitalize="characters" style={{ width: 88, borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 6 }} />
              <Button title={s.mutationBusy ? "Saving..." : "Add label"} onPress={s.createLabel} disabled={s.mutationBusy || s.dataBusy} />
            </View>
            <TextInput placeholder="Search name or label" value={s.query} onChangeText={s.setQuery} style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 6 }} />
            {!s.showTrash ? (
              <>
                <TextInput placeholder="Display name" value={s.displayName} onChangeText={s.setDisplayName} style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 6 }} />
                {s.editingId ? <Button title={s.mutationBusy ? "Saving..." : "Update contact"} onPress={s.updateContact} disabled={s.mutationBusy || s.dataBusy} /> : <Button title={s.mutationBusy ? "Saving..." : "Create contact"} onPress={s.createContact} disabled={s.mutationBusy || s.dataBusy} />}
              </>
            ) : null}
            <Button title={s.dataBusy ? "Refreshing..." : "Refresh"} onPress={() => s.refreshData(s.showTrash)} disabled={s.dataBusy} />
            {s.displayedContacts.map((contact) => {
              const assignedIds = new Set((contact.contact_labels ?? []).map((cl) => cl.label_id));
              return (
                <View key={contact.id} style={{ marginTop: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#eee" }}>
                  <Text style={{ fontSize: 17, fontWeight: "600" }}>{contact.display_name}</Text>
                  {!s.showTrash ? (
                    <>
                      <Button title="Edit" onPress={() => { s.setEditingId(contact.id); s.setDisplayName(contact.display_name); }} />
                      <Button title="Move to trash" onPress={() => s.softDeleteContact(contact.id)} />
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                        {s.labels.map((l) => <Button key={l.id} title={`${assignedIds.has(l.id) ? "✓ " : "+ "}${l.name}`} onPress={() => s.toggleContactLabel(contact.id, l.id, assignedIds.has(l.id))} />)}
                      </View>
                    </>
                  ) : (
                    <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                      <Button title="Restore" onPress={() => s.restoreContact(contact.id)} />
                      <Button title="Delete forever" onPress={() => s.permanentlyDeleteContact(contact.id)} />
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
