import type { Metadata, Viewport } from "next";
import "./globals.css";
import NavbarApple from "@/components/apple/NavbarApple";

export const metadata: Metadata = {
  title: "كورال ثمر شفاه — المنظومة الرقمية الشاملة | Thamar Shefah Choir",
  description: "المنظومة الرقمية الرسمية لكورال ثمر شفاه (ذبيحة تسبيح منذ عام 2000). حضور ذكي بالـ GPS، واشتراكات الخدمة، ومحرك النقاط الفصلي، ومكتبة الألحان السحابية.",
  keywords: [
    "كورال ثمر شفاه",
    "ذبيحة تسبيح",
    "حضور كورال",
    "نظام إدارة الكورال",
    "Thamar Shefah",
    "Choir Management System",
  ],
  authors: [{ name: "فريق كورال ثمر شفاه" }],
  icons: {
    icon: "/images/logo.jpg",
    apple: "/images/logo.jpg",
  },
};

export const viewport: Viewport = {
  themeColor: "#640810",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar-EG" dir="rtl" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-screen bg-surface-canvas text-charcoal font-sans antialiased selection:bg-gold-300 selection:text-burgundy-900">
        <NavbarApple />
        {children}
      </body>
    </html>
  );
}

