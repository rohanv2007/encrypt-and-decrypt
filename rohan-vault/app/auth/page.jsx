"use client";

import { useEffect } from "react";
import Script from "next/script";
import { supabase } from "../../lib/supabaseClient";
import "./auth.css";

export default function AuthPage() {

  // SIGN UP
  async function handleSignup(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    const { error } = await supabase.auth.signUp({ email, password });

    if (error) alert(error.message);
    else alert("Account created. Please sign in.");
  }

  // SIGN IN
  async function handleSignin(e) {
    e.preventDefault();
    const email = e.target.email.value;
    const password = e.target.password.value;

    const { error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) alert(error.message);
    else window.location.href = "/dashboard";
  }

  return (
    <>
      {/* load your original js for animations */}
      <Script src="/login.js" strategy="afterInteractive" />

      <div className="container" id="container">

        {/* SIGN UP */}
        <div className="form-container sign-up-container">
          <form onSubmit={handleSignup}>
            <h1>Create Account</h1>
            <input name="email" type="email" placeholder="Email" required />
            <input name="password" type="password" placeholder="Password" required />
            <button type="submit">Sign Up</button>
          </form>
        </div>

        {/* SIGN IN */}
        <div className="form-container sign-in-container">
          <form onSubmit={handleSignin}>
            <h1>Sign In</h1>
            <input name="email" type="email" placeholder="Email" required />
            <input name="password" type="password" placeholder="Password" required />
            <button type="submit">Sign In</button>
          </form>
        </div>

        {/* RIGHT SLIDING PANEL */}
        <div className="overlay-container">
          <div className="overlay">

            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>Already have an account?</p>
              <button className="ghost" id="signIn">Sign In</button>
            </div>

            <div className="overlay-panel overlay-right">
              <h1>Hello Friend!</h1>
              <p>New here? Create an account</p>
              <button className="ghost" id="signUp">Sign Up</button>
            </div>

          </div>
        </div>

      </div>
    </>
  );
}
