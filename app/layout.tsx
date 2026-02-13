import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Aemro (አምሮ) - Your AI Study Buddy",
  description: "Your AI study buddy that helps you learn by directly referencing your preferred textbooks and study materials",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="bg-black text-white antialiased">
        {children}
      </body>
    </html>
  );
}
