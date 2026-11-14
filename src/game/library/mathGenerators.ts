import type { Grade } from "../types";
import { dec, fmt, gcd, int, pick, shuffle, type Rng } from "./random";

export type Ex = { q: string; a: string; why?: string | undefined };
export type Gen = { rule: string; make: (r: Rng) => Ex };
const G = (rule: string, make: (r: Rng) => Ex): Gen => ({ rule, make });

const NAMES = ["Lan", "Minh", "Hoa", "Nam", "Mai", "An", "Bình", "Hà", "Tú", "Linh", "Khôi", "Vy"] as const;
const ITEMS = ["quả táo", "cái kẹo", "bông hoa", "quyển vở", "viên bi", "cái bút", "quả cam", "chiếc lá", "ngôi sao giấy", "con tem"] as const;
const EMOJI = ["🍎", "⭐", "🐟", "🌸", "🎈", "🐤", "🍓", "🚗"] as const;
const sign = (a: number, b: number) => (a > b ? ">" : a < b ? "<" : "=");
const twoNames = (r: Rng) => {
  const a = pick(r, NAMES);
  let b = pick(r, NAMES);
  while (b === a) b = pick(r, NAMES);
  return [a, b] as const;
};

/* ---------- Số và so sánh ---------- */
export const countObjects = G("Đếm lần lượt từng đồ vật, mỗi đồ vật chỉ đếm một lần; số cuối cùng đếm được là số lượng.", (r) => {
  const n = int(r, 1, 10);
  return { q: `Đếm xem có bao nhiêu hình: ${pick(r, EMOJI).repeat(n)}`, a: `${n}` };
});
export const neighbor = (max: number) => G("Số liền sau lớn hơn số đã cho 1 đơn vị; số liền trước bé hơn số đã cho 1 đơn vị.", (r) => {
  const n = int(r, 1, max - 1);
  return r() < 0.5
    ? { q: `Số liền sau của ${fmt(n)} là số nào?`, a: fmt(n + 1) }
    : { q: `Số liền trước của ${fmt(n)} là số nào?`, a: fmt(n - 1) };
});
export const compare = (max: number) => G("So sánh số chữ số trước; nếu bằng nhau thì so sánh từng hàng từ trái sang phải.", (r) => {
  const a = int(r, 0, max), b = r() < 0.15 ? a : int(r, 0, max);
  return { q: `Điền dấu >, <, = vào chỗ chấm: ${fmt(a)} … ${fmt(b)}`, a: `${fmt(a)} ${sign(a, b)} ${fmt(b)}` };
});
export const order = (max: number) => G("Muốn sắp xếp từ bé đến lớn: tìm số bé nhất viết trước, rồi đến các số lớn dần.", (r) => {
  const set = new Set<number>();
  while (set.size < 4) set.add(int(r, 0, max));
  const list = [...set];
  const asc = r() < 0.6;
  const sorted = [...list].sort((x, y) => (asc ? x - y : y - x));
  return { q: `Sắp xếp các số ${list.map(fmt).join("; ")} theo thứ tự từ ${asc ? "bé đến lớn" : "lớn đến bé"}.`, a: sorted.map(fmt).join("; ") };
});
export const tensUnits = (max: number) => G("Số có hai chữ số gồm chục và đơn vị: chữ số bên trái chỉ số chục, bên phải chỉ số đơn vị.", (r) => {
  const n = int(r, 11, max - 1);
  const t = Math.floor(n / 10), u = n % 10;
  return r() < 0.5
    ? { q: `Số ${n} gồm mấy chục và mấy đơn vị?`, a: `${t} chục và ${u} đơn vị` }
    : { q: `Số gồm ${t} chục và ${u} đơn vị viết là?`, a: `${n}` };
});
const PLACES = ["đơn vị", "chục", "trăm", "nghìn", "chục nghìn", "trăm nghìn", "triệu", "chục triệu", "trăm triệu"] as const;
export const placeValue = (minDigits: number, maxDigits: number) => G("Mỗi chữ số đứng ở một hàng: đơn vị, chục, trăm, nghìn, … Đọc số theo từng lớp ba chữ số từ trái sang phải.", (r) => {
  const d = int(r, minDigits, maxDigits);
  const n = int(r, 10 ** (d - 1), 10 ** d - 1);
  const pos = int(r, 0, d - 1);
  const digit = Math.floor(n / 10 ** pos) % 10;
  if (d === 4 && r() < 0.5) {
    const s = String(n);
    return { q: `Số ${fmt(n)} gồm mấy nghìn, mấy trăm, mấy chục, mấy đơn vị?`, a: `${s[0]} nghìn, ${s[1]} trăm, ${s[2]} chục, ${s[3]} đơn vị` };
  }
  return { q: `Trong số ${fmt(n)}, chữ số ở hàng ${PLACES[pos]} là chữ số nào?`, a: `${digit}` };
});

/* ---------- Cộng trừ ---------- */
export const addWithin = (max: number) => G(`Phép cộng gộp hai nhóm lại. Đổi chỗ các số hạng thì tổng không thay đổi: a + b = b + a.`, (r) => {
  const a = int(r, 0, max), b = int(r, 0, max - a);
  return { q: `${fmt(a)} + ${fmt(b)} = ?`, a: fmt(a + b) };
});
export const subWithin = (max: number) => G("Phép trừ là bớt đi. Kiểm tra: hiệu + số trừ = số bị trừ.", (r) => {
  const a = int(r, 1, max), b = int(r, 0, a);
  return { q: `${fmt(a)} − ${fmt(b)} = ?`, a: fmt(a - b), why: `Thử lại: ${fmt(a - b)} + ${fmt(b)} = ${fmt(a)}` };
});
export const addCarry = G("Cộng có nhớ: cộng hàng đơn vị trước, nếu được 10 trở lên thì viết chữ số đơn vị và nhớ 1 sang hàng chục.", (r) => {
  const au = int(r, 2, 9), bu = int(r, 10 - au, 9), at = int(r, 1, 7), bt = int(r, 0, 8 - at);
  const a = at * 10 + au, b = bt * 10 + bu;
  return { q: `${a} + ${b} = ?`, a: `${a + b}`, why: `${au} + ${bu} = ${au + bu}, viết ${(au + bu) % 10} nhớ 1; ${at} + ${bt} thêm 1 bằng ${at + bt + 1}` };
});
export const subBorrow = G("Trừ có nhớ: hàng đơn vị không trừ được thì mượn 1 chục (thêm 10), rồi nhớ 1 vào số chục của số trừ.", (r) => {
  const au = int(r, 0, 8), bu = int(r, au + 1, 9), at = int(r, 2, 9), bt = int(r, 1, at - 1);
  const a = at * 10 + au, b = bt * 10 + bu;
  return { q: `${a} − ${b} = ?`, a: `${a - b}`, why: `${10 + au} − ${bu} = ${10 + au - bu}, viết ${10 + au - bu} nhớ 1; ${bt} thêm 1 bằng ${bt + 1}, ${at} − ${bt + 1} = ${at - bt - 1}` };
});
export const bigAdd = (min: number, max: number) => G("Đặt tính thẳng cột theo từng hàng, cộng từ phải sang trái, nhớ sang hàng bên trái khi cần.", (r) => {
  const a = int(r, min, Math.floor(max / 2)), b = int(r, min, max - a);
  return { q: `Đặt tính rồi tính: ${fmt(a)} + ${fmt(b)}`, a: fmt(a + b) };
});
export const bigSub = (min: number, max: number) => G("Đặt tính thẳng cột, trừ từ phải sang trái; hàng nào không trừ được thì mượn 1 ở hàng bên trái.", (r) => {
  const a = int(r, min * 2, max), b = int(r, min, a - 1);
  return { q: `Đặt tính rồi tính: ${fmt(a)} − ${fmt(b)}`, a: fmt(a - b) };
});
export const wordAdd = (max: number) => G("Bài toán có lời văn: đọc kỹ đề, tìm điều đã cho và điều cần tìm, viết câu lời giải, phép tính và đáp số.", (r) => {
  const [n, n2] = twoNames(r);
  const it = pick(r, ITEMS);
  const a = int(r, 1, max - 1), b = int(r, 1, max - a);
  const t = int(r, 0, 2);
  if (t === 0) return { q: `${n} có ${a} ${it}, ${n2} cho ${n} thêm ${b} ${it}. Hỏi ${n} có tất cả bao nhiêu ${it}?`, a: `${a + b} ${it}`, why: `${a} + ${b} = ${a + b}` };
  if (t === 1) return { q: `Trên cành có ${a} con chim, bay đến thêm ${b} con chim. Hỏi trên cành có tất cả bao nhiêu con chim?`, a: `${a + b} con chim`, why: `${a} + ${b} = ${a + b}` };
  return { q: `${n} có ${a} ${it}. ${n2} có nhiều hơn ${n} ${b} ${it}. Hỏi ${n2} có bao nhiêu ${it}?`, a: `${a + b} ${it}`, why: `${a} + ${b} = ${a + b}` };
});
export const wordSub = (max: number) => G("Bài toán “còn lại”, “bớt đi”, “ít hơn” thường dùng phép trừ.", (r) => {
  const [n] = twoNames(r);
  const it = pick(r, ITEMS);
  const a = int(r, 3, max), b = int(r, 1, a - 1);
  return r() < 0.5 || max < 20
    ? { q: `${n} có ${a} ${it}, ${n} cho bạn ${b} ${it}. Hỏi ${n} còn lại bao nhiêu ${it}?`, a: `${a - b} ${it}`, why: `${a} − ${b} = ${a - b}` }
    : { q: `Lớp em có ${a} bạn, trong đó có ${b} bạn nam. Hỏi lớp em có bao nhiêu bạn nữ?`, a: `${a - b} bạn nữ`, why: `${a} − ${b} = ${a - b}` };
});
export const twoStep = G("Bài toán hai bước: tìm kết quả trung gian trước (bước 1), rồi dùng nó để tìm điều đề bài hỏi (bước 2).", (r) => {
  const a = int(r, 12, 40), b = int(r, 3, 15);
  return r() < 0.5
    ? { q: `Thùng thứ nhất có ${a} lít nước, thùng thứ hai nhiều hơn thùng thứ nhất ${b} lít. Hỏi cả hai thùng có bao nhiêu lít nước?`, a: `${a + a + b} lít`, why: `Thùng hai: ${a} + ${b} = ${a + b}; cả hai: ${a} + ${a + b} = ${2 * a + b}` }
    : { q: `Tổ Một trồng được ${a} cây, tổ Hai trồng ít hơn tổ Một ${b} cây. Hỏi cả hai tổ trồng được bao nhiêu cây?`, a: `${a + a - b} cây`, why: `Tổ Hai: ${a} − ${b} = ${a - b}; cả hai: ${a} + ${a - b} = ${2 * a - b}` };
});

/* ---------- Nhân chia ---------- */
export const mulTable = (tables: number[]) => G(`Thuộc bảng nhân ${tables.join(", ")}. Phép nhân là phép cộng các số hạng bằng nhau: 3 × 4 = 3 + 3 + 3 + 3.`, (r) => {
  const a = pick(r, tables), b = int(r, 1, 10);
  return { q: `${a} × ${b} = ?`, a: `${a * b}` };
});
export const divTable = (tables: number[]) => G("Phép chia là phép tính ngược của phép nhân: nếu 4 × 5 = 20 thì 20 : 4 = 5 và 20 : 5 = 4.", (r) => {
  const a = pick(r, tables), b = int(r, 1, 10);
  return { q: `${a * b} : ${a} = ?`, a: `${b}`, why: `Vì ${a} × ${b} = ${a * b}` };
});
export const divEqual = G("Chia đều: lấy tổng số chia cho số phần bằng nhau.", (r) => {
  const n = int(r, 2, 5), each = int(r, 2, 9), it = pick(r, ITEMS);
  return { q: `Có ${n * each} ${it} chia đều cho ${n} bạn. Hỏi mỗi bạn được mấy ${it}?`, a: `${each} ${it}`, why: `${n * each} : ${n} = ${each}` };
});
export const mulBig = (aMin: number, aMax: number, bMin: number, bMax: number) => G("Nhân từ phải sang trái; nhân số có hai chữ số thì viết tích riêng thứ hai lùi sang trái một cột.", (r) => {
  const a = int(r, aMin, aMax), b = int(r, bMin, bMax);
  return { q: `Đặt tính rồi tính: ${fmt(a)} × ${b}`, a: fmt(a * b) };
});
export const divRemainder = G("Chia từ trái sang phải. Số dư luôn bé hơn số chia. Thử lại: thương × số chia + số dư = số bị chia.", (r) => {
  const b = int(r, 2, 9), q = int(r, 11, 120), rem = r() < 0.5 ? 0 : int(r, 1, b - 1);
  const a = b * q + rem;
  return { q: `Đặt tính rồi tính: ${a} : ${b}`, a: rem ? `${q} (dư ${rem})` : `${q}`, why: `Thử lại: ${q} × ${b}${rem ? " + " + rem : ""} = ${a}` };
});
export const divExact = (bMin: number, bMax: number, qMin: number, qMax: number) => G("Chia cho số có hai chữ số: ước lượng thương bằng cách làm tròn số chia, rồi nhân lại để kiểm tra.", (r) => {
  const b = int(r, bMin, bMax), q = int(r, qMin, qMax);
  return { q: `Đặt tính rồi tính: ${fmt(b * q)} : ${b}`, a: fmt(q) };
});
export const fractionOf = G("Muốn tìm một phần mấy của một số, ta lấy số đó chia cho số phần: 1/4 của 20 là 20 : 4 = 5.", (r) => {
  const n = int(r, 2, 9), k = int(r, 2, 12), it = pick(r, ITEMS);
  return { q: `1/${n} của ${n * k} ${it} là bao nhiêu ${it}?`, a: `${k} ${it}`, why: `${n * k} : ${n} = ${k}` };
});
export const wordMulDiv = G("“Mỗi … có …, hỏi … có tất cả” dùng phép nhân; “chia đều, mỗi … được” dùng phép chia.", (r) => {
  const a = int(r, 3, 9), b = int(r, 4, 12);
  const t = int(r, 0, 2);
  if (t === 0) return { q: `Mỗi bàn có ${a} bạn ngồi. Lớp có ${b} bàn như vậy. Hỏi lớp có bao nhiêu bạn?`, a: `${a * b} bạn`, why: `${a} × ${b} = ${a * b}` };
  if (t === 1) return { q: `Có ${a * b} quyển sách xếp đều vào ${a} ngăn. Hỏi mỗi ngăn có bao nhiêu quyển?`, a: `${b} quyển`, why: `${a * b} : ${a} = ${b}` };
  return { q: `Một con gà có 2 chân. Hỏi ${b} con gà có bao nhiêu chân?`, a: `${2 * b} chân`, why: `2 × ${b} = ${2 * b}` };
});

/* ---------- Đo lường, thời gian, hình học ---------- */
export const lengthAdd = (max: number) => G("Cộng, trừ số đo độ dài như cộng trừ số tự nhiên, nhớ ghi đơn vị đo (cm) vào kết quả.", (r) => {
  const a = int(r, 1, max - 1), b = int(r, 1, max - a);
  return r() < 0.5 ? { q: `${a} cm + ${b} cm = ?`, a: `${a + b} cm` } : { q: `${a + b} cm − ${b} cm = ?`, a: `${a} cm` };
});
export const clock = (halves: boolean) => G("Kim ngắn chỉ giờ, kim dài chỉ phút. Kim dài chỉ số 12 là giờ đúng, chỉ số 6 là 30 phút (rưỡi).", (r) => {
  const h = int(r, 1, 11);
  return halves && r() < 0.5
    ? { q: `Kim dài chỉ số 6, kim ngắn ở giữa số ${h} và số ${h + 1}. Đồng hồ chỉ mấy giờ?`, a: `${h} giờ 30 phút (${h} giờ rưỡi)` }
    : { q: `Kim ngắn chỉ số ${h}, kim dài chỉ số 12. Đồng hồ chỉ mấy giờ?`, a: `${h} giờ` };
});
export const timeWord = G("Cộng thời gian: cộng phút với phút, giờ với giờ; đủ 60 phút thì đổi thành 1 giờ.", (r) => {
  const h = int(r, 6, 10), m = pick(r, [0, 15, 30]), d = pick(r, [20, 25, 35, 40, 45]);
  const total = h * 60 + m + d;
  const eh = Math.floor(total / 60), em = total % 60;
  return { q: `Buổi học bắt đầu lúc ${h} giờ${m ? " " + m + " phút" : ""}, kéo dài ${d} phút. Hỏi kết thúc lúc mấy giờ?`, a: `${eh} giờ${em ? " " + em + " phút" : ""}` };
});
const UNITS: Record<Grade, [string, string, number][]> = {
  1: [],
  2: [["dm", "cm", 10], ["m", "dm", 10], ["m", "cm", 100], ["km", "m", 1000]],
  3: [["km", "m", 1000], ["m", "cm", 100], ["kg", "g", 1000], ["giờ", "phút", 60], ["m", "mm", 1000], ["l", "ml", 1000]],
  4: [["yến", "kg", 10], ["tạ", "kg", 100], ["tấn", "kg", 1000], ["tạ", "yến", 10], ["m²", "dm²", 100], ["dm²", "cm²", 100], ["thế kỉ", "năm", 100], ["phút", "giây", 60]],
  5: [["km", "m", 1000], ["tấn", "kg", 1000], ["m²", "cm²", 10000], ["ha", "m²", 10000], ["m³", "dm³", 1000], ["dm³", "cm³", 1000], ["giờ", "phút", 60]],
};
export const unitConvert = (grade: Grade) => G("Đổi đơn vị: từ đơn vị lớn sang đơn vị bé thì nhân, từ đơn vị bé sang đơn vị lớn thì chia.", (r) => {
  const [big, small, f] = pick(r, UNITS[grade]);
  const v = int(r, 2, 9);
  if (grade === 5 && f % 2 === 0 && r() < 0.4) return { q: `${v},5 ${big} = … ${small}`, a: `${fmt(v * f + f / 2)} ${small}` };
  return r() < 0.6 ? { q: `${v} ${big} = … ${small}`, a: `${fmt(v * f)} ${small}` } : { q: `${fmt(v * f)} ${small} = … ${big}`, a: `${v} ${big}` };
});
const SHAPES: [string, string][] = [
  ["Hình có 3 cạnh và 3 đỉnh là hình gì?", "Hình tam giác"], ["Hình có 4 cạnh bằng nhau và 4 góc vuông là hình gì?", "Hình vuông"],
  ["Hình chữ nhật có mấy cạnh?", "4 cạnh"], ["Quả bóng có dạng hình gì?", "Hình tròn (khối cầu)"], ["Hộp sữa thường có dạng khối gì?", "Khối hộp chữ nhật"],
  ["Con xúc xắc có dạng khối gì?", "Khối lập phương"], ["Mặt đồng hồ treo tường thường có dạng hình gì?", "Hình tròn"], ["Hình vuông có mấy đỉnh?", "4 đỉnh"],
  ["Hình tam giác có mấy cạnh?", "3 cạnh"], ["Viên gạch thường có dạng khối gì?", "Khối hộp chữ nhật"], ["Đường gấp khúc ABC gồm mấy đoạn thẳng?", "2 đoạn thẳng (AB và BC)"],
  ["Quyển sách có dạng hình gì?", "Hình chữ nhật"],
];
export const shapes = G("Nhận biết hình: tam giác có 3 cạnh, hình vuông và hình chữ nhật có 4 cạnh, hình tròn không có cạnh.", (r) => {
  const [q, a] = pick(r, SHAPES);
  return { q, a };
});
export const zigzag = G("Độ dài đường gấp khúc bằng tổng độ dài các đoạn thẳng tạo thành nó.", (r) => {
  const n = int(r, 3, 4);
  const parts = Array.from({ length: n }, () => int(r, 2, 15));
  return { q: `Đường gấp khúc gồm ${n} đoạn dài ${parts.map((p) => p + " cm").join(", ")}. Tính độ dài đường gấp khúc.`, a: `${parts.reduce((s, p) => s + p, 0)} cm`, why: parts.join(" + ") + " = " + parts.reduce((s, p) => s + p, 0) };
});
export const perimeter = G("Chu vi hình chữ nhật = (dài + rộng) × 2. Chu vi hình vuông = cạnh × 4.", (r) => {
  if (r() < 0.5) {
    const a = int(r, 3, 25);
    return { q: `Hình vuông có cạnh ${a} cm. Tính chu vi hình vuông.`, a: `${a * 4} cm`, why: `${a} × 4 = ${a * 4}` };
  }
  const w = int(r, 2, 15), l = int(r, w + 1, 30);
  return { q: `Hình chữ nhật có chiều dài ${l} cm, chiều rộng ${w} cm. Tính chu vi.`, a: `${(l + w) * 2} cm`, why: `(${l} + ${w}) × 2 = ${(l + w) * 2}` };
});
export const area = G("Diện tích hình chữ nhật = dài × rộng. Diện tích hình vuông = cạnh × cạnh. Đơn vị diện tích: cm², dm², m².", (r) => {
  if (r() < 0.5) {
    const a = int(r, 3, 20);
    return { q: `Hình vuông cạnh ${a} cm. Tính diện tích.`, a: `${a * a} cm²`, why: `${a} × ${a} = ${a * a}` };
  }
  const w = int(r, 2, 15), l = int(r, w + 1, 30);
  return { q: `Hình chữ nhật dài ${l} cm, rộng ${w} cm. Tính diện tích.`, a: `${l * w} cm²`, why: `${l} × ${w} = ${l * w}` };
});
const ANGLES: [string, string][] = [
  ["Góc vuông có số đo bao nhiêu độ?", "90°"], ["Góc nhọn bé hơn hay lớn hơn góc vuông?", "Bé hơn góc vuông"],
  ["Góc tù lớn hơn hay bé hơn góc vuông?", "Lớn hơn góc vuông, bé hơn góc bẹt"], ["Góc bẹt bằng mấy góc vuông?", "2 góc vuông (180°)"],
  ["Hai đường thẳng vuông góc tạo thành mấy góc vuông?", "4 góc vuông"], ["Hai đường thẳng song song có cắt nhau không?", "Không bao giờ cắt nhau"],
  ["Dụng cụ nào dùng để đo góc?", "Thước đo góc"], ["Hình chữ nhật có mấy góc vuông?", "4 góc vuông"],
  ["Lúc 3 giờ đúng, kim giờ và kim phút tạo thành góc gì?", "Góc vuông"], ["Lúc 6 giờ đúng, kim giờ và kim phút tạo thành góc gì?", "Góc bẹt"],
];
export const angles = G("Góc nhọn < góc vuông (90°) < góc tù < góc bẹt (180°). Dùng ê ke để kiểm tra góc vuông.", (r) => {
  const [q, a] = pick(r, ANGLES);
  return { q, a };
});
export const volume = G("Thể tích hình hộp chữ nhật = dài × rộng × cao. Thể tích hình lập phương = cạnh × cạnh × cạnh. Diện tích tam giác = đáy × chiều cao : 2.", (r) => {
  const t = int(r, 0, 2);
  if (t === 0) {
    const a = int(r, 2, 9), b = int(r, 2, 9), c = int(r, 2, 9);
    return { q: `Hình hộp chữ nhật dài ${a} cm, rộng ${b} cm, cao ${c} cm. Tính thể tích.`, a: `${a * b * c} cm³`, why: `${a} × ${b} × ${c} = ${a * b * c}` };
  }
  if (t === 1) {
    const a = int(r, 2, 12);
    return { q: `Hình lập phương cạnh ${a} dm. Tính thể tích.`, a: `${a * a * a} dm³`, why: `${a} × ${a} × ${a} = ${a * a * a}` };
  }
  const b = int(r, 2, 15) * 2, h = int(r, 3, 20);
  return { q: `Tam giác có đáy ${b} cm, chiều cao ${h} cm. Tính diện tích.`, a: `${(b * h) / 2} cm²`, why: `${b} × ${h} : 2 = ${(b * h) / 2}` };
});

/* ---------- Tính chất, dãy số ---------- */
export const divisible = G("Chia hết cho 2: tận cùng là 0, 2, 4, 6, 8. Chia hết cho 5: tận cùng là 0 hoặc 5. Chia hết cho 3 (hoặc 9): tổng các chữ số chia hết cho 3 (hoặc 9).", (r) => {
  const d = pick(r, [2, 5, 3, 9]);
  const target = d * int(r, Math.ceil(100 / d), Math.floor(999 / d));
  const others = new Set<number>();
  while (others.size < 3) {
    const x = int(r, 100, 999);
    if (x % d !== 0) others.add(x);
  }
  const list = shuffle(r, [target, ...others]);
  return { q: `Trong các số ${list.join("; ")}, số nào chia hết cho ${d}?`, a: `${target}` };
});
export const average = G("Trung bình cộng = tổng các số : số các số hạng.", (r) => {
  const a = int(r, 10, 60), b = int(r, 10, 60);
  let c = int(r, 10, 60);
  while ((a + b + c) % 3 !== 0) c++;
  return { q: `Tìm số trung bình cộng của ${a}, ${b} và ${c}.`, a: `${(a + b + c) / 3}`, why: `(${a} + ${b} + ${c}) : 3 = ${(a + b + c) / 3}` };
});
export const sumDiff = G("Tìm hai số khi biết tổng và hiệu: Số lớn = (tổng + hiệu) : 2; Số bé = (tổng − hiệu) : 2.", (r) => {
  const small = int(r, 10, 200), diff = int(r, 2, 80) * 2 - (r() < 0.5 ? 0 : 0);
  const big = small + diff;
  return { q: `Tổng hai số là ${big + small}, hiệu hai số là ${diff}. Tìm hai số đó.`, a: `Số lớn ${big}, số bé ${small}`, why: `(${big + small} + ${diff}) : 2 = ${big}` };
});

/* ---------- Phân số ---------- */
const COPRIME: [number, number][] = [[1, 2], [1, 3], [2, 3], [1, 4], [3, 4], [2, 5], [3, 5], [4, 5], [1, 6], [5, 6], [3, 7], [2, 7], [3, 8], [5, 8], [7, 9], [4, 9]];
const simplify = (n: number, d: number) => {
  const g = gcd(n, d);
  return d / g === 1 ? `${n / g}` : `${n / g}/${d / g}`;
};
export const fracEquiv = G("Nhân (hoặc chia) cả tử số và mẫu số với cùng một số khác 0 thì được phân số bằng phân số đã cho.", (r) => {
  const [a, b] = pick(r, COPRIME), k = int(r, 2, 6);
  return { q: `Điền số thích hợp: ${a}/${b} = …/${b * k}`, a: `${a * k}`, why: `Nhân cả tử và mẫu với ${k}` };
});
export const fracSimplify = G("Rút gọn phân số: chia cả tử số và mẫu số cho cùng một số lớn hơn 1 đến khi không chia được nữa.", (r) => {
  const [a, b] = pick(r, COPRIME), k = int(r, 2, 9);
  return { q: `Rút gọn phân số ${a * k}/${b * k}`, a: `${a}/${b}`, why: `Chia cả tử và mẫu cho ${k}` };
});
export const fracCompare = G("Hai phân số cùng mẫu số: phân số nào có tử số lớn hơn thì lớn hơn. Khác mẫu: quy đồng rồi so sánh.", (r) => {
  const n = int(r, 3, 12), a = int(r, 1, n - 1);
  let b = int(r, 1, n - 1);
  if (b === a) b = a === 1 ? 2 : a - 1;
  return { q: `So sánh hai phân số: ${a}/${n} … ${b}/${n}`, a: `${a}/${n} ${sign(a, b)} ${b}/${n}` };
});
export const fracAddSame = G("Cộng (trừ) hai phân số cùng mẫu: cộng (trừ) hai tử số và giữ nguyên mẫu số, rồi rút gọn nếu được.", (r) => {
  const n = int(r, 3, 12), a = int(r, 1, n - 1), b = int(r, 1, n - 1);
  if (r() < 0.5) return { q: `${a}/${n} + ${b}/${n} = ?`, a: simplify(a + b, n), why: `${a + b}/${n}` };
  const hi = Math.max(a, b), lo = Math.min(a, b);
  return { q: `${hi}/${n} − ${lo}/${n} = ?`, a: hi === lo ? "0" : simplify(hi - lo, n), why: `${hi - lo}/${n}` };
});
export const fracAddDiff = G("Cộng hai phân số khác mẫu: quy đồng mẫu số rồi cộng hai tử số.", (r) => {
  const b = int(r, 2, 5), k = int(r, 2, 3), a = int(r, 1, b - 1), c = int(r, 1, b * k - 1);
  return { q: `${a}/${b} + ${c}/${b * k} = ?`, a: simplify(a * k + c, b * k), why: `${a}/${b} = ${a * k}/${b * k}` };
});

/* ---------- Số thập phân, phần trăm, chuyển động ---------- */
export const decFraction = G("Phân số thập phân có mẫu số 10, 100, 1000. Ví dụ: 7/10 = 0,7; 25/100 = 0,25.", (r) => {
  const scale = pick(r, [10, 100]);
  const n = int(r, 1, scale * 3 - 1);
  return r() < 0.6 ? { q: `Viết phân số ${n}/${scale} thành số thập phân.`, a: dec(n, scale) } : { q: `Viết số thập phân ${dec(n, scale)} thành phân số thập phân.`, a: `${n}/${scale}` };
});
export const decRead = G("Số thập phân gồm phần nguyên (bên trái dấu phẩy) và phần thập phân (bên phải dấu phẩy).", (r) => {
  const v = int(r, 101, 9999);
  if (v % 10 === 0) return { q: `So sánh: ${dec(v, 100)} … ${dec(v + 1, 100)}`, a: `${dec(v, 100)} < ${dec(v + 1, 100)}` };
  if (r() < 0.5) {
    const w = int(r, 101, 9999);
    return { q: `So sánh: ${dec(v, 100)} … ${dec(w, 100)}`, a: `${dec(v, 100)} ${sign(v, w)} ${dec(w, 100)}` };
  }
  return { q: `Số ${dec(v, 100)} có phần nguyên và phần thập phân là bao nhiêu?`, a: `Phần nguyên ${Math.floor(v / 100)}, phần thập phân ${String(v % 100).padStart(2, "0").replace(/0$/, "")}` };
});
export const decAddSub = G("Cộng, trừ số thập phân: viết các dấu phẩy thẳng cột, tính như số tự nhiên rồi đặt dấu phẩy ở kết quả.", (r) => {
  const a = int(r, 105, 9999), b = int(r, 105, 9999);
  return r() < 0.5 ? { q: `${dec(a, 100)} + ${dec(b, 100)} = ?`, a: dec(a + b, 100) } : { q: `${dec(Math.max(a, b), 100)} − ${dec(Math.min(a, b), 100)} = ?`, a: dec(Math.abs(a - b), 100) };
});
export const decMulDiv = G("Nhân số thập phân với số tự nhiên: nhân như số tự nhiên rồi đếm số chữ số phần thập phân để đặt dấu phẩy. Nhân với 10, 100: dời dấu phẩy sang phải 1, 2 chữ số.", (r) => {
  const t = int(r, 0, 2);
  const a = int(r, 11, 999), b = int(r, 2, 9);
  if (t === 0) return { q: `${dec(a, 10)} × ${b} = ?`, a: dec(a * b, 10) };
  if (t === 1) return { q: `${dec(a * b, 10)} : ${b} = ?`, a: dec(a, 10) };
  const k = pick(r, [10, 100]);
  return { q: `${dec(a, 100)} × ${k} = ?`, a: dec(a * k, 100) };
});
export const percent = G("Tìm a% của B: lấy B : 100 × a. Tìm tỉ số phần trăm của a và b: lấy a : b × 100 rồi viết thêm kí hiệu %.", (r) => {
  if (r() < 0.6) {
    const p = pick(r, [5, 10, 15, 20, 25, 30, 40, 50, 75]), base = int(r, 1, 20) * 20;
    return { q: `Tìm ${p}% của ${fmt(base)}.`, a: fmt((p * base) / 100), why: `${fmt(base)} : 100 × ${p} = ${fmt((p * base) / 100)}` };
  }
  const b = pick(r, [20, 25, 40, 50, 200]), p = pick(r, [10, 20, 40, 50, 60, 80]);
  const a = (b * p) / 100;
  return { q: `Lớp có ${b} học sinh, trong đó ${a} bạn đạt loại giỏi. Số bạn giỏi chiếm bao nhiêu phần trăm?`, a: `${p}%`, why: `${a} : ${b} × 100 = ${p}` };
});
export const motion = G("Chuyển động đều: quãng đường = vận tốc × thời gian; vận tốc = quãng đường : thời gian; thời gian = quãng đường : vận tốc.", (r) => {
  const v = pick(r, [12, 30, 36, 40, 45, 50, 60]), t = int(r, 2, 5), s = v * t;
  const k = int(r, 0, 2);
  if (k === 0) return { q: `Một xe đi với vận tốc ${v} km/giờ trong ${t} giờ. Tính quãng đường xe đi được.`, a: `${s} km`, why: `${v} × ${t} = ${s}` };
  if (k === 1) return { q: `Một người đi ${s} km hết ${t} giờ. Tính vận tốc.`, a: `${v} km/giờ`, why: `${s} : ${t} = ${v}` };
  return { q: `Quãng đường dài ${s} km, xe đi với vận tốc ${v} km/giờ. Hỏi xe đi hết bao lâu?`, a: `${t} giờ`, why: `${s} : ${v} = ${t}` };
});

/** Ten topic generator groups per grade, aligned with TOPICS.math in libraryCurriculum. */
export const MATH_TOPICS: Record<Grade, Gen[][]> = {
  1: [
    [countObjects, neighbor(10)], [compare(10), order(10)], [addWithin(10)], [subWithin(10)], [addWithin(20), subWithin(20)],
    [tensUnits(100)], [shapes], [wordAdd(10), wordSub(10)], [lengthAdd(20), clock(false)],
    [addWithin(10), subWithin(10), compare(20), wordAdd(10), wordSub(10), clock(false), shapes],
  ],
  2: [
    [compare(100), neighbor(100), tensUnits(100), order(100)], [addCarry], [subBorrow], [mulTable([2, 5])], [mulTable([3, 4])],
    [divTable([2, 3, 4, 5]), divEqual], [unitConvert(2), lengthAdd(100)], [zigzag, shapes], [twoStep],
    [addCarry, subBorrow, mulTable([2, 3, 4, 5]), divTable([2, 3, 4, 5]), clock(true), twoStep],
  ],
  3: [
    [placeValue(4, 4), compare(9999)], [bigAdd(1000, 9999), bigSub(1000, 9999)], [mulTable([6, 7, 8, 9]), divTable([6, 7, 8, 9])], [mulBig(12, 999, 2, 9)],
    [divRemainder], [fractionOf], [perimeter], [unitConvert(3), timeWord], [wordMulDiv, twoStep],
    [bigAdd(1000, 9999), bigSub(1000, 9999), mulBig(12, 999, 2, 9), divRemainder, fractionOf, perimeter, wordMulDiv],
  ],
  4: [
    [placeValue(5, 9), compare(9_999_999)], [unitConvert(4)], [bigAdd(10_000, 999_999), bigSub(10_000, 999_999)], [mulBig(101, 999, 11, 99), divExact(11, 99, 12, 300)],
    [divisible], [fracEquiv], [fracSimplify, fracCompare], [angles], [area, perimeter],
    [average, sumDiff, divisible, fracSimplify, area, mulBig(101, 999, 11, 99)],
  ],
  5: [
    [fracAddSame, fracSimplify, average], [decFraction], [decRead], [decAddSub], [decMulDiv], [percent], [unitConvert(5)], [volume], [motion],
    [fracAddDiff, decAddSub, decMulDiv, percent, volume, motion, sumDiff],
  ],
};
