import type { Metadata } from "next";
import { Spline_Sans } from "next/font/google";
import "./globals.css";

const splineSans = Spline_Sans({
  variable: "--font-spline-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Aina Nirina",
  description: "Portfolio of Aina Nirina",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${splineSans.variable} h-full antialiased`}
    >
      <body className={`${splineSans.className} min-h-full flex flex-col`}>{children}</body>
    </html>
  );
}
