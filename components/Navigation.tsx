"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect, lazy, Suspense } from "react";
import { Search, X, Menu } from "lucide-react";
import { siteConfig, navigation } from "@/config/config";

// SearchModal lazy loading
const SearchModal = lazy(() => import("@/components/SearchModal"));

export default function Navigation() {
    const pathname = usePathname();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    // 모바일 메뉴 열릴 때 스크롤 방지
    useEffect(() => {
        if (isMobileMenuOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isMobileMenuOpen]);

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 px-4 sm:px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="relative backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
                        <div className="px-4 sm:px-8 py-4 flex items-center justify-between">
                            {/* 로고 */}
                            <Link
                                href="/"
                                className="text-xl sm:text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                            >
                                {siteConfig.title}
                            </Link>

                            {/* 데스크톱 메뉴 */}
                            <div className="hidden md:flex items-center gap-6 lg:gap-8">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        className={`relative px-4 py-2 text-sm font-medium transition-all duration-300 ${
                                            pathname.startsWith(item.path)
                                                ? "text-gray-900 font-semibold"
                                                : "text-gray-700 hover:text-gray-900"
                                        }`}
                                    >
                                        {item.name}
                                        {pathname.startsWith(item.path) && (
                                            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full" />
                                        )}
                                    </Link>
                                ))}

                                <button
                                    onClick={() => setIsSearchOpen(true)}
                                    className="p-2 text-gray-700 hover:text-gray-900 transition-colors hover:bg-white/50 rounded-lg"
                                    aria-label="Search"
                                >
                                    <Search size={20} />
                                </button>
                            </div>

                            {/* 모바일 메뉴 버튼 */}
                            <div className="flex md:hidden items-center gap-2">
                                {/* 모바일: /search 페이지로 이동 */}
                                <Link
                                    href="/search"
                                    className="p-2 text-gray-700 hover:text-gray-900 transition-colors hover:bg-white/50 rounded-lg"
                                    aria-label="Search"
                                >
                                    <Search size={20} />
                                </Link>
                                <button
                                    onClick={() => setIsMobileMenuOpen(true)}
                                    className="p-2 text-gray-700 hover:text-gray-900 transition-colors hover:bg-white/50 rounded-lg"
                                    aria-label="Menu"
                                >
                                    <Menu size={24} />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </nav>

            {/* 모바일 사이드바 */}
            {isMobileMenuOpen && (
                <>
                    {/* 배경 오버레이 */}
                    <div
                        className="fixed inset-0 z-50 bg-black/50 md:hidden"
                        onClick={() => setIsMobileMenuOpen(false)}
                    />

                    {/* 사이드바 */}
                    <div className="fixed top-0 right-0 bottom-0 z-50 w-64 backdrop-blur-2xl bg-white/90 border-l border-white/60 shadow-2xl md:hidden">
                        <div className="p-6">
                            {/* 닫기 버튼 */}
                            <div className="flex justify-end mb-8">
                                <button
                                    onClick={() => setIsMobileMenuOpen(false)}
                                    className="p-2 text-gray-700 hover:text-gray-900 transition-colors hover:bg-white/50 rounded-lg"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* 메뉴 항목 */}
                            <nav className="space-y-2">
                                {navigation.map((item) => (
                                    <Link
                                        key={item.path}
                                        href={item.path}
                                        onClick={() =>
                                            setIsMobileMenuOpen(false)
                                        }
                                        className={`block px-4 py-3 rounded-lg text-base font-medium transition-all ${
                                            pathname.startsWith(item.path)
                                                ? "bg-blue-500/20 text-blue-700 border border-blue-400/40"
                                                : "text-gray-700 hover:bg-white/50"
                                        }`}
                                    >
                                        {item.name}
                                    </Link>
                                ))}
                            </nav>
                        </div>
                    </div>
                </>
            )}

            {/* Search Modal - Lazy Loading */}
            {isSearchOpen && (
                <Suspense fallback={null}>
                    <SearchModal
                        isOpen={isSearchOpen}
                        onClose={() => setIsSearchOpen(false)}
                    />
                </Suspense>
            )}
        </>
    );
}
