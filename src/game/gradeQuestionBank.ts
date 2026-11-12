export type PracticeSubject = "math" | "vietnamese" | "english";

export type PracticeQuestion = {
  prompt: string;
  choices: string[];
  answer: number;
  hint: string;
};

const pick = <T,>(items: readonly T[]): T => items[Math.floor(Math.random() * items.length)]!;
const int = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
const shuffle = <T,>(items: T[]): T[] => {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = int(0, i);
    [result[i], result[j]] = [result[j]!, result[i]!];
  }
  return result;
};

const make = (prompt: string, answer: string, distractors: string[], hint: string): PracticeQuestion => {
  const wrong = [...new Set(distractors.filter(value => value !== answer))].slice(0, 3);
  let n = 1;
  while (wrong.length < 3) {
    const fallback = `${answer} (${n++})`;
    if (fallback !== answer && !wrong.includes(fallback)) wrong.push(fallback);
  }
  const choices = shuffle([answer, ...wrong]);
  return { prompt, choices, answer: choices.indexOf(answer), hint };
};

const mathQuestion = (grade: number, stage: number): PracticeQuestion => {
  const scale = stage;
  if (grade === 1) {
    const max = Math.min(100, 10 + scale);
    const kind = int(0, 4);
    if (kind <= 1) {
      const a = int(0, max - 1), b = int(0, max - a);
      const answer = a + b;
      return make(`${a} + ${b} = ?`, String(answer), [String(answer + 1), String(Math.max(0, answer - 1)), String(answer + 2)], "Gộp hai nhóm rồi đếm tất cả.");
    }
    if (kind === 2) {
      const a = int(1, max), b = int(0, a);
      const answer = a - b;
      return make(`${a} - ${b} = ?`, String(answer), [String(answer + 1), String(Math.max(0, answer - 1)), String(a + b)], "Lấy số ban đầu bớt đi số đã cho.");
    }
    if (kind === 3) {
      const a = int(0, max), b = int(0, max);
      return make(`Số nào lớn hơn: ${a} hay ${b}?`, String(Math.max(a, b)), [String(Math.min(a, b)), String(max + 1), String(Math.max(a, b) + 1)], "So sánh hai số theo hàng chục rồi hàng đơn vị.");
    }
    const a = int(1, 8), answer = a + 2;
    return make(`Dãy số ${a}, ${a + 1}, __, ${a + 3}. Số còn thiếu là?`, String(answer), [String(answer - 1), String(answer + 1), String(answer + 2)], "Mỗi lần dãy tăng thêm 1.");
  }
  if (grade === 2) {
    const max = 20 + scale * 98;
    const kind = int(0, 4);
    if (kind <= 1) {
      const a = int(10, max - 1), b = int(1, Math.max(1, max - a));
      const answer = a + b;
      return make(`${a} + ${b} = ?`, String(answer), [String(answer + 1), String(answer - 1), String(answer + 10)], "Cộng lần lượt hàng đơn vị và hàng chục.");
    }
    if (kind === 2) {
      const a = int(20, max), b = int(1, a);
      const answer = a - b;
      return make(`${a} - ${b} = ?`, String(answer), [String(answer + 1), String(Math.max(0, answer - 1)), String(a + b)], "Trừ theo từng hàng, chú ý mượn nếu cần.");
    }
    if (kind === 3) {
      const a = int(2, 5), b = int(2, 9), answer = a * b;
      return make(`${a} × ${b} = ?`, String(answer), [String(answer + a), String(answer - b), String(answer + 2)], "Dùng phép cộng lặp hoặc bảng nhân.");
    }
    const a = int(2, 5), answer = int(2, 9), total = a * answer;
    return make(`${total} : ${a} = ?`, String(answer), [String(answer + 1), String(Math.max(1, answer - 1)), String(total + a)], "Tìm số mà nhân với ${a} được ${total}.");
  }
  if (grade === 3) {
    const kind = int(0, 4), max = 100 + scale * 180;
    if (kind === 0) {
      const a = int(2, 9), b = int(2, 9), answer = a * b;
      return make(`${a} × ${b} = ?`, String(answer), [String(answer + a), String(answer - b), String(a + b)], "Vận dụng bảng nhân.");
    }
    if (kind === 1) {
      const subject = pick(["They", "We", "I", "My friends", "The children", "He", "She", "My brother", "My sister"]);
      const answer = ["He", "She", "My brother", "My sister"].includes(subject) ? "has" : "have";
      const object = pick(["two storybooks", "a new school bag", "three pencils", "a red bicycle"]);
      const context = pick(["at home", "before school", "in the classroom", "during the English lesson"]);
      return make(`${subject} ___ ${object} ${context}.`, answer, ["has", "have", "having"].filter(x => x !== answer).concat(["is"]), "Dùng have với I, you, we, they và has với he, she, it.");
    }
    if (kind === 2) {
      const a = int(100, max), b = int(100, max), answer = a + b;
      return make(`${a} + ${b} = ?`, String(answer), [String(answer + 10), String(answer - 10), String(a + b + 100)], "Đặt tính thẳng cột các chữ số cùng hàng.");
    }
    if (kind === 3) {
      const a = int(10, 30 + scale * 10), b = int(5, 20 + scale * 5), answer = 2 * (a + b);
      return make(`Hình chữ nhật dài ${a} cm, rộng ${b} cm. Chu vi là bao nhiêu?`, `${answer} cm`, [`${a + b} cm`, `${a * b} cm`, `${answer + 2} cm`], "Chu vi = (chiều dài + chiều rộng) × 2.");
    }
    const a = int(2, 9), b = int(2, 9), answer = a * b;
    return make(`Có ${a} hộp, mỗi hộp ${b} chiếc bút. Có tất cả bao nhiêu chiếc bút?`, String(answer), [String(answer + a), String(answer - b), String(a + b)], "Số đồ vật bằng số hộp nhân số đồ vật mỗi hộp.");
  }
  if (grade === 4) {
    if (kind === 0) {
      const subject = pick(["We", "Mai", "Nam", "My friends", "The children"]);
      const activity = pick(["football", "badminton", "chess", "volleyball"]);
      const context = pick(["after school", "at the sports center", "last weekend", "in the playground", "with our classmates"]);
      return make(`${subject} ___ ${activity} ${context}.`, "played", ["play", "plays", "playing"], "Dùng thì quá khứ đơn cho hoạt động đã xảy ra.");
    }
    if (kind === 1) {
      const subject = pick(["The children", "Mai and Nam", "My friends", "The boys"]);
      const activity = pick([["run", "running"], ["dance", "dancing"], ["sing", "singing"], ["play", "playing"]]);
      const context = pick(["in the school yard", "at the park", "near the playground", "after class", "during break time"]);
      return make(`Look! ${subject} ___ ${context}.`, `are ${activity[1]}`, ["play", "plays", "played"], "Look! diễn tả hành động đang xảy ra; dùng are + V-ing.");
    }
    if (kind === 2) {
      const pairs = [["A giraffe", "a goat", "tall", "taller"], ["An elephant", "a dog", "big", "bigger"], ["A train", "a bicycle", "fast", "faster"], ["A whale", "a fish", "large", "larger"]];
      const item = pick(pairs);
      const context = pick(["in the animal world", "on a race track", "in a size comparison", "in a science lesson", "in the story"]);
      return make(`${item[0]} is ___ than ${item[1]} ${context}.`, item[3], [item[2], `${item[2]}est`, `more ${item[2]}`], "Dùng dạng so sánh hơn để so sánh hai sự vật.");
    }
    if (kind === 3) {
      const subject = pick(["I", "We", "Mai", "Nam", "My sister"]);
      const action = pick(["brush my teeth", "do homework", "read books", "help my parents"]);
      const context = pick(["before bedtime", "after school", "every morning", "on weekdays", "at home"]);
      return make(`${subject} ___ ${action} ${context}.`, "always", ["yesterday", "tomorrow", "last"], "Always diễn tả tần suất.");
    }
    const prompts = [["ask about a place", "Where"], ["ask about a person", "Who"], ["ask about a time", "When"], ["ask about a reason", "Why"]];
    const item = pick(prompts);
    const context = pick(["in an interview", "during a conversation", "at school", "when planning a trip", "in a story"]);
    return make(`${name} wants to ${item[0]} ${context}. Which question word should be used?`, item[1], prompts.filter(x => x[1] !== item[1]).slice(0, 3).map(x => x[1]), "Chọn từ để hỏi phù hợp với thông tin cần biết.");
  }
  if (kind === 0) {
    const subject = pick(["We", "I", "Mai", "Nam", "My family"]);
    const activity = pick(["visit our grandparents", "go to the museum", "have a picnic", "travel to Da Nang"]);
    const context = pick(["next Sunday", "during the summer holiday", "after the exam", "next weekend", "in December"]);
    return make(`${subject} ___ ${activity} ${context}.`, "will", ["did", "are", "was"], "Will dùng để nói về tương lai.");
  }
  if (kind === 1) {
    const adjectives = [["small", "smallest"], ["tall", "tallest"], ["fast", "fastest"], ["young", "youngest"]];
    const item = pick(adjectives);
    const context = pick(["in the group", "of all the animals", "in the class", "on the team", "in the family"]);
    return make(`Choose the superlative form of “${item[0]}” for ${name} ${context}.`, item[1], [`${item[0]}er`, `more ${item[0]}`, `most ${item[0]}`], "Tính từ ngắn thường thêm -est ở so sánh nhất.");
  }
  if (kind === 2) {
    const advice = pick(["wear a helmet when riding a bike", "wash your hands before eating", "drink enough water", "do your homework"]);
    const context = pick(["to stay safe", "to stay healthy", "before school", "every day", "at home"]);
    return make(`${name}, you ___ ${advice} ${context}.`, "should", ["shouldn't to", "are", "did"], "Should dùng để đưa ra lời khuyên.");
  }
  if (kind === 3) {
    const clauses = [["I stayed home", "I was ill"], ["She wore a coat", "it was cold"], ["We were happy", "we won the game"], ["He took an umbrella", "it was raining"]];
    const item = pick(clauses);
    const context = pick(["yesterday", "in the afternoon", "on the way to school", "during the holiday", "last night"]);
    return make(`${name} says: ${item[0]} ___ ${item[1]} ${context}.`, "because", ["but", "or", "although of"], "Because dùng để nối nguyên nhân với kết quả.");
  }
  const subject = pick(["She", "He", "They", "My parents", "Mai"]);
  const place = pick(["the museum", "the zoo", "the library", "the park"]);
  const context = pick(["with her family", "after lunch", "during the holiday", "with their classmates", "in the morning"]);
  return make(`${subject} ___ to ${place} last Sunday ${context}.`, "went", ["go", "goes", "going"], "Go có dạng quá khứ là went.");
};

export const generateGradeQuestions = (
  subject: PracticeSubject,
  grade: number,
  level: number,
  count: number,
  seen: Set<string>,
): PracticeQuestion[] => {
  const safeGrade = Math.max(1, Math.min(5, Math.floor(grade) || 1));
  const safeLevel = Math.max(1, Math.min(100, Math.floor(level) || 1));
  const safeCount = Math.max(0, Math.min(20, Math.floor(count) || 0));
  const stage = safeLevel;
  const output: PracticeQuestion[] = [];
  const local = new Set<string>();
  let attempts = 0;
  while (output.length < safeCount && attempts < safeCount * 100) {
    attempts++;
    const q = subject === "math"
      ? mathQuestion(safeGrade, stage)
      : subject === "vietnamese"
        ? vietnameseQuestion(safeGrade, stage)
        : englishQuestion(safeGrade, stage);
    const normalized = q.prompt.normalize("NFC").toLocaleLowerCase("vi").replace(/\s+/g, " ").trim();
    if (local.has(normalized) || seen.has(normalized)) continue;
    local.add(normalized);
    seen.add(normalized);
    output.push(q);
  }
  return output;
};
