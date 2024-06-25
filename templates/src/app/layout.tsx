import type { Metadata } from "next";
import { Inter as FontSans } from "next/font/google";
import { APP_NAME } from "@/config";
import "./globals.css";
import { cn } from "@/lib/utils";
import Providers from "./providers";

const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});
export const metadata: Metadata = {
  title: {
    template: `%s | ${APP_NAME}`,
    default: APP_NAME,
  },
  description: APP_NAME,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={cn(
          "min-h-screen bg-background font-sans antialiased",
          fontSans.variable
        )}
      >
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
