import { Button, Text, TextInput, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { labelCreateSchema, type LabelCreate } from "@widados/shared";
import type { ContactRow, LabelRow } from "./mobile-contact-search";

type ContactsSectionProps = {
  showTrash: boolean;
  setShowTrash: (value: boolean) => void;
  refreshData: (trashMode?: boolean) => Promise<void>;
  setNewLabelName: (value: string) => void;
  setNewLabelColor: (value: string) => void;
  createLabel: (input?: { name: string; color: string }) => Promise<boolean>;
  mutationBusy: boolean;
  dataBusy: boolean;
  query: string;
  setQuery: (value: string) => void;
  displayedContacts: ContactRow[];
  labels: LabelRow[];
  toggleContactLabel: (contactId: string, labelId: string, currentlyAssigned: boolean) => void;
  softDeleteContact: (id: string) => void;
  restoreContact: (id: string) => void;
  permanentlyDeleteContact: (id: string) => void;
  onNewContact: () => void;
  onEditContact: (contactId: string) => void;
};

function NewLabelBlock(props: Pick<ContactsSectionProps, "createLabel" | "mutationBusy" | "dataBusy" | "setNewLabelName" | "setNewLabelColor">) {
  const form = useForm<LabelCreate>({
    resolver: zodResolver(labelCreateSchema),
    defaultValues: { name: "", color: "#2563eb" },
  });

  return (
    <View className="gap-2">
      <View className="flex-row flex-wrap items-center gap-2">
        <Controller
          control={form.control}
          name="name"
          render={({ field }) => (
            <TextInput
              placeholder="New label"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              className="min-w-[120px] flex-1 rounded-md border border-slate-300 p-2"
            />
          )}
        />
        <Controller
          control={form.control}
          name="color"
          render={({ field }) => (
            <TextInput
              placeholder="#hex"
              value={field.value}
              onChangeText={field.onChange}
              onBlur={field.onBlur}
              autoCapitalize="characters"
              className="w-[100px] rounded-md border border-slate-300 p-2"
            />
          )}
        />
      </View>
      {form.formState.errors.name ? (
        <Text className="text-xs text-red-600">{form.formState.errors.name.message}</Text>
      ) : null}
      {form.formState.errors.color ? (
        <Text className="text-xs text-red-600">{form.formState.errors.color.message}</Text>
      ) : null}
      <Button
        title={props.mutationBusy ? "Saving..." : "Add label"}
        onPress={form.handleSubmit(async (data) => {
          const ok = await props.createLabel({ name: data.name, color: data.color });
          if (!ok) return;
          form.reset({ name: "", color: "#2563eb" });
        })}
        disabled={props.mutationBusy || props.dataBusy}
      />
    </View>
  );
}

export function ContactsSection(props: ContactsSectionProps) {
  return (
    <>
      <View className="flex-row gap-4">
        <Button
          title="Active"
          onPress={() => {
            props.setShowTrash(false);
            void props.refreshData(false);
          }}
        />
        <Button
          title="Trash"
          onPress={() => {
            props.setShowTrash(true);
            void props.refreshData(true);
          }}
        />
      </View>
      {!props.showTrash ? (
        <Button title="New contact" onPress={props.onNewContact} disabled={props.mutationBusy || props.dataBusy} />
      ) : null}
      <Text className="font-semibold">Labels</Text>
      <NewLabelBlock
        createLabel={props.createLabel}
        mutationBusy={props.mutationBusy}
        dataBusy={props.dataBusy}
        setNewLabelName={props.setNewLabelName}
        setNewLabelColor={props.setNewLabelColor}
      />
      <TextInput
        placeholder="Search name or label"
        value={props.query}
        onChangeText={props.setQuery}
        className="rounded-md border border-slate-300 p-2"
      />
      <Button title={props.dataBusy ? "Refreshing..." : "Refresh"} onPress={() => props.refreshData(props.showTrash)} disabled={props.dataBusy} />
      {props.displayedContacts.map((contact) => {
        const assignedIds = new Set((contact.contact_labels ?? []).map((cl) => cl.label_id));
        return (
          <View key={contact.id} className="mt-2 border-b border-slate-200 pb-2">
            <Text className="text-lg font-semibold">{contact.display_name}</Text>
            {!props.showTrash ? (
              <>
                <Button title="Edit" onPress={() => props.onEditContact(contact.id)} />
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
