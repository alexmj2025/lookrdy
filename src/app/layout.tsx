import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";
import { CookieConsent } from "@/components/consent/CookieConsent";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Lookrdy — Know what to wear, every time",
  description:
    "Upload one photo and tell us where you're going. Lookrdy creates three personalized outfit directions and finds the pieces you can actually buy.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      {/* Browser extensions (Grammarly and friends) inject attributes onto
          <body> before React hydrates, which React reports as a hydration
          mismatch. Suppressing here covers only this element's attributes. */}
      <body className="min-h-dvh" suppressHydrationWarning>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
