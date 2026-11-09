import { createFileRoute } from "@tanstack/react-router";
import { SchoolRankings } from "@/components/SchoolRankings";

export const Route = createFileRoute("/_authenticated/bang-xep-hang")({
  component: () => <SchoolRankings mode="leaderboard" />,
});
