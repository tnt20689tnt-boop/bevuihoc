import { useEffect, useMemo, useState } from "react";
import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { profileQueryKey, useMyProfile, type Profile } from "@/hooks/use-player";
import { AvatarBadge } from "@/components/AvatarBadge";
import { ACCESSORIES, CLOTH_COLORS, defaultAvatar, EYES, HAIR_COLORS, HAIR_STYLES, MOUTHS, OUTFITS, SKIN_TONES, validateName, type Avatar, type Gender } from "@/lib/avatar";

export const Route = createFileRoute("/_authenticated/nhan-vat")({
  head: () => ({
    meta: [
      { title: "Tùy chỉnh nhân vật – Bé Học Vui" },
      { name: "description", content: "Bé tùy chỉnh tên, lớp, diện mạo, trang phục và phụ kiện nhân vật." },
    ],
  }),
  component: CharacterEditor,
});

function ColorChoices({ colors, value, onChange, label }: {
  colors: string[];
  value: string;
  onChange: (value: string) => void;
  label: string;
}) {
  return (
    <div className="flex flex-wrap gap-3" aria-label={label}>
      {colors.map((color) => (
        <button
          key={color}
          type="button"
          aria-label={`${label} ${color}`}
          aria-pressed={value === color}
          onClick={() => onChange(color)}
          className={`h-9 w-9 rounded-full border-2 transition ${value === color ? "scale-110 border-slate-900 ring-2 ring-sky-200" : "border-white shadow"}`}
          style={{ backgroundColor: color }}
        />
      ))}
    </div>
  );
}

function CharacterEditor() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { data: profile, isLoading, isError, refetch } = useMyProfile();
  const [name, setName] = useState("");
  const [grade, setGrade] = useState(1);
  const [gender, setGender] = useState<Gender>("boy");
  const [avatar, setAvatar] = useState<Avatar | null>(defaultAvatar("boy"));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!profile) return;
    setName(profile.display_name);
    setGrade(profile.grade);
    setGender(profile.gender);
    setAvatar(profile.avatar);
  }, [profile]);

  const hairStyles = useMemo(() => HAIR_STYLES[gender], [gender]);

  function changeGender(nextGender: Gender) {
    setGender(nextGender);
    setAvatar(defaultAvatar(nextGender));
  }

  function patchAvatar(patch: Partial<Avatar>) {
    setAvatar((current) => current ? ({ ...current, ...patch, gender }) : current);
  }

  async function saveProfile() {
    const validation = validateName(name);
    if (validation) {
      setError(validation);
      return;
    }
    if (!profile || !avatar) return;
    setSaving(true);
    setError("");
    try {
      const cleanName = name.trim().replace(/\s+/g, " ");
      const { data: authData, error: authError } = await supabase.auth.getUser();
      if (authError) throw authError;
      if (!authData.user) throw new Error("Phiên đăng nhập đã hết hạn. Phụ huynh vui lòng đăng nhập lại.");

      // Create the first profile for a new account, or update the existing one.
      const profilePayload = {
        id: authData.user.id,
        display_name: cleanName,
        gender,
        grade,
        avatar: { ...avatar, gender },
      };
      const { data, error: saveError } = await supabase
        .from("profiles")
        .upsert(profilePayload, { onConflict: "id" })
        .select("id, display_name, gender, grade, last_grade_promotion, avatar")
        .single();
      if (saveError) {
        if (saveError.code === "42501") {
          throw new Error("Tài khoản chưa được cấp quyền tạo hồ sơ. Vui lòng thử lại sau khi quản trị hệ thống bật quyền tạo hồ sơ cho tài khoản của chính mình.");
        }
        throw saveError;
      }
      const savedProfile: Profile = {
        id: data.id,
        display_name: data.display_name,
        gender: data.gender as Gender,
        grade: data.grade,
        last_grade_promotion: data.last_grade_promotion,
        avatar: { ...avatar, ...(data.avatar as Partial<Avatar>), gender },
      };
      queryClient.setQueryData(profileQueryKey, savedProfile);
      await queryClient.invalidateQueries({ queryKey: profileQueryKey });
      toast.success("Đã cập nhật hồ sơ của bé! 🌟");
      await navigate({ to: "/ho-so" });
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "Không lưu được hồ sơ. Bé thử lại nhé.");
    } finally {
      setSaving(false);
    }
  }

  if (isLoading || (profile && !avatar)) {
    return <main className="grid min-h-screen place-items-center bg-sky-50 p-5"><p className="font-black text-sky-800">🎒 Đang tải hồ sơ của bé…</p></main>;
  }
  if (isError) {
    return <main className="grid min-h-screen place-items-center bg-sky-50 p-5"><section className="rounded-3xl bg-white p-8 text-center shadow-xl"><h1 className="text-2xl font-black">Chưa tải được hồ sơ</h1><button onClick={() => void refetch()} className="mt-4 rounded-xl bg-orange-500 px-5 py-3 font-black text-white">Thử lại</button></section></main>;
  }
  if (!avatar) return <main className="grid min-h-screen place-items-center bg-sky-50 p-5"><p className="font-black text-sky-800">🎒 Đang chuẩn bị nhân vật…</p></main>;

  return (
    <main className="min-h-screen bg-[radial-gradient(ellipse_at_10%_0%,#d9f5ff_0%,transparent_38%),radial-gradient(ellipse_at_90%_10%,#ffebf4_0%,transparent_36%),linear-gradient(145deg,#f4fbff,#fff8e9)] px-4 py-8 text-slate-800">
      <div className="mx-auto max-w-5xl">
        <header className="mb-6 text-center">
          <div className="text-5xl">🏫</div>
          <p className="mt-2 text-xs font-black uppercase tracking-[.22em] text-emerald-700">Bé Học Vui · Hồ sơ học sinh</p>
          <h1 className="mt-2 text-3xl font-black sm:text-4xl">{profile ? "Chỉnh sửa hồ sơ của bé" : "Tạo hồ sơ đầu tiên cho bé"}</h1>
          <p className="mt-2 text-slate-600">{profile ? "Bé có thể tự do thay đổi diện mạo, trang phục và phụ kiện của nhân vật." : "Điền tên, chọn giới tính và lớp học để tạo nhân vật, sau đó bé có thể vào trường."}</p>
        </header>

        <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_300px]">
          <section className="space-y-5 rounded-[2rem] border-4 border-white bg-white/95 p-5 shadow-xl sm:p-7">
            <section>
              <h2 className="mb-2 font-black">2. Bé là</h2>
              <div className="grid grid-cols-2 gap-3">
                <button type="button" aria-pressed={gender === "boy"} onClick={() => changeGender("boy")} className={`rounded-xl border-2 px-4 py-3 font-extrabold ${gender === "boy" ? "border-sky-500 bg-sky-50 text-sky-800" : "border-slate-200 bg-white text-slate-600"}`}>👦 Bé trai</button>
                <button type="button" aria-pressed={gender === "girl"} onClick={() => changeGender("girl")} className={`rounded-xl border-2 px-4 py-3 font-extrabold ${gender === "girl" ? "border-pink-500 bg-pink-50 text-pink-800" : "border-slate-200 bg-white text-slate-600"}`}>👧 Bé gái</button>
              </div>
            </section>
            <section>
              <h2 className="mb-2 font-black">3. Lớp đang học</h2>

            <section>
              <h2 className="mb-2 font-black">3. Lớp đang học</h2>
              <div className="grid grid-cols-5 gap-2">
                {[1, 2, 3, 4, 5].map((value) => (
                  <button key={value} type="button" aria-pressed={grade === value} onClick={() => setGrade(value)} className={`rounded-xl border-2 px-2 py-3 text-sm font-extrabold transition ${grade === value ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300"}`}>Lớp {value}</button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border-2 border-sky-100 bg-sky-50/60 p-4">
              <h2 className="mb-3 font-black">4. Màu da</h2>
              <ColorChoices colors={SKIN_TONES} value={avatar.skin} onChange={(skin) => patchAvatar({ skin })} label="Màu da" />
            </section>

            <section className="rounded-2xl border-2 border-sky-100 bg-sky-50/60 p-4">
              <h2 className="mb-3 font-black">5. Kiểu tóc</h2>
              <div className="flex flex-wrap gap-2">
                {hairStyles.map((style) => (
                  <button key={style.id} type="button" aria-pressed={avatar.hair === style.id} onClick={() => patchAvatar({ hair: style.id })} className={`rounded-xl border-2 px-3 py-2 text-sm font-extrabold ${avatar.hair === style.id ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-600"}`}>{style.name}</button>
                ))}
              </div>
              <h3 className="mb-2 mt-4 text-sm font-black text-slate-700">Màu tóc</h3>
              <ColorChoices colors={HAIR_COLORS} value={avatar.hairColor} onChange={(hairColor) => patchAvatar({ hairColor })} label="Màu tóc" />
            </section>

            <section className="rounded-2xl border-2 border-sky-100 bg-sky-50/60 p-4">
              <h2 className="mb-3 font-black">6. Trang phục</h2>
              <div className="flex flex-wrap gap-2">
                {OUTFITS[gender].map((item) => (
                  <button key={item.id} type="button" aria-pressed={avatar.outfit === item.id} onClick={() => patchAvatar({ outfit: item.id })} className={`rounded-xl border-2 px-3 py-2 text-sm font-extrabold ${avatar.outfit === item.id ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-600"}`}>{item.name}</button>
                ))}
              </div>
              <h3 className="mb-2 mt-4 text-sm font-black text-slate-700">Màu áo</h3>
              <ColorChoices colors={CLOTH_COLORS} value={avatar.topColor} onChange={(topColor) => patchAvatar({ topColor })} label="Màu áo" />
              <h3 className="mb-2 mt-4 text-sm font-black text-slate-700">Màu quần / váy</h3>
              <ColorChoices colors={CLOTH_COLORS} value={avatar.bottomColor} onChange={(bottomColor) => patchAvatar({ bottomColor })} label="Màu quần váy" />
              <h3 className="mb-2 mt-4 text-sm font-black text-slate-700">Màu giày</h3>
              <ColorChoices colors={CLOTH_COLORS} value={avatar.shoeColor} onChange={(shoeColor) => patchAvatar({ shoeColor })} label="Màu giày" />
            </section>

            <section className="rounded-2xl border-2 border-sky-100 bg-sky-50/60 p-4">
              <h2 className="mb-3 font-black">7. Phụ kiện</h2>
              <div className="flex flex-wrap gap-2">
                {ACCESSORIES[gender].map((item) => (
                  <button key={item.id} type="button" aria-pressed={avatar.accessory === item.id} onClick={() => patchAvatar({ accessory: item.id })} className={`rounded-xl border-2 px-3 py-2 text-sm font-extrabold ${avatar.accessory === item.id ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-600"}`}>{item.name}</button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border-2 border-sky-100 bg-sky-50/60 p-4">
              <h2 className="mb-3 font-black">8. Đôi mắt</h2>
              <div className="flex flex-wrap gap-2">
                {EYES.map((item) => (
                  <button key={item.id} type="button" aria-pressed={avatar.eyes === item.id} onClick={() => patchAvatar({ eyes: item.id })} className={`rounded-xl border-2 px-3 py-2 text-sm font-extrabold ${avatar.eyes === item.id ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-600"}`}>{item.name}</button>
                ))}
              </div>
            </section>

            <section className="rounded-2xl border-2 border-sky-100 bg-sky-50/60 p-4">
              <h2 className="mb-3 font-black">9. Nụ cười</h2>
              <div className="flex flex-wrap gap-2">
                {MOUTHS.map((item) => (
                  <button key={item.id} type="button" aria-pressed={avatar.mouth === item.id} onClick={() => patchAvatar({ mouth: item.id })} className={`rounded-xl border-2 px-3 py-2 text-sm font-extrabold ${avatar.mouth === item.id ? "border-emerald-500 bg-emerald-50 text-emerald-800" : "border-slate-200 bg-white text-slate-600"}`}>{item.name}</button>
                ))}
              </div>
            </section>

            {error && <p role="alert" className="rounded-xl bg-red-50 p-3 text-sm font-bold text-red-700">{error}</p>}
            <button type="button" disabled={saving} onClick={() => void saveProfile()} className="w-full rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 px-6 py-4 text-lg font-black text-white shadow-[0_5px_0_#16866e] disabled:opacity-60">{saving ? "Đang lưu…" : profile ? "Lưu thay đổi 🌟" : "Tạo hồ sơ và vào trường 🌟"}</button>
            <Link to="/ho-so" className="block text-center font-bold text-slate-500 hover:text-slate-800">Hủy, quay lại hồ sơ</Link>
          </section>

          <aside className="h-fit rounded-[2rem] border-4 border-white bg-white/95 p-6 text-center shadow-xl lg:sticky lg:top-6">
            <p className="font-black text-emerald-800">Xem trước nhân vật</p>
            <div className="mx-auto mt-5 grid h-40 w-40 place-items-center rounded-full bg-gradient-to-br from-sky-100 to-amber-100 ring-8 ring-white shadow-inner">
              <AvatarBadge avatar={avatar} size={136} />
            </div>
            <h2 className="mt-5 text-2xl font-black">{name.trim() || "Tên của bé"}</h2>
            <p className="mt-1 font-bold text-slate-500">{gender === "boy" ? "Bé trai" : "Bé gái"} · Lớp {grade}</p>
            <div className="mt-5 rounded-2xl bg-amber-50 p-3 text-sm font-semibold text-amber-900">✨ Mọi thay đổi sẽ được xem trước và lưu vào hồ sơ của bé.</div>
          </aside>
        </div>
      </div>
    </main>
  );
}
