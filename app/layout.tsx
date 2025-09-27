import "../styles/globals.css";
import { Navbar } from "@/components/navbar";
import { ReactNode } from "react";

export const metadata = {
  title: "the-funny",
  description: "Connecting comedians, promoters, venues, and fans"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-slate-50">
        <Navbar />
        <main className="mx-auto w-full max-w-6xl px-6 py-10">{children}</main>
      </body>
    </html>
  );
}
