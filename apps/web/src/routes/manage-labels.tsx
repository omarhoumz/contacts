import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/manage-labels")({
  beforeLoad: () => {
    throw redirect({
      to: "/labels",
      replace: true,
    });
  },
});
