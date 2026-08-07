import type { Metadata, Viewport } from "next";
import { Playfair_Display, Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { LockModalProvider } from "@/lib/lock-modal-context";
import MembersOnlyModal from "@/components/MembersOnlyModal";
import FloatingAccessButton from "@/components/FloatingAccessButton";
import "./globals.css";

const playfair = Playfair_Display({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-display",
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-body",
  display: "swap",
});

export const metadata: Metadata = {
  title: "MBJ Society",
  description: "Official membership community of Michael B. Jordan.",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 0.85,
  minimumScale: 0.85,
  maximumScale: 0.85,
  userScalable: false,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${playfair.variable} ${inter.variable}`}>
      <body className="bg-[#12151A] text-[#F1ECDF] font-body">
        <AuthProvider>
          <LockModalProvider>
            {children}
            <MembersOnlyModal />
            <FloatingAccessButton />
          </LockModalProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
