import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import { siteConfig } from "@/config/config";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
    title: siteConfig.title,
    description: siteConfig.description,
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="ko">
            <body className={inter.className}>
                {/* 배경 그라디언트 - 밝은 배경 */}
                <div className="fixed inset-0 -z-10 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50" />

                {/* 애니메이션 배경 효과 - 블러 강화 */}
                <div className="fixed inset-0 -z-10 opacity-50">
                    <div className="absolute top-0 -left-4 w-[500px] h-[500px] bg-blue-400 rounded-full mix-blend-multiply filter blur-[128px] animate-blob" />
                    <div className="absolute top-0 -right-4 w-[500px] h-[500px] bg-purple-400 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-2000" />
                    <div className="absolute -bottom-8 left-20 w-[500px] h-[500px] bg-pink-400 rounded-full mix-blend-multiply filter blur-[128px] animate-blob animation-delay-4000" />
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
