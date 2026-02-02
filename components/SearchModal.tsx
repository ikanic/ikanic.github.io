"use client";

import { X, Search as SearchIcon } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

interface SearchModalProps {
    isOpen: boolean;
    onClose: () => void;
}

interface Post {
    slug: string;
    title: string;
    description: string;
    category?: string;
    tags?: string[];
}

function SearchModalContent({ onClose }: { onClose: () => void }) {
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

    // 검색
    useEffect(() => {
        if (!searchQuery.trim()) {
            setSearchResults([]);
            return;
        }

        const query = searchQuery.toLowerCase();
        const results = allPosts.filter(
            (post) =>
                post.title.toLowerCase().includes(query) ||
                post.description?.toLowerCase().includes(query) ||
                post.category?.toLowerCase().includes(query) ||
                post.tags?.some((tag) => tag.toLowerCase().includes(query)),
        );
        setSearchResults(results);
    }, [searchQuery, allPosts]);

    // ESC 키
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") {
                e.preventDefault();
                onClose();
            }
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, [onClose]);

    // 즉시 닫기
    const handleClose = () => {
        onClose();
    };

    return (
        <div
            className="fixed inset-0 z-[99999] flex items-start justify-center pt-20 sm:pt-32 px-4 bg-black/50"
            onClick={handleClose}
            style={{ isolation: "isolate" }}
        >
            <div
                className="w-full max-w-2xl backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]"
                onClick={(e) => e.stopPropagation()}
                style={{
                    maxHeight: "80vh",
                    display: "flex",
                    flexDirection: "column",
                }}
            >
                {/* 헤더 */}
                <div className="p-4 sm:p-6 border-b border-white/60 flex-shrink-0">
                    <div className="relative">
                        <SearchIcon
                            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                            size={20}
                        />
                        <input
                            type="text"
                            placeholder="Search posts..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full backdrop-blur-xl bg-white/50 border border-white/60 rounded-xl pl-12 pr-12 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50"
                            autoFocus
                        />
                        {searchQuery && (
                            <button
                                onClick={() => setSearchQuery("")}
                                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                            >
                                <X size={20} />
                            </button>
                        )}
                    </div>
                </div>

                {/* 결과 */}
                <div className="overflow-y-auto p-4 sm:p-6 flex-1">
                    {isLoading ? (
                        <div className="text-center py-12 text-gray-600">
                            포스트를 불러오는 중...
                        </div>
                    ) : !searchQuery ? (
                        <div className="text-center py-12 text-gray-600">
                            검색어를 입력해주세요
                        </div>
                    ) : searchResults.length > 0 ? (
                        <div className="space-y-3">
                            {searchResults.map((result) => (
                                <Link
                                    key={result.slug}
                                    href={`/blog/${result.slug}`}
                                    onClick={handleClose}
                                    className="block p-4 backdrop-blur-xl bg-white/50 hover:bg-white/70 border border-white/60 rounded-xl transition-all shadow-sm hover:shadow-md"
                                >
                                    <div className="flex items-start justify-between gap-2 mb-1">
                                        <h3 className="font-semibold text-gray-900 flex-1">
                                            {result.title}
                                        </h3>
                                        {result.category && (
                                            <span className="px-2 py-1 backdrop-blur-xl bg-blue-500/20 border border-blue-400/40 rounded-full text-xs text-blue-700 whitespace-nowrap">
                                                {result.category}
                                            </span>
                                        )}
                                    </div>
                                    {result.description && (
                                        <p className="text-sm text-gray-700 line-clamp-2">
                                            {result.description}
                                        </p>
                                    )}
                                    {result.tags && result.tags.length > 0 && (
                                        <div className="flex flex-wrap gap-1 mt-2">
                                            {result.tags
                                                .slice(0, 3)
                                                .map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="px-2 py-0.5 backdrop-blur-xl bg-purple-500/20 border border-purple-400/40 rounded-full text-xs text-purple-700"
                                                    >
                                                        #{tag}
                                                    </span>
                                                ))}
                                        </div>
                                    )}
                                </Link>
                            ))}
                        </div>
                    ) : (
                        <div className="text-center py-12 text-gray-600">
                            검색 결과가 없습니다
                        </div>
                    )}
                </div>

                {/* 푸터 */}
                <div className="p-4 border-t border-white/60 flex-shrink-0">
                    {/* 데스크톱 */}
                    <div className="hidden sm:block text-center">
                        <p className="text-gray-700 text-sm">
                            Press{" "}
                            <kbd className="px-2 py-1 backdrop-blur-xl bg-white/50 border border-white/60 rounded text-xs">
                                ESC
                            </kbd>{" "}
                            to close
                        </p>
                    </div>

                    {/* 모바일 */}
                    <button
                        onClick={handleClose}
                        className="sm:hidden w-full py-3 backdrop-blur-xl bg-blue-500/80 hover:bg-blue-500 text-white rounded-xl font-medium transition-all shadow-sm"
                    >
                        닫기
                    </button>
                </div>
            </div>
        </div>
    );
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        return () => setMounted(false);
    }, []);

    if (!isOpen || !mounted) return null;

    return createPortal(
        <SearchModalContent onClose={onClose} />,
        document.body,
    );
}
