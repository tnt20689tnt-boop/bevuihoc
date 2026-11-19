import { createFileRoute } from "@tanstack/react-router";
import { generateSpeech } from "@lovable.dev/ai-gateway";
import { inspectAudioFormat } from "@/lib/audio-format";

export const Route = createFileRoute("/api/public/speech")({
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
          const bytes = await blob.arrayBuffer();
          const format = inspectAudioFormat(new Uint8Array(bytes), blob.type);
          if (!format.mimeType) throw new Error(format.error || "The speech service returned an unsupported audio format.");

          return new Response(bytes, {
            headers: {
              "Content-Type": format.mimeType,
              "Cache-Control": "private, max-age=86400",
              "X-Content-Type-Options": "nosniff",
            },
          });
        } catch (error) {
          const requestId = crypto.randomUUID();
          console.error("AI speech generation failed:", { requestId, error });
          return Response.json({ error: "Speech generation failed", requestId }, { status: 502 });
        }
      },
    },
  },
});
