import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { siteConfig } from "@/config/config";

const inter = Inter({
    subsets: ["latin"],
    display: "swap", // 폰트 로딩 전 시스템 폰트 먼저 표시
    preload: true,
    variable: "--font-inter",
});

export const metadata: Metadata = {
    metadataBase: new URL("https://taek0622.github.io"),
    title: {
        default: siteConfig.title,
        template: `%s | ${siteConfig.title}`,
    },
    description: siteConfig.description,
    keywords: [
        "개발 블로그",
        "프론트엔드",
        "iOS",
        "React",
        "Next.js",
        "Swift",
        "SwiftUI",
        "개발자",
    ],
    authors: [{ name: siteConfig.author, url: "https://taek0622.github.io" }],
    creator: siteConfig.author,
    openGraph: {
        type: "website",
        locale: "ko_KR",
        url: "https://taek0622.github.io",
        title: siteConfig.title,
        description: siteConfig.description,
        siteName: siteConfig.title,
    },
    twitter: {
        card: "summary_large_image",
        title: siteConfig.title,
        description: siteConfig.description,
        creator: "@shoot_taek_a",
    },
    robots: {
        index: true,
        follow: true,
        googleBot: {
            index: true,
            follow: true,
            "max-video-preview": -1,
            "max-image-preview": "large",
            "max-snippet": -1,
        },
    },
    alternates: {
        types: {
            "application/rss+xml": "https://taek0622.github.io/rss.xml",
        },
    },
    verification: {
        // Google Search Console 인증 코드 (나중에 추가)
        // google: 'your-google-verification-code',
    },
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
            <head>
                {/* DNS Prefetch 및 Preconnect - 폰트/리소스 로딩 최적화 */}
                <link rel="preconnect" href="https://cdn.jsdelivr.net" />
                <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
                <link
                    rel="preconnect"
                    href="https://github-page-analytics.vercel.app"
                />

                {/* RSS 피드 링크 */}
                <link
                    rel="alternate"
                    type="application/rss+xml"
                    title={`${siteConfig.title} RSS Feed`}
                    href="/rss.xml"
                />
                {/* Umami Analytics - localhost 제외 */}
                <script
                    defer
                    src="https://github-page-analytics.vercel.app/script.js"
                    data-website-id="148eef8f-df64-45cc-8663-546df874370c"
                    data-domains="taek0622.github.io"
                />
            </head>
            <body className={inter.className}>
                {/* 배경 그라디언트 - 밝은 배경 */}
                <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />

                {/* 애니메이션 배경 효과 - iOS Safari 최적화 */}
                <div className="fixed inset-0 -z-10 opacity-50">
                    <div className="absolute top-0 -left-4 w-[500px] h-[500px] bg-blue-400 rounded-full mix-blend-multiply filter blur-[128px] animate-blob will-change-transform" />
                    <div className="absolute top-0 -right-4 w-[500px] h-[500px] bg-purple-400 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000 will-change-transform" />
                    <div className="absolute -bottom-8 left-20 w-[500px] h-[500px] bg-pink-400 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-4000 will-change-transform" />
                </div>

                <Navigation />

                <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
                    <div className="max-w-7xl mx-auto">{children}</div>
                </main>

                {/* 푸터 */}
                <footer className="border-t border-gray-200/50 backdrop-blur-2xl bg-white/40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center text-gray-600 text-sm">
                        {siteConfig.copyright}
                    </div>
                </footer>
            </body>
        </html>
    );
}
