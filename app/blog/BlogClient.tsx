"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import PostCardHorizontal from "@/components/PostCardHorizontal";
import { PostData } from "@/lib/posts";
import {
    Folder,
    Tag,
    BookOpen,
    ChevronDown,
    ChevronUp,
    SlidersHorizontal,
    X,
} from "lucide-react";

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
    const searchParams = useSearchParams();
    const tagParam = searchParams.get("tag");
    const categoryParam = searchParams.get("category");
    const seriesParam = searchParams.get("series");

    // URL 파라미터에 따라 초기 필터 설정
    const getInitialFilter = () => {
        if (tagParam) return { type: "tag" as const, value: tagParam };
        if (categoryParam)
            return { type: "category" as const, value: categoryParam };
        if (seriesParam) return { type: "series" as const, value: seriesParam };
        return { type: "all" as const, value: "" };
    };

    const initialFilter = getInitialFilter();
    const [filterType, setFilterType] = useState<
        "all" | "category" | "tag" | "series"
    >(initialFilter.type);
    const [filterValue, setFilterValue] = useState<string>(initialFilter.value);

    // 접기 상태
    const [isCategoryOpen, setIsCategoryOpen] = useState(true);
    const [isTagOpen, setIsTagOpen] = useState(true);
    const [isSeriesOpen, setIsSeriesOpen] = useState(true);
    const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

    // URL 파라미터 변경 감지
    useEffect(() => {
        const newFilter = getInitialFilter();
        setFilterType(newFilter.type);
        setFilterValue(newFilter.value);
    }, [tagParam, categoryParam, seriesParam]);

    // 모바일 필터 열릴 때 스크롤 방지
    useEffect(() => {
        if (isMobileFilterOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isMobileFilterOpen]);

    const filteredPosts = (() => {
        if (filterType === "all") return initialPosts;
        if (filterType === "category") {
            return initialPosts.filter((post) => post.category === filterValue);
        }
        if (filterType === "tag") {
            return initialPosts.filter((post) =>
                post.tags?.includes(filterValue),
            );
        }
        if (filterType === "series") {
            return initialPosts.filter((post) => post.series === filterValue);
        }
        return initialPosts;
    })();

    const handleFilter = (
        type: "all" | "category" | "tag" | "series",
        value: string = "",
    ) => {
        setFilterType(type);
        setFilterValue(value);
        setIsMobileFilterOpen(false); // 필터 선택 시 모바일 사이드바 닫기
    };

    const getFilterTitle = () => {
        if (filterType === "all") return `전체 포스트 ${initialPosts.length}개`;
        if (filterType === "category")
            return `${filterValue} 카테고리 ${filteredPosts.length}개`;
        if (filterType === "tag")
            return `#${filterValue} 태그 ${filteredPosts.length}개`;
        if (filterType === "series")
            return `${filterValue} 시리즈 ${filteredPosts.length}개`;
        return "";
    };

    return (
        <div>
            <div className="flex gap-8">
                {/* 왼쪽 사이드바 - 데스크톱만 */}
                <aside className="hidden lg:block w-64 shrink-0">
                    <div className="sticky top-24 space-y-4">
                        {/* 카테고리 */}
                        <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] overflow-hidden">
                            <button
                                onClick={() =>
                                    setIsCategoryOpen(!isCategoryOpen)
                                }
                                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/50 transition-colors"
                            >
                                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                    <Folder size={20} />
                                    Categories
                                </h3>
                                {isCategoryOpen ? (
                                    <ChevronUp
                                        size={18}
                                        className="text-gray-600"
                                    />
                                ) : (
                                    <ChevronDown
                                        size={18}
                                        className="text-gray-600"
                                    />
                                )}
                            </button>

                            {isCategoryOpen && (
                                <nav className="px-4 pb-4 space-y-1">
                                    <button
                                        onClick={() => handleFilter("all")}
                                        className={`w-full text-left px-4 py-2 rounded-lg transition-all text-sm ${
                                            filterType === "all"
                                                ? "backdrop-blur-xl bg-blue-500/20 text-blue-700 border border-blue-400/40 font-medium shadow-sm"
                                                : "text-gray-700 hover:bg-white/50 hover:text-gray-900"
                                        }`}
                                    >
                                        All Posts
                                        <span className="ml-2 text-xs text-gray-600">
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
                                                    handleFilter(
                                                        "category",
                                                        category,
                                                    )
                                                }
                                                className={`w-full text-left px-4 py-2 rounded-lg transition-all text-sm ${
                                                    filterType === "category" &&
                                                    filterValue === category
                                                        ? "backdrop-blur-xl bg-blue-500/20 text-blue-700 border border-blue-400/40 font-medium shadow-sm"
                                                        : "text-gray-700 hover:bg-white/50 hover:text-gray-900"
                                                }`}
                                            >
                                                {category}
                                                <span className="ml-2 text-xs text-gray-600">
                                                    ({count})
                                                </span>
                                            </button>
                                        );
                                    })}
                                </nav>
                            )}
                        </div>

                        {/* 태그 */}
                        {initialTags.length > 0 && (
                            <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] overflow-hidden">
                                <button
                                    onClick={() => setIsTagOpen(!isTagOpen)}
                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/50 transition-colors"
                                >
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <Tag size={20} />
                                        Tags
                                    </h3>
                                    {isTagOpen ? (
                                        <ChevronUp
                                            size={18}
                                            className="text-gray-600"
                                        />
                                    ) : (
                                        <ChevronDown
                                            size={18}
                                            className="text-gray-600"
                                        />
                                    )}
                                </button>

                                {isTagOpen && (
                                    <div className="px-4 pb-4">
                                        <div className="flex flex-wrap gap-2">
                                            {initialTags.map(({ tag }) => (
                                                <button
                                                    key={tag}
                                                    onClick={() =>
                                                        handleFilter("tag", tag)
                                                    }
                                                    className={`px-3 py-1 backdrop-blur-xl border rounded-full text-sm transition-all ${
                                                        filterType === "tag" &&
                                                        filterValue === tag
                                                            ? "bg-purple-500/20 border-purple-400/40 text-purple-700 font-medium"
                                                            : "bg-white/50 border-white/60 text-gray-700 hover:bg-white/70"
                                                    }`}
                                                >
                                                    #{tag}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* 시리즈 */}
                        {initialSeries.length > 0 && (
                            <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] overflow-hidden">
                                <button
                                    onClick={() =>
                                        setIsSeriesOpen(!isSeriesOpen)
                                    }
                                    className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/50 transition-colors"
                                >
                                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                                        <BookOpen size={20} />
                                        Series
                                    </h3>
                                    {isSeriesOpen ? (
                                        <ChevronUp
                                            size={18}
                                            className="text-gray-600"
                                        />
                                    ) : (
                                        <ChevronDown
                                            size={18}
                                            className="text-gray-600"
                                        />
                                    )}
                                </button>

                                {isSeriesOpen && (
                                    <nav className="px-4 pb-4 space-y-1">
                                        {initialSeries.map(
                                            ({ series, count }) => (
                                                <button
                                                    key={series}
                                                    onClick={() =>
                                                        handleFilter(
                                                            "series",
                                                            series,
                                                        )
                                                    }
                                                    className={`w-full text-left px-4 py-2 rounded-lg transition-all text-sm ${
                                                        filterType ===
                                                            "series" &&
                                                        filterValue === series
                                                            ? "backdrop-blur-xl bg-pink-500/20 text-pink-700 border border-pink-400/40 font-medium shadow-sm"
                                                            : "text-gray-700 hover:bg-white/50 hover:text-gray-900"
                                                    }`}
                                                >
                                                    📚 {series}
                                                    <span className="ml-2 text-xs text-gray-600">
                                                        ({count})
                                                    </span>
                                                </button>
                                            ),
                                        )}
                                    </nav>
                                )}
                            </div>
                        )}
                    </div>
                </aside>

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
            {isMobileFilterOpen && (
                <>
                    {/* 배경 오버레이 */}
                    <div
                        className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
                        onPointerDown={(e) => {
                            e.preventDefault();
                            setIsMobileFilterOpen(false);
                        }}
                    />

                    {/* 사이드바 */}
                    <div className="fixed top-0 left-0 bottom-0 z-50 w-80 max-w-[85vw] backdrop-blur-2xl bg-white/90 border-r border-white/60 shadow-2xl lg:hidden overflow-y-auto">
                        <div className="p-6">
                            {/* 헤더 */}
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                    <SlidersHorizontal size={24} />
                                    필터
                                </h2>
                                <button
                                    onClick={() => setIsMobileFilterOpen(false)}
                                    className="p-2 text-gray-700 hover:text-gray-900 transition-colors hover:bg-white/50 rounded-lg"
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {/* 필터 내용 */}
                            <div className="space-y-4">
                                {/* 카테고리 */}
                                <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl shadow-sm overflow-hidden">
                                    <button
                                        onClick={() =>
                                            setIsCategoryOpen(!isCategoryOpen)
                                        }
                                        className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/50 transition-colors"
                                    >
                                        <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                            <Folder size={18} />
                                            Categories
                                        </h3>
                                        {isCategoryOpen ? (
                                            <ChevronUp
                                                size={16}
                                                className="text-gray-600"
                                            />
                                        ) : (
                                            <ChevronDown
                                                size={16}
                                                className="text-gray-600"
                                            />
                                        )}
                                    </button>

                                    {isCategoryOpen && (
                                        <nav className="px-3 pb-3 space-y-1">
                                            <button
                                                onClick={() =>
                                                    handleFilter("all")
                                                }
                                                className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                                                    filterType === "all"
                                                        ? "backdrop-blur-xl bg-blue-500/20 text-blue-700 border border-blue-400/40 font-medium"
                                                        : "text-gray-700 hover:bg-white/50"
                                                }`}
                                            >
                                                All Posts ({initialPosts.length}
                                                )
                                            </button>

                                            {initialCategories.map(
                                                (category) => {
                                                    const count =
                                                        initialPosts.filter(
                                                            (p) =>
                                                                p.category ===
                                                                category,
                                                        ).length;
                                                    return (
                                                        <button
                                                            key={category}
                                                            onClick={() =>
                                                                handleFilter(
                                                                    "category",
                                                                    category,
                                                                )
                                                            }
                                                            className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                                                                filterType ===
                                                                    "category" &&
                                                                filterValue ===
                                                                    category
                                                                    ? "backdrop-blur-xl bg-blue-500/20 text-blue-700 border border-blue-400/40 font-medium"
                                                                    : "text-gray-700 hover:bg-white/50"
                                                            }`}
                                                        >
                                                            {category} ({count})
                                                        </button>
                                                    );
                                                },
                                            )}
                                        </nav>
                                    )}
                                </div>

                                {/* 태그 */}
                                {initialTags.length > 0 && (
                                    <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl shadow-sm overflow-hidden">
                                        <button
                                            onClick={() =>
                                                setIsTagOpen(!isTagOpen)
                                            }
                                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/50 transition-colors"
                                        >
                                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                                <Tag size={18} />
                                                Tags
                                            </h3>
                                            {isTagOpen ? (
                                                <ChevronUp
                                                    size={16}
                                                    className="text-gray-600"
                                                />
                                            ) : (
                                                <ChevronDown
                                                    size={16}
                                                    className="text-gray-600"
                                                />
                                            )}
                                        </button>

                                        {isTagOpen && (
                                            <div className="px-3 pb-3">
                                                <div className="flex flex-wrap gap-2">
                                                    {initialTags.map(
                                                        ({ tag }) => (
                                                            <button
                                                                key={tag}
                                                                onClick={() =>
                                                                    handleFilter(
                                                                        "tag",
                                                                        tag,
                                                                    )
                                                                }
                                                                className={`px-3 py-1 backdrop-blur-xl border rounded-full text-sm transition-all ${
                                                                    filterType ===
                                                                        "tag" &&
                                                                    filterValue ===
                                                                        tag
                                                                        ? "bg-purple-500/20 border-purple-400/40 text-purple-700 font-medium"
                                                                        : "bg-white/50 border-white/60 text-gray-700 hover:bg-white/70"
                                                                }`}
                                                            >
                                                                #{tag}
                                                            </button>
                                                        ),
                                                    )}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* 시리즈 */}
                                {initialSeries.length > 0 && (
                                    <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl shadow-sm overflow-hidden">
                                        <button
                                            onClick={() =>
                                                setIsSeriesOpen(!isSeriesOpen)
                                            }
                                            className="w-full px-4 py-3 flex items-center justify-between hover:bg-white/50 transition-colors"
                                        >
                                            <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                                                <BookOpen size={18} />
                                                Series
                                            </h3>
                                            {isSeriesOpen ? (
                                                <ChevronUp
                                                    size={16}
                                                    className="text-gray-600"
                                                />
                                            ) : (
                                                <ChevronDown
                                                    size={16}
                                                    className="text-gray-600"
                                                />
                                            )}
                                        </button>

                                        {isSeriesOpen && (
                                            <nav className="px-3 pb-3 space-y-1">
                                                {initialSeries.map(
                                                    ({ series, count }) => (
                                                        <button
                                                            key={series}
                                                            onClick={() =>
                                                                handleFilter(
                                                                    "series",
                                                                    series,
                                                                )
                                                            }
                                                            className={`w-full text-left px-3 py-2 rounded-lg transition-all text-sm ${
                                                                filterType ===
                                                                    "series" &&
                                                                filterValue ===
                                                                    series
                                                                    ? "backdrop-blur-xl bg-pink-500/20 text-pink-700 border border-pink-400/40 font-medium"
                                                                    : "text-gray-700 hover:bg-white/50"
                                                            }`}
                                                        >
                                                            📚 {series} ({count}
                                                            )
                                                        </button>
                                                    ),
                                                )}
                                            </nav>
                                        )}
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </>
            )}
        </div>
    );
}
