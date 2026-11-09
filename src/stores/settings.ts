import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";

type Settings = {
  muted: boolean;
  toggleMuted: () => void;
};

// skipHydration: the stored value is applied after mount (see __root) to avoid hydration mismatches.
export const useSettings = create<Settings>()(
  persist(
    (set) => ({
      muted: false,
      toggleMuted: () => set((s) => ({ muted: !s.muted })),
    }),
    {
      name: "tghv-settings",
      storage: createJSONStorage(() => localStorage),
      skipHydration: true,
    },
  ),
);
