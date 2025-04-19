import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import AppQueryProvider from "./_components/AppQueryProvider";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"]
});

export const metadata: Metadata = {
  title: "HRIS",
  description: "A Human Resource Information System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        <AppQueryProvider>{children}</AppQueryProvider>
      </body>
    </html>
  );
}
