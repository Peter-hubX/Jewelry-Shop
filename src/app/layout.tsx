import { InstallPrompt } from "@/components/pwa/InstallPrompt";
import { ReloadPrompt } from "@/components/pwa/ReloadPrompt";
import { Toaster } from "@/components/ui/toaster";
import type { Metadata, Viewport } from "next";
import { Cairo } from "next/font/google";
import "./globals.css";

const cairo = Cairo({
  variable: "--font-cairo",
  subsets: ["arabic", "latin"],
  weight: ["400", "500", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'),
  title: "مجوهرات ميشيل - حرفية تمتد عبر الزمن",
  description: "متجر Michiel للمجوهرات - أكثر من 60 عاماً من الحرفية الذهبية الأصيلة. تصاميم فاخرة من الذهب 18 و21 و24 عيار مع شهادات معتمدة.",
  keywords: ["مجوهرات", "ذهب", "Michiel", "مجوهرات ذهبية", "سبائك ذهب", "حرفية", "أصالة"],
  authors: [{ name: "Michiel Jewelry Shop" }],
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'مجوهرات ميشيل',
  },
  openGraph: {
    title: "مجوهرات ميشيل - حرفية تمتد عبر الزمن",
    description: "متجر Michiel للمجوهرات - أكثر من 60 عاماً من الحرفية الذهبية الأصيلة",
    url: 'https://michiel-jewelry.com',
    siteName: 'مجوهرات ميشيل',
    images: [
      {
        url: '/images/michiel-logo.png',
        width: 1200,
        height: 630,
        alt: 'مجوهرات ميشيل - حرفية تمتد عبر الزمن',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: "مجوهرات ميشيل - حرفية تمتد عبر الزمن",
    description: "متجر Michiel للمجوهرات - أكثر من 60 عاماً من الحرفية الذهبية الأصيلة",
    images: ['/images/michiel-logo.png'],
  },
  icons: {
    icon: '/icon-192.png',
    shortcut: '/icon-512.png',
    apple: [
      { url: '/icon-192.png', sizes: '180x180' },
    ],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
    },
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" className={cairo.variable}>
      <body className={cairo.className}>
        {children}
        <Toaster />
        <InstallPrompt />
        <ReloadPrompt />
      </body>
    </html>
  );
}