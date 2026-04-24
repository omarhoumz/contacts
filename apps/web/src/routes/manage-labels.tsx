import { createFileRoute } from "@tanstack/react-router";
import { ManageLabelsRoute } from "../manage-labels-route";

export const Route = createFileRoute("/manage-labels")({
  component: ManageLabelsRoute,
});
