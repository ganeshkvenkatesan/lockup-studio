import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "./contexts/ThemeContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Lockup Studio",
  description: "A modern design studio crafting digital experiences",
  metadataBase: new URL('https://lockupstudio.com/'),
  openGraph: {
    title: 'Lockup Studio',
    description: 'A modern design studio crafting digital experiences',
    url: 'https://lockupstudio.com',
    siteName: 'Lockup Studio',
    locale: 'en_US',
    type: 'website',
    images: [{
    url: '/lockupstudio_logo.jpeg',
    width: 1200,
    height: 630,
    alt: 'Lockup Studio',
  }]
  },
  twitter: {
    title: 'Lockup Studio',
    description: 'A modern design studio crafting digital experiences',
    card: 'summary_large_image',
    images: '/lockupstudio_logo.jpeg',
  },
  verification: {
    google: 'google-site-verification=Ev2PVaQEKJtbgNFvewqzpDibwqcXg8oLgMz84p_7S1Q',
  },
  alternates: {
    canonical: '/',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '16x16,32x32,48x48' },
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-icon-180.png', sizes: '180x180', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
