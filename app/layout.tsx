import "./globals.css";
import { Navbar } from "@/components/navbar";
import { ReactNode } from "react";

export const metadata = {
  title: "the-funny",
  description: "Connecting comedians, promoters, venues, and fans"
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="relative min-h-screen bg-slate-100 text-slate-900 antialiased">
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute left-1/2 top-[-15%] h-[32rem] w-[32rem] -translate-x-1/2 rounded-full bg-brand/10 blur-3xl" />
          <div className="absolute -left-24 bottom-[-25%] h-[28rem] w-[28rem] rounded-full bg-indigo-200/60 blur-3xl" />
          <div className="absolute -right-10 top-1/3 h-72 w-72 rounded-full bg-amber-100/70 blur-3xl" />
        </div>
        <div className="relative z-10 flex min-h-screen flex-col">
          <Navbar />
          <main className="mx-auto w-full max-w-6xl flex-1 px-6 py-12">{children}</main>
        </div>
      </body>
    </html>
  );
}
