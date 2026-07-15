import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: {
    default: "Tracker",
    template: "%s | Tracker",
  },
  description: "A focused workspace for todos, notes, combos, and progress reports.",
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="id"
      className="h-full antialiased"
    >
      <body className="min-h-full flex flex-col" cz-shortcut-listen="true">
        {children}
      </body>
    </html>
  );
}
