import { describe, expect, it } from "vitest";
import { detectAudioMimeType, inspectAudioFormat } from "@/lib/audio-format";

function signature(prefix: string, suffix = ""): Uint8Array {
  const bytes = new Uint8Array(16);
  bytes.set(new TextEncoder().encode(prefix), 0);
  if (suffix) bytes.set(new TextEncoder().encode(suffix), 8);
  return bytes;
}

describe("audio format detection", () => {
  it("recognizes RIFF/WAVE audio and normalizes WAV MIME aliases", () => {
    const wav = signature("RIFF", "WAVE");
    expect(detectAudioMimeType(wav)).toBe("audio/wav");
    expect(inspectAudioFormat(wav, "audio/x-wav; rate=24000")).toEqual({
      mimeType: "audio/wav",
      detectedMimeType: "audio/wav",
      error: null,
    });
  });

  it("recognizes MP3 signatures without assuming an extension", () => {
    const mp3 = signature("ID3");
    expect(detectAudioMimeType(mp3)).toBe("audio/mpeg");
    expect(inspectAudioFormat(mp3, "audio/mpeg").mimeType).toBe("audio/mpeg");
  });

  it("rejects empty, unknown, or MIME-mismatched responses", () => {
    expect(inspectAudioFormat(new Uint8Array(), "audio/wav").error).toContain("rỗng");
    expect(inspectAudioFormat(new TextEncoder().encode("<html>"), "text/html").mimeType).toBeNull();
    const wav = signature("RIFF", "WAVE");
    expect(inspectAudioFormat(wav, "audio/mpeg").error).toContain("dữ liệu thực là audio/wav");
  });
});
