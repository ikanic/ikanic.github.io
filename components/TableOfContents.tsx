"use client";

import { useEffect, useState } from "react";
import { List, ChevronDown, ChevronUp } from "lucide-react";

interface TOCItem {
    id: string;
    text: string;
    level: number;
}

interface TableOfContentsProps {
    items: TOCItem[];
}

export default function TableOfContents({ items }: TableOfContentsProps) {
    const [activeId, setActiveId] = useState<string>("");
    const [isExpanded, setIsExpanded] = useState(true);

    useEffect(() => {
        // 헤딩에 ID 추가
        items.forEach(({ id, text, level }) => {
            const heading = Array.from(
                document.querySelectorAll(`h${level}`),
            ).find((h) => h.textContent === text);

            if (heading && !heading.id) {
                heading.id = id;
            }
        });

        // Intersection Observer로 현재 보고 있는 섹션 감지
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        setActiveId(entry.target.id);
                    }
                });
            },
            {
                rootMargin: "-80px 0px -80% 0px",
            },
        );

        items.forEach(({ id }) => {
            const element = document.getElementById(id);
            if (element) observer.observe(element);
        });

        return () => observer.disconnect();
    }, [items]);

    if (items.length === 0) return null;

    const handleClick = (id: string) => {
        const element = document.getElementById(id);
        if (element) {
            const offset = 100; // 네비게이션 높이만큼 오프셋
            const elementPosition = element.getBoundingClientRect().top;
            const offsetPosition =
                elementPosition + window.pageYOffset - offset;

            window.scrollTo({
                top: offsetPosition,
                behavior: "smooth",
            });
        }
    };

    return (
        <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] overflow-hidden">
            {/* 헤더 (클릭 가능) */}
            <button
                onClick={() => setIsExpanded(!isExpanded)}
                className="w-full text-left p-6 flex items-center justify-between hover:bg-white/50 transition-colors"
            >
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <List size={20} />
                    목차
                </h3>
                {isExpanded ? (
                    <ChevronUp size={20} className="text-gray-600" />
                ) : (
                    <ChevronDown size={20} className="text-gray-600" />
                )}
            </button>

            {/* 목차 내용 */}
            {isExpanded && (
                <nav className="px-6 pb-6 space-y-1">
                    {items.map(({ id, text, level }) => (
                        <button
                            key={id}
                            onClick={() => handleClick(id)}
                            className={`w-full text-left py-1.5 px-3 rounded-lg transition-all text-sm ${
                                level === 2 ? "pl-6" : ""
                            } ${
                                activeId === id
                                    ? "backdrop-blur-xl bg-blue-500/20 text-blue-700 border-l-2 border-blue-600 font-medium"
                                    : "text-gray-700 hover:bg-white/50 hover:text-gray-900 border-l-2 border-transparent"
                            }`}
                        >
                            {text}
                        </button>
                    ))}
                </nav>
            )}
        </div>
    );
}
