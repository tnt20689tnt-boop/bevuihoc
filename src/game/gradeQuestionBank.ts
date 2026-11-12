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
    const max = Math.min(100, 10 + scale * 9);
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
      const a = int(10, max), b = int(1, Math.min(max, 1000 - a));
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
  const speed = int(20, 60 + scale * 10), hours = int(2, 8), answer = speed * hours;
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
  const name = pick(names), word = pick(syllables), pair = pick(words);
  const stageKind = (stage - 1) % 5;
  if (grade === 1) {
    if (stageKind === 0) {
      const letter = pick(["a", "ă", "â", "b", "c", "d", "đ", "e", "ê", "g", "h", "i", "k", "l", "m", "n", "o", "ô", "ơ", "p", "q", "r", "s", "t", "u", "ư", "v", "x", "y"]);
      return make(`Chữ nào giống chữ “${letter}”?`, letter, ["b", "d", "m"].filter(x => x !== letter).concat(["a", "e", "o"].filter(x => x !== letter)), "Quan sát nét chữ và dấu của chữ cái.");
    }
    if (stageKind === 1) return make(`Tiếng nào có âm đầu “${pick(["b", "m", "c", "g", "h", "t"])}”?`, pick(["ba", "mẹ", "cá", "gà", "hoa", "táo"]), ["bàn", "mèo", "cô", "gỗ"], "Nghe âm đầu tiên khi đọc tiếng.");
    if (stageKind === 2) return make(`Từ nào có vần “${word.slice(-2)}”?`, word, ["bàn", "mẹ", "cá", "bé"].filter(x => x !== word).concat(["nhà"]), "Đọc phần vần ở cuối tiếng.");
    if (stageKind === 3) return make("Câu nào được viết đúng đầu câu và dấu kết thúc?", "Bé đi học.", ["bé đi học.", "Bé đi học", "bé đi học"], "Đầu câu viết hoa và cuối câu có dấu câu.");
    return make("Từ nào chỉ hoạt động?", pick(["chạy", "đọc", "hát", "viết"]), ["cái bàn", "bông hoa", "màu đỏ"], "Từ chỉ hoạt động cho biết người hoặc vật làm gì.");
  }
  if (grade === 2) {
    if (stageKind === 0) return make("Từ nào chỉ sự vật?", pick(["quyển vở", "cây bàng", "con mèo", "cô giáo"]), ["chạy", "xinh đẹp", "nhanh chóng"], "Từ chỉ sự vật gọi tên người, vật, cây cối.");
    if (stageKind === 1) return make("Từ nào chỉ đặc điểm?", pick(["hiền lành", "xanh biếc", "cao lớn", "chăm ngoan"]), ["đọc sách", "cái bàn", "học sinh"], "Từ chỉ đặc điểm nêu tính chất hoặc màu sắc.");
    if (stageKind === 2) return make("Từ nào chỉ hoạt động?", pick(["đang viết", "nhảy dây", "đọc sách", "quét nhà"]), ["màu đỏ", "hiền hậu", "quyển truyện"], "Từ chỉ hoạt động trả lời câu hỏi làm gì.");
    if (stageKind === 3) return make(`Từ trái nghĩa với “${pair[0]}” là gì?`, pair[2], [pair[1], pair[3], "vui vẻ"], "Tìm từ có nghĩa trái ngược.");
    return make("Câu nào là câu hỏi?", `Bạn ${name} học lớp mấy?`, [`Bạn ${name} học lớp hai.`, `Ôi, quyển sách đẹp quá!`, `Hãy mở sách ra.`], "Câu hỏi dùng để hỏi và thường kết thúc bằng dấu hỏi.");
  }
  if (grade === 3) {
    if (stageKind === 0) return make("Từ nào là danh từ?", pick(["học sinh", "dòng sông", "ước mơ", "cánh đồng"]), ["chạy", "xanh", "nhanh nhẹn"], "Danh từ gọi tên người, vật, hiện tượng, khái niệm.");
    if (stageKind === 1) return make("Từ nào là động từ?", pick(["suy nghĩ", "bảo vệ", "xây dựng", "lắng nghe"]), ["bầu trời", "xinh đẹp", "thông minh"], "Động từ chỉ hoạt động hoặc trạng thái.");
    if (stageKind === 2) return make("Từ nào là tính từ?", pick(["trong trẻo", "rộng lớn", "dũng cảm", "dịu dàng"]), ["học tập", "bàn ghế", "cây cối"], "Tính từ chỉ đặc điểm, tính chất.");
    if (stageKind === 3) return make(`Trong câu “${name} chăm chỉ đọc sách”, từ nào chỉ hoạt động?`, "đọc", ["chăm chỉ", name, "sách"], "Động từ nêu hoạt động của chủ thể.");
    return make("Thành ngữ nào khuyên con người biết yêu thương nhau?", "Thương người như thể thương thân", ["Có công mài sắt có ngày nên kim", "Đi một ngày đàng học một sàng khôn", "Ăn quả nhớ kẻ trồng cây"], "Chọn câu nói trực tiếp về lòng nhân ái.");
  }
  if (grade === 4) {
    if (stageKind === 0) return make("Câu nào thuộc kiểu câu kể Ai làm gì?", `${name} đang chăm sóc vườn rau.`, [`${name} rất chăm chỉ.`, `${name} là học sinh lớp bốn.`, `Ôi, vườn rau đẹp quá!`], "Kiểu câu này nêu chủ thể và hoạt động.");
    if (stageKind === 1) return make("Từ nào là từ láy?", pick(["lung linh", "rì rào", "lấp lánh", "xanh xao"]), ["bàn ghế", "sách vở", "học sinh"], "Từ láy có sự lặp lại âm hoặc vần.");
    if (stageKind === 2) return make("Từ nào là từ ghép?", pick(["bảo vệ", "học sinh", "quê hương", "chăm học"]), ["long lanh", "lấp lánh", "rì rào"], "Từ ghép gồm các tiếng có quan hệ về nghĩa.");
    if (stageKind === 3) return make(`Trong câu “${name} đang đọc truyện”, chủ ngữ là gì?`, name, ["đang đọc", "đọc truyện", "truyện"], "Chủ ngữ thường trả lời câu hỏi Ai hoặc Cái gì.");
    return make("Câu nào là câu khiến?", "Em hãy giữ gìn sách vở nhé!", ["Sách vở rất đẹp.", "Ai đang giữ sách?", "Ôi, sách mới đẹp quá!"], "Câu khiến dùng để yêu cầu, đề nghị hoặc khuyên bảo.");
  }
  if (stageKind === 0) return make("Đại từ trong câu nào được dùng để xưng hô?", "Chúng em sẽ cố gắng học tập.", ["Cánh đồng rất rộng.", "Bầu trời xanh biếc.", "Những bông hoa nở rộ."], "Đại từ có thể dùng để xưng hô hoặc thay thế.");
  if (stageKind === 1) return make("Cặp quan hệ từ nào biểu thị nguyên nhân – kết quả?", "Vì… nên…", ["Tuy… nhưng…", "Nếu… thì…", "Không những… mà còn…"], "Vì nêu nguyên nhân, nên nêu kết quả.");
  if (stageKind === 2) return make("Câu nào là câu ghép?", `${name} đọc sách, còn ${pick(names)} làm bài tập.`, ["Trời hôm nay rất đẹp.", "Những chú chim đang hót.", "Bông hoa màu đỏ."], "Câu ghép có từ hai cụm chủ ngữ – vị ngữ trở lên.");
  if (stageKind === 3) return make("Từ nào gần nghĩa với “nhân hậu”?", pick(["nhân ái", "hiền từ", "tốt bụng"]), ["độc ác", "ích kỷ", "thô lỗ"], "Tìm từ có nghĩa gần giống.");
  return make("Biện pháp tu từ trong câu “Mặt trời như quả cầu lửa” là gì?", "So sánh", ["Nhân hóa", "Điệp từ", "Ẩn dụ"], "Từ “như” báo hiệu phép so sánh.");
};

const englishQuestion = (grade: number, stage: number): PracticeQuestion => {
  const animals = ["cat", "dog", "bird", "fish", "rabbit", "tiger", "elephant", "monkey"];
  const colors = ["red", "blue", "green", "yellow", "purple", "orange", "black", "white"];
  const nouns = ["book", "pencil", "school", "teacher", "friend", "garden", "library", "family"];
  const name = pick(["Mai", "Nam", "Linh", "Tom", "Anna", "Ben"]);
  const kind = (stage - 1) % 5;
  if (grade === 1) {
    if (kind === 0) { const word = pick(animals); return make(`What is “${word}” in Vietnamese?`, ({cat:"con mèo",dog:"con chó",bird:"con chim",fish:"con cá",rabbit:"con thỏ",tiger:"con hổ",elephant:"con voi",monkey:"con khỉ"} as Record<string,string>)[word]!, ["quả táo","quyển sách","bông hoa"], "Nhớ nghĩa của từ chỉ con vật."); }
    if (kind === 1) { const color = pick(colors); return make(`What color is “${color}”?`, color, colors.filter(x => x !== color).slice(0,3), "Nhận biết và đọc tên màu sắc."); }
    if (kind === 2) return make("How many days are there in a week?", "Seven", ["Five", "Six", "Eight"], "Một tuần có bảy ngày.");
    if (kind === 3) return make("Choose the correct greeting in the morning.", "Good morning", ["Good night", "Goodbye", "Good evening"], "Dùng Good morning vào buổi sáng.");
    return make("Complete: This is ___ book.", "a", ["an", "are", "am"], "Dùng a trước danh từ số ít bắt đầu bằng phụ âm.");
  }
  if (grade === 2) {
    if (kind === 0) { const noun = pick(nouns); return make(`What is “${noun}” in Vietnamese?`, ({book:"quyển sách",pencil:"bút chì",school:"trường học",teacher:"giáo viên",friend:"bạn bè",garden:"khu vườn",library:"thư viện",family:"gia đình"} as Record<string,string>)[noun]!, ["con mèo","quả cam","màu xanh"], "Ôn từ vựng quen thuộc."); }
    if (kind === 1) return make("Choose the plural form of “box”.", "boxes", ["boxs", "boxies", "box"], "Danh từ kết thúc bằng x thường thêm -es.");
    if (kind === 2) return make(`Complete: ${name} ___ my friend.`, "is", ["am", "are", "be"], "Dùng is với chủ ngữ số ít.");
    if (kind === 3) return make("Choose the correct question word for asking a name.", "What", ["Where", "How many", "When"], "What is your name? dùng để hỏi tên.");
    return make("Choose the correct preposition: The book is ___ the table.", "on", ["in", "under to", "between of"], "On nghĩa là ở trên bề mặt.");
  }
  if (grade === 3) {
    if (kind === 0) return make(`Complete: ${name} ___ to school every day.`, "goes", ["go", "going", "went"], "Với he/she/tên một người ở hiện tại đơn, động từ thường thêm -s.");
    if (kind === 1) return make("Choose the correct form: They ___ two cats.", "have", ["has", "having", "is"], "Dùng have với they.");
    if (kind === 2) return make("Complete: There ___ three pencils on the desk.", "are", ["is", "am", "be"], "Dùng are với danh từ số nhiều.");
    if (kind === 3) return make("Choose the correct modal verb: A bird ___ fly.", "can", ["cans", "is", "does"], "Sau can dùng động từ nguyên mẫu.");
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
  const stage = Math.ceil(safeLevel / 10);
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
