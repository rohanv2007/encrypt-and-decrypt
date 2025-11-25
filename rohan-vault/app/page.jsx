"use client";

import Link from "next/link";
import { supabase } from "../lib/supabaseClient";
import { useEffect, useState } from "react";

export default function HomePage() {
  const [user, setUser] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then((res) => {
      if (res.data?.user) setUser(res.data.user);
    });
  }, []);

  return (
    <div className="home-container">
      <h1 className="home-title">🚀 Rohan Vault Projects</h1>
      <p className="home-sub">Select and explore your tools</p>

      <div className="project-grid">

        {/* Encryption Tool */}
        <Link href="/encrypt-tool" className="project-card">
          <h2>Encrypt & Decrypt Tool 🔐</h2>
          <p>Encrypt files with password & store securely.</p>
        </Link>

        {/* If you want more projects, add more cards here */}
      </div>

      {user ? (
        <button
          className="logout-btn"
          onClick={async () => {
            await supabase.auth.signOut();
            window.location.reload();
          }}
        >
          Logout
        </button>
      ) : (
        <Link href="/auth" className="auth-btn">Login</Link>
      )}
    </div>
  );
}
