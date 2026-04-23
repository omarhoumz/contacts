import { Button, Text, TextInput, View } from "react-native";
import type { ContactRow, LabelRow } from "./mobile-contact-search";

type ContactsSectionProps = {
  showTrash: boolean;
  setShowTrash: (value: boolean) => void;
  setEditingId: (value: string | null) => void;
  refreshData: (trashMode?: boolean) => Promise<void>;
  newLabelName: string;
  setNewLabelName: (value: string) => void;
  newLabelColor: string;
  setNewLabelColor: (value: string) => void;
  createLabel: () => void;
  mutationBusy: boolean;
  dataBusy: boolean;
  query: string;
  setQuery: (value: string) => void;
  showCompose: boolean;
  displayName: string;
  setDisplayName: (value: string) => void;
  editingId: string | null;
  updateContact: () => void;
  createContact: () => void;
  displayedContacts: ContactRow[];
  labels: LabelRow[];
  toggleContactLabel: (contactId: string, labelId: string, currentlyAssigned: boolean) => void;
  softDeleteContact: (id: string) => void;
  restoreContact: (id: string) => void;
  permanentlyDeleteContact: (id: string) => void;
};

export function ContactsSection(props: ContactsSectionProps) {
  return (
    <>
      <View style={{ flexDirection: "row", gap: 16 }}>
        <Button
          title="Active"
          onPress={() => {
            props.setShowTrash(false);
            props.setEditingId(null);
            void props.refreshData(false);
          }}
        />
        <Button
          title="Trash"
          onPress={() => {
            props.setShowTrash(true);
            props.setEditingId(null);
            void props.refreshData(true);
          }}
        />
      </View>
      <Text style={{ fontWeight: "600" }}>Labels</Text>
      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <TextInput
          placeholder="New label"
          value={props.newLabelName}
          onChangeText={props.setNewLabelName}
          style={{ flex: 1, minWidth: 120, borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 6 }}
        />
        <TextInput
          placeholder="#hex"
          value={props.newLabelColor}
          onChangeText={props.setNewLabelColor}
          autoCapitalize="characters"
          style={{ width: 88, borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 6 }}
        />
        <Button title={props.mutationBusy ? "Saving..." : "Add label"} onPress={props.createLabel} disabled={props.mutationBusy || props.dataBusy} />
      </View>
      <TextInput
        placeholder="Search name or label"
        value={props.query}
        onChangeText={props.setQuery}
        style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 6 }}
      />
      {props.showCompose ? (
        <>
          <TextInput
            placeholder="Display name"
            value={props.displayName}
            onChangeText={props.setDisplayName}
            style={{ borderWidth: 1, borderColor: "#ccc", padding: 8, borderRadius: 6 }}
          />
          {props.editingId ? (
            <Button title={props.mutationBusy ? "Saving..." : "Update contact"} onPress={props.updateContact} disabled={props.mutationBusy || props.dataBusy} />
          ) : (
            <Button title={props.mutationBusy ? "Saving..." : "Create contact"} onPress={props.createContact} disabled={props.mutationBusy || props.dataBusy} />
          )}
        </>
      ) : null}
      <Button title={props.dataBusy ? "Refreshing..." : "Refresh"} onPress={() => props.refreshData(props.showTrash)} disabled={props.dataBusy} />
      {props.displayedContacts.map((contact) => {
        const assignedIds = new Set((contact.contact_labels ?? []).map((cl) => cl.label_id));
        return (
          <View key={contact.id} style={{ marginTop: 8, paddingBottom: 8, borderBottomWidth: 1, borderBottomColor: "#eee" }}>
            <Text style={{ fontSize: 17, fontWeight: "600" }}>{contact.display_name}</Text>
            {!props.showTrash ? (
              <>
                <Button
                  title="Edit"
                  onPress={() => {
                    props.setEditingId(contact.id);
                    props.setDisplayName(contact.display_name);
                  }}
                />
                <Button title="Move to trash" onPress={() => props.softDeleteContact(contact.id)} />
                <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 6 }}>
                  {props.labels.map((l) => (
                    <Button
                      key={l.id}
                      title={`${assignedIds.has(l.id) ? "✓ " : "+ "}${l.name}`}
                      onPress={() => props.toggleContactLabel(contact.id, l.id, assignedIds.has(l.id))}
                    />
                  ))}
                </View>
              </>
            ) : (
              <View style={{ flexDirection: "row", gap: 8, marginTop: 6 }}>
                <Button title="Restore" onPress={() => props.restoreContact(contact.id)} />
                <Button title="Delete forever" onPress={() => props.permanentlyDeleteContact(contact.id)} />
              </View>
            )}
          </View>
        );
      })}
    </>
  );
}
