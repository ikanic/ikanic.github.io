"use client";

import Link from "next/link";
import { PostData } from "@/lib/posts";
import {
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    ChevronUp,
} from "lucide-react";
import { useState } from "react";

interface SeriesNavProps {
    currentPost: PostData;
    seriesPosts: PostData[];
}

export default function SeriesNav({
    currentPost,
    seriesPosts,
}: SeriesNavProps) {
    const [isExpanded, setIsExpanded] = useState(true);

    if (!currentPost.series || seriesPosts.length === 0) {
        return null;
    }

    const currentIndex = seriesPosts.findIndex(
        (post) => post.slug === currentPost.slug,
    );
    const prevPost = currentIndex > 0 ? seriesPosts[currentIndex - 1] : null;
    const nextPost =
        currentIndex < seriesPosts.length - 1
            ? seriesPosts[currentIndex + 1]
            : null;

    return (
        <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] overflow-hidden">
            {/* 헤더 (클릭 가능) */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full text-left p-6 hover:bg-white/50 transition-colors"
            >
                <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                        <h3 className="text-sm font-medium text-gray-600 mb-1">
                            📚 Series
                        </h3>
                        <h2 className="text-xl font-bold text-gray-900">
                            {currentPost.series}
                        </h2>
                    </div>
                    {isExpanded ? (
                        <ChevronUp size={20} className="text-gray-600 mt-1" />
                    ) : (
                        <ChevronDown size={20} className="text-gray-600 mt-1" />
                    )}
                </div>
            </button>

            {/* 시리즈 내용 */}
            {isExpanded && (
                <>
                    {/* 시리즈 목록 */}
                    <div className="px-6 pb-4 space-y-2">
                        {seriesPosts.map((post, index) => {
                            const isCurrent = post.slug === currentPost.slug;
                            return (
                                <Link
                                    key={post.slug}
                                    href={`/blog/${post.slug}`}
                                    className={`block px-4 py-2 rounded-lg transition-all ${
                                        isCurrent
                                            ? "backdrop-blur-xl bg-blue-500/20 text-blue-700 border border-blue-400/40 font-medium"
                                            : "text-gray-700 hover:bg-white/50 hover:text-gray-900"
                                    }`}
                                >
                                    <span className="text-sm text-gray-500 mr-2">
                                        {index + 1}.
                                    </span>
                                    {post.title}
                                </Link>
                            );
                        })}
                    </div>

                    {/* 이전/다음 포스트 네비게이션 */}
                    <div className="grid grid-cols-2 gap-4 px-6 pb-6 pt-4 border-t border-gray-200/50">
                        {prevPost ? (
                            <Link
                                href={`/blog/${prevPost.slug}`}
                                className="flex items-center gap-2 p-3 rounded-lg backdrop-blur-xl bg-white/30 hover:bg-white/50 transition-all group"
                            >
                                <ChevronLeft
                                    size={16}
                                    className="text-gray-600 group-hover:text-gray-900"
                                />
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-gray-500">
                                        이전 글
                                    </div>
                                    <div className="text-sm text-gray-900 truncate">
                                        {prevPost.title}
                                    </div>
                                </div>
                            </Link>
                        ) : (
                            <div />
                        )}

                        {nextPost ? (
                            <Link
                                href={`/blog/${nextPost.slug}`}
                                className="flex items-center gap-2 p-3 rounded-lg backdrop-blur-xl bg-white/30 hover:bg-white/50 transition-all group text-right"
                            >
                                <div className="flex-1 min-w-0">
                                    <div className="text-xs text-gray-500">
                                        다음 글
                                    </div>
                                    <div className="text-sm text-gray-900 truncate">
                                        {nextPost.title}
                                    </div>
                                </div>
                                <ChevronRight
                                    size={16}
                                    className="text-gray-600 group-hover:text-gray-900"
                                />
                            </Link>
                        ) : (
                            <div />
                        )}
                    </div>
                </>
            )}
        </div>
    );
}
