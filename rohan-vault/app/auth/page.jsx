// app/auth/page.jsx
"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import "./auth.css";
import Toast from "../components/Toast";

export default function AuthPage() {
  const router = useRouter();
  const [mode, setMode] = useState("login"); // login or signup
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // if already logged in -> redirect to dashboard or saved route
    supabase.auth.getUser().then((res) => {
      const user = res?.data?.user;
      if (user) {
        const after = (typeof window !== "undefined" && localStorage.getItem("afterAuth")) || "/dashboard";
        router.push(after);
      }
    });
  }, []);

  function notify(msg, type="info") {
    setToast({ msg, type });
    setTimeout(()=>setToast(null),3500);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    const form = new FormData(e.target);
    const email = form.get("email");
    const password = form.get("password");

    try {
      if (mode === "login") {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        notify("Logged in");
      } else {
        const { error } = await supabase.auth.signUp({ email, password });
        if (error) throw error;
        notify("Account created. Check your email if confirmation needed.");
      }

      // redirect after auth
      const redirect = localStorage.getItem("afterAuth") || "/dashboard";
      router.push(redirect);
    } catch (err) {
      notify(err.message || "Auth error", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-wrap">
      <div className="auth-card">
        <h2>{mode === "login" ? "Sign in" : "Create account"}</h2>

        <form onSubmit={handleSubmit} className="auth-form">
          <input name="email" type="email" placeholder="Email" required />
          <input name="password" type="password" placeholder="Password" required />
          <button className="btn" type="submit" disabled={loading}>
            {loading ? "Please wait..." : mode === "login" ? "Sign in" : "Sign up"}
          </button>
        </form>

        <p className="muted" style={{marginTop:10}}>
          {mode === "login" ? "Don't have an account?" : "Already have an account?"}
          <button className="link-btn" onClick={() => setMode(mode === "login" ? "signup" : "login")}>
            {mode === "login" ? " Sign up" : " Sign in"}
          </button>
        </p>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}
