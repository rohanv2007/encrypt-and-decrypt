// app/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../lib/supabaseClient";
import "./home.css";
import Toast from "./components/Toast";

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [toast, setToast] = useState(null);

  const projects = [
    {
      id: "file-vault",
      title: "File Encryption Vault",
      desc: "Encrypt, upload and decrypt files (Auth required)",
      path: "/dashboard",
      authRequired: true,
      img: "/projects/filevault.png",
    },
    {
      id: "mini-game",
      title: "Mini Game",
      desc: "Fun little demo (no auth)",
      path: "/projects/mini-game",
      authRequired: false,
      img: "/projects/minigame.png",
    },
  ];

  useEffect(() => {
    supabase.auth.getUser().then((res) => {
      setUser(res?.data?.user ?? null);
    });

    const { data: listener } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    return () => listener?.subscription?.unsubscribe?.();
  }, []);

  function notify(msg, type = "info") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  function openProject(p) {
    if (p.authRequired && !user) {
      notify("You must sign in to access this project", "warn");
      // store redirect
      try { localStorage.setItem("afterAuth", p.path); } catch {}
      router.push("/auth");
      return;
    }
    // to force refresh + navigate: do a push after replacing — simpler: push directly
    router.push(p.path);
  }

  return (
    <div className="container">
      <header style={{textAlign:"center", marginBottom:32}}>
        <h1 className="home-title">Rohan Vault — Mini Projects Hub</h1>
        <p className="home-sub">Try the tools, test and explore. Some tools require login.</p>
      </header>

      <main>
        <div className="grid">
          {projects.map((p) => (
            <div key={p.id} className="card">
              <img src={p.img} alt={p.title} className="card-img" />
              <div className="card-body">
                <h3>{p.title}</h3>
                <p className="muted">{p.desc}</p>
                <div style={{marginTop:12}}>
                  <button className="btn" onClick={() => openProject(p)}>
                    {p.authRequired ? "Open (Auth)" : "Open"}
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </div>
  );
}
