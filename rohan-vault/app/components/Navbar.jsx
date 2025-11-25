"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function NavBar({ user, setToast }) {
  const [dark, setDark] = useState(false);
  const router = useRouter();

  async function handleLogout() {
    await supabase.auth.signOut();
    setToast?.("Logged out", "success");
    router.push("/auth");
  }

  function toggleTheme() {
    setDark((s) => !s);
    document.documentElement.classList.toggle("dark-mode");
    setToast?.(dark ? "Light mode" : "Dark mode", "info");
  }

  return (
    <header className="nav">
      <div className="nav-left" onClick={() => router.push("/")}>
        <img className="nav-logo" src="/mnt/data/Screenshot (25).png" alt="logo" />
        <span className="brand">Rohan Vault</span>
      </div>

      <nav className="nav-right">
        <button className="nav-btn" onClick={() => router.push("/auth")}>
          {user ? "Profile" : "Sign In"}
        </button>

        {user && (
          <button className="nav-btn" onClick={handleLogout}>
            Logout
          </button>
        )}

        <button className="nav-icon" onClick={toggleTheme}>
          {dark ? "☀️" : "🌙"}
        </button>
      </nav>
    </header>
  );
}
