import { createFileRoute } from "@tanstack/react-router";
import { TrashRoute } from "../trash-route";

export const Route = createFileRoute("/trash")({
  component: TrashRoute,
});
