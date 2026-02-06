import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Earthquake Constellations",
  description: "A living night-sky visualization of recent USGS earthquakes.",
  icons: {
    icon: "/favicon.ico"
  }
};

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-black text-slate-100">
        {children}
      </body>
    </html>
  );
}
