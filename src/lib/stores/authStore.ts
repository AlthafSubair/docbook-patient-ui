import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { logoutApi } from "../api/auth";

interface AuthState {
  phone: string;
  country: string;
  national: string;
  accessToken: string;
  setAuth: (
    phone: string,
    country?: string,
    national?: string,
    tokenOrPayload?: string | { accessToken: string }
  ) => void;
  setAccessToken: (accessToken: string) => void;
  logout: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      phone:
        typeof window !== "undefined"
          ? localStorage.getItem("docbook_user_phone") || ""
          : "",
      country:
        typeof window !== "undefined"
          ? localStorage.getItem("docbook_user_country") || "IN"
          : "IN",
      national:
        typeof window !== "undefined"
          ? localStorage.getItem("docbook_user_national") || ""
          : "",
      accessToken:
        typeof window !== "undefined"
          ? localStorage.getItem("docbook_access_token") || ""
          : "",

      setAuth: (phone, country, national, tokenOrPayload) => {
        const rawToken =
          typeof tokenOrPayload === "string"
            ? tokenOrPayload
            : tokenOrPayload && typeof tokenOrPayload === "object"
            ? tokenOrPayload.accessToken || ""
            : "";

        try {
          localStorage.setItem("docbook_user_phone", phone);
          if (country) {
            localStorage.setItem("docbook_user_country", country);
          }
          if (national) {
            localStorage.setItem("docbook_user_national", national);
          }
          if (rawToken) {
            localStorage.setItem("docbook_access_token", rawToken);
          }
        } catch {}

        set((state) => ({
          phone,
          country: country || state.country,
          national: national || state.national,
          accessToken: rawToken || state.accessToken,
        }));
      },

      setAccessToken: (accessToken: string) => {
        try {
          localStorage.setItem("docbook_access_token", accessToken);
        } catch {}
        set({ accessToken });
      },

      logout: async () => {
        try {
          // Backend revokes session and clears HttpOnly refresh cookie
          await logoutApi();
        } catch (e) {
          console.warn("Backend logout request failed:", e);
        } finally {
          try {
            localStorage.removeItem("docbook_user_phone");
            localStorage.removeItem("docbook_user_national");
            localStorage.removeItem("docbook_access_token");
          } catch {}

          set({
            phone: "",
            national: "",
            accessToken: "",
          });
        }
      },
    }),
    {
      name: "docbook_auth_storage",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
