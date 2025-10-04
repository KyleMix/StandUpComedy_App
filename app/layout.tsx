import "./globals.css";
import { Navbar } from "@/components/navbar";
import { ReactNode } from "react";
import { inter } from "./fonts";

export const metadata = {
  title: "the-funny",
  description: "A simple workspace for planning comedy shows.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="bg-white text-slate-900 antialiased">
        <div className="flex min-h-screen flex-col">
          <Navbar />
          <main className="mx-auto w-full max-w-4xl flex-1 px-4 py-12 sm:px-6 lg:px-8">{children}</main>
        </div>
      </body>
    </html>
  );
}
