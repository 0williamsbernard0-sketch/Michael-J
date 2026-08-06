import type { Metadata } from "next";
import { AuthProvider } from "@/lib/auth-context";
import "./globals.css";

export const metadata: Metadata = {
  title: "MBJ Society",
  description: "Official membership community of Marvics.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body className="bg-[#12151A] text-[#F1ECDF] font-body">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}

