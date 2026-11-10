export type Grade = 1 | 2 | 3 | 4 | 5;
export type Subject = "math" | "viet" | "english";
export type Book = {
 id:string; title:string; subject:Subject; grade:Grade; color:string;
 cover_url?:string|null; file_url?:string|null; description?:string|null;
 total_copies?:number; available_copies?:number;
};
