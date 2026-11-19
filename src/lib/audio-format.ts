export type AudioFormatResult = {
  mimeType: string | null;
  detectedMimeType: string | null;
  error: string | null;
};

function ascii(bytes: Uint8Array, start: number, length: number): string {
  return String.fromCharCode(...bytes.subarray(start, start + length));
}

export function detectAudioMimeType(bytes: Uint8Array): string | null {
  if (bytes.length >= 12 && (ascii(bytes, 0, 4) === "RIFF" || ascii(bytes, 0, 4) === "RF64") && ascii(bytes, 8, 4) === "WAVE") {
    return "audio/wav";
  }
  if (bytes.length >= 4 && ascii(bytes, 0, 4) === "fLaC") return "audio/flac";
  if (bytes.length >= 4 && ascii(bytes, 0, 4) === "OggS") return "audio/ogg";
  if (bytes.length >= 4 && bytes[0] === 0x1a && bytes[1] === 0x45 && bytes[2] === 0xdf && bytes[3] === 0xa3) {
    return "audio/webm";
  }
  if (bytes.length >= 8 && ascii(bytes, 4, 4) === "ftyp") return "audio/mp4";
  if (bytes.length >= 3 && ascii(bytes, 0, 3) === "ID3") return "audio/mpeg";
  const scanEnd = Math.min(bytes.length - 1, 4);
  for (let i = 0; i < scanEnd; i += 1) {
    if (bytes[i] === 0xff && (bytes[i + 1]! & 0xe0) === 0xe0) return "audio/mpeg";
  }
  return null;
}

function normalizeMimeType(value: string): string {
  const mime = value.split(";", 1)[0]?.trim().toLowerCase() ?? "";
  if (mime === "audio/x-wav" || mime === "audio/wave") return "audio/wav";
  if (mime === "audio/mp3") return "audio/mpeg";
  if (mime === "audio/x-m4a") return "audio/mp4";
  return mime;
}

export function inspectAudioFormat(bytes: Uint8Array, declaredMimeType = ""): AudioFormatResult {
  const detectedMimeType = detectAudioMimeType(bytes);
  const declared = normalizeMimeType(declaredMimeType);
  const relevantDeclaration = declared.startsWith("audio/") ? declared : "";

  if (!bytes.length) {
    return { mimeType: null, detectedMimeType, error: "Máy chủ trả về tệp âm thanh rỗng." };
  }
  if (!detectedMimeType) {
    return { mimeType: null, detectedMimeType, error: `Không nhận diện được định dạng âm thanh${relevantDeclaration ? ` (${relevantDeclaration})` : ""}.` };
  }
  if (relevantDeclaration && relevantDeclaration !== detectedMimeType) {
    return {
      mimeType: null,
      detectedMimeType,
      error: `MIME máy chủ khai báo ${relevantDeclaration} nhưng dữ liệu thực là ${detectedMimeType}.`,
    };
  }
  return { mimeType: detectedMimeType, detectedMimeType, error: null };
}
