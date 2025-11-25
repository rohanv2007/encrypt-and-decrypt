"use client";

import Script from "next/script";
import "./auth.css";
import "./auth.js";
import { supabase } from "../../lib/supabaseClient";
import { useRouter } from "next/navigation";
import { useState } from "react";

export default function AuthPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  async function handleSignup(e) {
    e.preventDefault();
    setLoading(true);

    const name = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: { name },
      },
    });

    setLoading(false);

    if (error) return alert("Error: " + error.message);
    alert("Account created! Please sign in.");
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

    if (error) return alert("Login failed: " + error.message);

    const redirect = localStorage.getItem("afterAuth");
    router.push(redirect || "/dashboard");
  }

  return (
    <>
      {/* Animation script */}
      <Script src="./auth.js" strategy="afterInteractive" />

      {/* Back to Home */}
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
          zIndex: 999
        }}
      >
        ← Back
      </button>

      <div className="container" id="container">

        {/* Sign Up */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleSignup}>
            <h1>Create Account</h1>

            <input type="text" placeholder="Name" required />
            <input type="email" placeholder="Email" required />
            <input type="password" placeholder="Password" required />

            <button disabled={loading}>
              {loading ? "Processing..." : "Sign Up"}
            </button>
          </form>
        </div>

        {/* Sign In */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleSignin}>
            <h1>Sign In</h1>

            <input type="email" placeholder="Email" required />
            <input type="password" placeholder="Password" required />

            <a href="#">Forgot your password?</a>
            <button disabled={loading}>
              {loading ? "Processing..." : "Sign In"}
            </button>
          </form>
        </div>

        {/* Overlay Panels */}
        <div className="overlay-container">
          <div className="overlay">

            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>To keep connected, please login with your personal info</p>
              <button className="ghost" id="signIn">Sign In</button>
            </div>

            <div className="overlay-panel overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Enter your details and start your journey with us</p>
              <button className="ghost" id="signUp">Sign Up</button>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
