import type { Metadata } from "next";
import "./globals.css";
import { ThemeRegistry } from "./ThemeRegistry";

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
    <html lang="en">
      <body>
        <ThemeRegistry>{children}</ThemeRegistry>
      </body>
    </html>
  );
}
