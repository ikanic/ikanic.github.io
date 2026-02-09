import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { PostData } from "@/lib/posts";

export type FilterType = "all" | "category" | "tag" | "series";

export function useBlogFilter(initialPosts: PostData[]) {
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
    const [filterType, setFilterType] = useState<FilterType>(
        initialFilter.type,
    );
    const [filterValue, setFilterValue] = useState<string>(initialFilter.value);

    // URL 파라미터 변경 감지
    useEffect(() => {
        const newFilter = getInitialFilter();
        setFilterType(newFilter.type);
        setFilterValue(newFilter.value);
    }, [tagParam, categoryParam, seriesParam]);

    // 필터링된 포스트 계산
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

    // 필터 변경 핸들러
    const handleFilter = (type: FilterType, value: string = "") => {
        setFilterType(type);
        setFilterValue(value);
    };

    // 필터 제목 생성
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

    return {
        filterType,
        filterValue,
        filteredPosts,
        handleFilter,
        getFilterTitle,
    };
}
