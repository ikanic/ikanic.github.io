"use client";

import { useState } from "react";
import PostCardHorizontal from "@/components/PostCardHorizontal";
import { PostData } from "@/lib/posts";
import { SlidersHorizontal } from "lucide-react";
import { useBlogFilter } from "@/hooks/useBlogFilter";
import FilterSidebar from "@/components/blog/FilterSidebar";
import MobileFilterSidebar from "@/components/blog/MobileFilterSidebar";

interface BlogClientProps {
    initialPosts: PostData[];
    initialCategories: string[];
    initialTags: { tag: string; count: number }[];
    initialSeries: { series: string; count: number }[];
}

export default function BlogClient({
    initialPosts,
    initialCategories,
    initialTags,
    initialSeries,
}: BlogClientProps) {
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    const {
        filterType,
        filterValue,
        filteredPosts,
        handleFilter,
        getFilterTitle,
    } = useBlogFilter(initialPosts);

    return (
        <div>
            <div className="flex gap-8">
                {/* 데스크톱 사이드바 */}
                <FilterSidebar
                    filterType={filterType}
                    filterValue={filterValue}
                    initialPosts={initialPosts}
                    categories={initialCategories}
                    tags={initialTags}
                    series={initialSeries}
                    onFilterChange={handleFilter}
                />

                {/* 메인 콘텐츠 */}
                <main className="flex-1 min-w-0">
                    {/* 모바일 필터 버튼 */}
                    <button
                        onClick={() => setIsMobileFilterOpen(true)}
                        className="lg:hidden mb-6 w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-3 backdrop-blur-2xl bg-white/40 hover:bg-white/60 border border-white/60 rounded-xl text-gray-900 font-medium transition-all shadow-sm"
                    >
                        <SlidersHorizontal size={20} />
                        필터
                    </button>

                    <div className="mb-8">
                        <h1 className="text-4xl font-bold text-gray-900 mb-2">
                            Blog
                        </h1>
                        <p className="text-gray-700">{getFilterTitle()}</p>
                    </div>

                    {filteredPosts.length > 0 ? (
                        <div className="flex flex-col gap-4">
                            {filteredPosts.map((post) => (
                                <PostCardHorizontal
                                    key={post.slug}
                                    post={post}
                                />
                            ))}
                        </div>
                    ) : (
                        <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl p-12 text-center shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
                            <p className="text-gray-700 text-lg">
                                {filterType === "all"
                                    ? "아직 작성된 포스트가 없습니다."
                                    : "해당하는 포스트가 없습니다."}
                            </p>
                        </div>
                    )}
                </main>
            </div>

            {/* 모바일 필터 사이드바 */}
            <MobileFilterSidebar
                isOpen={isMobileFilterOpen}
                onClose={() => setIsMobileFilterOpen(false)}
                filterType={filterType}
                filterValue={filterValue}
                initialPosts={initialPosts}
                categories={initialCategories}
                tags={initialTags}
                series={initialSeries}
                onFilterChange={handleFilter}
            />
        </div>
    );
}
