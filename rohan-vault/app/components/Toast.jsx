// app/components/Toast.jsx
"use client";

export default function Toast({ message, type="info" }) {
  const bg = type === "error" ? "#ff4b4b" : type === "warn" ? "#f6c500" : "#2dbb8f";
  return (
    <div style={{
      position:"fixed",
      right:18,
      top:18,
      background:bg,
      color:"#081018",
      padding:"10px 14px",
      borderRadius:8,
      fontWeight:700,
      zIndex:9999
    }}>
      {message}
    </div>
  );
}
