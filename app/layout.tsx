import type { Metadata } from "next";
import { Fraunces, Inter } from "next/font/google";
import { AuthProvider } from "@/lib/auth-context";
import { LockModalProvider } from "@/lib/lock-modal-context";
import MembersOnlyModal from "@/components/MembersOnlyModal";
import FloatingAccessButton from "@/components/FloatingAccessButton";
import "./globals.css";

const fraunces = Fraunces({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
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
  description: "Official membership community of MBJ.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${fraunces.variable} ${inter.variable}`}>
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
