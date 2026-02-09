import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { siteConfig } from "@/config/config";

const inter = Inter({
    subsets: ["latin"],
    display: "swap",
    preload: true,
    variable: "--font-inter",
    adjustFontFallback: true,
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

    // 파비콘 설정
    icons: {
        icon: [
            { url: "/favicon.ico", sizes: "any" },
            { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
            { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
        ],
        apple: [
            {
                url: "/apple-touch-icon.png",
                sizes: "180x180",
                type: "image/png",
            },
        ],
    },

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
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
            <head>
                {/* iOS Safari viewport 설정 - safe area까지 확장 */}
                <meta
                    name="viewport"
                    content="width=device-width, initial-scale=1, viewport-fit=cover"
                />

                {/* iOS Safari 상단바 색상 */}
                <meta name="theme-color" content="#fef2f2" />
                <meta
                    name="apple-mobile-web-app-status-bar-style"
                    content="black-translucent"
                />

                <link rel="preconnect" href="https://cdn.jsdelivr.net" />
                <link rel="dns-prefetch" href="https://cdn.jsdelivr.net" />
                <link
                    rel="preconnect"
                    href="https://github-page-analytics.vercel.app"
                />
                <link
                    rel="preload"
                    href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/woff2-subset/Pretendard-Regular.subset.woff2"
                    as="font"
                    type="font/woff2"
                    crossOrigin="anonymous"
                />
                <link
                    rel="preload"
                    href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/static/woff2-subset/Pretendard-Bold.subset.woff2"
                    as="font"
                    type="font/woff2"
                    crossOrigin="anonymous"
                />
                <link
                    rel="alternate"
                    type="application/rss+xml"
                    title={`${siteConfig.title} RSS Feed`}
                    href="/rss.xml"
                />
                <script
                    defer
                    src="https://github-page-analytics.vercel.app/script.js"
                    data-website-id="148eef8f-df64-45cc-8663-546df874370c"
                    data-domains="taek0622.github.io"
                />
            </head>
            <body className={inter.className}>
                {/* 그라데이션 메쉬 배경 */}
                <div className="fixed inset-0 -z-10">
                    <div
                        className="absolute inset-0"
                        style={{
                            background: [
                                "radial-gradient(circle at 20% 30%, rgba(139, 92, 246, 0.28) 0%, transparent 50%)",
                                "radial-gradient(circle at 80% 20%, rgba(192, 132, 252, 0.26) 0%, transparent 50%)",
                                "radial-gradient(circle at 40% 70%, rgba(236, 72, 153, 0.22) 0%, transparent 50%)",
                                "radial-gradient(circle at 90% 80%, rgba(251, 113, 133, 0.18) 0%, transparent 50%)",
                                "linear-gradient(135deg, #e9d5ff 0%, #f3e8ff 25%, #fce7f3 50%, #ffe4e6 75%, #fef2f2 100%)",
                            ].join(", "),
                        }}
                    />
                    <div
                        className="absolute inset-0 opacity-50 animate-gentle-pulse"
                        style={{
                            background:
                                "radial-gradient(circle at 50% 50%, rgba(168, 85, 247, 0.12) 0%, transparent 70%)",
                        }}
                    />
                </div>

                <Navigation />

                <main className="min-h-screen pt-24 pb-16 px-4 sm:px-6">
                    <div className="max-w-7xl mx-auto">{children}</div>
                </main>

                <footer className="border-t border-gray-200/50 backdrop-blur-2xl bg-white/40">
                    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 text-center text-gray-600 text-sm">
                        {siteConfig.copyright}
                    </div>
                </footer>
            </body>
        </html>
    );
}
