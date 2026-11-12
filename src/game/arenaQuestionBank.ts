import { generateQuestion, type Question, type Subject } from "./learningEngine";

type Draft = Omit<Question, "id" | "level"> & { family: string };

const shuffle = <T,>(items: T[]): T[] => {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j]!, copy[i]!];
  }
  return copy;
};

const unique = (items: string[]) => [...new Set(items)];

function draft(
  subject: Subject,
  grade: number,
  question: string,
  correctAnswer: string,
  distractors: string[],
  explanation: string,
  family: string,
): Draft {
  const wrong = shuffle(unique(distractors.filter((item) => item !== correctAnswer)));
  while (wrong.length < 3) {
    const fallback = ["Không có đáp án nào đúng", "Cả hai đáp án đều đúng", "Không xác định"];
    const candidate = fallback.find((item) => item !== correctAnswer && !wrong.includes(item));
    if (!candidate) break;
    wrong.push(candidate);
  }
  return {
    subject, grade, question, correctAnswer,
    options: shuffle([correctAnswer, ...wrong]),
    explanation, family,
  };
}

const vietnameseDrafts = (grade: number): Draft[] => {
  const result: Draft[] = [];
  const add = (...args: Parameters<typeof draft>) => result.push(draft(...args));

  if (grade === 1) {
    const sets = [
      { name: "người", words: ["bác sĩ", "cô giáo", "bố", "bạn nhỏ", "bà", "chú công an"] },
      { name: "con vật", words: ["con thỏ", "con voi", "con gà", "con cá", "con mèo", "con chim"] },
      { name: "đồ vật", words: ["cặp sách", "bút chì", "quyển vở", "cái bàn", "thước kẻ", "cái trống"] },
      { name: "hoạt động", words: ["đọc sách", "chạy", "vẽ tranh", "quét nhà", "hát", "nhảy dây"] },
      { name: "đặc điểm", words: ["hiền lành", "cao", "xanh", "chăm chỉ", "nhỏ", "xinh đẹp"] },
    ];
    sets.forEach((set) => set.words.forEach((word) => {
      const others = sets.filter((item) => item.name !== set.name).map((item) => item.name);
      const mode = result.length % 3;
      if (mode === 0) {
        add("vietnamese", grade, `Từ “${word}” dùng để chỉ điều gì?`, set.name, others, `“${word}” thuộc nhóm từ chỉ ${set.name}.`, `nhom-tu-${set.name}`);
      } else if (mode === 1) {
        add("vietnamese", grade, `Trong các từ sau, từ nào chỉ ${set.name}?`, word, shuffle(set.words.filter((w) => w !== word)).slice(0, 3), `“${word}” là từ chỉ ${set.name}.`, `nhan-dien-${set.name}`);
      } else {
        const sentence = set.name === "hoạt động" ? `Bé đang ${word}.` : set.name === "đặc điểm" ? `Bông hoa thật ${word}.` : set.name === "người" ? `${word.charAt(0).toUpperCase() + word.slice(1)} đang giúp mọi người.` : set.name === "con vật" ? `${word.charAt(0).toUpperCase() + word.slice(1)} đang ở trong vườn.` : `Đây là ${word} của em.`;
        add("vietnamese", grade, `Chọn từ thích hợp để hoàn thành câu: “${sentence}” Từ được nhắc đến thuộc nhóm nào?`, set.name, others, `Từ “${word}” thuộc nhóm ${set.name}.`, `van-dung-${set.name}`);
      }
    }));
  } else if (grade === 2) {
    const synonymPairs = [["chăm chỉ", "siêng năng"], ["dũng cảm", "gan dạ"], ["yên tĩnh", "im lặng"], ["nhanh nhẹn", "lanh lợi"]];
    const antonymPairs = [["đoàn kết", "chia rẽ"], ["thật thà", "gian dối"], ["cao", "thấp"], ["nóng", "lạnh"], ["vui", "buồn"], ["sáng", "tối"]];
    synonymPairs.forEach(([a, b]) => add("vietnamese", grade, `Từ nào gần nghĩa với “${a}”?`, b, ["lười biếng", "ồn ào", "yếu đuối"], `“${a}” và “${b}” gần nghĩa với nhau.`, "tu-dong-nghia"));
    antonymPairs.forEach(([a, b]) => add("vietnamese", grade, `Từ nào trái nghĩa với “${a}”?`, b, ["rộng", "dài", "nhanh"], `“${a}” và “${b}” trái nghĩa với nhau.`, "tu-trai-nghia"));
    const tasks: Array<[string, string, string, string[], string]> = [
      ["Bạn Lan đang tưới cây.", "Ai đang tưới cây?", "Bạn Lan", ["đang tưới", "cây", "tưới cây"], "Bạn Lan là người thực hiện hoạt động."],
      ["Đàn chim hót líu lo.", "Con gì hót líu lo?", "Đàn chim", ["líu lo", "hót", "đàn"], "Đàn chim là sự vật được nói đến."],
      ["Bầu trời hôm nay rất trong xanh.", "Bầu trời hôm nay có đặc điểm gì?", "Trong xanh", ["hôm nay", "bầu trời", "rất"], "Trong xanh nêu đặc điểm của bầu trời."],
      ["Minh đọc sách ở thư viện.", "Minh làm gì ở thư viện?", "Đọc sách", ["Minh", "thư viện", "sách"], "Đọc sách là hoạt động của Minh."],
      ["Mẹ em nấu bữa tối.", "Ai nấu bữa tối?", "Mẹ em", ["bữa tối", "nấu", "tối"], "Mẹ em là người nấu bữa tối."],
    ];
    tasks.forEach(([sentence, q, a, wrong, exp]) => add("vietnamese", grade, `Đọc câu “${sentence}” rồi trả lời: ${q}`, a, wrong, exp, "doc-hieu-cau"));
    [
      ["sạch sẽ", "sạch sẻ", "sạch xẽ", "sạch sẹ"],
      ["xinh xắn", "sinh xắn", "xinh sắn", "sinh sắn"],
      ["nghỉ ngơi", "ngỉ ngơi", "nghĩ ngơi", "nghỉ ngi"],
      ["trường học", "chường học", "trường hộc", "chường hộc"],
    ].forEach(([correct, ...wrong]) => add("vietnamese", grade, "Chọn cách viết đúng chính tả.", correct, wrong, `Cách viết đúng là “${correct}”.`, "chinh-ta"));
  } else if (grade === 3) {
    const categories = [
      { name: "danh từ", words: ["dòng sông", "học sinh", "cánh đồng", "bác thợ mộc", "tiếng trống"] },
      { name: "động từ", words: ["suy nghĩ", "xây dựng", "quan sát", "thu hoạch", "bảo vệ"] },
      { name: "tính từ", words: ["rộng lớn", "dịu dàng", "chăm chỉ", "rực rỡ", "mạnh mẽ"] },
    ];
    categories.forEach((set) => set.words.forEach((word) => {
      const wrong = categories.filter((x) => x.name !== set.name).map((x) => x.name);
      add("vietnamese", grade, `Từ “${word}” thuộc từ loại nào?`, set.name, wrong, `“${word}” là ${set.name}.`, `tu-loai-${set.name}`);
    }));
    ([
      ["Chậm như", "rùa", ["thỏ", "ngựa", "chim"], "Thành ngữ so sánh “Chậm như rùa”."],
      ["Nhanh như", "cắt", ["ốc", "sên", "rùa"], "Thành ngữ quen thuộc là “Nhanh như cắt”."],
      ["Khỏe như", "voi", ["mèo", "kiến", "bướm"], "“Khỏe như voi” chỉ sức khỏe tốt."],
      ["Hiền như", "bụt", ["hổ", "sói", "cáo"], "“Hiền như bụt” chỉ người rất hiền."],
    ] as Array<[string, string, string[], string]>).forEach(([start, answer, wrong, exp]) => add("vietnamese", grade, `${start} …` , answer, wrong, exp, "thanh-ngu"));
    ([
      ["Mặt trời thức dậy sau rặng núi.", "Ai được nhân hóa?", "Mặt trời", ["rặng núi", "thức dậy", "sau"], "Mặt trời được miêu tả như con người thức dậy."],
      ["Những bông hoa mỉm cười trong nắng.", "Sự vật nào được nhân hóa?", "Những bông hoa", ["trong nắng", "mỉm cười", "nắng"], "Bông hoa được gán hành động mỉm cười."],
      ["Lan chăm sóc vườn rau mỗi chiều.", "Bộ phận trả lời câu hỏi “Ai?” là gì?", "Lan", ["chăm sóc", "vườn rau", "mỗi chiều"], "Lan là chủ thể thực hiện hoạt động."],
    ] as Array<[string, string, string, string[], string]>).forEach(([sentence, q, a, wrong, exp]) => add("vietnamese", grade, `Đọc “${sentence}” và xác định: ${q}`, a, wrong, exp, "doc-hieu-ngu-phap"));
  } else if (grade === 4) {
    const sentenceTypes: Array<[string, string, string[]]> = [
      ["Sáng nay, em đến trường rất sớm.", "câu kể", ["câu hỏi", "câu cảm", "câu khiến"]],
      ["Bạn đã làm xong bài tập chưa?", "câu hỏi", ["câu kể", "câu cảm", "câu khiến"]],
      ["Ôi, bông hoa đẹp quá!", "câu cảm", ["câu kể", "câu hỏi", "câu khiến"]],
      ["Hãy giữ gìn lớp học sạch đẹp!", "câu khiến", ["câu kể", "câu hỏi", "câu cảm"]],
    ];
    sentenceTypes.forEach(([sentence, answer, wrong]) => add("vietnamese", grade, `Câu “${sentence}” thuộc kiểu câu nào?`, answer, wrong, `Đây là ${answer}.`, "kieu-cau"));
    ([
      ["lung linh", "từ láy", ["bàn ghế", "xe đạp", "học sinh"]],
      ["nhà cửa", "từ ghép", ["long lanh", "xanh xanh", "rì rào"]],
      ["lấp lánh", "từ láy", ["quần áo", "sách vở", "bàn học"]],
      ["bạn bè", "từ ghép", ["mênh mông", "thoang thoảng", "xinh xắn"]],
      ["rì rào", "từ láy", ["nhà cửa", "cây cối", "quần áo"]],
    ] as Array<[string, string, string[]]>).forEach(([word, answer, wrong]) => add("vietnamese", grade, `“${word}” là từ ghép hay từ láy?`, answer, wrong, `“${word}” là ${answer}.`, "cau-tao-tu"));
    ([
      ["Nhờ chăm chỉ luyện tập, Nam tiến bộ rõ rệt.", "Vì sao Nam tiến bộ?", "Vì chăm chỉ luyện tập", ["Vì Nam nghỉ học", "Vì bài tập dễ", "Vì được nghỉ ngơi"], "Nam tiến bộ nhờ chăm chỉ luyện tập."],
      ["Dù trời mưa, các bạn vẫn đến lớp đúng giờ.", "Các bạn đến lớp trong hoàn cảnh nào?", "Trời mưa", ["Trời nắng", "Trời rét", "Trời quang"], "Câu cho biết trời mưa nhưng các bạn vẫn đến lớp."],
      ["Cây phượng nở hoa đỏ rực vào mùa hè.", "Hoa phượng có màu gì?", "Đỏ rực", ["Vàng nhạt", "Trắng muốt", "Tím biếc"], "Thông tin được nêu trực tiếp trong câu."],
    ] as Array<[string, string, string, string[], string]>).forEach(([sentence, q, a, wrong, exp]) => add("vietnamese", grade, `Đọc đoạn thông tin: “${sentence}” ${q}`, a, wrong, exp, "doc-hieu"));
  } else {
    ([
      ["Tôi rất yêu quê hương mình.", "Đại từ xưng hô là từ nào?", "Tôi", ["rất", "yêu", "quê hương"], "“Tôi” là đại từ xưng hô."],
      ["Chúng em cùng nhau trồng cây.", "Đại từ chỉ người là từ nào?", "Chúng em", ["cùng nhau", "trồng", "cây"], "“Chúng em” dùng để xưng gọi một nhóm người."],
      ["Vì trời mưa nên trận đấu bị hoãn.", "Cặp quan hệ từ biểu thị nguyên nhân – kết quả là gì?", "Vì… nên", ["Tuy… nhưng", "Nếu… thì", "Không những… mà còn"], "“Vì… nên” biểu thị quan hệ nguyên nhân – kết quả."],
      ["Tuy đường xa nhưng Hoa vẫn đi học đúng giờ.", "Cặp quan hệ từ biểu thị tương phản là gì?", "Tuy… nhưng", ["Vì… nên", "Nếu… thì", "Do… nên"], "“Tuy… nhưng” biểu thị sự tương phản."],
      ["Nếu em chăm đọc sách thì vốn từ sẽ phong phú hơn.", "Cặp quan hệ từ biểu thị điều kiện – kết quả là gì?", "Nếu… thì", ["Vì… nên", "Tuy… nhưng", "Mặc dù… nhưng"], "“Nếu… thì” biểu thị điều kiện – kết quả."],
    ] as Array<[string, string, string, string[], string]>).forEach(([sentence, q, a, wrong, exp]) => add("vietnamese", grade, `Đọc câu “${sentence}” rồi xác định: ${q}`, a, wrong, exp, "dai-tu-quan-he-tu"));
    ([
      ["Ăn quả nhớ kẻ trồng cây", "Biết ơn người tạo ra thành quả", ["Chỉ thích ăn trái cây", "Phải trồng cây mỗi ngày", "Không nên hái quả"], "Câu tục ngữ nhắc nhở lòng biết ơn."],
      ["Có công mài sắt, có ngày nên kim", "Kiên trì sẽ đạt được thành công", ["Làm việc thật nhanh", "Chỉ cần may mắn", "Không cần cố gắng"], "Tục ngữ đề cao sự kiên trì."],
      ["Lá lành đùm lá rách", "Giúp đỡ người gặp khó khăn", ["Che lá khỏi mưa", "Trồng nhiều cây xanh", "Giữ đồ vật sạch sẽ"], "Câu tục ngữ khuyên con người tương thân tương ái."],
      ["Uống nước nhớ nguồn", "Nhớ ơn những người đi trước", ["Tiết kiệm nước uống", "Bảo vệ nguồn nước", "Tìm nơi có nước"], "Câu tục ngữ nhắc nhớ cội nguồn và lòng biết ơn."],
    ] as Array<[string, string, string[], string]>).forEach(([proverb, q, wrong, exp]) => add("vietnamese", grade, `Ý nghĩa của câu tục ngữ “${proverb}” là gì?`, q, wrong, exp, "giai-nghia-tuc-ngu"));
    [
      ["bảo tồn", "giữ gìn", ["phá hủy", "lãng quên", "thay thế"]],
      ["nhân ái", "thương người", ["ích kỷ", "vô tâm", "thờ ơ"]],
      ["dũng cảm", "can đảm", ["hèn nhát", "lo lắng", "rụt rè"]],
      ["lạc quan", "yêu đời", ["bi quan", "chán nản", "buồn bã"]],
      ["tiết kiệm", "hoang phí", ["dè sẻn", "chắt chiu", "giữ gìn"]],
    ].forEach(([word, answer, wrong]) => add("vietnamese", grade, `Từ nào ${word === "tiết kiệm" ? "trái nghĩa" : "gần nghĩa"} với “${word}”?`, answer, wrong, `“${word}” và “${answer}” ${word === "tiết kiệm" ? "trái nghĩa" : "gần nghĩa"} với nhau.`, "mo-rong-tu-vung"));
    [
      ["Mặc dù trời rét nhưng các bạn vẫn chăm chỉ tập thể dục.", "Quan hệ giữa hai vế câu là gì?", "Tương phản", ["Nguyên nhân – kết quả", "Điều kiện – kết quả", "Tăng tiến"], "“Mặc dù… nhưng” biểu thị quan hệ tương phản."],
      ["Vì chăm sóc đúng cách nên cây phát triển xanh tốt.", "Quan hệ giữa hai vế câu là gì?", "Nguyên nhân – kết quả", ["Tương phản", "Điều kiện – kết quả", "Liệt kê"], "“Vì… nên” biểu thị nguyên nhân – kết quả."],
      ["Nếu chúng ta tiết kiệm điện thì sẽ bảo vệ tài nguyên.", "Quan hệ giữa hai vế câu là gì?", "Điều kiện – kết quả", ["Tương phản", "Nguyên nhân – kết quả", "Liệt kê"], "“Nếu… thì” biểu thị điều kiện – kết quả."],
      ["Không những Mai học giỏi mà bạn còn rất tốt bụng.", "Cặp từ nào thể hiện quan hệ tăng tiến?", "Không những… mà còn", ["Vì… nên", "Tuy… nhưng", "Nếu… thì"], "“Không những… mà còn” biểu thị quan hệ tăng tiến."],
    ] as Array<[string, string, string, string[], string]>).forEach(([sentence, q, answer, wrong, exp]) => add("vietnamese", grade, `Đọc câu “${sentence}” ${q}`, answer, wrong, exp, "quan-he-cau"));
  }
  return result;
};

const englishDrafts = (grade: number): Draft[] => {
  const result: Draft[] = [];
  const add = (...args: Parameters<typeof draft>) => result.push(draft(...args));
  const vocab: Record<number, Array<[string, string]>> = {
    1: [["con chim", "bird"], ["con bò", "cow"], ["con vịt", "duck"], ["con thỏ", "rabbit"], ["quả cam", "orange"], ["quả nho", "grape"], ["màu đỏ", "red"], ["màu xanh", "green"], ["mẹ", "mother"], ["anh trai", "brother"], ["quyển sách", "book"], ["cái cặp", "schoolbag"]],
    2: [["bữa sáng", "breakfast"], ["phòng ngủ", "bedroom"], ["bệnh viện", "hospital"], ["siêu thị", "supermarket"], ["con voi", "elephant"], ["con hổ", "tiger"], ["thứ hai", "Monday"], ["Chủ nhật", "Sunday"], ["mưa", "rain"], ["nắng", "sunny"], ["đọc", "read"], ["viết", "write"]],
    3: [["bơi", "swim"], ["nhảy", "jump"], ["thư viện", "library"], ["sân chơi", "playground"], ["bữa trưa", "lunch"], ["bữa tối", "dinner"], ["mùa xuân", "spring"], ["mùa đông", "winter"], ["cao", "tall"], ["thấp", "short"], ["khát nước", "thirsty"], ["đói bụng", "hungry"]],
    4: [["thời tiết", "weather"], ["địa chỉ", "address"], ["kỳ nghỉ", "holiday"], ["bảo tàng", "museum"], ["bưu điện", "post office"], ["ồn ào", "noisy"], ["yên tĩnh", "quiet"], ["nguy hiểm", "dangerous"], ["môi trường", "environment"], ["ô nhiễm", "pollution"], ["tiết kiệm", "save"], ["lời khuyên", "advice"]],
    5: [["thành tựu", "achievement"], ["truyền thống", "tradition"], ["phát minh", "invention"], ["năng lượng", "energy"], ["tình nguyện", "volunteer"], ["bền vững", "sustainable"], ["sự lựa chọn", "choice"], ["thử thách", "challenge"], ["cải thiện", "improve"], ["bảo vệ", "protect"], ["tự tin", "confident"], ["kiên nhẫn", "patient"]],
  };
  const pairs = vocab[grade]!;
  pairs.forEach(([vi, en], index) => {
    const wrong = shuffle(pairs.filter((pair) => pair[1] !== en).map((pair) => pair[1])).slice(0, 3);
    const mode = index % 3;
    if (mode === 0) add("english", grade, `Choose the English word for “${vi}”.`, en, wrong, `“${vi}” means “${en}”.`, "tu-vung-dich");
    else if (mode === 1) add("english", grade, `Which word means “${vi}”?`, en, wrong, `The correct translation is “${en}”.`, "tu-vung-nhan-dien");
    else add("english", grade, `Complete the vocabulary pair: ${vi} = ____.`, en, wrong, `The English word is “${en}”.`, "tu-vung-dien-tu");
  });

  const grammar: Record<number, Array<[string, string, string[], string, string]>> = {
    1: [
      ["What color is a banana?", "Yellow", ["Blue", "Black", "Purple"], "A ripe banana is usually yellow.", "mau-sac"],
      ["How many legs does a dog have?", "Four", ["Two", "Six", "Eight"], "A dog has four legs.", "so-dem"],
      ["Choose the correct greeting in the morning.", "Good morning", ["Good night", "Good evening", "Goodbye"], "We say “Good morning” in the morning.", "giao-tiep"],
      ["Which one is an animal?", "Rabbit", ["Pencil", "Table", "Window"], "A rabbit is an animal.", "nhan-biet"],
      ["Complete: This is ____ apple.", "an", ["a", "am", "are"], "We use “an” before a vowel sound.", "mao-tu"],
    ],
    2: [
      ["There ____ five books on the desk.", "are", ["is", "am", "be"], "Use “are” with plural nouns.", "there-are"],
      ["My sister ____ eight years old.", "is", ["am", "are", "be"], "Use “is” with “my sister”.", "dong-tu-to-be"],
      ["What day comes after Friday?", "Saturday", ["Thursday", "Monday", "Sunday"], "Saturday comes after Friday.", "ngay-trong-tuan"],
      ["Choose the opposite of “hot”.", "cold", ["warm", "big", "fast"], "“Cold” is the opposite of “hot”.", "tu-trai-nghia"],
      ["I have two ____.", "pencils", ["pencil", "penciles", "penciling"], "Use the plural form “pencils” after “two”.", "so-nhieu"],
    ],
    3: [
      ["She ____ a student.", "is", ["are", "am", "be"], "Use “is” with “she”.", "to-be"],
      ["They ____ football after school.", "play", ["plays", "playing", "played"], "Use the base verb with “they” in the present simple.", "hien-tai-don"],
      ["There ____ a ruler in my bag.", "is", ["are", "am", "be"], "Use “is” with the singular noun “a ruler”.", "there-is"],
      ["What is the plural of “child”?", "children", ["childs", "childes", "childrens"], "“Child” has the irregular plural “children”.", "so-nhieu-bat-quy-tac"],
      ["Choose the correct question.", "Where do you live?", ["Where you live?", "Where does you live?", "Where are you live?"], "Use “do” with “you” in this present simple question.", "dat-cau-hoi"],
    ],
    4: [
      ["She ____ to school every day.", "goes", ["go", "going", "went"], "Use “goes” with “she” in the present simple.", "hien-tai-don"],
      ["We ____ to the zoo last Sunday.", "went", ["go", "goes", "going"], "“Last Sunday” signals the past simple.", "qua-khu-don"],
      ["Look! The children ____ in the garden.", "are playing", ["play", "plays", "played"], "Use the present continuous for an action happening now.", "hien-tai-tiep-dien"],
      ["The opposite of “careful” is ____.", "careless", ["helpful", "useful", "beautiful"], "“Careless” means not careful.", "tu-trai-nghia"],
      ["The book is ____ the table.", "on", ["between", "understand", "behind of"], "“On” means the book is on the surface of the table.", "gioi-tu"],
    ],
    5: [
      ["She ____ here since 2020.", "has lived", ["lived", "lives", "is living"], "Use the present perfect with “since” for a continuing situation.", "hien-tai-hoan-thanh"],
      ["If it rains tomorrow, we ____ at home.", "will stay", ["stayed", "staying", "stay yesterday"], "Use “will” in the result clause of this first conditional.", "cau-dieu-kien"],
      ["This puzzle is ____ than the last one.", "more difficult", ["most difficult", "difficulter", "difficult"], "Use “more difficult” for this comparison.", "so-sanh-hon"],
      ["The classroom ____ every afternoon.", "is cleaned", ["cleans", "cleaned", "is cleaning"], "The passive form is “is cleaned”.", "bi-dong"],
      ["We have studied English ____ three years.", "for", ["since", "at", "on"], "Use “for” with a period of time.", "gioi-tu-thoi-gian"],
      ["He asked me where I ____.", "lived", ["live", "living", "lives"], "Reported questions use statement word order and backshift here.", "cau-tuong-thuat"],
    ],
  };
  grammar[grade]!.forEach(([q, a, wrong, explanation, family]) => add("english", grade, q, a, wrong, explanation, family));
  return result;
};

const normalizeQuestion = (question: string) =>
  question.normalize("NFC").toLocaleLowerCase("vi")
    .replace(/[“”"'.,!?;:]/g, "")
    .replace(/\s+/g, " ")
    .trim();

export function createArenaQuestionSet(grade: number, count = 10): Question[] {
  const g = Math.max(1, Math.min(5, Math.floor(grade) || 1));
  const storageKey = `be-vui-hoc:arena-seen:v3:grade-${g}`;
  let seen: string[] = [];
  try {
    const parsed: unknown = JSON.parse(localStorage.getItem(storageKey) || "[]");
    if (Array.isArray(parsed)) seen = parsed.filter((value): value is string => typeof value === "string");
  } catch { seen = []; }
  const seenSet = new Set(seen);

  const languageDrafts = [
    ...vietnameseDrafts(g),
    ...englishDrafts(g),
  ];
  const languagePool: (Question & { family?: string })[] = languageDrafts.map((q, index) => ({
    ...q,
    id: `arena-lang-g${g}-${index}`,
    level: g * 20,
  }));
  const mathPool: Question[] = [];
  for (let i = 0; i < 500; i++) {
    const level = 1 + (i % 100);
    const q = generateQuestion("math", g, level);
    mathPool.push(q);
  }

  const freshLanguage = languagePool.filter((q) => !seenSet.has(`${q.subject}:${normalizeQuestion(q.question)}`));
  const freshMath = mathPool.filter((q) => !seenSet.has(`math:${normalizeQuestion(q.question)}`));
  const selected: (Question & { family?: string })[] = [];
  const used = new Set<string>();
  const usedFamilies = new Set<string>();

  const addFrom = (pool: Question[], target: number) => {
    let added = 0;
    for (const q of shuffle(pool)) {
      const key = `${q.subject}:${normalizeQuestion(q.question)}`;
      if (used.has(key)) continue;
      const family = (q as Question & { family?: string }).family;
      if (family && usedFamilies.has(`${q.subject}:${family}`) && added < target - 1) continue;
      used.add(key);
      if (family) usedFamilies.add(`${q.subject}:${family}`);
      selected.push(q);
      added++;
      if (added >= target) break;
    }
  };

  const safeCount = Math.max(1, Math.min(30, Math.floor(count) || 10));
  // Keep all three subjects represented in every normal 10-question match.
  const mathTarget = Math.ceil(safeCount * 0.4);
  const viTarget = Math.floor(safeCount * 0.3);
  const enTarget = safeCount - mathTarget - viTarget;
  addFrom(freshMath, mathTarget);
  addFrom(freshLanguage.filter((q) => q.subject === "vietnamese"), viTarget);
  addFrom(freshLanguage.filter((q) => q.subject === "english"), enTarget);

  if (selected.length < safeCount) {
    // If the browser has already seen the whole language bank, allow older
    // questions as a last resort instead of starting a match with fewer items.
    const remaining = shuffle([
      ...freshMath,
      ...freshLanguage,
      ...mathPool,
      ...languagePool,
    ]);
    for (const q of remaining) {
      const key = `${q.subject}:${normalizeQuestion(q.question)}`;
      if (used.has(key)) continue;
      used.add(key);
      selected.push(q);
      if (selected.length >= safeCount) break;
    }
  }

  const finalQuestions = shuffle(selected).slice(0, safeCount).map((q, index) => ({
    ...q,
    id: `arena-g${g}-${Date.now()}-${index}-${Math.floor(Math.random() * 100000)}`,
    level: q.subject === "math" ? q.level : g * 10 + index,
  }));

  try {
    const nextSeen = [...seen, ...finalQuestions.map((q) => `${q.subject}:${normalizeQuestion(q.question)}`)].slice(-3000);
    localStorage.setItem(storageKey, JSON.stringify(nextSeen));
  } catch { /* Storage can be unavailable; the in-match de-duplication still applies. */ }

  return finalQuestions;
}
