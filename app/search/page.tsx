"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function SearchPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);

    // 정적 포스트 데이터
    const allPosts = [
        {
            slug: "example-post",
            title: "Next.js와 GitHub Pages로 블로그 만들기",
            description:
                "Next.js와 Tailwind CSS를 사용하여 GitHub Pages에 배포 가능한 정적 블로그를 만드는 방법을 알아봅니다.",
            category: "Development",
        },
        {
            slug: "tailwind-tips",
            title: "글래스모피즘 디자인 완벽 가이드",
            description:
                "Tailwind CSS를 사용하여 멋진 글래스모피즘 효과를 구현하는 방법을 상세히 알아봅니다.",
            category: "Design",
        },
        {
            slug: "series-feature",
            title: "블로그에 시리즈 기능 구현하기",
            description:
                "연관된 포스트들을 시리즈로 묶어서 독자들이 쉽게 탐색할 수 있도록 하는 시리즈 기능을 구현해봅니다.",
            category: "Development",
        },
        {
            slug: "react-hooks",
            title: "React Hooks 완벽 정리",
            description: "React Hooks의 핵심 개념과 실전 활용법을 정리합니다.",
            category: "Development",
        },
    ];

    // 실시간 검색 (debounce 적용)
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        // 300ms debounce
        const timeoutId = setTimeout(() => {
            const query = searchQuery.toLowerCase();
            const results = allPosts.filter(
                (post) =>
                    post.title.toLowerCase().includes(query) ||
                    post.description.toLowerCase().includes(query),
            );
            setSearchResults(results);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery]);

    return (
        <div className="min-h-screen">
            <div className="max-w-4xl mx-auto">
                {/* 헤더 */}
                <div className="mb-8">
                    <button
                        onClick={() => router.back()}
                        className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4 transition-colors"
                    >
                        <ArrowLeft size={20} />
                        뒤로가기
                    </button>

                    <h1 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-2">
                        검색
                    </h1>
                    <p className="text-gray-700">
                        찾으시는 포스트를 검색해보세요
                    </p>
                </div>

                {/* 검색창 */}
                <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl p-4 sm:p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] mb-6">
                    <div className="relative">
                        <Search
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="검색어를 입력하세요..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full backdrop-blur-xl bg-white/50 border border-white/60 rounded-xl pl-12 pr-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50"
                            autoFocus
                        />
                    </div>
                </div>

                {/* 실시간 검색 결과 */}
                {searchQuery.trim() ? (
                    <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl p-4 sm:p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
                        {searchResults.length > 0 ? (
                            <>
                                <h2 className="text-base sm:text-lg font-bold text-gray-900 mb-4">
                                    검색 결과 ({searchResults.length}개)
                                </h2>
                                <div className="space-y-4">
                                    {searchResults.map((post) => (
                                        <Link
                                            key={post.slug}
                                            href={`/blog/${post.slug}`}
                                            className="block p-4 sm:p-6 backdrop-blur-xl bg-white/50 hover:bg-white/70 border border-white/60 rounded-xl transition-all shadow-sm hover:shadow-md"
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-2">
                                                <h3 className="text-lg sm:text-xl font-bold text-gray-900 flex-1">
                                                    {post.title}
                                                </h3>
                                                {post.category && (
                                                    <span className="px-2 sm:px-3 py-1 backdrop-blur-xl bg-blue-500/20 border border-blue-400/40 rounded-full text-xs text-blue-700 whitespace-nowrap">
                                                        {post.category}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm sm:text-base text-gray-700">
                                                {post.description}
                                            </p>
                                        </Link>
                                    ))}
                                </div>
                            </>
                        ) : (
                            <div className="text-center py-12">
                                <p className="text-gray-700 text-lg mb-2">
                                    '{searchQuery}' 검색 결과가 없습니다
                                </p>
                                <p className="text-gray-600 text-sm">
                                    다른 검색어로 시도해보세요
                                </p>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl p-12 sm:p-20 text-center shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
                        <Search
                            size={48}
                            className="mx-auto text-gray-400 mb-4"
                        />
                        <p className="text-gray-700">검색어를 입력해주세요</p>
                    </div>
                )}
            </div>
        </div>
    );
}
