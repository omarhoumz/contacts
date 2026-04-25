import { useEffect, useState } from "react";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  PHONE_COUNTRIES,
  contactFormSchema,
  formatDialPrefix,
  tryUpdateCountryFromPhoneInput,
  type ContactFormValues,
  type PhoneCountry,
} from "@widados/shared";
import { useNavigate } from "@tanstack/react-router";
import { useWebApp } from "./web-app-context";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card } from "./components/ui/card";

type ContactEditorPanelProps = {
  title: string;
};

export function ContactEditorPanel(props: ContactEditorPanelProps) {
  const s = useWebApp();
  const navigate = useNavigate();
  const [phoneCountry, setPhoneCountry] = useState<PhoneCountry>(() => s.contactPhoneCountry);

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      display_name: s.displayName,
      email: s.contactEmail,
      phone: s.contactPhone,
    },
  });

  useEffect(() => {
    setPhoneCountry(s.contactPhoneCountry);
    form.reset({
      display_name: s.displayName,
      email: s.contactEmail,
      phone: s.contactPhone,
    });
  }, [s.editingId, s.displayName, s.contactEmail, s.contactPhone, form.reset]);

  const pushToDomain = (data: ContactFormValues) => {
    s.setDisplayName(data.display_name);
    s.setContactEmail(data.email);
    s.setContactPhone(data.phone);
    const next = tryUpdateCountryFromPhoneInput(data.phone, phoneCountry);
    setPhoneCountry(next);
    s.setContactPhoneCountry(next);
    return { ...data, phoneCountry: next };
  };

  const handleSubmit = form.handleSubmit(async (data) => {
    const values = pushToDomain(data);
    if (s.editingId) {
      const ok = await s.updateContact(values);
      if (ok) await navigate({ to: "/contacts" });
      return;
    }
    const ok = await s.createContact(values);
    if (ok) await navigate({ to: "/contacts" });
  });

  const goBackToList = () => {
    s.resetContactForm();
    void navigate({ to: "/contacts" });
  };

  return (
    <Card className="p-4">
      <p className="mb-3 text-sm font-semibold text-foreground">{props.title}</p>
      <form className="flex flex-col gap-2" onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 items-center gap-2 md:grid-cols-2 xl:grid-cols-3">
          <div className="min-w-0">
            <Input
              placeholder="Display name *"
              disabled={s.mutationBusy}
              className="min-w-0"
              autoFocus
              aria-invalid={Boolean(form.formState.errors.display_name)}
              {...form.register("display_name")}
            />
            <p className="mt-1 min-h-4 text-xs text-destructive" aria-live="polite">
              {form.formState.errors.display_name?.message ?? ""}
            </p>
          </div>
          <div className="min-w-0">
            <Controller
              control={form.control}
              name="phone"
              render={({ field }) => (
                <div className="flex min-w-0 gap-2">
                  <select
                    aria-label="Phone country"
                    disabled={s.mutationBusy}
                    value={phoneCountry}
                    onChange={(e) => {
                      const next = e.target.value as PhoneCountry;
                      setPhoneCountry(next);
                      s.setContactPhoneCountry(next);
                    }}
                    className="h-9 rounded-md border border-input bg-background px-2 text-xs text-foreground"
                  >
                    {PHONE_COUNTRIES.map((c) => (
                      <option key={c.code} value={c.code}>
                        {c.code} {formatDialPrefix(c.code)}
                      </option>
                    ))}
                  </select>
                  <Input
                    placeholder="Phone (E.164 or local)"
                    disabled={s.mutationBusy}
                    className="min-w-0"
                    value={field.value}
                    onChange={(e) => {
                      const v = e.target.value;
                      field.onChange(v);
                      const next = tryUpdateCountryFromPhoneInput(v, phoneCountry);
                      setPhoneCountry(next);
                      s.setContactPhoneCountry(next);
                    }}
                  />
                </div>
              )}
            />
            <p className="mt-1 min-h-4 text-xs text-destructive" aria-live="polite">
              {form.formState.errors.phone?.message ?? ""}
            </p>
          </div>
          <div className="min-w-0">
            <Input
              placeholder="Email (optional)"
              type="email"
              disabled={s.mutationBusy}
              className="min-w-0"
              aria-invalid={Boolean(form.formState.errors.email)}
              {...form.register("email")}
            />
            <p className="mt-1 min-h-4 text-xs text-destructive" aria-live="polite">
              {form.formState.errors.email?.message ?? ""}
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button type="submit" disabled={s.mutationBusy || s.dataBusy}>
            {s.mutationBusy ? "Saving…" : s.editingId ? "Save" : "Create"}
          </Button>
          <Button type="button" onClick={goBackToList} variant="secondary">
            Cancel
          </Button>
        </div>
      </form>
    </Card>
  );
}
