import type { Metadata } from "next";
import { Noto_Sans_KR } from "next/font/google";
import "./globals.css";

const notoSansKR = Noto_Sans_KR({
  variable: "--font-noto-sans-kr",
  subsets: ["latin"],
  weight: ["400", "500", "700"],
});

export const metadata: Metadata = {
  title: "오늘의 경제 뉴스 | 초보자를 위한 글로벌 경제 한국어 요약",
  description:
    "매일 아침 8시, 초보자도 이해할 수 있는 글로벌 경제 뉴스 요약을 받아보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={notoSansKR.variable}>
      <body className="font-sans min-h-screen">
        <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
          <div className="max-w-2xl mx-auto px-4 py-4 flex items-center gap-3">
            <span className="text-2xl" role="img" aria-label="차트">
              📈
            </span>
            <div>
              <p className="text-base font-bold text-slate-900 leading-none">
                오늘의 경제 뉴스
              </p>
              <p className="text-xs text-slate-500 mt-0.5">
                초보자를 위한 글로벌 경제 한국어 요약
              </p>
            </div>
          </div>
        </header>

        <main className="max-w-2xl mx-auto px-4 py-8">{children}</main>

        <footer className="border-t border-slate-200 mt-8">
          <div className="max-w-2xl mx-auto px-4 py-6 text-center text-xs text-slate-400">
            매일 오전 8시 KST 업데이트 · 뉴스 출처: NewsAPI · 요약: Claude AI
          </div>
        </footer>
      </body>
    </html>
  );
}
