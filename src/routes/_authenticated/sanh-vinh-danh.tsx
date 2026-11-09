import { createFileRoute } from "@tanstack/react-router";
import { SchoolRankings } from "@/components/SchoolRankings";

export const Route = createFileRoute("/_authenticated/sanh-vinh-danh")({
  component: () => <SchoolRankings mode="honor" />,
});
