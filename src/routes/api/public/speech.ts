import { createFileRoute } from "@tanstack/react-router";
import { generateSpeech } from "@lovable.dev/ai-gateway";

export const Route = createFileRoute("/api/public/speech" as never)({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const origin = request.headers.get("origin");
        const requestUrl = new URL(request.url);
        if (origin && new URL(origin).origin !== requestUrl.origin) {
          return new Response("Forbidden", { status: 403 });
        }

        let body: { text?: unknown };
        try {
          body = await request.json() as { text?: unknown };
        } catch {
          return new Response("Invalid JSON body", { status: 400 });
        }

        const text = typeof body.text === "string" ? body.text.trim().slice(0, 300) : "";
        if (!text) return new Response("Text required", { status: 400 });

        try {
          const audio = await generateSpeech({
            model: "google/gemini-3.1-flash-tts-preview",
            contents: [{ role: "user", parts: [{ text }] }],
            generationConfig: {
              speechConfig: {
                voiceConfig: {
                  prebuiltVoiceConfig: { voiceName: "Leda" },
                },
              },
            },
          });
          const blob = await audio.blob();
          if (!blob.size) throw new Error("The speech service returned an empty audio file.");

          return new Response(blob, {
            headers: {
              "Content-Type": blob.type || "audio/wav",
              "Cache-Control": "private, max-age=86400",
              "X-Content-Type-Options": "nosniff",
            },
          });
        } catch (error) {
          console.error("AI speech generation failed:", error);
          return new Response("Speech generation failed", { status: 502 });
        }
      },
    },
  },
});
