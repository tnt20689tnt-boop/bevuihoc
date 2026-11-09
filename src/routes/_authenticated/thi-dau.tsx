import { createFileRoute } from "@tanstack/react-router";
import { SchoolRankings } from "@/components/SchoolRankings";

export const Route = createFileRoute("/_authenticated/thi-dau")({
  component: () => <SchoolRankings mode="arena" />,
});
