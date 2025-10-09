import type { Metadata } from "next";
import "./globals.css";
import { Footer } from "@/components/Footer";
import { Navbar } from "@/components/Navbar";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { interFontClass } from "./fonts";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "The Funny — Find Gigs, Book Comics, Pack Rooms",
  description: "Discover stand-up comedy gigs, connect with comedians, and keep every room packed with laughs.",
  openGraph: {
    title: "The Funny — Find Gigs, Book Comics, Pack Rooms",
    description: "Discover stand-up comedy gigs, connect with comedians, and keep every room packed with laughs.",
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "The Funny — Find Gigs, Book Comics, Pack Rooms",
    description: "Discover stand-up comedy gigs, connect with comedians, and keep every room packed with laughs."
  }
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        data-theme="thefunny"
        className={cn(
          "min-h-screen bg-background font-sans text-foreground antialiased",
          interFontClass
        )}
      >
        <ThemeProvider>
          <div className="flex min-h-screen flex-col">
            <Navbar />
            <main className="flex-1">
              <div className="container py-12 md:py-16">{children}</div>
            </main>
            <Footer />
          </div>
        </ThemeProvider>
      </body>
    </html>
  );
}
