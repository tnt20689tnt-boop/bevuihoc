import { useCallback, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type ExamSubject = "math" | "viet" | "english";
export type ExamTerm = "mid1" | "final1" | "mid2" | "final2";

export type GeneratedQuestion = {
  id: string;
  order_index: number;
  question_text: string;
  question_type: "multiple_choice" | "short_answer";
  options: { key: string; text: string }[] | null;
  points: number;
};

export type GeneratedExamQuestions = {
  questions: GeneratedQuestion[];
  duration: number;
};

export type GeneratedExamResult = {
  score: number;
  total_points: number;
  percentage: number;
};

/**
 * Creates and loads a randomized exam.
 * Correct answers are deliberately never returned to the browser.
 * Grading is performed by submit_generated_exam() in Postgres.
 */
export function useGeneratedExam() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createExam = useCallback(
    async (
      subject: ExamSubject,
      grade: number,
      term: ExamTerm,
      count = 10,
      duration = 30,
    ): Promise<string | null> => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: rpcError } = await (supabase as any).rpc("generate_exam", {
          p_subject: subject,
          p_grade: grade,
          p_term: term,
          p_count: count,
          p_duration: duration,
        });
        if (rpcError) throw rpcError;
        if (typeof data !== "string") throw new Error("Máy chủ chưa trả về mã đề thi");
        return data;
      } catch (cause) {
        setError(cause instanceof Error ? cause.message : "Không sinh được đề");
        return null;
      } finally {
        setLoading(false);
      }
    },
    [],
  );

  const loadQuestions = useCallback(async (examId: string): Promise<GeneratedExamQuestions> => {
    const { data, error: rpcError } = await (supabase as any).rpc("get_generated_exam_questions", {
      p_exam_id: examId,
    });
    if (rpcError) throw rpcError;
    const questions = (data ?? []) as GeneratedQuestion[];
    const { data: exam, error: examError } = await (supabase as any)
      .from("generated_exams")
      .select("duration_minutes")
      .eq("id", examId)
      .single();
    if (examError) throw examError;
    return { questions, duration: Number(exam?.duration_minutes ?? 30) };
  }, []);

  const startAttempt = useCallback(async (examId: string): Promise<string> => {
    const { data, error: rpcError } = await (supabase as any).rpc("start_generated_exam_attempt", {
      p_exam_id: examId,
    });
    if (rpcError) throw rpcError;
    if (typeof data !== "string") throw new Error("Không tạo được lượt thi");
    return data;
  }, []);

  const submitExam = useCallback(async (
    examId: string,
    answers: Record<string, string>,
  ): Promise<GeneratedExamResult> => {
    const { data, error: rpcError } = await (supabase as any).rpc("submit_generated_exam", {
      p_exam_id: examId,
      p_answers: answers,
    });
    if (rpcError) throw rpcError;
    const result = Array.isArray(data) ? data[0] : data;
    if (!result) throw new Error("Chưa nhận được kết quả chấm thi");
    return {
      score: Number(result.score ?? 0),
      total_points: Number(result.total_points ?? 0),
      percentage: Number(result.percentage ?? 0),
    };
  }, []);

  return { createExam, loadQuestions, startAttempt, submitExam, loading, error };
}
