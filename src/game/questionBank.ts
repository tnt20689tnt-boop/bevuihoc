export type LessonSubject = "math" | "vietnamese" | "english";

export type LessonQuestion = {
  prompt: string;
  choices: string[];
  answer: number;
  hint: string;
};

const rand = (min: number, max: number) =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
};

const unique = (items: string[]) => [...new Set(items)];

const make = (prompt: string, answer: string, distractors: string[], hint: string): LessonQuestion => {
  const wrong = shuffle(unique(distractors.filter((item) => item !== answer))).slice(0, 3);
  const choices = shuffle([answer, ...wrong]);
  return { prompt, choices, answer: choices.indexOf(answer), hint };
};

const objects = ["quả táo", "quả cam", "quyển vở", "chiếc bút", "bông hoa", "viên bi", "chiếc kẹo", "con cá", "con chim", "quả bóng", "chiếc xe", "cái bánh"];
const names = ["An", "Bình", "Chi", "Dũng", "Hoa", "Lan", "Minh", "Nam", "Vy", "Hân"];
const englishWords: [string, string][] = [
  ["cat", "con mèo"], ["dog", "con chó"], ["apple", "quả táo"], ["book", "quyển sách"],
  ["sun", "mặt trời"], ["moon", "mặt trăng"], ["bird", "con chim"], ["fish", "con cá"],
  ["red", "màu đỏ"], ["blue", "màu xanh"], ["green", "màu xanh lá"], ["milk", "sữa"],
  ["pen", "bút mực"], ["bag", "cặp sách"], ["egg", "quả trứng"], ["cake", "bánh ngọt"],
  ["one", "một"], ["two", "hai"], ["three", "ba"], ["four", "bốn"], ["five", "năm"],
  ["mother", "mẹ"], ["father", "bố"], ["school", "trường học"], ["friend", "bạn bè"],
  ["happy", "vui vẻ"], ["water", "nước"], ["flower", "bông hoa"], ["orange", "quả cam"],
  ["rabbit", "con thỏ"], ["elephant", "con voi"], ["teacher", "giáo viên"], ["pencil", "bút chì"],
  ["yellow", "màu vàng"], ["purple", "màu tím"], ["house", "ngôi nhà"], ["family", "gia đình"],
  ["beautiful", "xinh đẹp"], ["small", "nhỏ"], ["big", "to"], ["run", "chạy"],
  ["read", "đọc"], ["write", "viết"], ["listen", "nghe"], ["speak", "nói"],
  ["breakfast", "bữa sáng"], ["dinner", "bữa tối"], ["watermelon", "dưa hấu"], ["butterfly", "con bướm"],
];
const vietnameseWords = ["bàn", "ghế", "cây", "hoa", "mèo", "chó", "bút", "sách", "trường", "bạn", "đẹp", "ngoan", "chăm", "học", "chạy", "nhảy", "đọc", "viết", "xanh", "đỏ", "vui", "buồn", "cao", "thấp", "nhanh", "chậm", "mẹ", "bố", "bà", "ông"];

function mathCandidates(level: number, grade: number): LessonQuestion[] {
  const tier = Math.min(9, Math.floor((level - 1) / 10) + Math.max(0, grade - 1));
  const max = [10, 20, 50, 100, 200, 500, 1000, 5000, 10000, 100000][tier]!;
  const questions: LessonQuestion[] = [];
  for (let i = 0; i < 100; i++) {
    const a = rand(1, Math.max(2, Math.floor(max / 2)));
    const b = rand(1, Math.max(2, Math.floor(max / 2)));
    const sum = a + b;
    const big = Math.max(a, b);
    const small = Math.min(a, b);
    const diff = big - small;
    const n = rand(1, Math.min(12, Math.max(2, tier + 3)));
    const m = rand(2, 10);
    const kind = i % 8;
    if (kind === 0) questions.push(make(`${a} + ${b} bằng bao nhiêu?`, String(sum), [String(sum + 1), String(Math.max(0, sum - 1)), String(sum + 2)], "Muốn tìm tất cả, bé dùng phép cộng."));
    if (kind === 1) questions.push(make(`${big} - ${small} bằng bao nhiêu?`, String(diff), [String(diff + 1), String(Math.max(0, diff - 1)), String(diff + 2)], "Lấy số lớn trừ số bé."));
    if (kind === 2) questions.push(make(`Số nào lớn hơn: ${a} hay ${b}?`, String(big), [String(small), String(big + 1), String(Math.max(0, small - 1))], "So sánh hai số nhé."));
    if (kind === 3) questions.push(make(`Điền số còn thiếu: ${a} + ? = ${sum}`, String(b), [String(b + 1), String(Math.max(0, b - 1)), String(b + 2)], "Lấy tổng trừ đi số đã biết."));
    if (kind === 4) {
      const item = objects[rand(0, objects.length - 1)]!;
      questions.push(make(`Có ${a} ${item}, được cho thêm ${b}. Có tất cả bao nhiêu?`, String(sum), [String(sum + 1), String(Math.max(0, sum - 1)), String(sum + 2)], "Gộp hai nhóm lại bằng phép cộng."));
    }
    if (kind === 5) {
      const item = objects[rand(0, objects.length - 1)]!;
      questions.push(make(`Có ${big} ${item}, đem cho ${small}. Còn lại bao nhiêu?`, String(diff), [String(diff + 1), String(Math.max(0, diff - 1)), String(diff + 2)], "Lấy số ban đầu trừ số đã cho."));
    }
    if (kind === 6 && tier >= 3) {
      const product = n * m;
      questions.push(make(`${n} × ${m} bằng bao nhiêu?`, String(product), [String(product + n), String(product - 1), String(product + 1)], "Phép nhân là phép cộng các nhóm bằng nhau."));
    }
    if (kind === 7 && tier >= 5) {
      const product = n * m;
      questions.push(make(`${product} : ${n} bằng bao nhiêu?`, String(m), [String(m + 1), String(Math.max(1, m - 1)), String(n)], "Chia thành các nhóm bằng nhau."));
    }
  }
  if (tier < 3) {
    const shapes = ["hình tròn", "hình vuông", "hình tam giác", "hình chữ nhật"];
    questions.push(make("Hình nào có 3 cạnh?", "hình tam giác", shapes.filter(x => x !== "hình tam giác"), "Hình tam giác có 3 cạnh."));
    questions.push(make("Hình nào không có cạnh?", "hình tròn", shapes.filter(x => x !== "hình tròn"), "Hình tròn không có cạnh thẳng."));
  }
  return questions;
}

function vietnameseCandidates(level: number, grade: number): LessonQuestion[] {
  const tier = Math.min(9, Math.floor((level - 1) / 10) + Math.max(0, grade - 1));
  const questions: LessonQuestion[] = [];
  const alphabet = ["a", "ă", "â", "b", "c", "d", "đ", "e", "ê", "g", "h", "i", "k", "l", "m", "n", "o", "ô", "ơ", "p", "q", "r", "s", "t", "u", "ư", "v", "x", "y"];
  for (const word of vietnameseWords) {
    questions.push(make(`Chọn từ viết đúng: ${word}`, word, shuffle(vietnameseWords.filter(x => x !== word)).slice(0, 3), "Đọc chậm từng tiếng để kiểm tra cách viết."));
  }
  for (let i = 0; i < alphabet.length; i++) {
    const letter = alphabet[i]!;
    questions.push(make(`Chữ nào đứng sau chữ ${alphabet[Math.max(0, i - 1)]}?`, letter, shuffle(alphabet.filter(x => x !== letter)).slice(0, 3), "Đọc bảng chữ cái theo đúng thứ tự."));
  }
  questions.push(
    make("Từ nào chỉ người?", "giáo viên", ["cái bàn", "bông hoa", "con đường"], "Giáo viên là từ chỉ người."),
    make("Từ nào chỉ con vật?", "con thỏ", ["quyển vở", "bông hoa", "chiếc cặp"], "Con thỏ là tên một con vật."),
    make("Từ nào chỉ hoạt động?", "chạy", ["xinh đẹp", "bàn ghế", "màu đỏ"], "Chạy là hoạt động."),
    make("Từ nào chỉ đặc điểm?", "hiền lành", ["đọc sách", "cái ghế", "học bài"], "Hiền lành nói về đặc điểm."),
    make("Cuối câu hỏi thường có dấu gì?", "dấu hỏi (?)", ["dấu chấm (.)", "dấu phẩy (,)", "dấu chấm than (!)"], "Câu hỏi kết thúc bằng dấu hỏi."),
    make("Cuối câu kể thường có dấu gì?", "dấu chấm (.)", ["dấu hỏi (?)", "dấu phẩy (,)", "dấu hai chấm (:)"], "Câu kể thường kết thúc bằng dấu chấm.")
  );
  if (tier >= 2) {
    questions.push(make("Từ trái nghĩa với cao là gì?", "thấp", ["dài", "rộng", "to"], "Cao và thấp là hai từ trái nghĩa."));
    questions.push(make("Từ đồng nghĩa với chăm chỉ là gì?", "siêng năng", ["lười biếng", "chậm chạp", "thờ ơ"], "Chăm chỉ gần nghĩa với siêng năng."));
    questions.push(make("Từ nào là từ láy?", "lung linh", ["bàn ghế", "học sinh", "xe đạp"], "Lung linh có các tiếng láy âm."));
  }
  if (tier >= 4) {
    questions.push(make("Chủ ngữ trong câu “Lan đang đọc sách” là ai?", "Lan", ["đang đọc", "sách", "đọc sách"], "Lan là người thực hiện hoạt động."));
    questions.push(make("Từ trái nghĩa với dũng cảm là gì?", "nhút nhát", ["gan dạ", "can đảm", "mạnh mẽ"], "Nhút nhát trái nghĩa với dũng cảm."));
    questions.push(make("Từ nào là danh từ?", "học sinh", ["chạy", "xinh đẹp", "nhanh"], "Học sinh là tên gọi người."));
  }
  if (tier >= 7) {
    questions.push(make("Câu nào là câu khiến?", "Em hãy mở sách ra.", ["Em đang đọc sách.", "Em có sách không?", "Sách đẹp quá!"], "Câu khiến dùng để yêu cầu hoặc đề nghị."));
    questions.push(make("Từ nào là quan hệ từ?", "vì", ["đẹp", "chạy", "bàn"], "Vì có thể dùng để nối các vế câu."));
  }
  return questions;
}

function englishCandidates(level: number, grade: number): LessonQuestion[] {
  const tier = Math.min(9, Math.floor((level - 1) / 10) + Math.max(0, grade - 1));
  const questions: LessonQuestion[] = [];
  for (const [word, meaning] of englishWords) {
    questions.push(make(`“${word}” có nghĩa là gì?`, meaning, shuffle(englishWords.filter(x => x[1] !== meaning).map(x => x[1])).slice(0, 3), `${word} nghĩa là ${meaning}.`));
    questions.push(make(`Từ tiếng Anh nào có nghĩa là “${meaning}”?`, word, shuffle(englishWords.filter(x => x[0] !== word).map(x => x[0])).slice(0, 3), `${word} nghĩa là ${meaning}.`));
  }
  questions.push(
    make("“Hello” có nghĩa là gì?", "Xin chào", ["Tạm biệt", "Cảm ơn", "Xin lỗi"], "Hello dùng để chào hỏi."),
    make("“Thank you” có nghĩa là gì?", "Cảm ơn", ["Xin chào", "Tạm biệt", "Xin lỗi"], "Thank you nghĩa là cảm ơn."),
    make("“Good morning” có nghĩa là gì?", "Chào buổi sáng", ["Chúc ngủ ngon", "Tạm biệt", "Chào buổi tối"], "Good morning là lời chào buổi sáng."),
    make("What color is the sky on a clear day?", "Blue", ["Black", "Pink", "Brown"], "The sky is usually blue on a clear day."),
    make("How many days are there in a week?", "Seven", ["Five", "Six", "Eight"], "There are seven days in a week.")
  );
  if (tier >= 2) {
    questions.push(make("Choose the correct sentence.", "I am a student.", ["I is a student.", "I are a student.", "I be a student."], "Với I, ta dùng am."));
    questions.push(make("She ___ my friend.", "is", ["am", "are", "be"], "She đi với is."));
    questions.push(make("They ___ playing football.", "are", ["is", "am", "be"], "They đi với are."));
  }
  if (tier >= 5) {
    questions.push(make("Yesterday, I ___ to school.", "went", ["go", "goes", "going"], "Yesterday diễn tả quá khứ."));
    questions.push(make("The opposite of “big” is ___.", "small", ["long", "tall", "short"], "Big trái nghĩa với small."));
    questions.push(make("We have lived here ___ 2020.", "since", ["for", "at", "on"], "Since đi với mốc thời gian."));
  }
  if (tier >= 8) {
    questions.push(make("If it rains, we ___ at home.", "will stay", ["stayed", "staying", "stay yesterday"], "Câu điều kiện loại 1 dùng will ở mệnh đề chính."));
    questions.push(make("This book is ___ than that one.", "more interesting", ["most interesting", "interesting", "interestinger"], "So sánh hơn của interesting là more interesting."));
  }
  return questions;
}

export function generateLessonQuestions(
  subject: LessonSubject,
  level: number,
  grade: number,
  seen: Set<string>,
  count = 5
): LessonQuestion[] {
  const candidates = subject === "math"
    ? mathCandidates(level, grade)
    : subject === "vietnamese"
      ? vietnameseCandidates(level, grade)
      : englishCandidates(level, grade);
  const fresh = shuffle(candidates.filter(q => !seen.has(q.prompt)));
  const chosen: LessonQuestion[] = [];
  const prompts = new Set<string>();
  for (const question of fresh) {
    if (prompts.has(question.prompt)) continue;
    prompts.add(question.prompt);
    chosen.push(question);
    if (chosen.length >= count) break;
  }
  // Never silently repeat within one session. If the unseen pool is exhausted,
  // return fewer questions and let the UI explain that new content is needed.
  return chosen;
}

export function loadSeenQuestionPrompts(key: string): Set<string> {
  try {
    const raw = localStorage.getItem(`bv-hoc-seen:${key}`);
    const values: unknown = raw ? JSON.parse(raw) : [];
    return new Set(Array.isArray(values) ? values.filter((v): v is string => typeof v === "string") : []);
  } catch {
    return new Set();
  }
}

export function saveSeenQuestionPrompts(key: string, seen: Set<string>): void {
  try {
    // Bound storage growth while retaining a long no-repeat history.
    localStorage.setItem(`bv-hoc-seen:${key}`, JSON.stringify([...seen].slice(-3000)));
  } catch {
    // Private browsing/storage limits should not prevent a child from learning.
  }
}
