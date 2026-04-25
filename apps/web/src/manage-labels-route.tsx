import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { labelCreateSchema, type LabelCreate } from "@widados/shared";
import { useWebApp } from "./web-app-context";
import { Button, buttonVariants } from "./components/ui/button";
import { cn } from "./lib/cn";
import { Input } from "./components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "./components/ui/dialog";
import { Card } from "./components/ui/card";
import type { LabelRow } from "./contact-search";


const PRESET_COLORS = [
  "#2563eb",
  "#7c3aed",
  "#db2777",
  "#dc2626",
  "#ea580c",
  "#ca8a04",
  "#16a34a",
  "#0891b2",
  "#64748b",
  "#0f172a",
];

const COLOR_CLASSES: Record<string, string> = {
  "#2563eb": "bg-[#2563eb]",
  "#7c3aed": "bg-[#7c3aed]",
  "#db2777": "bg-[#db2777]",
  "#dc2626": "bg-[#dc2626]",
  "#ea580c": "bg-[#ea580c]",
  "#ca8a04": "bg-[#ca8a04]",
  "#16a34a": "bg-[#16a34a]",
  "#0891b2": "bg-[#0891b2]",
  "#64748b": "bg-[#64748b]",
  "#0f172a": "bg-[#0f172a]",
};

function NewLabelDialogForm(props: { onDone: () => void }) {
  const s = useWebApp();
  const form = useForm<LabelCreate>({
    resolver: zodResolver(labelCreateSchema),
    defaultValues: { name: "", color: PRESET_COLORS[0] },
  });

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={form.handleSubmit(async (data) => {
        const ok = await s.createLabel(data);
        if (!ok) return;
        form.reset({ name: "", color: PRESET_COLORS[0] });
        props.onDone();
      })}
    >
      <Input
        placeholder="Label name"
        disabled={s.labelBusy}
        className="flex-1"
        aria-invalid={Boolean(form.formState.errors.name)}
        {...form.register("name")}
      />
      {form.formState.errors.name ? (
        <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
      ) : null}
      <div className="flex flex-wrap gap-1.5">
        {PRESET_COLORS.map((color) => (
          <button
            key={color}
            type="button"
            onClick={() => form.setValue("color", color, { shouldDirty: true })}
            disabled={s.labelBusy}
            title={color}
            aria-label={`Pick colour ${color}`}
            className={`h-[22px] w-[22px] cursor-pointer rounded-full p-0 ${COLOR_CLASSES[color]} ${
              form.watch("color") === color
                ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                : "border-2 border-transparent"
            }`}
          />
        ))}
      </div>
      <DialogFooter>
        <Button type="button" variant="secondary" onClick={props.onDone} disabled={s.labelBusy}>
          Cancel
        </Button>
        <Button type="submit" disabled={s.labelBusy || s.dataBusy}>
          {s.labelBusy ? "Saving…" : "Create"}
        </Button>
      </DialogFooter>
    </form>
  );
}

function EditLabelDialogForm(props: { label: LabelRow; onDone: () => void }) {
  const s = useWebApp();
  const form = useForm<LabelCreate>({
    resolver: zodResolver(labelCreateSchema),
    defaultValues: { name: props.label.name, color: props.label.color ?? PRESET_COLORS[0] },
  });

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={form.handleSubmit(async (data) => {
        const ok = await s.saveLabelEdit(data);
        if (!ok) return;
        props.onDone();
      })}
    >
      <Input
        aria-label={`Edit name for ${props.label.name}`}
        disabled={s.labelBusy}
        aria-invalid={Boolean(form.formState.errors.name)}
        {...form.register("name")}
      />
      {form.formState.errors.name ? (
        <p className="text-xs text-destructive">{form.formState.errors.name.message}</p>
      ) : null}
      <div className="flex flex-wrap gap-1.5">
        {PRESET_COLORS.map((color) => (
          <button
            key={`${props.label.id}-${color}`}
            type="button"
            onClick={() => form.setValue("color", color, { shouldDirty: true })}
            disabled={s.labelBusy}
            title={color}
            aria-label={`Set colour to ${color}`}
            className={`h-5 w-5 cursor-pointer rounded-full p-0 ${COLOR_CLASSES[color]} ${
              form.watch("color") === color
                ? "ring-2 ring-foreground ring-offset-2 ring-offset-background"
                : "border-2 border-transparent"
            }`}
          />
        ))}
      </div>
      <DialogFooter>
        <Button
          type="button"
          variant="secondary"
          onClick={() => {
            s.cancelEditLabel();
            props.onDone();
          }}
          disabled={s.labelBusy}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={s.labelBusy || !form.watch("name")?.trim()}>
          Save
        </Button>
      </DialogFooter>
    </form>
  );
}

export function ManageLabelsRoute() {
  const s = useWebApp();
  const [createOpen, setCreateOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editTarget, setEditTarget] = useState<LabelRow | null>(null);

  const confirmDeleteLabel = (name: string) => {
    return window.confirm(
      `Delete "${name}"? This also removes it from any contacts that currently use it.`,
    );
  };

  return (
    <>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h2 className="text-xl font-semibold tracking-tight">Labels</h2>
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger className={cn(buttonVariants())}>New label</DialogTrigger>
          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Create label</DialogTitle>
              <DialogDescription>Pick a name and colour. Presets match contact chips.</DialogDescription>
            </DialogHeader>
            <NewLabelDialogForm onDone={() => setCreateOpen(false)} />
          </DialogContent>
        </Dialog>
      </div>

      {editTarget ? (
        <Dialog
          open={editOpen}
          onOpenChange={(open) => {
            if (!open) {
              s.cancelEditLabel();
              setEditOpen(false);
              setEditTarget(null);
            }
          }}
        >
          <DialogContent aria-describedby={undefined}>
            <DialogHeader>
              <DialogTitle>Edit label</DialogTitle>
              <DialogDescription>Update the name or colour for this label.</DialogDescription>
            </DialogHeader>
            <EditLabelDialogForm
              key={editTarget.id}
              label={editTarget}
              onDone={() => {
                setEditOpen(false);
                setEditTarget(null);
              }}
            />
          </DialogContent>
        </Dialog>
      ) : null}

      <div>
        {s.dataBusy ? (
          <Card className="p-12 text-center">
            <p className="m-0 text-sm text-muted-foreground">Loading…</p>
          </Card>
        ) : s.labels.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="m-0 text-sm text-muted-foreground">No labels yet — create one with New label.</p>
          </Card>
        ) : (
          <ul className="m-0 list-none rounded-xl border bg-card p-0">
            {s.labels.map((l) => (
            <li key={l.id} className="flex items-center gap-2 border-b px-3 py-3 last:border-b-0">
              <span
                className={`h-3.5 w-3.5 shrink-0 rounded-full ${COLOR_CLASSES[l.color ?? ""] ?? "bg-slate-300"}`}
              />
              <span className="flex-1 text-sm text-foreground">{l.name}</span>
              <div className="flex gap-2">
                <Button
                  type="button"
                  onClick={() => {
                    s.beginEditLabel(l);
                    setEditTarget(l);
                    setEditOpen(true);
                  }}
                  disabled={s.labelBusy}
                  variant="secondary"
                  size="sm"
                  aria-label={`Edit label ${l.name}`}
                >
                  Edit
                </Button>
                <Button
                  type="button"
                  onClick={() => {
                    if (!confirmDeleteLabel(l.name)) return;
                    void s.deleteLabel(l);
                  }}
                  disabled={s.labelBusy}
                  variant="destructive"
                  size="sm"
                  aria-label={`Delete label ${l.name}`}
                >
                  Delete
                </Button>
              </div>
            </li>
            ))}
          </ul>
        )}
      </div>
    </>
  );
}
