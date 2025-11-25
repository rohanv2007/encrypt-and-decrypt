"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../lib/supabaseClient";
import {
  encryptFileWithPassword,
  decryptBlobWithPassword
} from "../../lib/cryptoClient";


export default function Dashboard() {
  const [user, setUser] = useState(null);
  const [file, setFile] = useState(null);
  const [password, setPassword] = useState("");
  const [uploading, setUploading] = useState(false);
  const [files, setFiles] = useState([]);
  const [message, setMessage] = useState("");

useEffect(() => {
  async function loadUser() {
    const res = await supabase.auth.getUser();
    if (res?.data?.user) {
      setUser(res.data.user);
    }
  }
  loadUser();
}, []);

useEffect(() => {
  if (user?.id) {
    fetchFiles();
  }
}, [user]);

  async function fetchFiles() {
  if (!user?.id) return;

  const { data, error } = await supabase.storage
    .from("encrypted-files")
    .list(user.id, {
      limit: 200,
      sortBy: { column: "created_at", order: "desc" },
    });

  if (!error) setFiles(data || []);
}


  async function handleEncryptUpload(e) {
    e.preventDefault();
    if (!file || !password) return alert("Select file & enter password");

    try {
      setUploading(true);
      setMessage("Encrypting file...");

      // Encrypt file
      const encrypted = await encryptFileWithPassword(file, password);

      // Path: userId/filename.enc
      const path = `${user.id}/${file.name}-${Date.now()}.enc`;

      setMessage("Uploading...");
      const { error } = await supabase.storage
        .from("encrypted-files")
        .upload(path, encrypted);

      if (error) return alert(error.message);

      setMessage("Uploaded successfully!");
      setPassword("");
      setFile(null);
      fetchFiles();
    } catch (err) {
      alert("Error: " + err.message);
    } finally {
      setUploading(false);
    }
  }

  async function downloadDecrypt(path) {
    const pass = prompt("Enter password to decrypt:");
    if (!pass) return;

    const { data, error } = await supabase.storage
      .from("encrypted-files")
      .download(path);

    if (error) return alert("Download failed");

    try {
      const decrypted = await decryptBlobWithPassword(data, pass);

      const link = document.createElement("a");
      link.href = URL.createObjectURL(decrypted);
      link.download = path.replace(/-\d+\.enc$/, "");
      link.click();
    } catch (err) {
      alert("Wrong password OR corrupted file");
    }
  }

  async function deleteFile(path) {
    if (!confirm("Delete this file?")) return;

    const { error } = await supabase.storage
      .from("encrypted-files")
      .remove([path]);

    if (error) alert(error.message);
    else fetchFiles();
  }

  return (
    <div className="dashboard-container">
      <div className="dash-title">Your Secure File Vault 🔐</div>
      <div className="dash-sub">Welcome {user?.email}</div>

      {/* Upload Card */}
      <div className="card">
        <h3>Encrypt & Upload File</h3>

        <input
          type="file"
          className="input-field"
          onChange={(e) => setFile(e.target.files?.[0] || null)}
        />

        <input
          type="password"
          className="input-field"
          placeholder="Enter password to encrypt"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />

        <button
          className="btn-primary"
          onClick={handleEncryptUpload}
          disabled={uploading}
        >
          {uploading ? "Uploading..." : "Encrypt & Upload"}
        </button>

        <div style={{ marginTop: 10, color: "#555" }}>{message}</div>
      </div>

      {/* File List */}
      <div className="card">
        <h3>Your Files</h3>

        <table className="table">
          <thead>
            <tr>
              <th>Filename</th>
              <th>Actions</th>
            </tr>
          </thead>

          <tbody>
            {files.length === 0 && (
              <tr>
                <td colSpan="2">No files uploaded yet</td>
              </tr>
            )}

            {files.map((f) => (
              <tr key={f.name}>
                <td>{f.name}</td>
                <td>
                  <button
                    className="btn-small"
                    onClick={() => downloadDecrypt(`${user.id}/${f.name}`)}
                  >
                    Download & Decrypt
                  </button>

                  <button
                    className="btn-small delete"
                    onClick={() => deleteFile(`${user.id}/${f.name}`)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}



