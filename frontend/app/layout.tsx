import type { Metadata } from "next";
import "./globals.css";
import { ThemeRegistry } from "./ThemeRegistry";
import Footer from "@/components/shared/Footer";

export const metadata: Metadata = {
  title: "OOP Shop Manager",
  description: "Minimalistic management interface for OOP Shop",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" data-scroll-behavior="smooth">
      <body style={{ display: "flex", flexDirection: "column", minHeight: "100vh" }} suppressHydrationWarning>
        <ThemeRegistry>
          <div style={{ flex: 1 }}>
            {children}
          </div>
          <Footer />
        </ThemeRegistry>
      </body>
    </html>
  );
}
