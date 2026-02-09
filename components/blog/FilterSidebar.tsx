import { Folder, Tag, BookOpen } from "lucide-react";
import { PostData } from "@/lib/posts";
import { FilterType } from "@/hooks/useBlogFilter";
import {
    FilterSection,
    FilterButton,
    TagButton,
    SeriesButton,
} from "./FilterSection";

interface FilterSidebarProps {
    filterType: FilterType;
    filterValue: string;
    initialPosts: PostData[];
    categories: string[];
    tags: { tag: string; count: number }[];
    series: { series: string; count: number }[];
    onFilterChange: (type: FilterType, value?: string) => void;
}

export default function FilterSidebar({
    filterType,
    filterValue,
    initialPosts,
    categories,
    tags,
    series,
    onFilterChange,
}: FilterSidebarProps) {
    return (
        <aside className="hidden lg:block w-64 shrink-0">
            <div className="sticky top-24 space-y-4">
                {/* 카테고리 */}
                <FilterSection
                    title="Categories"
                    icon={<Folder size={20} />}
                    defaultOpen={true}
                >
                    <nav className="space-y-1">
                        <FilterButton
                            isActive={filterType === "all"}
                            onClick={() => onFilterChange("all")}
                        >
                            All Posts
                            <span className="ml-2 text-xs text-gray-600">
                                ({initialPosts.length})
                            </span>
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
                                        onFilterChange("category", category)
                                    }
                                >
                                    {category}
                                    <span className="ml-2 text-xs text-gray-600">
                                        ({count})
                                    </span>
                                </FilterButton>
                            );
                        })}
                    </nav>
                </FilterSection>

                {/* 태그 */}
                {tags.length > 0 && (
                    <FilterSection
                        title="Tags"
                        icon={<Tag size={20} />}
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
                                    onClick={() => onFilterChange("tag", tag)}
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
                        icon={<BookOpen size={20} />}
                        defaultOpen={false}
                    >
                        <nav className="space-y-1">
                            {series.map(({ series: seriesName, count }) => (
                                <SeriesButton
                                    key={seriesName}
                                    isActive={
                                        filterType === "series" &&
                                        filterValue === seriesName
                                    }
                                    onClick={() =>
                                        onFilterChange("series", seriesName)
                                    }
                                    series={seriesName}
                                    count={count}
                                />
                            ))}
                        </nav>
                    </FilterSection>
                )}
            </div>
        </aside>
    );
}
