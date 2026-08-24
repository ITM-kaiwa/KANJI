import type { Metadata } from "next";
import { BIZ_UDPMincho } from "next/font/google";
import "./globals.css";

// BIZ UDPMincho is Morisawa/Fontworks' Universal Design Mincho family,
// explicitly designed for and modeled after Japanese school-textbook print
// (kyoukasho-tai) -- the closest widely-available web font to "教科書体".
const kyokasho = BIZ_UDPMincho({
  weight: ["400", "700"],
  subsets: ["latin"],
  preload: false, // Japanese subset is large; loaded on demand per-page.
  variable: "--font-kyokasho",
});

export const metadata: Metadata = {
  title: "日本語フラッシュカード",
  description:
    "Thẻ ghi nhớ tiếng Nhật — Kanji, Hiragana, Katakana, và từ vựng Minna no Nihongo N5-N4",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="vi" className={kyokasho.variable}>
      <body className="min-h-screen bg-sand-100 text-sand-800 antialiased">
        {children}
      </body>
    </html>
  );
}
