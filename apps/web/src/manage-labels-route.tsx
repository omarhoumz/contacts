import { useWebApp } from "./web-app-context";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Card } from "./components/ui/card";

const PRESET_COLORS = [
  "#2563eb", "#7c3aed", "#db2777", "#dc2626",
  "#ea580c", "#ca8a04", "#16a34a", "#0891b2",
  "#64748b", "#0f172a",
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

export function ManageLabelsRoute() {
  const s = useWebApp();
  const confirmDeleteLabel = (name: string) => {
    return window.confirm(
      `Delete "${name}"? This also removes it from any contacts that currently use it.`,
    );
  };

  return (
    <>
      <div className="mb-4">
        <h2 className="text-xl font-semibold tracking-tight">Manage Labels</h2>
      </div>

      <Card className="mb-4 p-4">
        <p className="mb-2 text-sm font-semibold text-foreground">New label</p>
        <div className="flex items-center gap-2">
          <Input
            placeholder="Label name"
            value={s.newLabelName}
            onChange={(e) => s.setNewLabelName(e.target.value)}
            disabled={s.labelBusy}
            className="flex-1"
          />
          <Button
            onClick={s.createLabel}
            disabled={s.labelBusy || s.dataBusy || !s.newLabelName.trim()}
          >
            {s.labelBusy ? "Saving…" : "Add label"}
          </Button>
        </div>

        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => s.setNewLabelColor(color)}
              disabled={s.labelBusy}
              title={color}
              aria-label={`Pick colour ${color}`}
              className={`h-[22px] w-[22px] cursor-pointer rounded-full p-0 ${COLOR_CLASSES[color]} ${
                s.newLabelColor === color ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : "border-2 border-transparent"
              }`}
            />
          ))}
        </div>
      </Card>

      <div>
        {s.labels.length === 0 && !s.dataBusy && (
          <p className="mt-12 text-center text-sm text-muted-foreground">
            No labels yet — create your first one above.
          </p>
        )}
        {s.dataBusy && (
          <p className="py-5 text-sm text-muted-foreground">Loading…</p>
        )}
        <ul className="m-0 list-none rounded-xl border bg-card p-0">
          {s.labels.map((l) => (
            <li
              key={l.id}
              className="flex items-center gap-2 border-b px-3 py-3 last:border-b-0"
            >
              <span
                className={`h-3.5 w-3.5 shrink-0 rounded-full ${COLOR_CLASSES[l.color ?? ""] ?? "bg-slate-300"}`}
              />
              {s.editingLabelId === l.id ? (
                <div className="flex flex-1 flex-col gap-2">
                  <Input
                    value={s.editLabelName}
                    onChange={(e) => s.setEditLabelName(e.target.value)}
                    disabled={s.labelBusy}
                    aria-label={`Edit name for ${l.name}`}
                  />
                  <div className="flex flex-wrap gap-1.5">
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={`${l.id}-${color}`}
                        type="button"
                        onClick={() => s.setEditLabelColor(color)}
                        disabled={s.labelBusy}
                        title={color}
                        aria-label={`Set ${l.name} colour to ${color}`}
                        className={`h-5 w-5 cursor-pointer rounded-full p-0 ${COLOR_CLASSES[color]} ${
                          s.editLabelColor === color ? "ring-2 ring-foreground ring-offset-2 ring-offset-background" : "border-2 border-transparent"
                        }`}
                      />
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={s.saveLabelEdit}
                      disabled={s.labelBusy || !s.editLabelName.trim()}
                      variant="secondary"
                      size="sm"
                    >
                      Save
                    </Button>
                    <Button
                      type="button"
                      onClick={s.cancelEditLabel}
                      disabled={s.labelBusy}
                      variant="secondary"
                      size="sm"
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              ) : (
                <>
                  <span className="flex-1 text-sm text-foreground">{l.name}</span>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={() => s.beginEditLabel(l)}
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
                </>
              )}
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
