import { Card } from "@widados/ui-lib";
import type { LabelRow } from "./contact-search";
import { Input } from "./components/ui/input";
import { Button } from "./components/ui/button";

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
      <p className="text-sm text-muted-foreground">
        Create labels, then assign them to contacts from the list below.
      </p>
      <div className="mb-2 flex items-center gap-2">
        <Input
          placeholder="New label name"
          value={props.newLabelName}
          onChange={(e) => props.setNewLabelName(e.target.value)}
          disabled={props.labelBusy}
          className="min-w-[120px] flex-1"
        />
        <input
          type="color"
          value={props.newLabelColor}
          onChange={(e) => props.setNewLabelColor(e.target.value)}
          disabled={props.labelBusy}
          className="h-9 w-[42px] rounded-md border border-input bg-background p-1"
        />
        <Button onClick={props.createLabel} disabled={props.labelBusy || props.dataBusy}>
          {props.labelBusy ? "Saving..." : "Add label"}
        </Button>
      </div>
      <ul className="m-0 list-disc pl-5">
        {props.labels.map((l) => (
          <li key={l.id} className="mb-1">
            {l.name}
          </li>
        ))}
      </ul>
    </Card>
  );
}
