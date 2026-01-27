"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { Search, X } from "lucide-react";

export default function Navigation() {
    const pathname = usePathname();
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [allPosts, setAllPosts] = useState<any[]>([]);

    const menuItems = [
        { name: "Blog", path: "/blog" },
        { name: "Project", path: "/project" },
        { name: "About Me", path: "/about" },
    ];

    // 포스트 데이터 로드
    useEffect(() => {
        const posts = [
            {
                slug: "example-post",
                title: "Next.js와 GitHub Pages로 블로그 만들기",
                description:
                    "Next.js와 Tailwind CSS를 사용하여 GitHub Pages에 배포 가능한 정적 블로그를 만드는 방법을 알아봅니다.",
                category: "Development",
                tags: ["Next.js", "React", "GitHub Pages"],
            },
            {
                slug: "tailwind-tips",
                title: "글래스모피즘 디자인 완벽 가이드",
                description:
                    "Tailwind CSS를 사용하여 멋진 글래스모피즘 효과를 구현하는 방법을 상세히 알아봅니다.",
                category: "Design",
                tags: ["Tailwind CSS", "CSS", "Design", "Glassmorphism"],
            },
            {
                slug: "series-feature",
                title: "블로그에 시리즈 기능 구현하기",
                description:
                    "연관된 포스트들을 시리즈로 묶어서 독자들이 쉽게 탐색할 수 있도록 하는 시리즈 기능을 구현해봅니다.",
                category: "Development",
                tags: ["Next.js", "TypeScript", "Blog"],
            },
            {
                slug: "react-hooks",
                title: "React Hooks 완벽 정리",
                description:
                    "React Hooks의 핵심 개념과 실전 활용법을 정리합니다.",
                category: "Development",
                tags: ["React", "JavaScript", "Hooks"],
            },
        ];
        setAllPosts(posts);
    }, []);

    // ESC 키로 검색 모달 닫기
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === "Escape") setIsSearchOpen(false);
        };
        window.addEventListener("keydown", handleEscape);
        return () => window.removeEventListener("keydown", handleEscape);
    }, []);

    // 검색 기능
    useEffect(() => {
        if (searchQuery.trim() && allPosts.length > 0) {
            const query = searchQuery.toLowerCase();
            const results = allPosts.filter((post) => {
                const titleMatch = post.title.toLowerCase().includes(query);
                const descriptionMatch = post.description
                    ?.toLowerCase()
                    .includes(query);
                const categoryMatch = post.category
                    ?.toLowerCase()
                    .includes(query);
                const tagsMatch = post.tags?.some((tag: string) =>
                    tag.toLowerCase().includes(query),
                );
                return (
                    titleMatch || descriptionMatch || categoryMatch || tagsMatch
                );
            });
            setSearchResults(results.slice(0, 10));
        } else {
            setSearchResults([]);
        }
    }, [searchQuery, allPosts]);

    return (
        <>
            <nav className="fixed top-0 left-0 right-0 z-50 px-6 py-4">
                <div className="max-w-7xl mx-auto">
                    <div className="relative backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
                        <div className="px-8 py-4 flex items-center justify-between">
                            <Link
                                href="/"
                                className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent hover:opacity-80 transition-opacity"
                            >
                                MyBlog
                            </Link>

                            <div className="flex items-center gap-8">
                                {menuItems.map((item) => (
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
                        </div>
                    </div>
                </div>
            </nav>

            {isSearchOpen && (
                <div
                    className="fixed inset-0 z-50 flex items-start justify-center pt-32 px-4 bg-black/50 backdrop-blur-sm"
                    onClick={() => setIsSearchOpen(false)}
                >
                    <div
                        className="w-full max-w-2xl backdrop-blur-2xl bg-white/50 border border-white/60 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.2)]"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="p-6 border-b border-gray-200/50">
                            <div className="relative">
                                <Search
                                    className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500"
                                    size={20}
                                />
                                <input
                                    type="text"
                                    placeholder="Search posts..."
                                    value={searchQuery}
                                    onChange={(e) =>
                                        setSearchQuery(e.target.value)
                                    }
                                    className="w-full backdrop-blur-xl bg-white/30 border border-white/50 rounded-xl pl-12 pr-12 py-4 text-gray-900 placeholder-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500/50 focus:border-blue-400/50"
                                    autoFocus
                                />
                                {searchQuery && (
                                    <button
                                        onClick={() => setSearchQuery("")}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
                                    >
                                        <X size={20} />
                                    </button>
                                )}
                            </div>
                        </div>

                        <div className="max-h-96 overflow-y-auto custom-scrollbar p-4">
                            {searchQuery.trim() === "" ? (
                                <div className="text-center py-12 text-gray-500">
                                    검색어를 입력해주세요
                                </div>
                            ) : searchResults.length > 0 ? (
                                <div className="space-y-3">
                                    {searchResults.map((result: any) => (
                                        <Link
                                            key={result.slug}
                                            href={`/blog/${result.slug}`}
                                            onClick={() => {
                                                setIsSearchOpen(false);
                                                setSearchQuery("");
                                            }}
                                            className="block p-4 backdrop-blur-xl bg-white/40 hover:bg-white/60 border border-white/50 rounded-xl transition-all group"
                                        >
                                            <div className="flex items-start justify-between gap-2 mb-1">
                                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-blue-600 flex-1">
                                                    {result.title}
                                                </h3>
                                                {result.category && (
                                                    <span className="px-2 py-1 backdrop-blur-xl bg-blue-500/20 border border-blue-400/40 rounded text-xs text-blue-700 whitespace-nowrap">
                                                        {result.category}
                                                    </span>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                                {result.description}
                                            </p>
                                            {result.tags &&
                                                result.tags.length > 0 && (
                                                    <div className="flex flex-wrap gap-1">
                                                        {result.tags
                                                            .slice(0, 3)
                                                            .map(
                                                                (
                                                                    tag: string,
                                                                ) => (
                                                                    <span
                                                                        key={
                                                                            tag
                                                                        }
                                                                        className="text-xs text-gray-500"
                                                                    >
                                                                        #{tag}
                                                                    </span>
                                                                ),
                                                            )}
                                                    </div>
                                                )}
                                        </Link>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-12 text-gray-500">
                                    '{searchQuery}' 검색 결과가 없습니다
                                </div>
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-200/50 text-center">
                            <p className="text-gray-600 text-sm">
                                Press{" "}
                                <kbd className="px-2 py-1 bg-white/50 border border-white/60 rounded text-xs">
                                    ESC
                                </kbd>{" "}
                                to close
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
