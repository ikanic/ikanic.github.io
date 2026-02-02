"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Search, ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

// 타입 정의
interface Post {
    slug: string;
    title: string;
    description: string;
    category?: string;
    tags?: string[];
}

export default function SearchPage() {
    const router = useRouter();
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<Post[]>([]);
    const [allPosts, setAllPosts] = useState<Post[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    // 컴포넌트 마운트 시 실제 포스트 데이터 가져오기
    useEffect(() => {
        async function fetchPosts() {
            try {
                const response = await fetch("/posts.json");
                if (response.ok) {
                    const posts = await response.json();
                    setAllPosts(posts);
                }
            } catch (error) {
                console.error("Failed to fetch posts:", error);
            } finally {
                setIsLoading(false);
            }
        }

        fetchPosts();
    }, []);

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
                    post.description?.toLowerCase().includes(query) ||
                    post.category?.toLowerCase().includes(query) ||
                    post.tags?.some((tag) => tag.toLowerCase().includes(query)),
            );
            setSearchResults(results);
        }, 300);

        return () => clearTimeout(timeoutId);
    }, [searchQuery, allPosts]);

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
                {isLoading ? (
                    <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl p-12 text-center shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
                        <p className="text-gray-700">포스트를 불러오는 중...</p>
                    </div>
                ) : searchQuery.trim() ? (
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
                                            {post.description && (
                                                <p className="text-sm sm:text-base text-gray-700 mb-2">
                                                    {post.description}
                                                </p>
                                            )}
                                            {post.tags &&
                                                post.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-2 mt-2">
                                                        {post.tags
                                                            .slice(0, 3)
                                                            .map((tag) => (
                                                                <span
                                                                    key={tag}
                                                                    className="px-2 py-1 backdrop-blur-xl bg-purple-500/20 border border-purple-400/40 rounded-full text-xs text-purple-700"
                                                                >
                                                                    #{tag}
                                                                </span>
                                                            ))}
                                                    </div>
                                                )}
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
