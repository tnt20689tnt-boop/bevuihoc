import { generateQuestion, type Question, type Subject } from "./learningEngine";

const viWords: Record<number, { person: string[]; animal: string[]; object: string[]; action: string[]; trait: string[] }> = {
  1: { person: ["bố", "mẹ", "bà", "ông", "cô giáo", "bạn nhỏ"], animal: ["con mèo", "con chó", "con gà", "con vịt", "con cá", "con thỏ"], object: ["cái bàn", "cái ghế", "quyển vở", "cặp sách", "bút chì", "thước kẻ"], action: ["đọc", "viết", "chạy", "nhảy", "hát", "vẽ"], trait: ["xanh", "đỏ", "đẹp", "ngoan", "cao", "nhỏ"] },
  2: { person: ["bác sĩ", "học sinh", "nông dân", "thầy giáo", "công nhân", "bố"], animal: ["voi", "hổ", "sư tử", "chim én", "cá heo", "con sóc"], object: ["thư viện", "bút mực", "bảng lớp", "đồng hồ", "xe đạp", "cánh diều"], action: ["tưới cây", "quét nhà", "đọc sách", "tập thể dục", "chăm sóc", "gieo hạt"], trait: ["chăm chỉ", "dũng cảm", "hiền lành", "nhanh nhẹn", "thật thà", "vui vẻ"] },
  3: { person: ["bác nông dân", "người thợ", "bạn học", "nhạc sĩ", "họa sĩ", "chiến sĩ"], animal: ["đại bàng", "hươu cao cổ", "cá voi", "chim công", "rùa biển", "khỉ"], object: ["kính hiển vi", "bản đồ", "la bàn", "máy tính", "chiếc trống", "quả địa cầu"], action: ["khám phá", "bảo vệ", "sáng tạo", "quan sát", "thảo luận", "thu hoạch"], trait: ["kiên trì", "thân thiện", "sáng suốt", "khiêm tốn", "cần cù", "linh hoạt"] },
  4: { person: ["nhà khoa học", "kiến trúc sư", "nhà văn", "phi công", "thủ thư", "hướng dẫn viên"], animal: ["gấu trúc", "tê giác", "chim hải âu", "rái cá", "linh dương", "cá mập"], object: ["ống nhòm", "từ điển", "thiết bị", "tư liệu", "di tích", "hành trang"], action: ["nghiên cứu", "phát minh", "bảo tồn", "thuyết trình", "tổ chức", "đánh giá"], trait: ["trung thực", "sáng tạo", "nhân hậu", "độc lập", "cẩn thận", "trách nhiệm"] },
  5: { person: ["nhà khảo cổ", "nhà môi trường", "nhà ngoại giao", "nhà thiết kế", "nhà nghiên cứu", "tình nguyện viên"], animal: ["voi châu Á", "gấu Bắc Cực", "đười ươi", "rùa xanh", "báo đốm", "cá voi xanh"], object: ["hệ sinh thái", "di sản", "năng lượng", "tài nguyên", "thí nghiệm", "công trình"], action: ["phân tích", "bảo tồn", "đề xuất", "thuyết phục", "hợp tác", "đóng góp"], trait: ["bao dung", "bền bỉ", "khách quan", "sâu sắc", "linh hoạt", "sáng suốt"] },
};

const enPairs: Record<number, Array<[string, string]>> = {
  1: [["con chim", "Bird"], ["con bò", "Cow"], ["con vịt", "Duck"], ["con thỏ", "Rabbit"], ["quả cam", "Orange"], ["quả nho", "Grape"], ["màu đỏ", "Red"], ["màu xanh", "Green"], ["mẹ", "Mother"], ["anh trai", "Brother"], ["quyển sách", "Book"], ["cái cặp", "Bag"]],
  2: [["bữa sáng", "Breakfast"], ["phòng ngủ", "Bedroom"], ["bệnh viện", "Hospital"], ["siêu thị", "Supermarket"], ["con voi", "Elephant"], ["con hổ", "Tiger"], ["thứ hai", "Monday"], ["Chủ nhật", "Sunday"], ["mưa", "Rain"], ["nắng", "Sunshine"], ["đọc", "Read"], ["viết", "Write"]],
  3: [["bơi", "Swim"], ["nhảy", "Jump"], ["thư viện", "Library"], ["sân chơi", "Playground"], ["bữa trưa", "Lunch"], ["bữa tối", "Dinner"], ["mùa xuân", "Spring"], ["mùa đông", "Winter"], ["cao", "Tall"], ["thấp", "Short"], ["khát nước", "Thirsty"], ["đói bụng", "Hungry"]],
  4: [["thời tiết", "Weather"], ["địa chỉ", "Address"], ["kỳ nghỉ", "Holiday"], ["bảo tàng", "Museum"], ["bưu điện", "Post office"], ["ồn ào", "Noisy"], ["yên tĩnh", "Quiet"], ["nguy hiểm", "Dangerous"], ["môi trường", "Environment"], ["ô nhiễm", "Pollution"], ["tiết kiệm", "Save"], ["lời khuyên", "Advice"]],
  5: [["thành tựu", "Achievement"], ["truyền thống", "Tradition"], ["phát minh", "Invention"], ["năng lượng", "Energy"], ["tình nguyện", "Volunteer"], ["bền vững", "Sustainable"], ["sự lựa chọn", "Choice"], ["thử thách", "Challenge"], ["cải thiện", "Improve"], ["bảo vệ", "Protect"], ["tự tin", "Confident"], ["kiên nhẫn", "Patient"]],
};

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
};

function languageQuestions(grade: number, subject: "vietnamese" | "english"): Question[] {
  const g = Math.max(1, Math.min(5, Math.floor(grade) || 1));
  const result: Question[] = [];
  if (subject === "english") {
    const pairs = enPairs[g] ?? enPairs[3]!;
    pairs.forEach(([vi, en], index) => {
      const distractors = shuffle(pairs.filter((pair) => pair[1] !== en).map((pair) => pair[1])).slice(0, 3);
      result.push({ id: `arena-en-g${g}-${index}`, subject, grade: g, level: 50, question: `What is "${vi}" in English?`, options: shuffle([en, ...distractors]), correctAnswer: en, explanation: `"${vi}" means "${en}" in English.` });
    });
  } else {
    const words = viWords[g] ?? viWords[3]!;
    const groups = [{ label: "người", values: words.person }, { label: "con vật", values: words.animal }, { label: "đồ vật hoặc sự vật", values: words.object }, { label: "hoạt động", values: words.action }, { label: "đặc điểm", values: words.trait }];
    groups.forEach((group, index) => {
      group.values.forEach((word, wordIndex) => {
        const otherWords = shuffle(groups.filter((item) => item.label !== group.label).map((item) => item.values[(wordIndex + index) % item.values.length]!)).slice(0, 3);
        result.push({ id: `arena-vi-g${g}-${index}-${wordIndex}`, subject, grade: g, level: 50, question: `Từ "${word}" thuộc nhóm từ nào?`, options: shuffle([group.label, ...otherWords.map((_, i) => groups.filter((item) => item.label !== group.label)[i]!.label)]), correctAnswer: group.label, explanation: `"${word}" là từ chỉ ${group.label}.` });
      });
    });
  }
  return result;
}

export function createArenaQuestionSet(grade: number, count = 10): Question[] {
  const g = Math.max(1, Math.min(5, Math.floor(grade) || 1));
  const storageKey = `be-vui-hoc:arena-seen:v2:grade-${g}`;
  let seen: string[] = [];
  try { seen = JSON.parse(localStorage.getItem(storageKey) || "[]") as string[]; } catch { seen = []; }
  const seenSet = new Set(seen);
  const pool = [
    ...languageQuestions(g, "vietnamese"),
    ...languageQuestions(g, "english"),
  ];
  const mathCandidates: Question[] = [];
  for (let i = 0; i < 180; i++) mathCandidates.push(generateQuestion("math", g, 50));
  pool.push(...mathCandidates);
  const fresh = shuffle(pool.filter((q) => !seenSet.has(`${q.subject}:${q.question.toLocaleLowerCase()}`)));
  const selected: Question[] = [];
  const used = new Set<string>();
  for (const q of fresh) {
    const key = `${q.subject}:${q.question.toLocaleLowerCase()}`;
    if (used.has(key)) continue;
    used.add(key);
    selected.push(q);
    if (selected.length >= count) break;
  }
  if (selected.length < count) {
    for (const q of shuffle(pool)) {
      const key = `${q.subject}:${q.question.toLocaleLowerCase()}`;
      if (used.has(key)) continue;
      used.add(key);
      selected.push(q);
      if (selected.length >= count) break;
    }
  }
  try {
    const nextSeen = [...seen, ...selected.map((q) => `${q.subject}:${q.question.toLocaleLowerCase()}`)].slice(-1500);
    localStorage.setItem(storageKey, JSON.stringify(nextSeen));
  } catch { /* Storage can be unavailable in private browsing; matches still work. */ }
  return shuffle(selected).slice(0, count);
}
