// Character (avatar) configuration shared by the 3D model, the 2D badge and the editor.

export type Gender = "boy" | "girl";

export type Avatar = {
  gender: Gender;
  skin: string;
  hair: string;
  hairColor: string;
  eyes: "round" | "happy" | "sparkle" | "wink";
  mouth: "smile" | "grin" | "open" | "tongue";
  outfit: string;
  topColor: string;
  bottomColor: string;
  shoeColor: string;
  accessory: string;
};

export const SKIN_TONES = ["#ffe0c7", "#f6c9a0", "#e0a878", "#b97a4f"];
export const HAIR_COLORS = ["#2b1d16", "#5a3825", "#a0612f", "#e3b04b", "#e86a92", "#5b7fd6"];
export const CLOTH_COLORS = [
  "#ff7a59",
  "#ffc93c",
  "#4cc38a",
  "#3fa7f5",
  "#ff6fa8",
  "#9b7bea",
  "#ffffff",
  "#2f3e66",
  "#e84a4a",
  "#1fb5a8",
];

export const HAIR_STYLES: Record<Gender, { id: string; name: string }[]> = {
  boy: [
    { id: "short", name: "Tóc ngắn" },
    { id: "spiky", name: "Tóc dựng" },
    { id: "curly", name: "Tóc xoăn" },
    { id: "side", name: "Rẽ ngôi" },
    { id: "buzz", name: "Đầu đinh" },
  ],
  girl: [
    { id: "long", name: "Tóc dài" },
    { id: "pigtails", name: "Hai bím" },
    { id: "ponytail", name: "Đuôi ngựa" },
    { id: "bun", name: "Búi tóc" },
    { id: "bob", name: "Tóc ngang vai" },
  ],
};

export const OUTFITS: Record<Gender, { id: string; name: string }[]> = {
  boy: [
    { id: "tshirt", name: "Áo thun" },
    { id: "hoodie", name: "Áo hoodie" },
    { id: "jersey", name: "Áo cầu thủ" },
    { id: "uniform", name: "Đồng phục" },
  ],
  girl: [
    { id: "dress", name: "Váy liền" },
    { id: "skirt", name: "Áo + chân váy" },
    { id: "overall", name: "Yếm" },
    { id: "uniform", name: "Đồng phục" },
  ],
};

export const ACCESSORIES: Record<Gender, { id: string; name: string }[]> = {
  boy: [
    { id: "none", name: "Không" },
    { id: "cap", name: "Mũ lưỡi trai" },
    { id: "glasses", name: "Kính" },
    { id: "star", name: "Kẹp ngôi sao" },
    { id: "headphones", name: "Tai nghe" },
  ],
  girl: [
    { id: "none", name: "Không" },
    { id: "bow", name: "Nơ xinh" },
    { id: "headband", name: "Băng đô" },
    { id: "flower", name: "Kẹp hoa" },
    { id: "glasses", name: "Kính" },
  ],
};

export const EYES: { id: Avatar["eyes"]; name: string }[] = [
  { id: "round", name: "Mắt tròn" },
  { id: "happy", name: "Mắt cười" },
  { id: "sparkle", name: "Mắt long lanh" },
  { id: "wink", name: "Nháy mắt" },
];
export const MOUTHS: { id: Avatar["mouth"]; name: string }[] = [
  { id: "smile", name: "Mỉm cười" },
  { id: "grin", name: "Cười tươi" },
  { id: "open", name: "Ngạc nhiên" },
  { id: "tongue", name: "Lè lưỡi" },
];

export function defaultAvatar(gender: Gender): Avatar {
  return gender === "boy"
    ? {
        gender,
        skin: "#f6c9a0",
        hair: "short",
        hairColor: "#2b1d16",
        eyes: "round",
        mouth: "smile",
        outfit: "tshirt",
        topColor: "#3fa7f5",
        bottomColor: "#2f3e66",
        shoeColor: "#ff7a59",
        accessory: "none",
      }
    : {
        gender,
        skin: "#ffe0c7",
        hair: "pigtails",
        hairColor: "#5a3825",
        eyes: "sparkle",
        mouth: "smile",
        outfit: "dress",
        topColor: "#ff6fa8",
        bottomColor: "#ffffff",
        shoeColor: "#ff7a59",
        accessory: "bow",
      };
}

function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)] as T;
}

export function randomAvatar(gender: Gender): Avatar {
  return {
    gender,
    skin: pick(SKIN_TONES),
    hair: pick(HAIR_STYLES[gender]).id,
    hairColor: pick(HAIR_COLORS),
    eyes: pick(EYES).id,
    mouth: pick(MOUTHS).id,
    outfit: pick(OUTFITS[gender]).id,
    topColor: pick(CLOTH_COLORS),
    bottomColor: pick(CLOTH_COLORS),
    shoeColor: pick(CLOTH_COLORS),
    accessory: pick(ACCESSORIES[gender]).id,
  };
}

/** Accept anything from the database / network and return a safe avatar. */
export function toAvatar(raw: unknown, fallbackGender: Gender = "boy"): Avatar {
  const r = (raw && typeof raw === "object" ? raw : {}) as Partial<Avatar>;
  const gender: Gender = r.gender === "girl" || r.gender === "boy" ? r.gender : fallbackGender;
  const base = defaultAvatar(gender);
  const str = (v: unknown, d: string) => (typeof v === "string" && v.length < 40 ? v : d);
  return {
    gender,
    skin: str(r.skin, base.skin),
    hair: str(r.hair, base.hair),
    hairColor: str(r.hairColor, base.hairColor),
    eyes: (EYES.some((e) => e.id === r.eyes) ? r.eyes : base.eyes) as Avatar["eyes"],
    mouth: (MOUTHS.some((m) => m.id === r.mouth) ? r.mouth : base.mouth) as Avatar["mouth"],
    outfit: str(r.outfit, base.outfit),
    topColor: str(r.topColor, base.topColor),
    bottomColor: str(r.bottomColor, base.bottomColor),
    shoeColor: str(r.shoeColor, base.shoeColor),
    accessory: str(r.accessory, base.accessory),
  };
}

const NAME_PARTS_A = ["Bé", "Bạn", "Siêu", "Tí", "Mèo", "Thỏ", "Gấu", "Sóc"];
const NAME_PARTS_B = ["Nhí", "Vui", "Xinh", "Nhanh", "Giỏi", "Sao", "Mây", "Nắng", "Bông", "Kẹo"];
export function suggestName(): string {
  return `${pick(NAME_PARTS_A)} ${pick(NAME_PARTS_B)} ${Math.floor(Math.random() * 90 + 10)}`;
}

const BLOCKED = /(địt|đụ|lồn|cặc|đéo|fuck|shit|bitch|vcl|vkl|dcm|đcm)/i;
export function validateName(name: string): string | null {
  const n = name.trim().replace(/\s+/g, " ");
  if (n.length < 2 || n.length > 20) return "Tên nhân vật cần từ 2 đến 20 ký tự";
  if (BLOCKED.test(n)) return "Tên chưa phù hợp, bé chọn tên khác nhé";
  if (/[<>{}]/.test(n)) return "Tên không được chứa ký tự đặc biệt";
  return null;
}
