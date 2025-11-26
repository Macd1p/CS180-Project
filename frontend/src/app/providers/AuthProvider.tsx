"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";

type AuthCtx = {
  isAuthenticated: boolean;
  signOut: () => Promise<void>;
};

const Ctx = createContext<AuthCtx>({ isAuthenticated: false, signOut: async () => {} });

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthed, setAuthed] = useState(false);
  const router = useRouter();

  // hydrate auth state by pinging a lightweight endpoint that requires token
  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        // this hits our own API which forwards the cookie to Flask
        const r = await fetch("/api/auth/whoami", { method: "GET" });
        setAuthed(r.ok);
      } catch {
        setAuthed(false);
      }
    })();

    // Listen for storage events (e.g., when sign-in sets fms_authed)
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "fms_authed") {
        setAuthed(localStorage.getItem("fms_authed") === "1");
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => { 
      ignore = true;
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  const signOut = async () => {
    await fetch("/api/auth/signout", { method: "POST" });
    setAuthed(false);
    router.push("/");
  };

  return <Ctx.Provider value={{ isAuthenticated: isAuthed, signOut }}>{children}</Ctx.Provider>;
}

export const useAuth = () => useContext(Ctx);
