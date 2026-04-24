import { useWebApp } from "./web-app-context";
import { ui } from "./ui-styles";

const PRESET_COLORS = [
  "#2563eb", "#7c3aed", "#db2777", "#dc2626",
  "#ea580c", "#ca8a04", "#16a34a", "#0891b2",
  "#64748b", "#0f172a",
];

export function ManageLabelsRoute() {
  const s = useWebApp();
  const confirmDeleteLabel = (name: string) => {
    return window.confirm(
      `Delete "${name}"? This also removes it from any contacts that currently use it.`,
    );
  };

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div style={ui.topBar}>
        <h2 style={ui.topBarTitle}>Manage Labels</h2>
      </div>

      {/* ── Create label form ────────────────────────────────────────── */}
      <div style={ui.composeSection}>
        <p style={ui.composeSectionTitle}>New label</p>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            placeholder="Label name"
            value={s.newLabelName}
            onChange={(e) => s.setNewLabelName(e.target.value)}
            disabled={s.labelBusy}
            style={{ ...ui.compactInput, flex: 1 }}
          />
          <button
            onClick={s.createLabel}
            disabled={s.labelBusy || s.dataBusy || !s.newLabelName.trim()}
            style={ui.primaryButton}
          >
            {s.labelBusy ? "Saving…" : "Add label"}
          </button>
        </div>

        {/* Colour swatches */}
        <div style={{ display: "flex", gap: 6, marginBlockStart: 10, flexWrap: "wrap" as const }}>
          {PRESET_COLORS.map((color) => (
            <button
              key={color}
              type="button"
              onClick={() => s.setNewLabelColor(color)}
              disabled={s.labelBusy}
              title={color}
              aria-label={`Pick colour ${color}`}
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: color,
                border: s.newLabelColor === color ? "2px solid var(--text-primary)" : "2px solid transparent",
                cursor: "pointer",
                padding: 0,
                outline: s.newLabelColor === color ? "2px solid var(--bg-surface)" : "none",
                outlineOffset: -3,
              }}
            />
          ))}
        </div>
        <div style={{ display: "none" }}>
        </div>
      </div>

      {/* ── Labels list ──────────────────────────────────────────────── */}
      <div style={ui.mainBody}>
        {s.labels.length === 0 && !s.dataBusy && (
          <p style={{ color: "var(--text-subtle)", fontSize: 14, textAlign: "center", marginTop: 48 }}>
            No labels yet — create your first one above.
          </p>
        )}
        {s.dataBusy && (
          <p style={{ color: "var(--text-subtle)", fontSize: 14, padding: "20px 0" }}>Loading…</p>
        )}
        <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
          {s.labels.map((l) => (
            <li
              key={l.id}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 0",
                borderBottom: "1px solid var(--border-soft)",
              }}
            >
              <span
                style={{
                  width: 14,
                  height: 14,
                  borderRadius: "50%",
                  background: l.color ?? "#cbd5e1",
                  flexShrink: 0,
                }}
              />
              {s.editingLabelId === l.id ? (
                <div style={{ display: "flex", flexDirection: "column", gap: 8, flex: 1 }}>
                  <input
                    value={s.editLabelName}
                    onChange={(e) => s.setEditLabelName(e.target.value)}
                    disabled={s.labelBusy}
                    style={ui.compactInput}
                    aria-label={`Edit name for ${l.name}`}
                  />
                  <div style={{ display: "flex", gap: 6, flexWrap: "wrap" as const }}>
                    {PRESET_COLORS.map((color) => (
                      <button
                        key={`${l.id}-${color}`}
                        type="button"
                        onClick={() => s.setEditLabelColor(color)}
                        disabled={s.labelBusy}
                        title={color}
                        aria-label={`Set ${l.name} colour to ${color}`}
                        style={{
                          width: 20,
                          height: 20,
                          borderRadius: "50%",
                          background: color,
                          border: s.editLabelColor === color ? "2px solid var(--text-primary)" : "2px solid transparent",
                          cursor: "pointer",
                          padding: 0,
                          outline: s.editLabelColor === color ? "2px solid var(--bg-surface)" : "none",
                          outlineOffset: -3,
                        }}
                      />
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      onClick={s.saveLabelEdit}
                      disabled={s.labelBusy || !s.editLabelName.trim()}
                      style={ui.smallButton}
                    >
                      Save
                    </button>
                    <button
                      type="button"
                      onClick={s.cancelEditLabel}
                      disabled={s.labelBusy}
                      style={ui.smallButton}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <span style={{ fontSize: 14, color: "var(--text-primary)", flex: 1 }}>{l.name}</span>
                  <div style={{ display: "flex", gap: 8 }}>
                    <button
                      type="button"
                      onClick={() => s.beginEditLabel(l)}
                      disabled={s.labelBusy}
                      style={ui.smallButton}
                      aria-label={`Edit label ${l.name}`}
                    >
                      Edit
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!confirmDeleteLabel(l.name)) return;
                        void s.deleteLabel(l);
                      }}
                      disabled={s.labelBusy}
                      style={{
                        ...ui.smallButton,
                        borderColor: "var(--danger-border)",
                        color: "var(--danger)",
                        background: "var(--danger-bg)",
                      }}
                      aria-label={`Delete label ${l.name}`}
                    >
                      Delete
                    </button>
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
