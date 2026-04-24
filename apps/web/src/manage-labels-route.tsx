import { useWebApp } from "./web-app-context";
import { ui } from "./ui-styles";

export function ManageLabelsRoute() {
  const s = useWebApp();

  return (
    <>
      {/* ── Top bar ─────────────────────────────────────────────────── */}
      <div style={ui.topBar}>
        <h2 style={ui.topBarTitle}>Manage Labels</h2>
      </div>

      {/* ── Create label form ────────────────────────────────────────── */}
      <div style={ui.composeSection}>
        <p style={{ margin: "0 0 10px", fontSize: 13, fontWeight: 600, color: "#374151" }}>
          New label
        </p>
        <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
          <input
            placeholder="Label name"
            value={s.newLabelName}
            onChange={(e) => s.setNewLabelName(e.target.value)}
            disabled={s.labelBusy}
            style={{ ...ui.compactInput, flex: 1 }}
          />
          <input
            type="color"
            value={s.newLabelColor}
            onChange={(e) => s.setNewLabelColor(e.target.value)}
            disabled={s.labelBusy}
            style={{ ...ui.compactInput, width: 42, padding: 4 }}
            title="Label colour"
          />
          <button
            onClick={s.createLabel}
            disabled={s.labelBusy || s.dataBusy}
            style={ui.primaryButton}
          >
            {s.labelBusy ? "Saving…" : "Add label"}
          </button>
        </div>
      </div>

      {/* ── Labels list ──────────────────────────────────────────────── */}
      <div style={ui.mainBody}>
        {s.labels.length === 0 && !s.dataBusy && (
          <p style={{ color: "#94a3b8", fontSize: 14, textAlign: "center", marginTop: 48 }}>
            No labels yet — create your first one above.
          </p>
        )}
        {s.dataBusy && (
          <p style={{ color: "#94a3b8", fontSize: 14, padding: "20px 0" }}>Loading…</p>
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
                borderBottom: "1px solid #f1f5f9",
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
              <span style={{ fontSize: 14, color: "#0f172a" }}>{l.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </>
  );
}
