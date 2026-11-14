let activeUtterance: SpeechSynthesisUtterance | null = null;
let runToken = 0;
const getSpeech = () => typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null;

export function stopSpeech() {
  runToken += 1;
  const synth = getSpeech();
  if (synth) synth.cancel();
  activeUtterance = null;
}

export function primeSpeech(locale = "vi-VN") {
  const synth = getSpeech();
  if (!synth) return;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(locale.startsWith("en") ? "Let's begin!" : "Bắt đầu học nhé!");
  utterance.lang = locale;
  utterance.rate = 0.9;
  const voices = synth.getVoices();
  const voice = voices.find(v => v.lang.toLowerCase() === locale.toLowerCase())
    ?? voices.find(v => v.lang.toLowerCase().startsWith(locale.slice(0, 2).toLowerCase()));
  if (voice) utterance.voice = voice;
  activeUtterance = utterance;
  utterance.onend = () => { if (activeUtterance === utterance) activeUtterance = null; };
  utterance.onerror = () => { if (activeUtterance === utterance) activeUtterance = null; };
  synth.speak(utterance);
  synth.resume();
}

function speakOne(text: string, locale: string, token: number): Promise<void> {
  const synth = getSpeech();
  if (!synth || token !== runToken || !text.trim()) return Promise.resolve();
  return new Promise(resolve => {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = locale;
    utterance.rate = 0.9;
    utterance.pitch = 1;
    const voices = synth.getVoices();
    const voice = voices.find(v => v.lang.toLowerCase() === locale.toLowerCase())
      ?? voices.find(v => v.lang.toLowerCase().startsWith(locale.slice(0, 2).toLowerCase()));
    if (voice) utterance.voice = voice;
    activeUtterance = utterance;
    utterance.onend = () => { if (activeUtterance === utterance) activeUtterance = null; resolve(); };
    utterance.onerror = () => { if (activeUtterance === utterance) activeUtterance = null; resolve(); };
    synth.speak(utterance);
  });
}

export function naturalizeMath(text: string): string {
  return text
    .replace(/(\d+)\s*\+\s*(\d+)/g, "$1 cộng $2")
    .replace(/(\d+)\s*[-−]\s*(\d+)/g, "$1 trừ $2")
    .replace(/(\d+)\s*[×x]\s*(\d+)/gi, "$1 nhân $2")
    .replace(/(\d+)\s*[÷/]\s*(\d+)/g, "$1 chia $2")
    .replace(/=\s*\?/g, " bằng mấy?")
    .replace(/=/g, " bằng ");
}

export async function speakQuiz(question: string, options: string[], locale = "vi-VN", math = false) {
  stopSpeech();
  const token = runToken;
  const spokenQuestion = math && locale.startsWith("vi") ? naturalizeMath(question) : question;
  await speakOne((locale.startsWith("en") ? "Question. " : "Câu hỏi. ") + spokenQuestion, locale, token);
  for (let i = 0; i < options.length; i++) {
    if (token !== runToken) return;
    const option = options[i].replace(/^([A-D])\.\s*/, "");
    await speakOne(`${locale.startsWith("en") ? "Option" : "Đáp án"} ${["A", "B", "C", "D"][i] ?? i + 1}. ${math && locale.startsWith("vi") ? naturalizeMath(option) : option}`, locale, token);
  }
}

export function speakFeedback(correct: boolean, message: string, locale = "vi-VN") {
  stopSpeech();
  const token = runToken;
  void speakOne((locale.startsWith("en") ? (correct ? "Correct! " : "Not quite. ") : (correct ? "Chính xác! " : "Chưa đúng. ")) + message, locale, token);
}

export async function speakSequence(lines: string[], locale = "vi-VN") {
  stopSpeech();
  const token = runToken;
  for (const line of lines) {
    if (token !== runToken) return;
    await speakOne(line, locale, token);
  }
}
