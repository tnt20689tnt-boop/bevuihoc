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
      const divisor = int(2, 9), answer = int(2, 20 + scale * 2), total = divisor * answer;
      return make(`${total} : ${divisor} = ?`, String(answer), [String(answer + 1), String(answer - 1), String(total - divisor)], "Phép chia là phép tính ngược của phép nhân.");
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
    const kind = int(0, 4), max = 1000 + scale * 9000;
    if (kind === 0) {
      const a = int(100, max), b = int(2, 9), answer = a * b;
      return make(`${a} × ${b} = ?`, String(answer), [String(answer + b), String(answer - a), String(a + b)], "Nhân lần lượt theo từng hàng.");
    }
    if (kind === 1) {
      const divisor = int(2, 9), answer = int(100, 500 + scale * 100), total = divisor * answer;
      return make(`${total} : ${divisor} = ?`, String(answer), [String(answer + 10), String(answer - 10), String(total - divisor)], "Thực hiện phép chia theo thứ tự từ trái sang phải.");
    }
    if (kind === 2) {
      const denominator = int(3, 12), numerator = int(1, denominator - 1);
      return make(`Phân số nào bằng ${numerator}/${denominator} khi nhân cả tử và mẫu với 2?`, `${numerator * 2}/${denominator * 2}`, [`${numerator + 1}/${denominator * 2}`, `${numerator * 2}/${denominator}`, `${numerator}/${denominator * 2}`], "Nhân cả tử số và mẫu số với cùng một số khác 0.");
    }
    if (kind === 3) {
      const a = int(10, 100 + scale * 10), b = int(10, 80 + scale * 8), answer = a * b;
      return make(`Hình chữ nhật dài ${a} m, rộng ${b} m. Diện tích là?`, `${answer} m²`, [`${2 * (a + b)} m²`, `${a + b} m²`, `${answer + a} m²`], "Diện tích hình chữ nhật = dài × rộng.");
    }
    const a = int(1000, max), b = int(1000, max), answer = a + b;
    return make(`${a} + ${b} = ?`, String(answer), [String(answer + 100), String(answer - 100), String(a + b + 1000)], "Cộng các chữ số theo từng hàng.");
  }
  const kind = int(0, 4);
  if (kind === 0) {
    const a = int(10, 999) / 10, b = int(10, 999) / 10, answer = Math.round((a + b) * 100) / 100;
    return make(`${a.toFixed(1)} + ${b.toFixed(1)} = ?`, answer.toFixed(2), [(answer + 0.1).toFixed(2), (answer - 0.1).toFixed(2), (answer + 1).toFixed(2)], "Đặt thẳng hàng các chữ số cùng hàng thập phân.");
  }
  if (kind === 1) {
    const denominator = int(3, 12), a = int(1, denominator - 1), b = int(1, denominator - a);
    return make(`${a}/${denominator} + ${b}/${denominator} = ?`, `${a + b}/${denominator}`, [`${a + b + 1}/${denominator}`, `${a + b}/${denominator + 1}`, `${Math.max(0, a - b)}/${denominator}`], "Giữ nguyên mẫu số và cộng các tử số.");
  }
  if (kind === 2) {
    const percent = pick([10, 20, 25, 40, 50, 75]), total = int(2, 20 + scale * 10) * 10, answer = total * percent / 100;
    return make(`${percent}% của ${total} là bao nhiêu?`, String(answer), [String(answer + total / 10), String(answer - total / 10), String(answer + percent)], "Lấy số đó nhân với phần trăm rồi chia 100.");
  }
  if (kind === 3) {
    const a = int(2, 20 + scale * 5), b = int(2, 15 + scale * 3), h = int(2, 10 + scale * 2), answer = a * b * h;
    return make(`Hộp chữ nhật dài ${a} cm, rộng ${b} cm, cao ${h} cm. Thể tích là?`, `${answer} cm³`, [`${a * b} cm³`, `${2 * (a + b + h)} cm³`, `${answer + a} cm³`], "Thể tích = dài × rộng × cao.");
  }
  const speed = int(20, Math.min(150, 60 + scale)), hours = int(2, 8), answer = speed * hours;
  return make(`Một xe đi với vận tốc ${speed} km/giờ trong ${hours} giờ. Quãng đường là?`, `${answer} km`, [`${speed + hours} km`, `${answer - speed} km`, `${answer + hours} km`], "Quãng đường = vận tốc × thời gian.");
};

const vietnameseQuestion = (grade: number, stage: number): PracticeQuestion => {
  const words = [
    ["chăm chỉ", "siêng năng", "lười biếng", "thờ ơ"], ["dũng cảm", "can đảm", "nhút nhát", "yếu đuối"],
    ["vui vẻ", "hớn hở", "buồn bã", "ủ rũ"], ["bảo vệ", "giữ gìn", "phá hoại", "làm hỏng"],
    ["nhanh nhẹn", "lanh lợi", "chậm chạp", "vụng về"], ["hiền lành", "nhân hậu", "độc ác", "hung dữ"],
  ];
  const syllables = ["trăng", "sáng", "sách", "trường", "chim", "phượng", "biển", "rừng", "thầy", "cô", "bạn", "ước mơ"];
  const names = ["Lan", "Minh", "Hoa", "Nam", "Mai", "An", "Bình", "Hà"];
  const name = pick(names), pair = pick(words);
  const stageKind = (stage - 1) % 5;
  if (grade === 1) {
    if (stageKind === 0) {
      const letter = pick(["a", "ă", "â", "b", "c", "d", "đ", "e", "ê", "g", "h", "i", "k", "l", "m", "n", "o", "ô", "ơ", "p", "q", "r", "s", "t", "u", "ư", "v", "x", "y"]);
      const place = pick(["trên bảng lớp", "trong quyển vở", "trên thẻ chữ", "ở góc thư viện"]);
      return make(`Bạn ${name} nhìn ${place}. Chữ nào giống chữ “${letter}”?`, letter, ["b", "d", "m"].filter(x => x !== letter).concat(["a", "e", "o"].filter(x => x !== letter)), "Quan sát nét chữ và dấu của chữ cái.");
    }
    if (stageKind === 1) {
      const onset = pick(["b", "m", "c", "g", "h", "t"]);
      const examples: Record<string, string[]> = { b: ["ba", "bé", "bà"], m: ["mẹ", "mèo", "mũ"], c: ["cá", "cô", "cờ"], g: ["gà", "gỗ", "gấu"], h: ["hoa", "hồ", "hè"], t: ["táo", "tay", "tủ"] };
      const answer = pick(examples[onset]!);
      const allWords = Object.values(examples).flat();
      const distractors = shuffle(allWords.filter(value => !examples[onset]!.includes(value))).slice(0, 3);
      const displayed = shuffle([answer, ...distractors]);
      return make(`${name} đọc các tiếng: ${displayed.join(", ")}. Tiếng nào bắt đầu bằng âm “${onset}”?`, answer, distractors, "Nghe âm đầu tiên khi đọc tiếng.");
    }
    if (stageKind === 2) {
      const rhymeGroups = [["an", "bàn", "lan", "can", "tan"], ["ong", "bóng", "sông", "cong", "mong"], ["at", "cát", "mát", "hát", "bát"], ["ang", "bàng", "sáng", "nàng", "mang"], ["ơi", "chơi", "bơi", "lời", "mời"]];
      const group = pick(rhymeGroups);
      const answer = group[int(1, 4)]!;
      const distractors = shuffle(rhymeGroups.filter(item => item[0] !== group[0]).map(item => item[int(1, 4)]!)).slice(0, 3);
      const displayed = shuffle([answer, ...distractors]);
      return make(`${name} nhìn các thẻ tiếng: ${displayed.join(", ")}. Tiếng nào có vần “${group[0]}”?`, answer, distractors, "Đọc phần vần ở cuối tiếng.");
    }
    if (stageKind === 3) {
      const action = pick(["đi học", "đọc sách", "vẽ tranh", "đá bóng", "hát múa"]);
      const time = pick(["Mỗi buổi sáng", "Sau giờ học", "Vào ngày chủ nhật", "Hôm nay"]);
      const correct = `${time}, ${name} ${action}.`;
      return make(`Chọn cách viết đúng câu: “${correct}”`, correct, [`${time.toLowerCase()}, ${name.toLowerCase()} ${action}.`, `${correct.slice(0, -1)}`, `${time}, ${name.toUpperCase()} ${action}.`], "Đầu câu viết hoa và cuối câu có dấu chấm.");
    }
    const action = pick(["chạy", "đọc", "hát", "viết", "vẽ", "nhảy", "bơi", "cười"]);
    const place = pick(["ở sân trường", "trong lớp", "ở công viên", "tại nhà"]);
    return make(`Trong câu “${name} đang ${action} ${place}”, từ nào chỉ hoạt động?`, action, [name, "đang", place], "Từ chỉ hoạt động cho biết người hoặc vật làm gì.");
  }
  if (grade === 2) {
    if (stageKind === 0) {
      const noun = pick(["quyển vở", "cây bàng", "con mèo", "cô giáo", "chiếc xe", "bông hoa", "dòng sông", "ngôi trường"]);
      return make(`Trong câu “${name} nhìn thấy ${noun}”, từ nào chỉ sự vật?`, noun, ["chạy", "xinh đẹp", "nhanh chóng"], "Từ chỉ sự vật gọi tên người, vật, cây cối.");
    }
    if (stageKind === 1) {
      const adjective = pick(["hiền lành", "xanh biếc", "cao lớn", "chăm ngoan", "dịu dàng", "rực rỡ", "sạch sẽ", "vui vẻ"]);
      return make(`Bạn ${name} được khen là “${adjective}”. Từ nào chỉ đặc điểm?`, adjective, ["đọc sách", "cái bàn", "học sinh"], "Từ chỉ đặc điểm nêu tính chất hoặc màu sắc.");
    }
    if (stageKind === 2) {
      const action = pick(["đang viết", "nhảy dây", "đọc sách", "quét nhà", "tưới cây", "xếp hàng", "đàn hát", "tập thể dục"]);
      return make(`Mỗi sáng, ${name} thường ${action}. Cụm từ nào chỉ hoạt động?`, action, ["màu đỏ", "hiền hậu", "quyển truyện"], "Từ chỉ hoạt động trả lời câu hỏi làm gì.");
    }
    if (stageKind === 3) { const context = pick(["trong bài đọc", "ở lớp học", "trong câu chuyện", "khi miêu tả bạn bè"]); return make(`Bạn ${name} tìm từ trái nghĩa với “${pair[0]}” ${context}. Từ cần tìm là gì?`, pair[2], [pair[1], pair[3], "vui vẻ"], "Tìm từ có nghĩa trái ngược."); }
    const topics = [
      ["hỏi về lớp học", `Bạn ${name} học lớp mấy?`],
      ["hỏi về việc trực nhật", `Hôm nay ${name} trực nhật phải không?`],
      ["hỏi về quyển sách", `${name} đang đọc quyển sách nào?`],
      ["hỏi về người đi cùng", `Ai cùng ${name} đến thư viện?`],
      ["hỏi về thời gian", `Khi nào ${name} đến trường?`],
      ["hỏi về địa điểm", `${name} đang học ở đâu?`],
    ];
    const topic = pick(topics);
    const context = pick(["trong giờ học", "khi trò chuyện", "trong bài tập đọc"]);
    return make(`Trong tình huống ${context}, câu nào dùng để ${topic[0]}?`, topic[1], [`Bạn ${name} học lớp hai.`, `Ôi, quyển sách đẹp quá!`, `Hãy mở sách ra.`], "Câu hỏi dùng để hỏi và thường kết thúc bằng dấu hỏi.");
  }
  if (grade === 3) {
    if (stageKind === 0) {
      const noun = pick(["học sinh", "dòng sông", "ước mơ", "cánh đồng", "bầu trời", "bác sĩ", "tiếng chim", "tình bạn"]);
      const scene = pick(["trên đường đến trường", "trong buổi tham quan", "ở công viên", "trong bài văn"]);
      return make(`Trong câu “${name} ngắm ${noun} ${scene}”, từ nào là danh từ?`, noun, ["chạy", "xanh", "nhanh nhẹn"], "Danh từ gọi tên người, vật, hiện tượng, khái niệm.");
    }
    if (stageKind === 1) {
      const verb = pick(["suy nghĩ", "bảo vệ", "xây dựng", "lắng nghe", "tìm hiểu", "chia sẻ", "khám phá", "giúp đỡ"]);
      const object = pick(["thiên nhiên", "bạn bè", "quê hương", "môi trường"]);
      return make(`Trong câu “${name} ${verb} ${object} mỗi ngày”, từ nào là động từ?`, verb, ["bầu trời", "xinh đẹp", "thông minh"], "Động từ chỉ hoạt động hoặc trạng thái.");
    }
    if (stageKind === 2) {
      const adjective = pick(["trong trẻo", "rộng lớn", "dũng cảm", "dịu dàng", "kiên trì", "mênh mông", "thân thiện", "sáng suốt"]);
      const scene = pick(["khi tham gia hoạt động nhóm", "trong buổi dã ngoại", "lúc giúp đỡ bạn", "trong giờ học"]);
      return make(`Từ nào miêu tả đặc điểm của ${name} ${scene} trong cụm “${name} rất ${adjective}”?`, adjective, ["học tập", "bàn ghế", "cây cối"], "Tính từ chỉ đặc điểm, tính chất.");
    }
    if (stageKind === 3) { const action = pick(["đọc", "viết", "trồng", "chăm sóc", "bảo vệ"]); const object = pick(["sách", "cây xanh", "môi trường", "bài tập"]); return make(`Trong câu “${name} đang ${action} ${object}”, từ nào là động từ?`, action, ["chăm chỉ", name, object], "Động từ nêu hoạt động của chủ thể."); }
    const proverbs = ["Thương người như thể thương thân", "Lá lành đùm lá rách", "Một con ngựa đau cả tàu bỏ cỏ", "Chị ngã em nâng"];
    const proverb = pick(proverbs);
    const theme = pick(["lòng nhân ái", "tinh thần đoàn kết", "sự sẻ chia", "giúp đỡ người gặp khó khăn"]);
    const context = pick(["trong giờ sinh hoạt lớp", "ở tiết học đạo đức", "khi viết đoạn văn", "trong câu chuyện về tình bạn"]);
    return make(`Bạn ${name} chọn tục ngữ cho chủ đề ${theme} ${context}. Câu nào phù hợp?`, proverb, proverbs.filter(x => x !== proverb).slice(0, 3), "Chọn câu nói về lòng nhân ái và sự sẻ chia.");
  }
  if (grade === 4) {
    if (stageKind === 0) { const action = pick(["chăm sóc vườn rau", "đọc sách trong thư viện", "tưới cây ngoài sân", "giúp mẹ nấu cơm"]); const context = pick(["trong bài kể chuyện", "khi tả hoạt động hằng ngày", "ở giờ luyện câu", "trong đoạn văn"]); return make(`Trong ${context}, câu nào thuộc kiểu Ai làm gì về hoạt động của ${name}?`, `${name} đang ${action}.`, [`${name} rất chăm chỉ.`, `${name} là học sinh lớp bốn.`, `Ôi, ${action} thật vui!`], "Kiểu câu này nêu chủ thể và hoạt động."); }
    if (stageKind === 1) {
      const reduplicative = pick(["lung linh", "rì rào", "lấp lánh", "xanh xao", "long lanh", "ào ào", "thăm thẳm", "lập lòe"]);
      const context = pick(["trong bài văn tả cảnh", "khi miêu tả âm thanh", "ở bài tập từ láy", "trong đoạn văn của bạn"]);
      return make(`Bạn ${name} tìm từ láy ${context}. Từ nào trong nhóm sau là từ láy: ${reduplicative}, bàn ghế, sách vở, học sinh?`, reduplicative, ["bàn ghế", "sách vở", "học sinh"], "Từ láy có sự lặp lại âm hoặc vần.");
    }
    if (stageKind === 2) {
      const compound = pick(["bảo vệ", "học sinh", "quê hương", "bàn ghế", "sách vở", "hoa quả", "nhà cửa", "thầy cô"]);
      const context = pick(["trong bài tập phân loại từ", "khi viết đoạn văn", "ở tiết Tiếng Việt", "trong trò chơi ghép từ"]);
      return make(`Trong ${context}, bạn ${name} cần tìm từ ghép. Từ nào trong nhóm sau là từ ghép: ${compound}, long lanh, lấp lánh, rì rào?`, compound, ["long lanh", "lấp lánh", "rì rào"], "Từ ghép gồm các tiếng có quan hệ về nghĩa.");
    }
    if (stageKind === 3) { const activity = pick(["đang đọc truyện", "đang tưới cây", "đang viết bài", "đang chăm sóc hoa"]); const object = pick(["trong vườn", "ở lớp", "sau giờ học"]); const context = pick(["trong giờ luyện ngữ pháp", "khi phân tích câu", "ở bài tập đọc hiểu", "trong vở bài tập"]); return make(`${context}: trong câu “${name} ${activity} ${object}”, chủ ngữ là gì?`, name, [activity, object, "truyện"], "Chủ ngữ thường trả lời câu hỏi Ai hoặc Cái gì."); }
    const request = pick(["hãy giữ gìn sách vở", "giúp cô xếp bàn ghế", "đọc bài thật kỹ", "chăm sóc cây xanh"]);
    const context = pick(["trong giờ học", "khi làm việc nhóm", "ở thư viện", "trong buổi lao động"]);
    return make(`Bạn ${name} muốn nhờ các bạn ${request} ${context}. Câu nào là câu khiến?`, `Các bạn hãy ${request} nhé!`, [`Các bạn đang ${request}.`, `Ai đã ${request}?`, "Ôi, việc đó thật vui!"], "Câu khiến dùng để yêu cầu, đề nghị hoặc khuyên bảo.");
  }
  if (stageKind === 0) {
    const pronoun = pick(["Chúng em", "Chúng tôi", "Mình", "Tôi", "Các bạn"]);
    const action = pick(["bảo vệ môi trường", "đọc sách mỗi ngày", "giúp đỡ bạn bè", "chăm sóc vườn trường"]);
    const context = pick(["trong giờ sinh hoạt", "ở câu lạc bộ", "trong buổi lao động", "sau giờ học"]);
    return make(`Bạn ${name} viết câu ${context}: “${pronoun} cùng nhau ${action}”. Đại từ xưng hô là từ nào?`, pronoun, ["cùng nhau", action, "mỗi ngày"], "Đại từ xưng hô dùng để chỉ người đang nói, nghe hoặc được nhắc đến.");
  }
  if (stageKind === 1) {
    const relations = [
      ["nguyên nhân – kết quả", "Vì… nên…", ["Tuy… nhưng…", "Nếu… thì…", "Không những… mà còn…"]],
      ["giả thiết – kết quả", "Nếu… thì…", ["Vì… nên…", "Tuy… nhưng…", "Không những… mà còn…"]],
      ["tương phản", "Tuy… nhưng…", ["Vì… nên…", "Nếu… thì…", "Không những… mà còn…"]],
      ["tăng tiến", "Không những… mà còn…", ["Vì… nên…", "Nếu… thì…", "Tuy… nhưng…"]],
    ] as const;
    const relation = pick(relations);
    const context = pick(["trong bài đọc hiểu", "khi nối hai vế câu", "ở bài tập ngữ pháp", "trong đoạn văn của bạn"]);
    return make(`Bạn ${name} đang làm bài ${context}. Cặp quan hệ từ nào biểu thị quan hệ ${relation[0]}?`, relation[1], [...relation[2]], "Xác định ý nghĩa quan hệ giữa hai vế câu.");
  }
  if (stageKind === 2) {
    const secondName = pick(names);
    const firstAction = pick(["đọc sách", "tưới cây", "làm bài tập", "vẽ tranh"]);
    const secondAction = pick(["quét nhà", "xếp sách", "chơi cờ", "viết bài"]);
    return make(`Câu ghép nào diễn tả hai hoạt động của ${name} và ${secondName}?`, `${name} ${firstAction}, còn ${secondName} ${secondAction}.`, [`${name} đang ${firstAction}.`, `${secondName} rất chăm chỉ.`, "Bầu trời hôm nay xanh biếc."], "Câu ghép có từ hai cụm chủ ngữ – vị ngữ trở lên.");
  }
  if (stageKind === 3) {
    const synonyms = [["nhân hậu", "nhân ái"], ["siêng năng", "chăm chỉ"], ["dũng cảm", "can đảm"], ["bao la", "mênh mông"], ["hạnh phúc", "sung sướng"], ["trung thực", "thật thà"]];
    const item = pick(synonyms);
    const context = pick(["trong bài văn", "khi miêu tả một người", "trong câu chuyện", "ở bài tập từ đồng nghĩa"]);
    return make(`Bạn ${name} cần tìm từ gần nghĩa với “${item[0]}” ${context}. Từ nào phù hợp?`, item[1], ["độc ác", "ích kỷ", "thô lỗ"], "Tìm từ có nghĩa gần giống.");
  }
  const image = pick(["Mặt trời như quả cầu lửa", "Tiếng suối trong như tiếng hát", "Bạn Nam nhanh như sóc", "Mái tóc bà trắng như mây"]);
  const context = pick(["trong bài văn miêu tả", "ở giờ đọc hiểu", "trong câu chuyện của bạn", "khi phân tích hình ảnh"]);
  return make(`Bạn ${name} phân tích câu “${image}” ${context}. Biện pháp tu từ được sử dụng là gì?`, "So sánh", ["Nhân hóa", "Điệp từ", "Ẩn dụ"], "Từ ngữ so sánh hoặc hình ảnh tương đồng giúp nhận ra phép so sánh.");
};

const englishQuestion = (grade: number, stage: number): PracticeQuestion => {
  const animals = ["cat", "dog", "bird", "fish", "rabbit", "tiger", "elephant", "monkey"];
  const colors = ["red", "blue", "green", "yellow", "purple", "orange", "black", "white"];
  const nouns = ["book", "pencil", "school", "teacher", "friend", "garden", "library", "family"];
  const name = pick(["Mai", "Nam", "Linh", "Tom", "Anna", "Ben"]);
  const kind = (stage - 1) % 5;
  if (grade === 1) {
    if (kind === 0) { const word = pick(animals); const context = pick(["at the zoo", "in a picture book", "on a flashcard"]); return make(`What does ${name} call this animal ${context}: “${word}”?`, ({cat:"con mèo",dog:"con chó",bird:"con chim",fish:"con cá",rabbit:"con thỏ",tiger:"con hổ",elephant:"con voi",monkey:"con khỉ"} as Record<string,string>)[word]!, ["quả táo","quyển sách","bông hoa"], "Nhớ nghĩa của từ chỉ con vật."); }
    if (kind === 1) { const object = pick(["the sky", "a banana", "grass", "a tomato", "an orange", "the sea"]); const context = pick(["in the garden", "at the beach", "in the fruit basket", "on a sunny day"]); return make(`${name} is looking ${context}. Which color is usually associated with ${object}?`, ({ "the sky":"blue", "a banana":"yellow", "grass":"green", "a tomato":"red", "an orange":"orange", "the sea":"blue" } as Record<string,string>)[object]!, colors.filter(x => x !== ({ "the sky":"blue", "a banana":"yellow", "grass":"green", "a tomato":"red", "an orange":"orange", "the sea":"blue" } as Record<string,string>)[object]!), "Nhớ từ vựng chỉ màu sắc."); }
    if (kind === 2) {
      const days = [["Monday", "Tuesday"], ["Tuesday", "Wednesday"], ["Wednesday", "Thursday"], ["Thursday", "Friday"], ["Friday", "Saturday"], ["Saturday", "Sunday"]];
      const item = pick(days);
      const context = pick(["at school", "in the calendar", "during the weekend", "in the morning"]);
      return make(`${name} checks the calendar ${context}. Which day comes after ${item[0]}?`, item[1]!, ["Monday", "Friday", "Sunday"].filter(x => x !== item[1]), "Học thứ tự các ngày trong tuần.");
    }
    if (kind === 3) { const time = pick([["8 a.m.", "Good morning"], ["2 p.m.", "Good afternoon"], ["6 p.m.", "Good evening"], ["before going to bed", "Good night"]]); const context = pick(["at the school gate", "when meeting a friend", "at home", "on the way to class"]); return make(`What should you say to ${name} ${context} at ${time[0]}?`, time[1]!, ["Good morning", "Goodbye", "Good evening"].filter(x => x !== time[1]), "Chọn lời chào phù hợp với thời điểm."); }
    const object = pick(["book", "pencil", "ruler", "bag", "desk", "chair", "apple", "orange"]);
    const article = /^[aeiou]/i.test(object) ? "an" : "a";
    const context = pick(["in ${name}’s school bag", "on the teacher’s desk", "in the classroom", "at the library"]);
    return make(`Complete the sentence ${context}: This is ___ ${object}.`, article, [article === "a" ? "an" : "a", "are", "am"], "Chọn mạo từ a hoặc an theo âm đầu của danh từ.");
  }
  if (grade === 2) {
    if (kind === 0) { const noun = pick(nouns); const context = pick(["in a school story", "on a vocabulary card", "during an English lesson"]); return make(`${name} sees the word “${noun}” ${context}. What does it mean in Vietnamese?`, ({book:"quyển sách",pencil:"bút chì",school:"trường học",teacher:"giáo viên",friend:"bạn bè",garden:"khu vườn",library:"thư viện",family:"gia đình"} as Record<string,string>)[noun]!, ["con mèo","quả cam","màu xanh"], "Ôn từ vựng quen thuộc."); }
    if (kind === 1) {
      const singular = pick(["box", "bus", "class", "dish", "watch", "baby"]);
      const plural = singular === "baby" ? "babies" : `${singular}es`;
      const context = pick(["in the classroom", "in a reading exercise", "on a vocabulary worksheet"]);\n      return make(`${name} is doing an English exercise ${context}. Choose the plural form of “${singular}”.`, plural, [`${singular}s`, `${singular}ies`, singular], "Chú ý quy tắc thêm -es hoặc đổi y thành -ies.");
    }
    if (kind === 2) { const object = pick(["classmate", "neighbor", "teacher", "cousin", "new friend"]); const context = pick(["at school", "in the playground", "in the classroom", "at the library"]); return make(`Complete the sentence ${context}: ${name} ___ my ${object}.`, "is", ["am", "are", "be"], "Dùng is với chủ ngữ số ít."); }
    if (kind === 3) {
      const prompts = [["asking a name", "What"], ["asking a place", "Where"], ["asking a time", "When"], ["asking a reason", "Why"]];
      const item = pick(prompts);
      const context = pick(["in a conversation", "during an interview", "in a classroom dialogue", "when asking a new friend"]);\n      return make(`${name} needs to ${item[0]} ${context}. Which question word should be used?`, item[1], prompts.filter(x => x[1] !== item[1]).slice(0, 3).map(x => x[1]), "Chọn từ để hỏi phù hợp với thông tin cần biết.");
    }
    const place = pick(["the table", "the school bag", "the chair", "the desk"]);
    const relation = pick(["on", "under", "in"]);
    const context = pick(["in the classroom", "at the library", "on the study desk", "in the bedroom"]);\n    return make(`${name} is describing a pencil ${context}: The pencil is ___ ${place}. Choose the correct preposition.`, relation, ["on", "under", "in"].filter(x => x !== relation).concat(["between"]), "On là ở trên, under là ở dưới, in là ở trong.");
  }
  if (grade === 3) {
    if (kind === 0) {
      const subject = pick(["Mai", "Nam", "Linh", "My brother", "My sister", "Tom"]);
      const verb = pick(["go", "walk", "cycle", "travel"]);
      return make(`Complete: ${subject} ___ to school every day.`, `${verb}s`, [verb, `${verb}ing`, `${verb}ed`], "Với chủ ngữ số ít ở hiện tại đơn, động từ thường thêm -s.");
    }
    if (kind === 1) {
      const subject = pick(["They", "We", "I", "My friends", "The children"]);
      const answer = subject === "They" || subject === "We" || subject === "I" || subject === "My friends" || subject === "The children" ? "have" : "has";
      return make(`Choose the correct form: ${subject} ___ a new school bag.`, answer, ["has", "have", "having"].filter(x => x !== answer).concat(["is"]), "Dùng have với I, you, we, they và has với he, she, it.");
    }
    if (kind === 2) {
      const count = int(2, 8), object = pick(["pencils", "books", "rulers", "erasers", "chairs"]);
      return make(`There ___ ${count} ${object} in the classroom.`, "are", ["is", "am", "be"], "Dùng are với danh từ số nhiều.");
    }
    if (kind === 3) {
      const animal = pick(["A bird", "A fish", "A rabbit", "A horse"]);
      const ability = animal === "A fish" ? "swim" : animal === "A rabbit" ? "jump" : animal === "A horse" ? "run" : "fly";
      return make(`${animal} ___ ${ability}.`, "can", ["cans", "is", "does"], "Sau can dùng động từ nguyên mẫu.");
    }
    return make("Choose the opposite of “early”.", "late", ["fast", "small", "young"], "Late là trái nghĩa của early.");
  }
  if (grade === 4) {
    if (kind === 0) return make("Complete: We ___ football yesterday.", "played", ["play", "plays", "playing"], "Yesterday thường đi với thì quá khứ đơn.");
    if (kind === 1) return make("Look! The children ___ in the park.", "are playing", ["play", "plays", "played"], "Look! diễn tả hành động đang xảy ra.");
    if (kind === 2) return make("A giraffe is ___ than a goat.", "taller", ["tall", "tallest", "more tall"], "So sánh hơn với tính từ ngắn: thêm -er.");
    if (kind === 3) return make("Choose the correct adverb of frequency: I ___ brush my teeth twice a day.", "always", ["yesterday", "tomorrow", "last"], "Always diễn tả tần suất.");
    return make("Choose the correct question: ___ did you go yesterday?", "Where", ["Who", "How much", "What color"], "Where hỏi địa điểm.");
  }
  if (kind === 0) return make("Complete: We ___ visit our grandparents tomorrow.", "will", ["did", "are", "was"], "Will dùng để nói về tương lai.");
  if (kind === 1) return make("Choose the superlative form of “small”.", "smallest", ["smaller", "more small", "most small"], "Tính từ ngắn thường thêm -est ở so sánh nhất.");
  if (kind === 2) return make("Choose the correct advice: You ___ wear a helmet when riding a bike.", "should", ["shouldn't to", "are", "did"], "Should dùng để đưa ra lời khuyên.");
  if (kind === 3) return make("Choose the correct conjunction: I stayed home ___ I was ill.", "because", ["but", "or", "although of"], "Because nêu lý do.");
  return make("Complete: She ___ to the museum last Sunday.", "went", ["go", "goes", "going"], "Go có dạng quá khứ là went.");
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
