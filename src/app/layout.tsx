import type { Metadata } from "next";
import { Toaster } from "react-hot-toast";
import "./globals.css";

export const metadata: Metadata = {
  title: "心晴助手 — 心理諮商中心貼文 Agent",
  description: "為大學心理諮商中心打造的內容管理工具，一鍵生成心理健康貼文並發布到微信公眾號",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-Hant">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400;500;700&family=Space+Mono:wght@400;700&family=ZCOOL+XiaoWei&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <Toaster
          position="top-center"
          toastOptions={{
            style: {
              fontFamily: '"Noto Sans SC", sans-serif',
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
