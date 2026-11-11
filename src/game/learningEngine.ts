// ==========================================
// MEGA ENGINE: TOÁN - TIẾNG VIỆT - TIẾNG ANH
// 5 KHỐI LỚP x 100 LEVEL x 3 MÔN
// ==========================================

export type Subject = "math" | "vietnamese" | "english";

export interface Question {
  id: string;
  subject: Subject;
  grade: number;
  level: number;
  question: string;
  options: string[];
  correctAnswer: string;
  explanation: string;
}

type Choice = { q: string; a: string; w: string[] };
type GeneratedResult = {
  questionText: string;
  correctVal: string;
  explanation: string;
  wrongs: string[];
};

const rand = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

const shuffleArray = <T,>(array: T[]): T[] => {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = rand(0, i);
    [arr[i], arr[j]] = [arr[j]!, arr[i]!];
  }
  return arr;
};

const normalizeGrade = (grade: number): number =>
  Math.max(1, Math.min(5, Math.floor(grade) || 1));

// ==========================================
// PHẦN 1: TOÁN HỌC
// ==========================================
const generateMath = (grade: number, lv: number) => {
  const difficulty = lv / 100;
  let questionText = "";
  let correctVal = 0;
  let explanation = "";
  let isFloat = false;

  if (grade === 1) {
    const maxNum = lv <= 33 ? 10 : lv <= 66 ? 20 : 100;
    if (Math.random() > 0.5) {
      const a = rand(1, maxNum - 1);
      const b = rand(1, maxNum - a);
      correctVal = a + b;
      questionText = `${a} + ${b} bằng bao nhiêu?`;
      explanation = `${a} + ${b} = ${correctVal}.`;
    } else {
      const a = rand(2, maxNum);
      const b = rand(1, a);
      correctVal = a - b;
      questionText = `${a} - ${b} bằng bao nhiêu?`;
      explanation = `${a} - ${b} = ${correctVal}.`;
    }
  } else if (grade === 2) {
    const type = lv <= 33 ? rand(1, 2) : lv <= 66 ? 3 : rand(1, 3);
    if (type === 1) {
      const maxN = lv <= 33 ? 20 : 100;
      const a = rand(10, maxN - 10);
      const b = rand(5, maxN - a);
      correctVal = a + b;
      questionText = `${a} + ${b} = ?`;
      explanation = `${a} + ${b} = ${correctVal}.`;
    } else if (type === 2) {
      const maxN = lv <= 33 ? 20 : 100;
      const a = rand(10, maxN);
      const b = rand(5, a - 5);
      correctVal = a - b;
      questionText = `${a} - ${b} = ?`;
      explanation = `${a} - ${b} = ${correctVal}.`;
    } else {
      const a = rand(2, 5);
      const b = rand(2, 9);
      correctVal = a * b;
      questionText = `${a} x ${b} = ?`;
      explanation = `${a} x ${b} = ${correctVal}.`;
    }
  } else if (grade === 3) {
    const type = lv <= 33 ? 1 : lv <= 66 ? 2 : 3;
    if (type === 1) {
      const a = rand(2, 9);
      const b = rand(2, 9);
      correctVal = a * b;
      questionText = `${a} x ${b} = ?`;
      explanation = `Bảng cửu chương ${a}: ${a} x ${b} = ${correctVal}.`;
    } else if (type === 2) {
      const maxN = 50 + Math.round(difficulty * 150);
      const a = rand(10, maxN);
      const b = rand(a + 1, maxN + 50);
      correctVal = b - a;
      questionText = `Tìm X: X + ${a} = ${b}`;
      explanation = `X = ${b} - ${a} = ${correctVal}.`;
    } else {
      const maxN = 20 + Math.round(difficulty * 80);
      const a = rand(5, maxN);
      const b = rand(5, maxN);
      correctVal = (a + b) * 2;
      questionText = `HCN dài ${a}cm, rộng ${b}cm. Chu vi = ?`;
      explanation = `Chu vi = (${a} + ${b}) x 2 = ${correctVal}.`;
    }
  } else if (grade === 4) {
    const type = lv <= 33 ? 1 : lv <= 66 ? 2 : 3;
    if (type === 1) {
      const maxA = 100 + Math.round(difficulty * 900);
      const a = rand(100, maxA);
      const b = rand(2, 9);
      correctVal = a * b;
      questionText = `${a} x ${b} = ?`;
      explanation = `${a} x ${b} = ${correctVal}.`;
    } else if (type === 2) {
      const b = rand(2, 9);
      const correct = rand(10, 50 + Math.round(difficulty * 50));
      const a = b * correct;
      correctVal = correct;
      questionText = `${a} : ${b} = ?`;
      explanation = `${a} : ${b} = ${correctVal}.`;
    } else {
      const m = rand(2, 5 + Math.round(difficulty * 10));
      const t1 = rand(1, m - 1);
      const t2 = rand(1, m - 1);
      const sumT = t1 + t2;
      if (sumT <= m) {
        correctVal = sumT;
        questionText = `${t1}/${m} + ${t2}/${m} = ?/${m}. Tử số?`;
        explanation = `Tử số = ${t1} + ${t2} = ${sumT}.`;
      } else {
        const a = rand(10, 99);
        const b = rand(10, 99);
        correctVal = a + b;
        questionText = `${a} + ${b} = ?`;
        explanation = `${a} + ${b} = ${correctVal}.`;
      }
    }
  } else {
    isFloat = true;
    const type = lv <= 33 ? 1 : lv <= 66 ? 2 : 3;
    if (type === 1) {
      const maxN = 10 + Math.round(difficulty * 90);
      const a = rand(10, maxN * 10) / 10;
      const b = rand(10, maxN * 10) / 10;
      correctVal = Math.round((a + b) * 10) / 10;
      questionText = `${a} + ${b} = ?`;
      explanation = `${a} + ${b} = ${correctVal}.`;
    } else if (type === 2) {
      const total = rand(10, 100) * 10;
      const percent = [10, 20, 25, 50][rand(0, 3)] ?? 10;
      correctVal = (total * percent) / 100;
      questionText = `${percent}% của ${total} = ?`;
      explanation = `${total} x ${percent} : 100 = ${correctVal}.`;
    } else {
      const r = rand(1, 5 + Math.round(difficulty * 10));
      correctVal = Math.round(3.14 * r * r * 100) / 100;
      questionText = `Hình tròn r = ${r}cm. Diện tích = ? (π = 3.14)`;
      explanation = `S = ${r} x ${r} x 3.14 = ${correctVal}.`;
    }
  }

  return {
    questionText,
    correctVal: correctVal.toString(),
    explanation,
    isFloat,
  };
};

// ==========================================
// PHẦN 2: TIẾNG VIỆT
// ==========================================
const generateVietnamese = (grade: number, _lv: number): GeneratedResult => {
  const banks: Record<number, Choice[]> = {
    1: [
      { q: "Từ nào viết đúng chính tả?", a: "cái bàn", w: ["kái bàn", "cái pàn", "cái bàng"] },
      { q: "Từ nào viết đúng chính tả?", a: "quả cam", w: ["quã cam", "qủa cam", "quả camm"] },
      { q: "Từ nào viết đúng chính tả?", a: "con cá", w: ["con ká", "con cà", "con cả"] },
      { q: "Từ nào viết đúng chính tả?", a: "hoa hồng", w: ["hoa hòng", "hoa hông", "hoa hồn"] },
      { q: "Từ nào viết đúng chính tả?", a: "mẹ yêu", w: ["mẹ iêu", "mẹ yều", "mẹ yeu"] },
      { q: "Từ nào chỉ người?", a: "bà", w: ["cây", "con mèo", "quả"] },
      { q: "Từ nào chỉ con vật?", a: "con chó", w: ["cái bàn", "bông hoa", "quyển sách"] },
      { q: "Từ nào chỉ đồ vật?", a: "cái ghế", w: ["ông", "con cá", "hoa"] },
      { q: "Từ nào chỉ cây cối?", a: "cây tre", w: ["con gà", "cô giáo", "cái áo"] },
      { q: "Từ nào chỉ hoạt động?", a: "đọc", w: ["bàn", "đẹp", "xanh"] },
    ],
    2: [
      { q: "Từ nào là từ chỉ hoạt động?", a: "chạy", w: ["đẹp", "cao", "xanh"] },
      { q: "Từ nào là từ chỉ đặc điểm?", a: "đẹp", w: ["chạy", "ăn", "ngủ"] },
      { q: "Từ nào là từ chỉ sự vật?", a: "bàn", w: ["chạy", "đẹp", "nhanh"] },
      { q: "Từ nào là từ chỉ hoạt động?", a: "hát", w: ["đỏ", "to", "cao"] },
      { q: "Từ nào là từ chỉ đặc điểm?", a: "xanh", w: ["đi", "nói", "cười"] },
      { q: "Cặp từ trái nghĩa là:", a: "cao - thấp", w: ["cao - to", "thấp - bé", "to - lớn"] },
      { q: "Cặp từ trái nghĩa là:", a: "nóng - lạnh", w: ["nóng - ấm", "lạnh - mát", "ấm - nóng"] },
      { q: "Cặp từ trái nghĩa là:", a: "đen - trắng", w: ["đen - xám", "trắng - sáng", "xám - đen"] },
      { q: "Cặp từ trái nghĩa là:", a: "vui - buồn", w: ["vui - hạnh phúc", "buồn - khổ", "vui - cười"] },
      { q: "Từ nào đồng nghĩa với chăm chỉ?", a: "siêng năng", w: ["lười biếng", "thờ ơ", "chậm chạp"] },
    ],
    3: [
      { q: "Từ nào là danh từ?", a: "học sinh", w: ["chạy", "đẹp", "nhanh"] },
      { q: "Từ nào là động từ?", a: "viết", w: ["bàn", "đẹp", "cao"] },
      { q: "Từ nào là tính từ?", a: "thông minh", w: ["chạy", "bàn", "học"] },
      { q: "Từ nào là danh từ?", a: "quyển sách", w: ["đọc", "hay", "nhanh"] },
      { q: "Từ nào là động từ?", a: "nhảy", w: ["cao", "đẹp", "bàn"] },
      { q: 'Thành ngữ "Chậm như ..."', a: "rùa", w: ["thỏ", "ngựa", "mèo"] },
      { q: 'Thành ngữ "Nhanh như ..."', a: "cắt", w: ["rùa", "ốc", "sên"] },
      { q: 'Thành ngữ "Khỏe như ..."', a: "voi", w: ["mèo", "kiến", "chim"] },
      { q: 'Thành ngữ "Đen như ..."', a: "cột nhà cháy", w: ["tuyết", "trứng gà", "bông"] },
      { q: "Từ nào trái nghĩa với dũng cảm?", a: "nhút nhát", w: ["can đảm", "gan dạ", "mạnh mẽ"] },
    ],
    4: [
      { q: "Câu nào là câu kể?", a: "Em đi học.", w: ["Em có đi học không?", "Ôi, đẹp quá!", "Em đi học nhé!"] },
      { q: "Câu nào là câu hỏi?", a: "Bạn tên gì?", w: ["Tôi là Nam.", "Đẹp quá!", "Đi thôi!"] },
      { q: "Câu nào là câu cảm?", a: "Ôi, đẹp quá!", w: ["Tôi đi học.", "Bạn tên gì?", "Đi thôi!"] },
      { q: "Câu nào là câu khiến?", a: "Đóng cửa lại!", w: ["Trời đẹp.", "Bạn tên gì?", "Ôi, vui quá!"] },
      { q: "Từ nào là từ láy?", a: "lung linh", w: ["bàn ghế", "học sinh", "xe đạp"] },
      { q: "Từ nào là từ ghép?", a: "bàn ghế", w: ["lung linh", "xinh xinh", "đẹp đẽ"] },
      { q: "Từ nào là từ láy?", a: "xinh xắn", w: ["quần áo", "sách vở", "nhà cửa"] },
      { q: "Từ nào là từ ghép?", a: "quần áo", w: ["lung linh", "rì rào", "lấp lánh"] },
      { q: "Chủ ngữ trong câu 'Lan đang đọc sách' là?", a: "Lan", w: ["đang đọc", "đọc sách", "sách"] },
    ],
    5: [
      { q: 'Đại từ trong câu "Tôi đi học" là?', a: "Tôi", w: ["đi", "học", "Tôi đi"] },
      { q: 'Quan hệ từ trong câu "Vì trời mưa nên em nghỉ học" là?', a: "Vì... nên", w: ["trời", "mưa", "em"] },
      { q: 'Đại từ trong câu "Bạn ấy học giỏi" là?', a: "Bạn ấy", w: ["học", "giỏi", "học giỏi"] },
      { q: 'Quan hệ từ trong câu "Tuy nhà nghèo nhưng Nam học giỏi" là?', a: "Tuy... nhưng", w: ["nhà", "nghèo", "Nam"] },
      { q: 'Thành ngữ "Ăn quả nhớ kẻ ..."', a: "trồng cây", w: ["hái quả", "bán quả", "mua quả"] },
      { q: 'Thành ngữ "Uống nước nhớ ..."', a: "nguồn", w: ["sông", "suối", "biển"] },
      { q: 'Thành ngữ "Lá lành đùm lá ..."', a: "rách", w: ["xanh", "vàng", "khô"] },
      { q: 'Thành ngữ "Một nắng hai ..."', a: "sương", w: ["mưa", "gió", "bão"] },
      { q: "Từ nào đồng nghĩa với hòa bình?", a: "yên bình", w: ["chiến tranh", "xung đột", "ồn ào"] },
      { q: "Từ nào trái nghĩa với đoàn kết?", a: "chia rẽ", w: ["gắn bó", "đồng lòng", "hợp tác"] },
    ],
  };
  const bank = banks[normalizeGrade(grade)] ?? banks[3]!;
  const item = bank[rand(0, bank.length - 1)]!;
  return {
    questionText: item.q,
    correctVal: item.a,
    explanation: `Đáp án đúng là: ${item.a}.`,
    wrongs: shuffleArray(item.w.filter((value) => value !== item.a)).slice(0, 3),
  };
};

const generateEnglish = (grade: number, _lv: number): GeneratedResult => {
  const banks: Record<number, Choice[]> = {
    1: [
      { q: "What color is the sun?", a: "Yellow", w: ["Blue", "Green", "Black"] },
      { q: "How many fingers are on one hand?", a: "Five", w: ["Three", "Four", "Six"] },
      { q: 'What is "mèo" in English?', a: "Cat", w: ["Dog", "Bird", "Fish"] },
      { q: 'What is "chó" in English?', a: "Dog", w: ["Cat", "Cow", "Pig"] },
      { q: "Which one is a fruit?", a: "Apple", w: ["Car", "Book", "Chair"] },
      { q: "What color is grass?", a: "Green", w: ["Red", "Blue", "Black"] },
      { q: 'What is "con cá" in English?', a: "Fish", w: ["Bird", "Dog", "Cat"] },
      { q: 'What is "quả chuối" in English?', a: "Banana", w: ["Apple", "Orange", "Grape"] },
    ],
    2: [
      { q: 'What is "táo" in English?', a: "Apple", w: ["Orange", "Banana", "Grape"] },
      { q: 'What is "sách" in English?', a: "Book", w: ["Pen", "Bag", "Desk"] },
      { q: "Which one is a color?", a: "Red", w: ["Run", "Eat", "Go"] },
      { q: "How many days are there in a week?", a: "Seven", w: ["Five", "Six", "Eight"] },
      { q: 'What is "mẹ" in English?', a: "Mother", w: ["Father", "Sister", "Brother"] },
      { q: 'What is "trường học" in English?', a: "School", w: ["Hospital", "Market", "Park"] },
      { q: 'What is "con voi" in English?', a: "Elephant", w: ["Tiger", "Rabbit", "Monkey"] },
      { q: 'What is "màu tím" in English?', a: "Purple", w: ["Yellow", "Brown", "White"] },
    ],
    3: [
      { q: "She ___ a student.", a: "is", w: ["are", "am", "be"] },
      { q: "They ___ my friends.", a: "are", w: ["is", "am", "be"] },
      { q: "I ___ nine years old.", a: "am", w: ["is", "are", "be"] },
      { q: "He ___ a book.", a: "has", w: ["have", "is", "are"] },
      { q: "We ___ English.", a: "like", w: ["likes", "liking", "liked"] },
      { q: 'What is "trường học" in English?', a: "School", w: ["Home", "Park", "Shop"] },
      { q: "There ___ two pens on the desk.", a: "are", w: ["is", "am", "be"] },
      { q: "What is the plural of 'cat'?", a: "Cats", w: ["Cates", "Cat", "Caties"] },
    ],
    4: [
      { q: "She ___ to school every day.", a: "goes", w: ["go", "going", "went"] },
      { q: "They ___ football yesterday.", a: "played", w: ["play", "plays", "playing"] },
      { q: "I ___ a book now.", a: "am reading", w: ["read", "reads", "reading"] },
      { q: "He ___ his homework last night.", a: "did", w: ["does", "do", "doing"] },
      { q: "There ___ two cats in the garden.", a: "are", w: ["is", "am", "be"] },
      { q: "My mother ___ dinner every evening.", a: "cooks", w: ["cook", "cooking", "cooked"] },
      { q: "We ___ to the zoo last Sunday.", a: "went", w: ["go", "goes", "going"] },
      { q: "The opposite of 'big' is ___.", a: "small", w: ["long", "tall", "short"] },
    ],
    5: [
      { q: "She ___ here since 2020.", a: "has lived", w: ["lived", "lives", "is living"] },
      { q: "If it rains, we ___ at home.", a: "will stay", w: ["stay", "stayed", "staying"] },
      { q: "This book is ___ than that one.", a: "more interesting", w: ["interesting", "most interesting", "interestinger"] },
      { q: "He is the ___ student in class.", a: "tallest", w: ["taller", "tall", "most tall"] },
      { q: "I ___ my homework already.", a: "have finished", w: ["finish", "finished", "finishing"] },
      { q: "She asked me where I ___.", a: "lived", w: ["live", "living", "lives"] },
      { q: "We have studied English ___ three years.", a: "for", w: ["since", "at", "on"] },
      { q: "The letter ___ by my teacher yesterday.", a: "was written", w: ["wrote", "is writing", "writes"] },
    ],
  };
  const bank = banks[normalizeGrade(grade)] ?? banks[3]!;
  const item = bank[rand(0, bank.length - 1)]!;
  return {
    questionText: item.q,
    correctVal: item.a,
    explanation: `Đáp án đúng là: ${item.a}.`,
    wrongs: shuffleArray(item.w.filter((value) => value !== item.a)).slice(0, 3),
  };
};

// ==========================================
// SINH 1 CÂU HỎI
// ==========================================
export const generateQuestion = (
  subject: Subject,
  grade: number,
  level: number,
): Question => {
  const safeGrade = normalizeGrade(grade);
  const lv = Math.max(1, Math.min(100, Math.floor(level) || 1));
  let result: GeneratedResult;

  if (subject === "math") {
    const { questionText, correctVal, explanation, isFloat } = generateMath(safeGrade, lv);
    result = {
      questionText,
      correctVal,
      explanation,
      wrongs: generateWrongMaths(Number(correctVal), isFloat),
    };
  } else if (subject === "vietnamese") {
    result = generateVietnamese(safeGrade, lv);
  } else {
    result = generateEnglish(safeGrade, lv);
  }

  return {
    id: `${subject}-G${safeGrade}-L${lv}-${Date.now()}-${rand(1000, 9999)}`,
    subject,
    grade: safeGrade,
    level: lv,
    question: result.questionText,
    options: shuffleArray([result.correctVal, ...result.wrongs]),
    correctAnswer: result.correctVal,
    explanation: result.explanation,
  };
};

// ==========================================
// SINH 3 ĐÁP ÁN SAI CHO TOÁN
// ==========================================
const generateWrongMaths = (correct: number, isFloat = false): string[] => {
  const wrongs = new Set<string>();
  let attempts = 0;

  while (wrongs.size < 3 && attempts < 100) {
    attempts++;
    const offset = isFloat ? rand(-150, 150) / 10 : rand(-15, 15);
    if (offset === 0) continue;
    let wrongVal = correct + offset;
    if (wrongVal < 0) wrongVal = Math.abs(wrongVal);
    if (isFloat) wrongVal = Math.round(wrongVal * 10) / 10;
    else wrongVal = Math.round(wrongVal);
    const answer = wrongVal.toString();
    if (answer !== correct.toString()) wrongs.add(answer);
  }

  let fallback = 1;
  while (wrongs.size < 3) {
    const answer = (correct + fallback * (isFloat ? 0.1 : 1)).toFixed(isFloat ? 1 : 0);
    if (Number(answer) >= 0 && answer !== correct.toString()) wrongs.add(answer);
    fallback++;
  }
  return Array.from(wrongs);
};

// ==========================================
// TẠO BỘ CÂU HỎI CHO MỘT LEVEL
// ==========================================
export const generateLevelQuestions = (
  subject: Subject,
  grade: number,
  level: number,
  count = 5,
): Question[] => {
  const safeCount = Math.max(0, Math.min(50, Math.floor(count) || 0));
  const questions: Question[] = [];
  const existingTexts = new Set<string>();
  let safety = 0;

  while (questions.length < safeCount && safety < safeCount * 30 + 100) {
    safety++;
    const question = generateQuestion(subject, grade, level);
    if (!existingTexts.has(question.question)) {
      existingTexts.add(question.question);
      questions.push(question);
    }
  }

  return questions;
};
