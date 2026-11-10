export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18"
  }
  public: {
    Tables: {
      badges: {
        Row: {
          active: boolean
          code: string
          created_at: string
          criteria: string
          description: string
          icon: string
          id: string
          name: string
          threshold: number
        }
        Insert: {
          active?: boolean
          code: string
          created_at?: string
          criteria: string
          description?: string
          icon?: string
          id?: string
          name: string
          threshold?: number
        }
        Update: {
          active?: boolean
          code?: string
          created_at?: string
          criteria?: string
          description?: string
          icon?: string
          id?: string
          name?: string
          threshold?: number
        }
        Relationships: []
      }
      contest_answers: {
        Row: {
          answer: string | null
          contest_id: string
          created_at: string
          is_correct: boolean
          points: number
          question_id: string | null
          question_index: number
          user_id: string
        }
        Insert: {
          answer?: string | null
          contest_id: string
          created_at?: string
          is_correct: boolean
          points?: number
          question_id?: string | null
          question_index: number
          user_id: string
        }
        Update: {
          answer?: string | null
          contest_id?: string
          created_at?: string
          is_correct?: boolean
          points?: number
          question_id?: string | null
          question_index?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contest_answers_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
        ]
      }
      contest_players: {
        Row: {
          avatar: Json
          contest_id: string
          correct: number
          display_name: string
          goals: number
          joined_at: string
          score: number
          user_id: string
        }
        Insert: {
          avatar?: Json
          contest_id: string
          correct?: number
          display_name: string
          goals?: number
          joined_at?: string
          score?: number
          user_id: string
        }
        Update: {
          avatar?: Json
          contest_id?: string
          correct?: number
          display_name?: string
          goals?: number
          joined_at?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contest_players_contest_id_fkey"
            columns: ["contest_id"]
            isOneToOne: false
            referencedRelation: "contests"
            referencedColumns: ["id"]
          },
        ]
      }
      contests: {
        Row: {
          created_at: string
          current_index: number
          difficulty: string | null
          finished_at: string | null
          grade: number
          host_id: string
          id: string
          kind: string
          question_ids: string[]
          question_started_at: string | null
          seconds_per_question: number
          status: string
          subject: string
          title: string
          total_questions: number
        }
        Insert: {
          created_at?: string
          current_index?: number
          difficulty?: string | null
          finished_at?: string | null
          grade: number
          host_id: string
          id?: string
          kind?: string
          question_ids?: string[]
          question_started_at?: string | null
          seconds_per_question?: number
          status?: string
          subject: string
          title: string
          total_questions?: number
        }
        Update: {
          created_at?: string
          current_index?: number
          difficulty?: string | null
          finished_at?: string | null
          grade?: number
          host_id?: string
          id?: string
          kind?: string
          question_ids?: string[]
          question_started_at?: string | null
          seconds_per_question?: number
          status?: string
          subject?: string
          title?: string
          total_questions?: number
        }
        Relationships: []
      }
      hall_of_fame: {
        Row: {
          avatar: Json
          correct: number
          created_at: string
          display_name: string
          goals: number
          grade: number
          id: string
          period_start: string
          period_type: string
          points: number
          rank: number
          user_id: string
        }
        Insert: {
          avatar?: Json
          correct?: number
          created_at?: string
          display_name: string
          goals?: number
          grade?: number
          id?: string
          period_start: string
          period_type: string
          points: number
          rank: number
          user_id: string
        }
        Update: {
          avatar?: Json
          correct?: number
          created_at?: string
          display_name?: string
          goals?: number
          grade?: number
          id?: string
          period_start?: string
          period_type?: string
          points?: number
          rank?: number
          user_id?: string
        }
        Relationships: []
      }
      play_sessions: {
        Row: {
          answered: number
          best_streak: number
          correct: number
          difficulty: string | null
          finished_at: string | null
          goals: number
          grade: number
          id: string
          mode: string
          points: number
          started_at: string
          streak: number
          subject: string
          user_id: string
        }
        Insert: {
          answered?: number
          best_streak?: number
          correct?: number
          difficulty?: string | null
          finished_at?: string | null
          goals?: number
          grade: number
          id?: string
          mode: string
          points?: number
          started_at?: string
          streak?: number
          subject: string
          user_id: string
        }
        Update: {
          answered?: number
          best_streak?: number
          correct?: number
          difficulty?: string | null
          finished_at?: string | null
          goals?: number
          grade?: number
          id?: string
          mode?: string
          points?: number
          started_at?: string
          streak?: number
          subject?: string
          user_id?: string
        }
        Relationships: []
      }
      player_status: {
        Row: {
          last_seen: string
          room: string
          user_id: string
        }
        Insert: {
          last_seen?: string
          room?: string
          user_id: string
        }
        Update: {
          last_seen?: string
          room?: string
          user_id?: string
        }
        Relationships: []
      }
      point_events: {
        Row: {
          contest_id: string | null
          correct: number
          created_at: string
          goals: number
          grade: number
          id: string
          note: string | null
          points: number
          reason: string
          session_id: string | null
          user_id: string
        }
        Insert: {
          contest_id?: string | null
          correct?: number
          created_at?: string
          goals?: number
          grade: number
          id?: string
          note?: string | null
          points: number
          reason: string
          session_id?: string | null
          user_id: string
        }
        Update: {
          contest_id?: string | null
          correct?: number
          created_at?: string
          goals?: number
          grade?: number
          id?: string
          note?: string | null
          points?: number
          reason?: string
          session_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar: Json
          created_at: string
          display_name: string
          gender: string
          grade: number
          id: string
          updated_at: string
        }
        Insert: {
          avatar?: Json
          created_at?: string
          display_name: string
          gender: string
          grade: number
          id: string
          updated_at?: string
        }
        Update: {
          avatar?: Json
          created_at?: string
          display_name?: string
          gender?: string
          grade?: number
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      questions: {
        Row: {
          active: boolean
          correct_answer: string
          created_at: string
          created_by: string | null
          difficulty: string
          explanation: string | null
          grade: number
          id: string
          media: string | null
          options: Json
          prompt: string
          qtype: string
          speak_text: string | null
          subject: string
          topic: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          correct_answer: string
          created_at?: string
          created_by?: string | null
          difficulty?: string
          explanation?: string | null
          grade: number
          id?: string
          media?: string | null
          options?: Json
          prompt: string
          qtype?: string
          speak_text?: string | null
          subject: string
          topic?: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          correct_answer?: string
          created_at?: string
          created_by?: string | null
          difficulty?: string
          explanation?: string | null
          grade?: number
          id?: string
          media?: string | null
          options?: Json
          prompt?: string
          qtype?: string
          speak_text?: string | null
          subject?: string
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      salon_looks: {
        Row: {
          created_at: string
          id: string
          look: Json
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          look: Json
          title?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          look?: Json
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      session_answers: {
        Row: {
          answer: string | null
          created_at: string
          id: string
          is_correct: boolean
          points: number
          question_id: string | null
          session_id: string
          user_id: string
        }
        Insert: {
          answer?: string | null
          created_at?: string
          id?: string
          is_correct: boolean
          points?: number
          question_id?: string | null
          session_id: string
          user_id: string
        }
        Update: {
          answer?: string | null
          created_at?: string
          id?: string
          is_correct?: boolean
          points?: number
          question_id?: string | null
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "session_answers_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "session_answers_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "play_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badges"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      admin_adjust_points: {
        Args: { p_note: string; p_points: number; p_user: string }
        Returns: undefined
      }
      admin_exists: { Args: never; Returns: boolean }
      admin_players: {
        Args: never
        Returns: {
          avatar: Json
          correct: number
          created_at: string
          display_name: string
          gender: string
          goals: number
          grade: number
          id: string
          is_admin: boolean
          last_seen: string
          points: number
          room: string
        }[]
      }
      admin_set_admin: {
        Args: { p_admin: boolean; p_user: string }
        Returns: undefined
      }
      award_badges: { Args: { p_user: string }; Returns: Json }
      award_lesson_points: { Args: { p_note?: string }; Returns: Json }
      check_my_badges: { Args: never; Returns: Json }
      claim_first_admin: { Args: never; Returns: boolean }
      close_periods: { Args: never; Returns: number }
      create_contest: {
        Args: {
          p_difficulty: string
          p_grade: number
          p_kind: string
          p_seconds: number
          p_subject: string
          p_title: string
          p_total: number
        }
        Returns: string
      }
      finish_session: { Args: { p_session: string }; Returns: Json }
      get_contest_question: { Args: { p_contest: string }; Returns: Json }
      get_leaderboard: {
        Args: { p_grade?: number; p_limit?: number; p_period: string }
        Returns: {
          avatar: Json
          correct: number
          display_name: string
          goals: number
          grade: number
          points: number
          rank: number
          user_id: string
        }[]
      }
      get_quiz_questions: {
        Args: {
          p_count?: number
          p_difficulty?: string
          p_grade: number
          p_subject: string
        }
        Returns: {
          difficulty: string
          grade: number
          id: string
          media: string
          options: Json
          prompt: string
          qtype: string
          speak_text: string
          subject: string
          topic: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      heartbeat: { Args: { p_room: string }; Returns: undefined }
      join_contest: { Args: { p_contest: string }; Returns: undefined }
      my_stats: { Args: never; Returns: Json }
      next_contest_question: {
        Args: { p_contest: string; p_index: number }
        Returns: undefined
      }
      norm_answer: { Args: { t: string }; Returns: string }
      period_start: {
        Args: { p_period: string; p_ts: string }
        Returns: string
      }
      start_contest: { Args: { p_contest: string }; Returns: undefined }
      start_session: {
        Args: {
          p_difficulty?: string
          p_grade: number
          p_mode: string
          p_subject: string
        }
        Returns: string
      }
      submit_answer: {
        Args: { p_answer: string; p_question: string; p_session: string }
        Returns: Json
      }
      submit_contest_answer: {
        Args: { p_answer: string; p_contest: string; p_index: number }
        Returns: Json
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
