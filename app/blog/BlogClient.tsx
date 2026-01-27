"use client";

import { useState } from "react";
import PostCard from "@/components/PostCard";
import { PostData } from "@/lib/posts";
import { Folder } from "lucide-react";

interface BlogClientProps {
    initialPosts: PostData[];
    initialCategories: string[];
}

export default function BlogClient({
    initialPosts,
    initialCategories,
}: BlogClientProps) {
    const [selectedCategory, setSelectedCategory] = useState<string>("all");

    const filteredPosts =
        selectedCategory === "all"
            ? initialPosts
            : initialPosts.filter((post) => post.category === selectedCategory);

    return (
        <div className="max-w-7xl mx-auto px-0">
            <div className="flex gap-8">
                {/* 왼쪽 사이드바 */}
                <aside className="hidden lg:block w-64 shrink-0">
                    <div className="sticky top-24">
                        <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
                            <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                <Folder size={20} />
                                Categories
                            </h3>

                            <nav className="space-y-2">
                                <button
                                    onClick={() => setSelectedCategory("all")}
                                    className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                                        selectedCategory === "all"
                                            ? "backdrop-blur-xl bg-blue-500/20 text-blue-700 border border-blue-400/40 font-medium shadow-sm"
                                            : "text-gray-700 hover:bg-white/50 hover:text-gray-900"
                                    }`}
                                >
                                    All Posts
                                    <span className="ml-2 text-sm text-gray-600">
                                        ({initialPosts.length})
                                    </span>
                                </button>

                                {initialCategories.map((category) => {
                                    const count = initialPosts.filter(
                                        (p) => p.category === category,
                                    ).length;
                                    return (
                                        <button
                                            key={category}
                                            onClick={() =>
                                                setSelectedCategory(category)
                                            }
                                            className={`w-full text-left px-4 py-2 rounded-lg transition-all ${
                                                selectedCategory === category
                                                    ? "backdrop-blur-xl bg-blue-500/20 text-blue-700 border border-blue-400/40 font-medium shadow-sm"
                                                    : "text-gray-700 hover:bg-white/50 hover:text-gray-900"
                                            }`}
                                        >
                                            {category}
                                            <span className="ml-2 text-sm text-gray-600">
                                                ({count})
                                            </span>
                                        </button>
                                    );
                                })}
                            </nav>
                        </div>
                    </div>
                </aside>

                {/* 메인 콘텐츠 */}
                <main className="flex-1 min-w-0">
                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Blog
                        </h1>
                        <p className="text-gray-700">
                            {selectedCategory === "all"
                                ? `전체 포스트 ${initialPosts.length}개`
                                : `${selectedCategory} 카테고리의 포스트 ${filteredPosts.length}개`}
                        </p>
                    </div>

                    {filteredPosts.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {filteredPosts.map((post) => (
                                <PostCard key={post.slug} post={post} />
                            ))}
                        </div>
                    ) : (
                        <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl p-12 text-center shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
                            <p className="text-gray-700 text-lg">
                                이 카테고리에는 아직 포스트가 없습니다.
                            </p>
                        </div>
                    )}
                </main>
            </div>
        </div>
    );
}
