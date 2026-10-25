import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "GridSight | Wind forecast accuracy",
  description: "Decision-time renewable generation intelligence powered by Elexon BMRS.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
