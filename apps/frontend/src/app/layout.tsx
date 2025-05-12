import { Inter } from "next/font/google";
import "./globals.css";
import { Metadata } from "next";
import { AuthProvider } from "./_components/AuthProvider";
import { Toaster } from "../components/ui/toaster";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "HRIS",
  description: "A Human Resource Information System",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.variable}>
        <AuthProvider>
          {children}
          <Toaster />
        </AuthProvider>
      </body>
    </html>
  );
}
