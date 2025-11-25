// app/components/Navbar.jsx
"use client";

import { useRouter, usePathname } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";

export default function Navbar({ user }) {
  const router = useRouter();
  const path = usePathname();

  // Hide on home (for your requirement)
  if (path === "/") return null;

  async function logout() {
    await supabase.auth.signOut();
    router.push("/");
  }

  return (
    <nav style={{
      display:"flex",
      alignItems:"center",
      justifyContent:"space-between",
      background: "transparent",
      padding:"12px 0",
      marginBottom:18,
    }}>
      <div style={{display:"flex",gap:12,alignItems:"center"}}>
        <img src="/logo.png" alt="logo" style={{width:36,height:36,borderRadius:8}}/>
        <strong>Rohan Vault</strong>
      </div>

      <div style={{display:"flex",gap:8,alignItems:"center"}}>
        <button className="btn" onClick={()=>{ document.documentElement.classList.toggle("light"); }}>
          🌗
        </button>
        {user && (
          <button className="btn" onClick={logout} style={{background:"#ff4b2b"}}>
            Sign out
          </button>
        )}
      </div>
    </nav>
  );
}
