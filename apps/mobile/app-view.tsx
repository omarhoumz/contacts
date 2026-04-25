import { useEffect, useState } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Button, SafeAreaView, ScrollView, Text } from "react-native";
import { MobileCard } from "@widados/ui-lib-mobile";
import { useMobileAppState } from "./use-mobile-app-state";
import { SignInScreen } from "./sign-in-screen";
import { SignUpScreen } from "./sign-up-screen";
import { ContactsSection } from "./contacts-section";
import { ContactEditorScreen } from "./contact-editor-screen";

type ContactNav = { screen: "list" } | { screen: "new" } | { screen: "edit"; contactId: string };

const mobileQueryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      networkMode: "online",
      retry: 1,
    },
  },
});

export function App() {
  return (
    <QueryClientProvider client={mobileQueryClient}>
      <AppBody />
    </QueryClientProvider>
  );
}

function AppBody() {
  const s = useMobileAppState();
  const [authTab, setAuthTab] = useState<"signIn" | "signUp">("signIn");
  const [contactNav, setContactNav] = useState<ContactNav>({ screen: "list" });

  useEffect(() => {
    if (!s.sessionEmail) {
      setContactNav({ screen: "list" });
    }
  }, [s.sessionEmail]);

  if (!s.sessionEmail) {
    return (
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerClassName="gap-3 px-4 pb-8 pt-4">
          <Text className="text-3xl font-bold">WidadOS Mobile</Text>
          <MobileCard label="Auth — /sign-in and /sign-up parity" />
          {authTab === "signIn" ? (
            <SignInScreen
              authBusy={s.authBusy}
              feedback={s.feedback}
              onSignIn={s.signIn}
              onNavigateSignUp={() => setAuthTab("signUp")}
            />
          ) : (
            <SignUpScreen
              authBusy={s.authBusy}
              feedback={s.feedback}
              onSignUp={s.signUp}
              onNavigateSignIn={() => setAuthTab("signIn")}
            />
          )}
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (contactNav.screen === "new") {
    return (
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerClassName="gap-3 px-4 pb-8 pt-4">
          <ContactEditorScreen
            mode="new"
            contactId={null}
            displayName={s.displayName}
            setDisplayName={s.setDisplayName}
            contactPhone={s.contactPhone}
            setContactPhone={s.setContactPhone}
            contactEmail={s.contactEmail}
            setContactEmail={s.setContactEmail}
            contactPhoneCountry={s.contactPhoneCountry}
            setContactPhoneCountry={s.setContactPhoneCountry}
            mutationBusy={s.mutationBusy}
            dataBusy={s.dataBusy}
            resetContactForm={s.resetContactForm}
            prepareEditContact={s.prepareEditContact}
            createContact={s.createContact}
            updateContact={s.updateContact}
            onCancel={() => setContactNav({ screen: "list" })}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  if (contactNav.screen === "edit") {
    return (
      <SafeAreaView className="flex-1">
        <ScrollView contentContainerClassName="gap-3 px-4 pb-8 pt-4">
          <ContactEditorScreen
            mode="edit"
            contactId={contactNav.contactId}
            displayName={s.displayName}
            setDisplayName={s.setDisplayName}
            contactPhone={s.contactPhone}
            setContactPhone={s.setContactPhone}
            contactEmail={s.contactEmail}
            setContactEmail={s.setContactEmail}
            contactPhoneCountry={s.contactPhoneCountry}
            setContactPhoneCountry={s.setContactPhoneCountry}
            mutationBusy={s.mutationBusy}
            dataBusy={s.dataBusy}
            resetContactForm={s.resetContactForm}
            prepareEditContact={s.prepareEditContact}
            createContact={s.createContact}
            updateContact={s.updateContact}
            onCancel={() => setContactNav({ screen: "list" })}
          />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1">
      <ScrollView contentContainerClassName="gap-3 px-4 pb-8 pt-4">
        <Text className="text-3xl font-bold">WidadOS Mobile</Text>
        <MobileCard label="Contacts, labels, and trash" />
        <Text className="text-green-800">Signed in as {s.sessionEmail}</Text>
        <Button title={s.authBusy ? "Working…" : "Sign out"} onPress={s.signOut} disabled={s.authBusy} />
        <ContactsSection
          showTrash={s.showTrash}
          setShowTrash={s.setShowTrash}
          refreshData={s.refreshData}
          setNewLabelName={s.setNewLabelName}
          setNewLabelColor={s.setNewLabelColor}
          createLabel={s.createLabel}
          mutationBusy={s.mutationBusy}
          dataBusy={s.dataBusy}
          query={s.query}
          setQuery={s.setQuery}
          displayedContacts={s.displayedContacts}
          labels={s.labels}
          toggleContactLabel={s.toggleContactLabel}
          softDeleteContact={s.softDeleteContact}
          restoreContact={s.restoreContact}
          permanentlyDeleteContact={s.permanentlyDeleteContact}
          onNewContact={() => {
            s.resetContactForm();
            setContactNav({ screen: "new" });
          }}
          onEditContact={(contactId) => {
            setContactNav({ screen: "edit", contactId });
          }}
        />
      </ScrollView>
    </SafeAreaView>
  );
}
