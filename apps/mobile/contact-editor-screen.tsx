import { useEffect, useState } from "react";
import { Button, Text, TextInput, View } from "react-native";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  contactFormSchema,
  tryUpdateCountryFromPhoneInput,
  type ContactFormValues,
  type PhoneCountry,
} from "@widados/shared";

type ContactEditorScreenProps = {
  mode: "new" | "edit";
  contactId: string | null;
  displayName: string;
  setDisplayName: (v: string) => void;
  contactPhone: string;
  setContactPhone: (v: string) => void;
  contactEmail: string;
  setContactEmail: (v: string) => void;
  contactPhoneCountry: PhoneCountry;
  setContactPhoneCountry: (v: PhoneCountry) => void;
  mutationBusy: boolean;
  dataBusy: boolean;
  resetContactForm: () => void;
  prepareEditContact: (id: string) => Promise<boolean>;
  createContact: (input?: {
    display_name: string;
    email: string;
    phone: string;
    phoneCountry: PhoneCountry;
  }) => Promise<boolean>;
  updateContact: (input?: {
    display_name: string;
    email: string;
    phone: string;
    phoneCountry: PhoneCountry;
  }) => Promise<boolean>;
  onCancel: () => void;
};

export function ContactEditorScreen(props: ContactEditorScreenProps) {
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountry>(() => props.contactPhoneCountry);
  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      display_name: props.displayName,
      email: props.contactEmail,
      phone: props.contactPhone,
    },
  });

  useEffect(() => {
    setPhoneCountry(props.contactPhoneCountry);
    form.reset({
      display_name: props.displayName,
      email: props.contactEmail,
      phone: props.contactPhone,
    });
  }, [props.mode, props.contactId, props.displayName, props.contactEmail, props.contactPhone, form.reset]);

  useEffect(() => {
    if (props.mode !== "edit" || !props.contactId) return;
    let cancelled = false;
    void (async () => {
      const ok = await props.prepareEditContact(props.contactId!);
      if (cancelled) return;
      if (!ok) props.onCancel();
    })();
    return () => {
      cancelled = true;
      props.resetContactForm();
    };
  }, [props.mode, props.contactId]);

  const title = props.mode === "new" ? "New contact" : "Edit contact";
  const hint = props.mode === "new" ? "Parity with web /contacts/new." : "Parity with web /contacts/:id/edit.";

  const pushToDomain = (data: ContactFormValues) => {
    props.setDisplayName(data.display_name);
    props.setContactEmail(data.email);
    props.setContactPhone(data.phone);
    const next = tryUpdateCountryFromPhoneInput(data.phone, phoneCountry);
    setPhoneCountry(next);
    props.setContactPhoneCountry(next);
    return { ...data, phoneCountry: next };
  };

  const handleSave = form.handleSubmit(async (data) => {
    const values = pushToDomain(data);
    const ok = props.mode === "new" ? await props.createContact(values) : await props.updateContact(values);
    if (ok) props.onCancel();
  });

  const handleCancel = () => {
    props.resetContactForm();
    props.onCancel();
  };

  return (
    <View className="gap-3">
      <Text className="text-xl font-bold">{title}</Text>
      <Text className="text-slate-600">{hint}</Text>
      <TextInput
        placeholder="Display name"
        value={form.watch("display_name")}
        onChangeText={(t) => form.setValue("display_name", t, { shouldValidate: true })}
        editable={!props.mutationBusy}
        className="rounded-md border border-slate-300 p-2"
      />
      {form.formState.errors.display_name ? (
        <Text className="text-xs text-red-600">{form.formState.errors.display_name.message}</Text>
      ) : null}
      <Controller
        control={form.control}
        name="phone"
        render={({ field }) => (
          <TextInput
            placeholder="Phone (E.164 or local)"
            value={field.value}
            onChangeText={(t) => {
              field.onChange(t);
              const next = tryUpdateCountryFromPhoneInput(t, phoneCountry);
              setPhoneCountry(next);
              props.setContactPhoneCountry(next);
            }}
            editable={!props.mutationBusy}
            className="rounded-md border border-slate-300 p-2"
          />
        )}
      />
      <TextInput
        placeholder="Email (optional)"
        value={form.watch("email")}
        onChangeText={(t) => form.setValue("email", t, { shouldValidate: true })}
        keyboardType="email-address"
        autoCapitalize="none"
        editable={!props.mutationBusy}
        className="rounded-md border border-slate-300 p-2"
      />
      {form.formState.errors.email ? (
        <Text className="text-xs text-red-600">{form.formState.errors.email.message}</Text>
      ) : null}
      <View className="flex-row flex-wrap gap-2">
        <Button
          title={props.mutationBusy ? "Saving…" : props.mode === "new" ? "Create" : "Save"}
          onPress={() => void handleSave()}
          disabled={props.mutationBusy || props.dataBusy}
        />
        <Button title="Cancel" onPress={handleCancel} disabled={props.mutationBusy} />
      </View>
    </View>
  );
}
