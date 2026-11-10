import { createServerFn } from "@tanstack/react-start";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";
import type { Json } from "@/integrations/supabase/types";
import {
  FOOTBALL_DIRECTIONS,
  isFootballDirection,
  isFootballGoal,
  type FootballDirection,
} from "@/lib/football-scoring";

const MIN_SERVER_SHOT_INTERVAL_MS = 700;
const MIN_GOAL_INTERVAL_MS = 1_200;
const lastShotAtByUser = new Map<string, number>();
type FootballBadge = { name: string; icon: string; description: string };

function parseFootballBadges(value: Json): FootballBadge[] {
  if (!Array.isArray(value)) return [];
  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || Array.isArray(entry)) return [];
    const badge = entry as Record<string, unknown>;
    if (
      typeof badge["name"] !== "string" ||
      typeof badge["icon"] !== "string" ||
      typeof badge["description"] !== "string"
    ) {
      return [];
    }
    return [{ name: badge["name"], icon: badge["icon"], description: badge["description"] }];
  });
}

function chooseGoalkeeperDirection(): FootballDirection {
  const random = new Uint32Array(1);
  globalThis.crypto.getRandomValues(random);
  return FOOTBALL_DIRECTIONS[random[0]! % FOOTBALL_DIRECTIONS.length]!;
}

export const takeFootballShot = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .validator((input: { direction: unknown; power?: unknown }) => {
    if (!input || !isFootballDirection(input.direction)) {
      throw new Error("Hướng sút không hợp lệ.");
    }
    const power = input.power === undefined ? 100 : input.power;
    if (typeof power !== "number" || !Number.isFinite(power) || power < 20 || power > 100) {
      throw new Error("Lực sút không hợp lệ.");
    }
    return { direction: input.direction, power };
  })
  .handler(async ({ data, context }) => {
    const userId = context.userId;
    const now = Date.now();
    const lastShotAt = lastShotAtByUser.get(userId);
    if (lastShotAt !== undefined && now - lastShotAt < MIN_SERVER_SHOT_INTERVAL_MS) {
      throw new Error("Bé sút chậm lại một chút nhé.");
    }
    lastShotAtByUser.set(userId, now);

    // The client supplies only a direction. The server picks the keeper and decides
    // whether the shot scores, so a client cannot claim a goal or choose its outcome.
    const goalkeeperDirection = chooseGoalkeeperDirection();
    const accuracyRoll = new Uint32Array(1);
    globalThis.crypto.getRandomValues(accuracyRoll);
    const accuracy = accuracyRoll[0]! / 0x1_0000_0000;
    const scored = isFootballGoal(data.direction, goalkeeperDirection) && accuracy <= data.power / 100;
    if (!scored) {
      return { goalkeeperDirection, scored: false, points: 0, newBadges: [] as FootballBadge[] };
    }

    const { data: profile, error: profileError } = await context.supabase
      .from("profiles")
      .select("grade")
      .eq("id", userId)
      .maybeSingle();
    if (profileError) throw new Error("Chưa đọc được hồ sơ để lưu điểm.");
    if (!profile) throw new Error("Không tìm thấy hồ sơ học sinh.");

    // Existing event rows provide a small persistent cooldown without changing the
    // managed database schema. The in-memory guard above also throttles misses.
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const cutoff = new Date(Date.now() - MIN_GOAL_INTERVAL_MS).toISOString();
    const { data: recentGoals, error: recentGoalsError } = await supabaseAdmin
      .from("point_events")
      .select("id")
      .eq("user_id", userId)
      .eq("reason", "football_goal")
      .gte("created_at", cutoff)
      .limit(1);
    if (recentGoalsError) throw new Error("Chưa kiểm tra được lượt sút gần nhất.");
    if (recentGoals?.length) throw new Error("Bé chờ một chút rồi hãy sút tiếp nhé.");

    const { error: insertError } = await supabaseAdmin.from("point_events").insert({
      user_id: userId,
      grade: profile.grade,
      points: 10,
      correct: 1,
      goals: 1,
      reason: "football_goal",
      note: "Ghi bàn trong trò chơi Sút bóng",
    });
    if (insertError) throw new Error("Chưa lưu được điểm ghi bàn.");

    // This SECURITY DEFINER RPC awards any newly earned badges for the authenticated user.
    const { data: badgeData, error: badgeError } = await context.supabase.rpc("check_my_badges");
    if (badgeError) {
      console.error("Could not update football badges:", badgeError.message);
    }

    return {
      goalkeeperDirection,
      scored: true,
      points: 10,
      newBadges: badgeData ? parseFootballBadges(badgeData) : [],
    };
  });
