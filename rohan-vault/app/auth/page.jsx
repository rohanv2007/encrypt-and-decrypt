"use client";

import Script from "next/script";

import { supabase } from "@/lib/supabaseClient";

export default function AuthPage() {
  return (
    <>
      {/* Load your login.js animation script */}
      <Script src="/login.js" strategy="afterInteractive" />

      <div className="container" id="container">

        {/* ---------------- SIGN UP ---------------- */}
        <div className="form-container sign-up-container">
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              const name = e.target[0].value;
              const email = e.target[1].value;
              const password = e.target[2].value;

              const { data, error } = await supabase.auth.signUp({
                email,
                password,
                options: { data: { name } }
              });

              if (error) {
                alert("Error: " + error.message);
              } else {
                alert("Account Created! Please Sign In.");
              }
            }}
          >
            <h1>Create Account</h1>

            <input type="text" placeholder="Name" required />
            <input type="email" placeholder="Email" required />
            <input type="password" placeholder="Password" required />
            <button type="submit">Sign Up</button>
          </form>
        </div>

        {/* ---------------- SIGN IN ---------------- */}
        <div className="form-container sign-in-container">
          <form
            onSubmit={async (e) => {
              e.preventDefault();

              const email = e.target[0].value;
              const password = e.target[1].value;

              const { data, error } = await supabase.auth.signInWithPassword({
                email,
                password,
              });

              if (error) {
                alert("Login Failed: " + error.message);
              } else {
                window.location.href = "/dashboard";
              }
            }}
          >
            <h1>Sign in</h1>

            <input type="email" placeholder="Email" required />
            <input type="password" placeholder="Password" required />
            <a href="#">Forgot your password?</a>
            <button type="submit">Sign In</button>
          </form>
        </div>

        {/* ---------------- OVERLAY ---------------- */}
        <div className="overlay-container">
          <div className="overlay">

            <div className="overlay-panel overlay-left">
              <h1>Welcome Back!</h1>
              <p>To keep connected with us please login with your personal info</p>
              <button className="ghost" id="signIn">Sign In</button>
            </div>

            <div className="overlay-panel overlay-right">
              <h1>Hello, Friend!</h1>
              <p>Enter your personal details and start journey with us</p>
              <button className="ghost" id="signUp">Sign Up</button>
            </div>

          </div>
        </div>
      </div>
    </>
  );
}
