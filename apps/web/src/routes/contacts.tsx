import { createFileRoute } from "@tanstack/react-router";
import { ContactsRoute } from "../contacts-route";

export const Route = createFileRoute("/contacts")({
  component: ContactsRoute,
});
