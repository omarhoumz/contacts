import { Card } from "@widados/ui-lib";
import type { LabelRow } from "./contact-search";
import { ui } from "./ui-styles";

type LabelsSectionProps = {
  labels: LabelRow[];
  newLabelName: string;
  setNewLabelName: (value: string) => void;
  newLabelColor: string;
  setNewLabelColor: (value: string) => void;
  createLabel: () => void;
  labelBusy: boolean;
  dataBusy: boolean;
};

export function LabelsSection(props: LabelsSectionProps) {
  return (
    <Card>
      <h3>Labels</h3>
      <p style={ui.sectionHint}>
        Create labels, then assign them to contacts from the list below.
      </p>
      <div style={{ ...ui.row, marginBottom: 8 }}>
        <input
          placeholder="New label name"
          value={props.newLabelName}
          onChange={(e) => props.setNewLabelName(e.target.value)}
          disabled={props.labelBusy}
          style={{ ...ui.compactInput, flex: 1, minWidth: 120 }}
        />
        <input
          type="color"
          value={props.newLabelColor}
          onChange={(e) => props.setNewLabelColor(e.target.value)}
          disabled={props.labelBusy}
          style={{ ...ui.compactInput, width: 42, padding: 4 }}
        />
        <button onClick={props.createLabel} disabled={props.labelBusy || props.dataBusy} style={ui.primaryButton}>
          {props.labelBusy ? "Saving..." : "Add label"}
        </button>
      </div>
      <ul style={{ paddingLeft: 18, margin: 0 }}>
        {props.labels.map((l) => (
          <li key={l.id} style={{ marginBottom: 4 }}>
            {l.name}
          </li>
        ))}
      </ul>
    </Card>
  );
}
