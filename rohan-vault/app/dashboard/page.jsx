// app/dashboard/page.jsx
"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../../lib/supabaseClient";
import {
  encryptFileWithPassword,
  decryptBlobWithPassword,
} from "../../lib/cryptoClient";
import "../auth/auth.css";
import "./dashboard.css";
import Toast from "../components/Toast";
import Navbar from "../components/Navbar";

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    supabase.auth.getUser().then((res) => setUser(res?.data?.user ?? null));
    const { data: listener } = supabase.auth.onAuthStateChange((_ev, session) => {
      setUser(session?.user ?? null);
    });

    fetchFiles();
    return () => listener?.subscription?.unsubscribe?.();
  }, []);

  function notify(msg, type = "info") {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3500);
  }

  async function fetchFiles() {
    if (!user) return;
    const { data, error } = await supabase.storage.from("encrypted-files").list(user.id || "", { limit: 200, sortBy: { column:"created_at", order:"desc" }});
    if (error) { console.error(error); return; }
    setFiles(data || []);
  }

  async function handleEncryptUpload(e) {
    e.preventDefault();
    if (!file || !password) return notify("Select file & enter password", "warn");
    try {
      setUploading(true);
      notify("Encrypting...");
      const encrypted = await encryptFileWithPassword(file, password);
      const path = `${user.id}/${file.name}-${Date.now()}.enc`;
      notify("Uploading...");
      const { error } = await supabase.storage.from("encrypted-files").upload(path, encrypted);
      if (error) throw error;
      notify("Uploaded");
      setPassword(""); setFile(null);
      fetchFiles();
    } catch (err) {
      notify(err.message || "Upload failed", "error");
    } finally { setUploading(false); }
  }

  async function downloadDecrypt(path) {
    const pass = prompt("Enter password to decrypt:");
    if (!pass) return;
    const { data, error } = await supabase.storage.from("encrypted-files").download(path);
    if (error) { notify("Download failed", "error"); return; }
    try {
      const decrypted = await decryptBlobWithPassword(data, pass);
      const link = document.createElement("a");
      link.href = URL.createObjectURL(decrypted);
      // remove timestamp suffix from filename if present
      const raw = path.replace(`${user.id}/`, "");
      const name = raw.replace(/-\d+\.enc$/, "").replace(/\.enc$/, "");
      link.download = name;
      link.click();
    } catch (err) {
      notify("Wrong password or corrupted file", "error");
    }
  }

  async function deleteFile(path) {
    if (!confirm("Delete this file?")) return;
    const { error } = await supabase.storage.from("encrypted-files").remove([path]);
    if (error) notify(error.message, "error");
    else { notify("Deleted"); fetchFiles(); }
  }

  if (!user) {
    return (
      <div className="container">
        <p className="muted">You must sign in to access the vault. Redirecting...</p>
      </div>
    );
  }

  return (
    <>
      <Navbar user={user} />
      <div className="container">
        <h2>File Encryption Vault</h2>
        <p className="muted">Upload any file, encrypt with password, and download it anywhere.</p>

        <div className="card upload-card">
          <form onSubmit={handleEncryptUpload}>
            <input type="file" onChange={(e)=>setFile(e.target.files?.[0]||null)} />
            <input type="password" placeholder="Password to encrypt" value={password} onChange={(e)=>setPassword(e.target.value)} />
            <button className="btn" disabled={uploading}>{uploading ? "Uploading..." : "Encrypt & Upload"}</button>
          </form>
        </div>

        <div className="card file-list">
          <h3>Your files</h3>
          <table>
            <thead>
              <tr><th>Filename</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {files.length === 0 && (<tr><td colSpan="2" className="muted">No files</td></tr>)}
              {files.map(f => (
                <tr key={f.name}>
                  <td>{f.name}</td>
                  <td>
                    <button className="btn-small" onClick={()=>downloadDecrypt(`${user.id}/${f.name}`)}>Download</button>
                    <button className="btn-small delete" onClick={()=>deleteFile(`${user.id}/${f.name}`)}>Delete</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {toast && <Toast message={toast.msg} type={toast.type} />}
    </>
  );
}
