// app/layout.jsx
import "../app/globals.css";

export const metadata = {
  title: "Rohan Vault",
  description: "Mini Projects Hub",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}

