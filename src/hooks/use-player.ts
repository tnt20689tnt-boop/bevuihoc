import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import type { Session } from "@supabase/supabase-js";
import { supabase } from "@/integrations/supabase/client";
import { toAvatar, type Avatar, type Gender } from "@/lib/avatar";

export type Profile = {
  id: string;
  display_name: string;
  gender: Gender;
  grade: number;
  last_grade_promotion: string;
  avatar: Avatar;
};

/** Current auth session (client only). `undefined` while loading. */
export function useSession() {
  const [session, setSession] = useState<Session | null | undefined>(undefined);
  useEffect(() => {
    let alive = true;
    supabase.auth.getSession().then(({ data }) => alive && setSession(data.session));
    const { data } = supabase.auth.onAuthStateChange((_e, s) => setSession(s));
    return () => {
      alive = false;
      data.subscription.unsubscribe();
    };
  }, []);
  return session;
}

export const profileQueryKey = ["profile", "me"] as const;

export function useMyProfile() {
  return useQuery({
    queryKey: profileQueryKey,
    queryFn: async (): Promise<Profile | null> => {
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) return null;

      // Load the saved student profile first. A missing or temporarily failing
      // grade-promotion RPC must never keep a signed-in child out of the world.
      const loadProfile = async () => {
        const { data, error } = await supabase
          .from("profiles")
          .select("id, display_name, gender, grade, last_grade_promotion, avatar")
          .eq("id", authData.user.id)
          .maybeSingle();
        if (error) throw error;
        return data;
      };

      let data = await loadProfile();
      if (!data) return null;

      // Promotion is best-effort: keep the existing profile usable even when
      // the SQL migration/RPC has not reached the database yet.
      const { error: promotionError } = await supabase.rpc("promote_my_grade_if_due");
      if (!promotionError) {
        try {
          data = await loadProfile();
        } catch {
          // Preserve the already-loaded profile if the refresh fails.
        }
      } else {
        console.warn("Grade promotion check skipped; profile remains available.", promotionError);
      }

      const gender = data.gender as Gender;
      return { ...data, gender, avatar: toAvatar(data.avatar, gender) };
    },
    staleTime: 60_000,
  });
}

export function useIsAdmin() {
  return useQuery({
    queryKey: ["is-admin"],
    queryFn: async () => {
      const { data: u } = await supabase.auth.getUser();
      if (!u.user) return false;
      const { data } = await supabase.rpc("has_role", { _user_id: u.user.id, _role: "admin" });
      return !!data;
    },
    staleTime: 60_000,
  });
}

export function useMyStats() {
  return useQuery({
    queryKey: ["my-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("my_stats");
      if (error) throw error;
      return data as {
        points: number;
        correct: number;
        goals: number;
        today: number;
        sessions: number;
        best_streak: number;
        badges: number;
      };
    },
  });
}

export function errorText(e: unknown): string {
  if (e && typeof e === "object" && "message" in e) return String((e as { message: string }).message);
  return "Có lỗi xảy ra, bé thử lại nhé";
}
