"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";

import NavBar from "./components/Navbar.jsx";
import Toast from "./components/Toast.jsx";

import "../public/home.css";


export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(false);

  // simple project list - add more objects later
  const projects = [
    {
      id: "file-vault",
      title: "File Encryption Vault",
      desc: "Encrypt, upload and decrypt files (Auth required)",
      path: "/dashboard",
      authRequired: true,
      // sample image src (use your converted URL pipeline)
      img: "/mnt/data/Screenshot (25).png",
    },
    {
      id: "mini-game",
      title: "Mini Game",
      desc: "Fun little demo (no auth)",
      path: "/projects/mini-game",
      authRequired: false,
      img: "/public/placeholder-project.png",
    },
    // add future projects here
  ];

  useEffect(() => {
    supabase.auth.getUser().then((res) => {
      if (res?.data?.user) setUser(res.data.user);
    });
    // also subscribe to auth changes so user state updates
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => sub?.subscription?.unsubscribe?.();
  }, []);

  function showToast(msg, type = "info") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function handleProjectClick(project) {
    // if project needs auth and the user is NOT logged in -> redirect to /auth
    if (project.authRequired && !user) {
      showToast("You must sign in to access this project.", "warning");
      // store a redirect-on-success param (optional)
      localStorage.setItem("afterAuth", project.path);
      router.push("/auth");
      return;
    }

    // otherwise go to project page
    setLoading(true);
    try {
      router.push(project.path);
    } catch (e) {
      showToast("Navigation failed", "error");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <NavBar user={user} setToast={showToast} />
      <main className="home-wrap">
        <div className="hero">
          <h1>Rohan Vault — Mini Projects Hub</h1>
          <p>Try the tools, test, and explore. Some tools require login.</p>
        </div>

        <section className="projects-grid">
          {projects.map((p) => (
            <article className="project-card" key={p.id}>
              <img src={p.img} alt={p.title} className="project-img" />
              <div className="project-body">
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <div className="project-actions">
                  <button
                    className="btn-primary"
                    onClick={() => handleProjectClick(p)}
                    disabled={loading}
                  >
                    {p.authRequired ? "Open (Auth)" : "Open"}
                  </button>
                </div>
              </div>
            </article>
          ))}
        </section>

        {loading && (
          <div className="loading-overlay">
            <div className="spinner" />
          </div>
        )}
      </main>

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </>
  );
}
