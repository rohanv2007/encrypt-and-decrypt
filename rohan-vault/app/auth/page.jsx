"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import "./auth.css";

// Disable static rendering fully
export const dynamic = "force-dynamic";

export default function AuthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // ⭐ Correct animation logic (SSR-safe)
  useEffect(() => {
    const container = document.getElementById("container");
    const signUpButton = document.getElementById("signUp");
    const signInButton = document.getElementById("signIn");

    if (!container || !signUpButton || !signInButton) return;

    signUpButton.onclick = () => container.classList.add("right-panel-active");
    signInButton.onclick = () => container.classList.remove("right-panel-active");
  }, []);

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);

    const name = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { name } },
    });

    setLoading(false);

    if (error) return alert(error.message);
    alert("Account created! Sign in now.");
  }

  async function handleSignin(e) {
    e.preventDefault();
    setLoading(true);

    const email = e.target[0].value;
    const password = e.target[1].value;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) return alert(error.message);
    router.push("/dashboard");
  }

  return (
    <>
      {/* Back Button */}
      <button
        onClick={() => router.push("/")}
        style={{
          position: "absolute",
          top: 20,
          left: 20,
          padding: "8px 15px",
          borderRadius: "8px",
          border: "none",
          background: "#333",
          color: "white",
          cursor: "pointer",
          zIndex: 999,
        }}
      >
        ← Back
      </button>

      <div className="container" id="container">

        <div className="form-container sign-up-container">
          <form onSubmit={handleSignup}>
            <h1>Create Account</h1>
            <input type="text" placeholder="Name" />
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button disabled={loading}>
              {loading ? "Processing..." : "Sign Up"}
            </button>
          </form>
        </div>

        <div className="form-container sign-in-container">
          <form onSubmit={handleSignin}>
            <h1>Sign in</h1>
            <input type="email" placeholder="Email" />
            <input type="password" placeholder="Password" />
            <button disabled={loading}>
              {loading ? "Processing..." : "Sign In"}
            </button>
          </form>
        </div>

        <div className="overlay-container">
          <div className="overlay">

            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>Login with your personal info</p>
              <button className="ghost" id="signIn">Sign In</button>
            </div>

            <div className="overlay-panel overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Create your account</p>
              <button className="ghost" id="signUp">Sign Up</button>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
