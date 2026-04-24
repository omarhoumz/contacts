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
      <View className="flex-row gap-4">
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
      <Text className="font-semibold">Labels</Text>
      <View className="flex-row flex-wrap items-center gap-2">
        <TextInput
          placeholder="New label"
          value={props.newLabelName}
          onChangeText={props.setNewLabelName}
          className="min-w-[120px] flex-1 rounded-md border border-slate-300 p-2"
        />
        <TextInput
          placeholder="#hex"
          value={props.newLabelColor}
          onChangeText={props.setNewLabelColor}
          autoCapitalize="characters"
          className="w-[88px] rounded-md border border-slate-300 p-2"
        />
        <Button title={props.mutationBusy ? "Saving..." : "Add label"} onPress={props.createLabel} disabled={props.mutationBusy || props.dataBusy} />
      </View>
      <TextInput
        placeholder="Search name or label"
        value={props.query}
        onChangeText={props.setQuery}
        className="rounded-md border border-slate-300 p-2"
      />
      {props.showCompose ? (
        <>
          <TextInput
            placeholder="Display name"
            value={props.displayName}
            onChangeText={props.setDisplayName}
            className="rounded-md border border-slate-300 p-2"
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
          <View key={contact.id} className="mt-2 border-b border-slate-200 pb-2">
            <Text className="text-lg font-semibold">{contact.display_name}</Text>
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
                <View className="mt-1.5 flex-row flex-wrap gap-1.5">
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
              <View className="mt-1.5 flex-row gap-2">
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
