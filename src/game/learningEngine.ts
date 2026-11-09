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
    [arr[i], arr[j]] = [arr[j], arr[i]];
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
      const percent = [10, 20, 25, 50][rand(0, 3)];
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
  const chinhTa: Choice[] = [
    { q: 'Điền từ đúng: "Bầu trời ... xanh"', a: "trong", w: ["chong", "trông", "chong"] },
    { q: 'Điền từ đúng: "Cánh đồng ... thẳng cánh cò bay"', a: "lúa", w: ["lứa", "lữa", "lưa"] },
    { q: "Từ nào viết đúng chính tả?", a: "Nghỉ ngơi", w: ["Nghĩ ngơi", "Nghỉ nghơi", "Nghỉ ngơi nhé"] },
    { q: 'Điền "s" hay "x": "...ung phong"', a: "x", w: ["s", "tr", "ch"] },
    { q: 'Điền "tr" hay "ch": "...ăm sóc"', a: "ch", w: ["tr", "s", "x"] },
    { q: 'Điền từ đúng: "Học ... chăm chỉ"', a: "tập", w: ["tạp", "tấp", "tắp"] },
  ];

  const dongNghia: Choice[] = [
    { q: 'Từ nào đồng nghĩa với "chăm chỉ"?', a: "Siêng năng", w: ["Lười biếng", "Thông minh", "Xinh đẹp"] },
    { q: 'Từ nào đồng nghĩa với "to lớn"?', a: "Khổng lồ", w: ["Nhỏ bé", "Tí hon", "Bé nhỏ"] },
    { q: 'Từ nào trái nghĩa với "vui vẻ"?', a: "Buồn bã", w: ["Hạnh phúc", "Phấn khởi", "Hân hoan"] },
    { q: 'Từ nào trái nghĩa với "cao"?', a: "Thấp", w: ["Dài", "Rộng", "To"] },
  ];

  const thanhNgu: Choice[] = [
    { q: 'Điền vào chỗ trống: "Ăn quả nhớ kẻ ..."', a: "trồng cây", w: ["trồng rừng", "trồng hoa", "trồng lúa"] },
    { q: 'Điền: "Có công mài sắt, có ngày nên ..."', a: "kim", w: ["vàng", "bạc", "đồng"] },
    { q: 'Điền: "Uống nước nhớ ..."', a: "nguồn", w: ["sông", "suối", "biển"] },
    { q: 'Điền: "Lá lành đùm lá ..."', a: "rách", w: ["tốt", "xanh", "vàng"] },
  ];

  const nguPhap: Choice[] = [
    { q: 'Từ "chạy" là loại từ gì?', a: "Động từ", w: ["Danh từ", "Tính từ", "Đại từ"] },
    { q: 'Từ "đẹp" là loại từ gì?', a: "Tính từ", w: ["Danh từ", "Động từ", "Đại từ"] },
    { q: 'Từ "học sinh" là loại từ gì?', a: "Danh từ", w: ["Động từ", "Tính từ", "Đại từ"] },
    { q: 'Câu "Bé Lan đang hát" có chủ ngữ là gì?', a: "Bé Lan", w: ["đang hát", "hát", "Bé Lan đang"] },
  ];

  let bank: Choice[];
  if (grade <= 1) bank = chinhTa;
  else if (grade === 2) bank = [...chinhTa, ...dongNghia];
  else if (grade === 3) bank = [...dongNghia, ...thanhNgu];
  else if (grade === 4) bank = [...thanhNgu, ...nguPhap];
  else bank = [...chinhTa, ...dongNghia, ...thanhNgu, ...nguPhap];

  const item = bank[rand(0, bank.length - 1)];
  const wrongs = [...new Set(item.w)].filter((w) => w !== item.a).slice(0, 3);
  while (wrongs.length < 3) wrongs.push(`Đáp án khác ${wrongs.length + 1}`);

  return {
    questionText: item.q,
    correctVal: item.a,
    explanation: `Đáp án đúng là: ${item.a}.`,
    wrongs,
  };
};

// ==========================================
// PHẦN 3: TIẾNG ANH
// ==========================================
const generateEnglish = (grade: number, _lv: number): GeneratedResult => {
  const vocabulary: Choice[] = [
    { q: "Con mèo trong tiếng Anh là gì?", a: "Cat", w: ["Dog", "Bird", "Fish"] },
    { q: "Màu đỏ trong tiếng Anh là gì?", a: "Red", w: ["Blue", "Green", "Yellow"] },
    { q: "Số 5 trong tiếng Anh là gì?", a: "Five", w: ["Four", "Six", "Seven"] },
    { q: "Mẹ trong tiếng Anh là gì?", a: "Mother", w: ["Father", "Sister", "Brother"] },
    { q: "Quả táo trong tiếng Anh là gì?", a: "Apple", w: ["Banana", "Orange", "Mango"] },
    { q: "Trường học trong tiếng Anh là gì?", a: "School", w: ["Hospital", "Market", "Park"] },
    { q: "Con chó trong tiếng Anh là gì?", a: "Dog", w: ["Cat", "Pig", "Cow"] },
    { q: "Màu xanh dương là gì?", a: "Blue", w: ["Red", "Green", "Black"] },
  ];

  const grammar: Choice[] = [
    { q: 'Điền từ: "I ___ a student."', a: "am", w: ["is", "are", "be"] },
    { q: 'Điền từ: "She ___ my sister."', a: "is", w: ["am", "are", "be"] },
    { q: 'Điền từ: "They ___ playing football."', a: "are", w: ["is", "am", "be"] },
    { q: 'Điền giới từ: "The book is ___ the table."', a: "on", w: ["in", "at", "to"] },
    { q: 'Điền giới từ: "I go ___ school."', a: "to", w: ["on", "in", "at"] },
    { q: 'Đại từ nào thay thế cho "Nam"?', a: "He", w: ["She", "It", "They"] },
    { q: 'Đại từ nào thay thế cho "Lan"?', a: "She", w: ["He", "It", "They"] },
  ];

  const reading: Choice[] = [
    { q: 'Đọc: "Tom is a boy. He is 7 years old." - Tom bao nhiêu tuổi?', a: "7", w: ["6", "8", "9"] },
    { q: 'Đọc: "I have a cat. It is black." - Con mèo màu gì?', a: "Black", w: ["White", "Red", "Blue"] },
  ];

  const verbs: Choice[] = [
    { q: 'Chia động từ: "He ___ (go) to school every day."', a: "goes", w: ["go", "going", "went"] },
    { q: 'Chia động từ: "They ___ (play) games."', a: "play", w: ["plays", "playing", "played"] },
  ];

  let bank: Choice[];
  if (grade <= 1) bank = vocabulary;
  else if (grade === 2) bank = [...vocabulary, ...grammar];
  else if (grade === 3) bank = [...grammar, ...reading];
  else if (grade === 4) bank = [...reading, ...verbs, ...grammar];
  else bank = [...vocabulary, ...grammar, ...reading, ...verbs];

  const item = bank[rand(0, bank.length - 1)];
  const wrongs = item.w.slice(0, 3);
  while (wrongs.length < 3) wrongs.push(`Other ${wrongs.length + 1}`);

  return {
    questionText: item.q,
    correctVal: item.a,
    explanation: `Đáp án đúng là: ${item.a}.`,
    wrongs,
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
