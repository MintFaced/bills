import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Artist Moments - Atari Timeline",
  description: "Transform your Etherscan history into an 80s Atari-style visual timeline",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
