import type { Grade, Subject } from "./types";
import { getLibraryVolume, type LibraryLesson, type LibraryVolume } from "./libraryCurriculum";

const PAGE_W = 1240;
const PAGE_H = 1754;
const PDF_W = 595;
const PDF_H = 842;

function wrapText(ctx: CanvasRenderingContext2D, text: string, maxWidth: number): string[] {
  const words = text.split(/\s+/);
  const lines: string[] = [];
  let line = "";
  for (const word of words) {
    const candidate = line ? line + " " + word : word;
    if (line && ctx.measureText(candidate).width > maxWidth) {
      lines.push(line);
      line = word;
    } else {
      line = candidate;
    }
  }
  if (line) lines.push(line);
  return lines;
}

function drawParagraph(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  width: number,
  font: string,
  color: string,
  lineHeight: number,
): number {
  ctx.font = font;
  ctx.fillStyle = color;
  const lines = wrapText(ctx, text, width);
  for (const line of lines) {
    ctx.fillText(line, x, y);
    y += lineHeight;
  }
  return y;
}

function roundedPanel(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, color: string) {
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.roundRect(x, y, w, h, 28);
  ctx.fill();
}

function renderCover(volume: LibraryVolume): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = PAGE_W;
  canvas.height = PAGE_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Thiết bị chưa hỗ trợ tạo tài liệu PDF.");
  ctx.fillStyle = "#fffdf7";
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);
  ctx.fillStyle = "#0f684f";
  ctx.fillRect(0, 0, PAGE_W, 390);
  ctx.fillStyle = "#d9f5e8";
  ctx.font = "bold 32px Arial";
  ctx.fillText("THƯ VIỆN BÉ VUI HỌC", 100, 105);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 76px Arial";
  const titleLines = wrapText(ctx, volume.title, 1020);
  titleLines.slice(0, 2).forEach((line, i) => ctx.fillText(line, 100, 220 + i * 92));
  ctx.fillStyle = "#275b49";
  ctx.font = "bold 42px Arial";
  ctx.fillText("TÀI LIỆU HỌC TẬP OFFLINE", 100, 540);
  ctx.font = "32px Arial";
  drawParagraph(ctx, volume.description, 100, 625, 1020, "32px Arial", "#344b42", 48);
  roundedPanel(ctx, 100, 850, 1040, 340, "#e9f6ef");
  ctx.fillStyle = "#145b43";
  ctx.font = "bold 38px Arial";
  ctx.fillText("NỘI DUNG BỘ TÀI LIỆU", 145, 925);
  ctx.font = "30px Arial";
  let y = 1000;
  volume.lessons.forEach((lesson, i) => {
    if (i < 10) {
      ctx.fillStyle = "#29463b";
      ctx.fillText(`${i + 1}. ${lesson.title}`, 150, y);
      y += 48;
    }
  });
  ctx.fillStyle = "#64756c";
  ctx.font = "24px Arial";
  ctx.fillText("Nội dung do Bé Vui Học biên soạn; không sao chép nguyên văn sách giáo khoa.", 100, 1600);
  return canvas;
}

function renderLesson(volume: LibraryVolume, lesson: LibraryLesson, index: number): HTMLCanvasElement {
  const canvas = document.createElement("canvas");
  canvas.width = PAGE_W;
  canvas.height = PAGE_H;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Thiết bị chưa hỗ trợ tạo tài liệu PDF.");
  ctx.fillStyle = "#fffdf8";
  ctx.fillRect(0, 0, PAGE_W, PAGE_H);
  ctx.fillStyle = "#0f684f";
  ctx.fillRect(0, 0, PAGE_W, 155);
  ctx.fillStyle = "#e2f7eb";
  ctx.font = "bold 25px Arial";
  ctx.fillText(`BÉ VUI HỌC  •  LỚP ${volume.grade}`, 80, 62);
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 42px Arial";
  ctx.fillText(volume.subject === "math" ? "TOÁN" : volume.subject === "viet" ? "TIẾNG VIỆT" : "TIẾNG ANH", 80, 118);
  let y = 245;
  y = drawParagraph(ctx, lesson.title, 80, y, 1080, "bold 48px Arial", "#173e30", 64) + 28;

  roundedPanel(ctx, 70, y, 1100, 390, "#eaf5ff");
  y += 65;
  y = drawParagraph(ctx, "KIẾN THỨC CẦN NHỚ", 110, y, 1000, "bold 30px Arial", "#145b82", 42) + 20;
  y = drawParagraph(ctx, lesson.knowledge, 110, y, 1000, "30px Arial", "#263b48", 48) + 40;

  roundedPanel(ctx, 70, y, 1100, 230, "#fff2d9");
  y += 65;
  y = drawParagraph(ctx, "VÍ DỤ MINH HỌA", 110, y, 1000, "bold 30px Arial", "#8a5610", 42) + 20;
  y = drawParagraph(ctx, lesson.example, 110, y, 1000, "30px Arial", "#493b27", 48) + 55;

  roundedPanel(ctx, 70, y, 1100, 430, "#f1f7ed");
  y += 65;
  y = drawParagraph(ctx, "BÉ TỰ LUYỆN TẬP", 110, y, 1000, "bold 30px Arial", "#28613a", 42) + 25;
  lesson.exercises.forEach((exercise, i) => {
    y = drawParagraph(ctx, `${i + 1}. ${exercise}`, 115, y, 990, "29px Arial", "#263b2b", 44) + 18;
  });
  y += 18;
  y = drawParagraph(ctx, "GỢI Ý HỌC TẬP", 110, y, 1000, "bold 27px Arial", "#28613a", 38) + 12;
  drawParagraph(ctx, lesson.guidance, 110, y, 990, "25px Arial", "#405547", 38);

  ctx.fillStyle = "#829188";
  ctx.font = "22px Arial";
  ctx.fillText(`${volume.title}  •  Trang ${index + 2}/${volume.lessons.length + 1}`, 80, 1690);
  return canvas;
}

async function canvasJpeg(canvas: HTMLCanvasElement): Promise<Uint8Array> {
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((value) => value ? resolve(value) : reject(new Error("Không thể tạo trang PDF.")), "image/jpeg", 0.88);
  });
  return new Uint8Array(await blob.arrayBuffer());
}

function ascii(value: string): Uint8Array {
  return new TextEncoder().encode(value);
}

function joinBytes(parts: Uint8Array[]): Uint8Array {
  const size = parts.reduce((sum, part) => sum + part.length, 0);
  const output = new Uint8Array(size);
  let offset = 0;
  for (const part of parts) {
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

function buildPdf(images: Uint8Array[]): Blob {
  const objects: Uint8Array[] = [];
  const kids = images.map((_, i) => `${3 + i * 3} 0 R`).join(" ");
  objects[1] = ascii("<< /Type /Catalog /Pages 2 0 R >>");
  objects[2] = ascii(`<< /Type /Pages /Kids [${kids}] /Count ${images.length} >>`);
  images.forEach((image, i) => {
    const pageId = 3 + i * 3;
    const imageId = pageId + 1;
    const contentId = pageId + 2;
    objects[pageId] = ascii(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_W} ${PDF_H}] /Resources << /XObject << /Im0 ${imageId} 0 R >> >> /Contents ${contentId} 0 R >>`);
    objects[imageId] = joinBytes([
      ascii(`<< /Type /XObject /Subtype /Image /Width ${PAGE_W} /Height ${PAGE_H} /ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /DCTDecode /Length ${image.length} >>\nstream\n`),
      image,
      ascii("\nendstream"),
    ]);
    const stream = ascii("q\n595 0 0 842 0 0 cm\n/Im0 Do\nQ\n");
    objects[contentId] = joinBytes([
      ascii(`<< /Length ${stream.length} >>\nstream\n`),
      stream,
      ascii("endstream"),
    ]);
  });

  const parts: Uint8Array[] = [ascii("%PDF-1.4\n%âãÏÓ\n")];
  const offsets = [0];
  let length = parts[0]!.length;
  for (let id = 1; id < objects.length; id++) {
    offsets[id] = length;
    const chunk = joinBytes([ascii(`${id} 0 obj\n`), objects[id]!, ascii("\nendobj\n")]);
    parts.push(chunk);
    length += chunk.length;
  }
  const xrefOffset = length;
  let xref = `xref\n0 ${objects.length}\n0000000000 65535 f \n`;
  for (let id = 1; id < objects.length; id++) {
    xref += `${String(offsets[id]).padStart(10, "0")} 00000 n \n`;
  }
  const trailer = `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;
  parts.push(ascii(xref + trailer));
  return new Blob(parts as BlobPart[], { type: "application/pdf" });
}

export async function createLibraryPdf(subject: Subject, grade: Grade, documentTitle?: string): Promise<string> {
  const source = getLibraryVolume(subject, grade);
  const volume: LibraryVolume = documentTitle ? { ...source, title: documentTitle } : source;
  const canvases = [renderCover(volume), ...volume.lessons.map((lesson, index) => renderLesson(volume, lesson, index))];
  const images = await Promise.all(canvases.map(canvasJpeg));
  return URL.createObjectURL(buildPdf(images));
}
