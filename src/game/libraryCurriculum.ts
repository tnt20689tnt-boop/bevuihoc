import type { Grade, Subject } from "./types";

export type LibraryLesson = {
  title: string;
  knowledge: string;
  example: string;
  exercises: string[];
  guidance: string;
};

export type LibraryVolume = {
  id: string;
  subject: Subject;
  grade: Grade;
  title: string;
  description: string;
  lessons: LibraryLesson[];
};

const TOPICS: Record<Subject, Record<Grade, string[]>> = {
  math: {
    1: ["Các số từ 0 đến 10", "So sánh và sắp xếp số", "Cộng trong phạm vi 10", "Trừ trong phạm vi 10", "Cộng trừ trong phạm vi 20", "Chục và đơn vị", "Hình phẳng quanh em", "Bài toán có lời văn", "Đo độ dài và xem giờ", "Ôn tập cuối năm"],
    2: ["Số đến 100", "Cộng có nhớ trong phạm vi 100", "Trừ có nhớ trong phạm vi 100", "Bảng nhân 2 và 5", "Bảng nhân 3 và 4", "Phép chia và chia đều", "Đơn vị đo độ dài, khối lượng", "Hình học và đường gấp khúc", "Bài toán hai bước tính", "Ôn tập cuối năm"],
    3: ["Số trong phạm vi 10 000", "Cộng trừ trong phạm vi 10 000", "Bảng nhân và bảng chia", "Nhân số có hai chữ số", "Chia số có hai chữ số", "Tìm một phần bằng nhau", "Chu vi hình vuông, hình chữ nhật", "Đơn vị đo và thời gian", "Giải toán có lời văn", "Ôn tập cuối năm"],
    4: ["Số tự nhiên nhiều chữ số", "Yến, tạ, tấn và đơn vị diện tích", "Cộng trừ số tự nhiên", "Nhân và chia số tự nhiên", "Dấu hiệu chia hết", "Phân số và phân số bằng nhau", "So sánh và rút gọn phân số", "Hai đường thẳng và góc", "Chu vi, diện tích hình", "Ôn tập cuối năm"],
    5: ["Ôn tập số tự nhiên và phân số", "Phân số thập phân", "Số thập phân", "Cộng trừ số thập phân", "Nhân chia số thập phân", "Tỉ số phần trăm", "Đổi đơn vị đo", "Diện tích và thể tích", "Vận tốc, quãng đường, thời gian", "Ôn tập và giải toán tổng hợp"],
  },
  viet: {
    1: ["Làm quen âm và chữ", "Ghép vần và đọc tiếng", "Đọc từ và câu ngắn", "Viết chữ thường đúng nét", "Viết hoa đầu câu và tên riêng", "Dấu chấm và dấu hỏi", "Mở rộng vốn từ theo chủ đề", "Nghe kể chuyện và kể lại", "Đọc hiểu đoạn ngắn", "Ôn đọc và viết cuối năm"],
    2: ["Đọc trôi chảy câu và đoạn", "Chính tả nghe viết", "Từ chỉ sự vật", "Từ chỉ hoạt động và đặc điểm", "Câu giới thiệu và câu nêu hoạt động", "Câu hỏi và dấu câu", "Mở rộng vốn từ gia đình, trường học", "Viết đoạn ngắn", "Đọc hiểu và trả lời câu hỏi", "Ôn tập cuối năm"],
    3: ["Danh từ, động từ, tính từ", "Từ đồng nghĩa và trái nghĩa", "Từ chỉ sự vật, hoạt động, đặc điểm", "Câu kể và câu hỏi", "Dấu chấm, phẩy, hai chấm", "So sánh và nhân hóa", "Đọc hiểu văn bản", "Viết đoạn văn kể chuyện", "Viết thư và thông báo", "Ôn tập cuối năm"],
    4: ["Danh từ riêng và danh từ chung", "Động từ và tính từ", "Cấu tạo câu và chủ ngữ", "Vị ngữ và trạng ngữ", "Câu kể, câu hỏi, câu khiến", "Từ ghép và từ láy", "Dấu ngoặc kép và dấu gạch ngang", "Đọc hiểu và cảm nhận", "Văn kể chuyện, miêu tả", "Ôn tập cuối năm"],
    5: ["Từ đồng nghĩa và trái nghĩa", "Từ nhiều nghĩa và từ đồng âm", "Đại từ và quan hệ từ", "Liên kết câu trong đoạn văn", "Câu đơn và câu ghép", "Dấu câu và cách dùng", "Đọc hiểu thơ và truyện", "Tả người và tả cảnh", "Kể chuyện và viết đoạn văn", "Ôn tập cuối cấp"],
  },
  english: {
    1: ["Alphabet and letter sounds", "Numbers from one to ten", "Colours around me", "School things", "Family members", "Animals", "Greetings and introductions", "Simple classroom commands", "Listen and repeat", "Review and speaking practice"],
    2: ["Alphabet review and spelling", "Numbers and age", "Colours and toys", "My family", "My school", "Pets and animals", "Food and drinks", "Days and simple routines", "Short questions and answers", "Review and communication"],
    3: ["Hello and personal information", "School subjects and school things", "Family and friends", "Daily activities", "Numbers, time and dates", "Food and favourite things", "Animals and abilities", "Places around town", "Present simple sentences", "Reading and writing review"],
    4: ["Personal information and hobbies", "Daily routines and time", "School activities", "Jobs and workplaces", "Food, health and sports", "Places and directions", "Present simple and present continuous", "Past activities", "Comparisons and descriptions", "Reading, listening and writing review"],
    5: ["Personal information and future plans", "Daily routines and healthy habits", "Places and directions", "Travel and transport", "Food and the environment", "Past simple", "Present simple and adverbs", "Comparatives and superlatives", "Questions and short paragraphs", "Entrance exam revision"],
  },
};

const MATH_GUIDES: Record<Grade, string> = {
  1: "Đếm bằng que tính hoặc hình vẽ. Đọc kỹ dấu cộng, dấu trừ và kiểm tra kết quả bằng cách đếm lại.",
  2: "Tách số thành chục và đơn vị. Đặt tính thẳng cột; khi cộng hoặc trừ có nhớ, ghi nhớ đúng hàng.",
  3: "Đặt tính theo hàng nghìn, trăm, chục, đơn vị. Với nhân chia, thuộc bảng tính và kiểm tra bằng phép tính ngược.",
  4: "Viết rõ từng bước, quy đồng khi cộng trừ phân số và giữ đúng đơn vị đo trong lời giải.",
  5: "Chuyển dữ kiện về cùng đơn vị, xác định quan hệ giữa các đại lượng rồi trình bày phép tính theo thứ tự.",
};
const MATH_EXAMPLES: Record<Grade, string[]> = {
  1: ["Có 4 quả táo, thêm 3 quả: 4 + 3 = 7 quả.", "8 lớn hơn 5 nên viết 8 > 5.", "9 − 4 = 5; kiểm tra: 5 + 4 = 9."],
  2: ["36 = 3 chục và 6 đơn vị.", "27 + 15 = 42.", "52 − 18 = 34."],
  3: ["2 345 gồm 2 nghìn, 3 trăm, 4 chục và 5 đơn vị.", "125 × 3 = 375.", "864 ÷ 4 = 216."],
  4: ["3/8 + 2/8 = 5/8.", "24 × 15 = 360.", "1 m² = 100 dm²."],
  5: ["2,35 + 1,4 = 3,75.", "25% của 80 là 20.", "Quãng đường = vận tốc × thời gian."],
};
const VIET_EXAMPLES: Record<Grade, string[]> = {
  1: ["Bé đọc câu: “Mẹ đưa bé đến trường.”", "Tên riêng viết hoa: Lan, Việt Nam.", "Cuối câu kể đặt dấu chấm."],
  2: ["Từ chỉ sự vật: bàn, ghế, học sinh.", "Từ chỉ hoạt động: đọc, viết, chạy.", "“Bạn Lan học bài.” là câu kể."],
  3: ["Danh từ: học sinh; động từ: đọc; tính từ: chăm chỉ.", "Đồng nghĩa: chăm chỉ – siêng năng.", "So sánh: Mặt trời đỏ như quả cầu lửa."],
  4: ["Danh từ riêng: Hà Nội; danh từ chung: thành phố.", "Chủ ngữ: “Lan”; vị ngữ: “đang đọc sách”.", "Từ láy: long lanh, chăm chỉ."],
  5: ["Từ nhiều nghĩa: “chân bàn”, “chân người”.", "Quan hệ từ: vì, nên, tuy, nhưng.", "Câu ghép: Trời mưa nên đường trơn."],
};
const EN_EXAMPLES: Record<Grade, string[]> = {
  1: ["Hello! My name is Mai.", "One, two, three, four, five.", "It is red. I see a cat."],
  2: ["How old are you? I am eight.", "This is my family.", "I have a small dog."],
  3: ["What subjects do you like? I like English.", "She goes to school every day.", "There are four books on the desk."],
  4: ["I usually get up at six o'clock.", "She is reading a book now.", "Turn left at the traffic lights."],
  5: ["Yesterday, we visited the museum.", "I will travel to Da Nang next summer.", "You should eat more vegetables."],
};

function createLesson(subject: Subject, grade: Grade, topic: string, index: number): LibraryLesson {
  if (subject === "math") {
    const examples = MATH_EXAMPLES[grade];
    const exercises = grade === 1
      ? ["Tính: 5 + 2 = ?", "Tính: 9 − 3 = ?", "Có 6 bông hoa, thêm 2 bông. Có tất cả bao nhiêu bông?"]
      : grade === 2
        ? ["Tính: 38 + 24 = ?", "Tính: 71 − 36 = ?", "Có 4 hộp, mỗi hộp 5 chiếc bút. Có tất cả bao nhiêu chiếc?"]
        : grade === 3
          ? ["Tính: 246 × 3 = ?", "Tính: 936 ÷ 4 = ?", "Một cửa hàng có 125 kg gạo, bán 38 kg. Còn lại bao nhiêu ki-lô-gam?"]
          : grade === 4
            ? ["Tính: 2/7 + 3/7 = ?", "Tính: 125 × 24 = ?", "Một hình chữ nhật dài 12 cm, rộng 7 cm. Tính chu vi."]
            : ["Tính: 4,25 + 2,8 = ?", "Tìm 15% của 200.", "Một xe đi 45 km trong 1 giờ. Đi trong 3 giờ được bao nhiêu ki-lô-mét nếu vận tốc không đổi?"];
    return {
      title: `Bài ${index + 1}. ${topic} (Lớp ${grade})`,
      knowledge: `${topic} là nội dung quan trọng trong chương trình Toán lớp ${grade}. ${MATH_GUIDES[grade]} Hãy ghi phép tính, trình bày từng bước và ghi đáp số kèm đơn vị nếu đề bài yêu cầu.`,
      example: examples[index % examples.length],
      exercises: exercises.map((exercise) => `${exercise} (chuyên đề: ${topic})`),
      guidance: "Tự làm từng câu vào vở, sau đó kiểm tra phép tính và đơn vị. Với bài toán có lời văn, viết câu lời giải, phép tính và đáp số.",
    };
  }
  if (subject === "viet") {
    const examples = VIET_EXAMPLES[grade];
    const exercises = grade === 1
      ? ["Đọc to một câu có từ 4–6 tiếng.", "Viết một câu giới thiệu tên em.", "Tìm chữ cái đầu trong tên một người thân."]
      : grade === 2
        ? ["Tìm 3 từ chỉ sự vật trong lớp học.", "Đặt câu với từ “chăm chỉ”.", "Viết 3 câu kể về một người bạn."]
        : grade === 3
          ? ["Tìm một danh từ, một động từ và một tính từ trong câu em tự đặt.", "Đặt câu có hình ảnh so sánh.", "Viết đoạn văn 5 câu kể về một việc tốt."]
          : grade === 4
            ? ["Xác định chủ ngữ và vị ngữ trong câu: “Những chú chim hót líu lo.”", "Tìm 2 từ láy miêu tả âm thanh.", "Viết đoạn văn 6–8 câu tả một đồ vật."]
            : ["Đặt câu với một cặp quan hệ từ.", "Tìm nghĩa gốc và nghĩa chuyển của từ “mắt”.", "Viết đoạn văn 8–10 câu tả một cảnh đẹp."];
    return {
      title: `Bài ${index + 1}. ${topic}`,
      knowledge: `Ở lớp ${grade}, khi học nội dung “${topic}”, em cần đọc kỹ ngữ liệu, xác định từ ngữ hoặc chi tiết quan trọng và giải thích bằng câu đầy đủ. Chú ý viết hoa đầu câu, dùng dấu câu phù hợp và kiểm tra chính tả sau khi viết.`,
      example: examples[index % examples.length],
      exercises: exercises.map((exercise) => `${exercise} (ngữ liệu: ${topic})`),
      guidance: "Đáp án có thể khác nhau nếu diễn đạt đúng yêu cầu. Khi tự kiểm tra, đối chiếu đúng nội dung, đủ ý, chính tả, viết hoa và dấu câu.",
    };
  }
  const examples = EN_EXAMPLES[grade];
  const exercises = grade === 1
    ? ["Say the letters A, B, C, D and E.", "Count from one to ten.", "Complete: My name is ____."]
    : grade === 2
      ? ["Answer: How old are you?", "Write three words about your family.", "Complete: I have a ____ (pet)."]
      : grade === 3
        ? ["Complete: She ____ (go) to school every day.", "Write three school subjects in English.", "Answer: What do you do after school?"]
        : grade === 4
          ? ["Write two sentences about your daily routine.", "Complete: They ____ (play) football now.", "Give directions using “turn left” or “turn right”."]
          : ["Change into the past: “I visit my friend.”", "Write three sentences about your next holiday.", "Complete: You ____ eat more fruit. (advice)"];
  return {
    title: `Lesson ${index + 1}. ${topic} (Grade ${grade})`,
    knowledge: `This lesson develops Grade ${grade} vocabulary, sentence patterns and communication for “${topic}”. Read each model sentence aloud, notice the word order, then replace key words to make a sentence about yourself. Listen, repeat, read and write.`,
    example: examples[index % examples.length],
    exercises: exercises.map((exercise) => `${exercise} (topic: ${topic})`),
    guidance: "Check spelling, capital letters and full stops. Practise saying each answer aloud and make sure the sentence matches the question.",
  };
}

export const LIBRARY_VOLUMES: LibraryVolume[] = (["math", "viet", "english"] as Subject[]).flatMap((subject) =>
  ([1, 2, 3, 4, 5] as Grade[]).map((grade) => {
    const topics = TOPICS[subject][grade];
    const subjectName = subject === "math" ? "Toán" : subject === "viet" ? "Tiếng Việt" : "Tiếng Anh";
    return {
      id: `${subject}-grade-${grade}`,
      subject,
      grade,
      title: `${subjectName} lớp ${grade} – Tập bài học và luyện tập`,
      description: `Bộ tài liệu tự biên soạn gồm ${topics.length} chuyên đề, ví dụ và bài luyện tập dành cho học sinh lớp ${grade}.`,
      lessons: topics.map((topic, index) => createLesson(subject, grade, topic, index)),
    };
  }),
);

export function getLibraryVolume(subject: Subject, grade: Grade): LibraryVolume {
  return LIBRARY_VOLUMES.find((volume) => volume.subject === subject && volume.grade === grade)!;
}
