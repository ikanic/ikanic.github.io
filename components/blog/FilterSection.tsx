import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { FilterType } from "@/hooks/useBlogFilter";

interface FilterSectionProps {
    title: string;
    icon: React.ReactNode;
    defaultOpen?: boolean;
    children: React.ReactNode;
}

export function FilterSection({
    title,
    icon,
    defaultOpen = true,
    children,
}: FilterSectionProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen);

    return (
        <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] overflow-hidden">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full px-6 py-4 flex items-center justify-between hover:bg-white/50 transition-colors"
            >
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    {icon}
                    {title}
                </h3>
                {isOpen ? (
                    <ChevronUp size={18} className="text-gray-600" />
                ) : (
                    <ChevronDown size={18} className="text-gray-600" />
                )}
            </button>

            {isOpen && <div className="px-4 pb-4">{children}</div>}
        </div>
    );
}

interface FilterButtonProps {
    isActive: boolean;
    onClick: () => void;
    children: React.ReactNode;
}

export function FilterButton({
    isActive,
    onClick,
    children,
}: FilterButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-4 py-2 rounded-lg transition-all text-sm ${
                isActive
                    ? "backdrop-blur-xl bg-blue-500/20 text-blue-700 border border-blue-400/40 font-medium shadow-sm"
                    : "text-gray-700 hover:bg-white/50 hover:text-gray-900"
            }`}
        >
            {children}
        </button>
    );
}

interface TagButtonProps {
    isActive: boolean;
    onClick: () => void;
    tag: string;
}

export function TagButton({ isActive, onClick, tag }: TagButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`px-3 py-1 backdrop-blur-xl border rounded-full text-sm transition-all ${
                isActive
                    ? "bg-purple-500/20 border-purple-400/40 text-purple-700 font-medium"
                    : "bg-white/50 border-white/60 text-gray-700 hover:bg-white/70"
            }`}
        >
            #{tag}
        </button>
    );
}

interface SeriesButtonProps {
    isActive: boolean;
    onClick: () => void;
    series: string;
    count: number;
}

export function SeriesButton({
    isActive,
    onClick,
    series,
    count,
}: SeriesButtonProps) {
    return (
        <button
            onClick={onClick}
            className={`w-full text-left px-4 py-2 rounded-lg transition-all text-sm ${
                isActive
                    ? "backdrop-blur-xl bg-pink-500/20 text-pink-700 border border-pink-400/40 font-medium shadow-sm"
                    : "text-gray-700 hover:bg-white/50 hover:text-gray-900"
            }`}
        >
            📚 {series}
            <span className="ml-2 text-xs text-gray-600">({count})</span>
        </button>
    );
}
