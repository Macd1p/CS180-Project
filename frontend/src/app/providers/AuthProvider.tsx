"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AuthCtx = {
  isAuthenticated: boolean;
  isLoading: boolean; //used to prevent race condition and not make user re sign in
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({ isAuthenticated: false, isLoading: true, signOut: async () => { } });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthed, setAuthed] = useState(false);
  const [isLoading, setLoading] = useState(true);
  const router = useRouter();

  // hydrate auth state by pinging a lightweight endpoint that requires token
  //hydrate auth state from localStorage
  useEffect(() => {
    const token = localStorage.getItem("fms_token");
    if (token) {
      setAuthed(true);
    }
    setLoading(false);

    // Listen for storage events (e.g., when sign-in sets fms_authed)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "fms_authed") {
        setAuthed(localStorage.getItem("fms_authed") === "1");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const signOut = async () => {
    //clear the local storage
    localStorage.removeItem("fms_token");
    localStorage.removeItem("fms_authed");
    localStorage.removeItem("fms_avatar");

    //notify other tabs/components
    window.dispatchEvent(new StorageEvent("storage", { key: "fms_authed", newValue: null }));

    await fetch("/api/auth/signout", { method: "POST" });
    setAuthed(false);
    router.push("/");
  };

  return <Ctx.Provider value={{ isAuthenticated: isAuthed, isLoading, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
