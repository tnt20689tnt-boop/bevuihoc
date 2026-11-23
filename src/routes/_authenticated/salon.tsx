import { createFileRoute, redirect } from "@tanstack/react-router";

/** Legacy URL: Salon was removed while its broken implementation is rebuilt. */
export const Route = createFileRoute("/_authenticated/salon")({
  beforeLoad: () => { throw redirect({ to: "/the-gioi" }); },
});
