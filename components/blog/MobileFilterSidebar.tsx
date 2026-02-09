import { useEffect } from "react";
import { Folder, Tag, BookOpen, SlidersHorizontal, X } from "lucide-react";
import { PostData } from "@/lib/posts";
import { FilterType } from "@/hooks/useBlogFilter";
import {
    FilterSection,
    FilterButton,
    TagButton,
    SeriesButton,
} from "./FilterSection";

interface MobileFilterSidebarProps {
    isOpen: boolean;
    onClose: () => void;
    filterType: FilterType;
    filterValue: string;
    initialPosts: PostData[];
    categories: string[];
    tags: { tag: string; count: number }[];
    series: { series: string; count: number }[];
    onFilterChange: (type: FilterType, value?: string) => void;
}

export default function MobileFilterSidebar({
    isOpen,
    onClose,
    filterType,
    filterValue,
    initialPosts,
    categories,
    tags,
    series,
    onFilterChange,
}: MobileFilterSidebarProps) {
    // 모바일 필터 열릴 때 스크롤 방지
    useEffect(() => {
        if (isOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "unset";
        }
        return () => {
            document.body.style.overflow = "unset";
        };
    }, [isOpen]);

    if (!isOpen) return null;

    const handleFilterChange = (type: FilterType, value?: string) => {
        onFilterChange(type, value);
        onClose();
    };

    return (
        <>
            {/* 배경 오버레이 */}
            <div
                className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm lg:hidden"
                onPointerDown={(e) => {
                    e.preventDefault();
                    onClose();
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
                            onClick={onClose}
                            className="p-2 text-gray-700 hover:text-gray-900 transition-colors hover:bg-white/50 rounded-lg"
                        >
                            <X size={24} />
                        </button>
                    </div>

                    <div className="space-y-4">
                        {/* 카테고리 */}
                        <FilterSection
                            title="Categories"
                            icon={<Folder size={18} />}
                            defaultOpen={true}
                        >
                            <nav className="space-y-1">
                                <FilterButton
                                    isActive={filterType === "all"}
                                    onClick={() => handleFilterChange("all")}
                                >
                                    All Posts ({initialPosts.length})
                                </FilterButton>

                                {categories.map((category) => {
                                    const count = initialPosts.filter(
                                        (p) => p.category === category,
                                    ).length;
                                    return (
                                        <FilterButton
                                            key={category}
                                            isActive={
                                                filterType === "category" &&
                                                filterValue === category
                                            }
                                            onClick={() =>
                                                handleFilterChange(
                                                    "category",
                                                    category,
                                                )
                                            }
                                        >
                                            {category} ({count})
                                        </FilterButton>
                                    );
                                })}
                            </nav>
                        </FilterSection>

                        {/* 태그 */}
                        {tags.length > 0 && (
                            <FilterSection
                                title="Tags"
                                icon={<Tag size={18} />}
                                defaultOpen={false}
                            >
                                <div className="flex flex-wrap gap-2">
                                    {tags.map(({ tag }) => (
                                        <TagButton
                                            key={tag}
                                            isActive={
                                                filterType === "tag" &&
                                                filterValue === tag
                                            }
                                            onClick={() =>
                                                handleFilterChange("tag", tag)
                                            }
                                            tag={tag}
                                        />
                                    ))}
                                </div>
                            </FilterSection>
                        )}

                        {/* 시리즈 */}
                        {series.length > 0 && (
                            <FilterSection
                                title="Series"
                                icon={<BookOpen size={18} />}
                                defaultOpen={false}
                            >
                                <nav className="space-y-1">
                                    {series.map(
                                        ({ series: seriesName, count }) => (
                                            <SeriesButton
                                                key={seriesName}
                                                isActive={
                                                    filterType === "series" &&
                                                    filterValue === seriesName
                                                }
                                                onClick={() =>
                                                    handleFilterChange(
                                                        "series",
                                                        seriesName,
                                                    )
                                                }
                                                series={seriesName}
                                                count={count}
                                            />
                                        ),
                                    )}
                                </nav>
                            </FilterSection>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
}
