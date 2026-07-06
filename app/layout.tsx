import type { Metadata } from "next";
import { Spline_Sans } from "next/font/google";
import ScrollToTop from "./_components/ScrollToTop";
import SmoothScroll from "./_components/SmoothScroll";
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
    <html lang="en" className={`${splineSans.variable} antialiased`}>
      <body className={`${splineSans.className} min-h-full flex flex-col`}>
        <SmoothScroll>
          <script
            dangerouslySetInnerHTML={{
              __html:
                "if('scrollRestoration' in history){history.scrollRestoration='manual';}window.scrollTo(0,0);",
            }}
          />
          <ScrollToTop />
          {children}
        </SmoothScroll>
      </body>
    </html>
  );
}
