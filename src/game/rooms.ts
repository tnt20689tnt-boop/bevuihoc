import mathImg from "@/assets/room-math.jpg";
import vietImg from "@/assets/room-vietnamese.jpg";
import engImg from "@/assets/room-english.jpg";
import salonImg from "@/assets/room-salon.jpg";
import footballImg from "@/assets/room-football.jpg";

export type RoomId = "plaza" | "math" | "vietnamese" | "english" | "girls" | "boys" | "arena" | "library";
export const ROOM_IDS: RoomId[] = ["plaza", "math", "vietnamese", "english", "girls", "boys", "arena", "library"];

export type Activity = {
  x: number;
  z: number;
  label: string;
  icon: string;
  to: "/hoc/$subject" | "/salon" | "/tao-nguoi-mau" | "/san-bong" | "/thi-dau" | "/bang-xep-hang" | "/sanh-vinh-danh";
  params?: { subject: string };
};

export type Portal = { to: RoomId; x: number; z: number };

export type RoomDef = {
  id: RoomId;
  name: string;
  short: string;
  emoji: string;
  color: string; // 3D accent color
  ground: [string, string]; // base + pattern
  sky: string;
  image?: string;
  blurb: string;
  radius: number;
  portals: Portal[];
  activities: Activity[];
  obstacles: { x: number; z: number; r: number }[];
};

// Campus layout: learning buildings around an open central courtyard, with a few swings placed separately.
export const PLAZA_PORTALS: Portal[] = [
  { to: "math", x: -7.731092, z: -2.577031 },
  { to: "vietnamese", x: 7.731092, z: -2.577031 },
  { to: "english", x: 0, z: -13.5 },
  { to: "girls", x: -8.91727, z: 6.777125 },
  { to: "boys", x: 10.052813, z: -11.599399 },
  { to: "arena", x: -10.052813, z: -11.599399 },
  { to: "library", x: 15.5, z: -2.577031 },
];

export function portalBuildingPosition(portal: Portal): [number, number] {
  const length = Math.hypot(portal.x, portal.z) || 1;
  return [portal.x + (portal.x / length) * 4.5, portal.z + (portal.z / length) * 4.5];
}

const EXIT: Portal = { to: "plaza", x: 0, z: 11 };

export const ROOMS: Record<RoomId, RoomDef> = {
  plaza: {
    id: "plaza",
    name: "Quảng trường trung tâm",
    short: "Quảng trường",
    emoji: "⛲",
    color: "#ffb347",
    ground: ["#f3e3c3", "#e9d2a6"],
    sky: "#9fd8ff",
    blurb: "Nơi các bạn gặp nhau, chào hỏi và chọn phòng học.",
    radius: 29,
    portals: PLAZA_PORTALS,
    activities: [
      { x: 6, z: 6, label: "Bảng xếp hạng", icon: "🏆", to: "/bang-xep-hang" },
      { x: 0, z: 9.5, label: "Sảnh vinh danh", icon: "👑", to: "/sanh-vinh-danh" },
    ],
    obstacles: [
      { x: -20, z: -4, r: 3.1 },
      ...PLAZA_PORTALS.map((portal) => { const [x, z] = portalBuildingPosition(portal); return { x, z, r: portal.to === "arena" ? 2.15 : 3.35 }; }),
    ],
  },
  math: {
    id: "math",
    name: "Phòng Toán học",
    short: "Toán",
    emoji: "🔢",
    color: "#4f8ef7",
    ground: ["#d8e8ff", "#c2d8fb"],
    sky: "#a9d4ff",
    image: mathImg,
    blurb: "Cộng, trừ, nhân, chia, hình học và toán có lời văn.",
    radius: 14,
    portals: [EXIT],
    activities: [
      {
        x: 0,
        z: -5,
        label: "Vào học Toán",
        icon: "🔢",
        to: "/hoc/$subject",
        params: { subject: "math" },
      },
    ],
    obstacles: [{ x: 0, z: -10, r: 2.2 }],
  },
  vietnamese: {
    id: "vietnamese",
    name: "Phòng Tiếng Việt",
    short: "Tiếng Việt",
    emoji: "📖",
    color: "#f5b730",
    ground: ["#fff1cc", "#fbe3a3"],
    sky: "#ffe2a8",
    image: vietImg,
    blurb: "Luyện đọc, chính tả, từ vựng, ngữ pháp và đọc hiểu.",
    radius: 14,
    portals: [EXIT],
    activities: [
      {
        x: 0,
        z: -5,
        label: "Vào học Tiếng Việt",
        icon: "📖",
        to: "/hoc/$subject",
        params: { subject: "vietnamese" },
      },
    ],
    obstacles: [
      { x: 7, z: -3, r: 2.2 },
      { x: 0, z: -10, r: 2.2 },
    ],
  },
  english: {
    id: "english",
    name: "Phòng Tiếng Anh",
    short: "Tiếng Anh",
    emoji: "🌍",
    color: "#3fbf6f",
    ground: ["#dcf5df", "#c4ebc9"],
    sky: "#a8e6ff",
    image: engImg,
    blurb: "Chữ cái, số đếm, màu sắc, con vật và câu giao tiếp.",
    radius: 14,
    portals: [EXIT],
    activities: [
      {
        x: 0,
        z: -5,
        label: "Vào học Tiếng Anh",
        icon: "🌍",
        to: "/hoc/$subject",
        params: { subject: "english" },
      },
    ],
    obstacles: [
      { x: -7, z: -4, r: 1.8 },
      { x: 7, z: -4, r: 1.6 },
    ],
  },
  girls: {
    id: "girls",
    name: "Khu vui chơi bé gái – Salon làm đẹp",
    short: "Salon",
    emoji: "💄",
    color: "#ff6fa8",
    ground: ["#ffe1ee", "#ffcce2"],
    sky: "#ffd6ea",
    image: salonImg,
    blurb: "Trang điểm, làm tóc và thay trang phục cho cô bé anime.",
    radius: 14,
    portals: [EXIT],
    activities: [
      { x: -2.1, z: -5, label: "Vào Salon làm đẹp", icon: "💄", to: "/salon" },
      { x: 3.6, z: -5, label: "Tạo người mẫu", icon: "👗", to: "/tao-nguoi-mau" },
    ],
    obstacles: [{ x: 0, z: -10, r: 2.4 }],
  },

  arena: {
    id: "arena",
    name: "Nhà thi đấu tri thức",
    short: "Nhà thi đấu",
    emoji: "🏆",
    color: "#d99b45",
    ground: ["#c9955f", "#b77d49"],
    sky: "#b8dff4",
    blurb: "Ngôi nhà thi đấu có bảng lớn, bục dẫn chương trình và khu vực thí sinh.",
    radius: 14,
    portals: [EXIT],
    activities: [],
    obstacles: [],
  },
  library: {
    id: "library",
    name: "Thư viện Bé Vui Học",
    short: "Thư viện",
    emoji: "📚",
    color: "#b98555",
    ground: ["#ead8bd", "#d8bd99"],
    sky: "#dcecff",
    blurb: "Không gian đọc sách Toán, Tiếng Việt và Tiếng Anh theo lớp của bé.",
    radius: 26,
    portals: [EXIT],
    activities: [],
    obstacles: [
      { x: -8.5, z: -15, r: 2.9 },
      { x: 0, z: -15, r: 2.9 },
      { x: 8.5, z: -15, r: 2.9 },
      { x: 0, z: 8, r: 3.0 },
    ],
  },
  boys: {
    id: "boys",
    name: "Khu vui chơi bé trai – Sân bóng Toán học",
    short: "Sân bóng",
    emoji: "⚽",
    color: "#1fb5a8",
    ground: ["#7ccf6a", "#6cc35a"],
    sky: "#a9dcff",
    image: footballImg,
    blurb: "Trả lời đúng để sút bóng vào gôn và ghi bàn.",
    radius: 14,
    portals: [EXIT],
    activities: [{ x: 0, z: -5, label: "Ra sân sút bóng", icon: "⚽", to: "/san-bong" }],
    obstacles: [],
  },
};

export function isRoomId(v: unknown): v is RoomId {
  return typeof v === "string" && (ROOM_IDS as string[]).includes(v);
}

/** Where a player appears when entering `to` from `from`. */
export function spawnPoint(to: RoomId, from: RoomId | null): { x: number; z: number; ry: number } {
  if (to === "arena") return { x: 0, z: 5, ry: Math.PI };
  if (to === "plaza") {
    const p = PLAZA_PORTALS.find((pp) => pp.to === from);
    if (p) {
      const len = Math.hypot(p.x, p.z);
      const k = (len - 3) / len; // just inside the portal, toward the fountain
      return { x: p.x * k, z: p.z * k, ry: Math.atan2(-p.x, -p.z) };
    }
    // Khi đăng nhập/chọn nhân vật, bé xuất hiện ngay phía trước cổng trường.
    // Cổng nằm ở z=26.2; lối đi lát đá kéo ra phía trước đến gần z=30.
    return { x: (Math.random() - 0.5) * 0.8, z: 29.2, ry: 0 };
  }
  return { x: (Math.random() - 0.5) * 3, z: 5, ry: Math.PI };
}
