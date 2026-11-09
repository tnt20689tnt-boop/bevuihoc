import { useEffect, useMemo, useState } from "react";
import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { profileQueryKey, type Profile } from "@/hooks/use-player";
import { AvatarBadge } from "@/components/AvatarBadge";
import {
  ACCESSORIES,
  CLOTH_COLORS,
  defaultAvatar,
  HAIR_COLORS,
  HAIR_STYLES,
  OUTFITS,
  SKIN_TONES,
  suggestName,
  validateName,
  type Avatar,
  type Gender,
} from "@/lib/avatar";

export const Route = createFileRoute("/_authenticated/nhan-vat")({
  head: () => ({
    meta: [
      { title: "Tạo nhân vật – Bé Học Vui" },
      { name: "description", content: "Bé chọn tên, lớp học và tạo nhân vật để vào trường 3D." },
    ],
  }),
  component: CharacterCreator,
});

function ChoiceButton({
  selected,
  onClick,
  children,
}: {
  selected: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-xl border-2 px-3 py-2 text-sm font-extrabold transition ${selected
        ? "border-emerald-500 bg-emerald-50 text-emerald-800 shadow-sm"
        : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"}`}
    >
      {children}
    </button>
  );
}

function Swatches({
  colors,
  value,
  onChange,
  label,
}: {
  colors: string[];
  value: string;
  onChange: (color: string) => void;
  label: string;
}) {
  return (
    <div className="flex flex-wrap gap-2" aria-label={label}>
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={`${label} ${color}`}
          aria-pressed={value === color}
          onClick={() => onChange(color)}
          className={`h-8 w-8 rounded-full border-2 transition ${value === color ? "scale-110 border-slate-800 ring-2 ring-white" : "border-white shadow"}`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

function CharacterCreator() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [gender, setGender] = useState<Gender>("boy");
  const [avatar, setAvatar] = useState<Avatar>(() => defaultAvatar("boy"));
  const [name, setName] = useState("");
  const [grade, setGrade] = useState(1);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let alive = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (!alive) return;
      const fullName = data.user?.user_metadata?.full_name;
      if (typeof fullName === "string" && fullName.trim()) setName(fullName.trim().slice(0, 20));
      else setName(suggestName());
    });
    return () => { alive = false; };
  }, []);

  const hairStyles = useMemo(() => HAIR_STYLES[gender], [gender]);
  const outfits = useMemo(() => OUTFITS[gender], [gender]);
  const accessories = useMemo(() => ACCESSORIES[gender], [gender]);

  function changeGender(next: Gender) {
    setGender(next);
    setAvatar(defaultAvatar(next));
  }

  function patchAvatar(patch: Partial<Avatar>) {
    setAvatar((current) => ({ ...current, ...patch, gender }));
  }

  async function finish() {
    const validation = validateName(name);
    if (validation) {
      setError(validation);
      return;
    }
    setSaving(true);
    setError("");
    try {
      const { data: auth, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!auth.user) {
        void navigate({ to: "/auth", replace: true });
        return;
      }
      const cleanName = name.trim().replace(/\s+/g, " ");
      const savedAvatar: Avatar = { ...defaultAvatar(gender), ...avatar, gender };
      const { data: saved, error: saveError } = await supabase
        .from("profiles")
        .upsert({
          id: auth.user.id,
          display_name: cleanName,
          gender,
          grade,
          avatar: savedAvatar,
        })
        .select("id, display_name, gender, grade, avatar")
        .single();
      if (saveError) throw saveError;
      // Seed the saved profile before navigation so a stale cached null
      // cannot send the child back to this form.
      queryClient.setQueryData<Profile>(profileQueryKey, {
        id: saved.id,
        display_name: saved.display_name,
        gender: saved.gender as Gender,
        grade: saved.grade,
        avatar: { ...savedAvatar, ...(saved.avatar as Partial<Avatar>), gender },
      });
      void queryClient.invalidateQueries({ queryKey: profileQueryKey });
      toast.success("Tạo nhân vật thành công! Chào mừng bé đến trường 🎉");
      await navigate({ to: "/the-gioi", replace: true });
    } catch (cause) {
      const message = cause instanceof Error ? cause.message : "Không lưu được nhân vật. Bé thử lại nhé.";
      setError(message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_10%_0%,#d9f5ff_0%,transparent_38%),radial-gradient(ellipse_at_90%_10%,#ffebf4_0%,transparent_36%),linear-gradient(145deg,#f4fbff,#fff8e9)] px-4 py-8 text-slate-800">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 text-center">
          <div className="text-5xl">🏫</div>
          <p className="mt-2 text-xs font-black uppercase tracking-[.22em] text-emerald-700">Bé Học Vui · Trường học 3D</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">Tạo nhân vật của bé</h1>
          <p className="mt-2 text-slate-600">Chọn diện mạo yêu thích rồi cùng bước vào sân trường nhé!</p>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="space-y-5 rounded-[2rem] border-4 border-white bg-white/95 p-5 shadow-[0_24px_70px_-32px_rgba(35,74,83,.35)] sm:p-7">
            <div>
              <label htmlFor="character-name" className="mb-2 block font-black">1. Tên nhân vật</label>
              <div className="flex gap-2">
                <input
                  id="character-name"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  maxLength={20}
                  placeholder="Ví dụ: Bé Mây"
                  className="min-w-0 flex-1 rounded-xl border-2 border-slate-200 px-4 py-3 font-bold outline-none focus:border-emerald-400"
                />
                <button type="button" onClick={() => setName(suggestName())} className="rounded-xl bg-amber-100 px-3 font-extrabold text-amber-900">Gợi ý tên</button>
              </div>
            </div>

            <div>
              <p className="mb-2 font-black">2. Bé là</p>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" onClick={() => changeGender("boy")} className={`rounded-2xl border-2 p-4 text-center font-extrabold ${gender === "boy" ? "border-sky-400 bg-sky-50 text-sky-800" : "border-slate-200"}`}>
                  <span className="block text-3xl">👦</span>Bé trai
                </button>
                <button type="button" onClick={() => changeGender("girl")} className={`rounded-2xl border-2 p-4 text-center font-extrabold ${gender === "girl" ? "border-pink-400 bg-pink-50 text-pink-800" : "border-slate-200"}`}>
                  <span className="block text-3xl">👧</span>Bé gái
                </button>
              </div>
            </div>

            <div>
              <p className="mb-2 font-black">3. Bé đang học lớp</p>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <ChoiceButton key={value} selected={grade === value} onClick={() => setGrade(value)}>
                    Lớp {value}
                  </ChoiceButton>
                ))}
              </div>
            </div>

            <div>
              <p className="mb-2 font-black">4. Kiểu tóc</p>
              <div className="flex flex-wrap gap-2">
                {hairStyles.map((style) => (
                  <ChoiceButton key={style.id} selected={avatar.hair === style.id} onClick={() => patchAvatar({ hair: style.id })}>{style.name}</ChoiceButton>
                ))}
              </div>
              <p className="mb-2 mt-4 text-sm font-bold text-slate-600">Màu tóc</p>
              <Swatches colors={HAIR_COLORS} value={avatar.hairColor} onChange={(hairColor) => patchAvatar({ hairColor })} label="Màu tóc" />
            </div>

            <div>
              <p className="mb-2 font-black">5. Trang phục</p>
              <div className="flex flex-wrap gap-2">
                {outfits.map((outfit) => (
                  <ChoiceButton key={outfit.id} selected={avatar.outfit === outfit.id} onClick={() => patchAvatar({ outfit: outfit.id })}>{outfit.name}</ChoiceButton>
                ))}
              </div>
              <p className="mb-2 mt-4 text-sm font-bold text-slate-600">Màu áo</p>
              <Swatches colors={CLOTH_COLORS} value={avatar.topColor} onChange={(topColor) => patchAvatar({ topColor })} label="Màu áo" />
            </div>

            <div>
              <p className="mb-2 font-black">6. Màu da và phụ kiện</p>
              <p className="mb-2 text-sm font-bold text-slate-600">Màu da</p>
              <Swatches colors={SKIN_TONES} value={avatar.skin} onChange={(skin) => patchAvatar({ skin })} label="Màu da" />
              <p className="mb-2 mt-4 text-sm font-bold text-slate-600">Phụ kiện</p>
              <div className="flex flex-wrap gap-2">
                {accessories.map((item) => (
                  <ChoiceButton key={item.id} selected={avatar.accessory === item.id} onClick={() => patchAvatar({ accessory: item.id })}>{item.name}</ChoiceButton>
                ))}
              </div>
            </div>

            {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
            <button type="button" disabled={saving} onClick={() => void finish()} className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 text-lg font-black text-white shadow-[0_5px_0_#16866e] transition hover:-translate-y-0.5 disabled:cursor-wait disabled:opacity-60">
              {saving ? "Đang lưu nhân vật…" : "Hoàn tất – Vào sân trường 🎒"}
            </button>
          </section>

          <aside className="h-fit rounded-[2rem] border-4 border-white bg-white/95 p-6 text-center shadow-[0_24px_70px_-32px_rgba(35,74,83,.35)] lg:sticky lg:top-6">
            <p className="font-black text-emerald-800">Nhân vật của bé</p>
            <div className="mx-auto mt-5 grid h-40 w-40 place-items-center rounded-full bg-gradient-to-br from-sky-100 to-amber-100 ring-8 ring-white shadow-inner">
              <AvatarBadge avatar={avatar} size={136} />
            </div>
            <h2 className="mt-5 text-2xl font-black">{name.trim() || "Tên của bé"}</h2>
            <p className="mt-1 font-bold text-slate-500">{gender === "boy" ? "Bé trai" : "Bé gái"} · Lớp {grade}</p>
            <div className="mt-5 rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">
              ⭐ Hồ sơ được lưu để lần sau bé tiếp tục cuộc phiêu lưu.
            </div>
          </aside>
        </div>
      </div>
    </main>
  );
}
