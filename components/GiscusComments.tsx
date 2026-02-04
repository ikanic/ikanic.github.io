"use client";

import { useEffect, useRef } from "react";
import { usePathname } from "next/navigation";
import { MessageCircle } from "lucide-react";

export default function GiscusComments() {
    const pathname = usePathname();
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        // 기존 Giscus iframe 제거
        const existingIframe = document.querySelector("iframe.giscus-frame");
        if (existingIframe) {
            existingIframe.remove();
        }

        // Giscus 스크립트 로드
        const script = document.createElement("script");
        script.src = "https://giscus.app/client.js";
        script.setAttribute("data-repo", "taek0622/taek0622.github.io");
        script.setAttribute(
            "data-repo-id",
            process.env.NEXT_PUBLIC_GISCUS_REPO_ID || "",
        );
        script.setAttribute("data-category", "Reply & Reaction");
        script.setAttribute(
            "data-category-id",
            process.env.NEXT_PUBLIC_GISCUS_CATEGORY_ID || "",
        );
        script.setAttribute("data-mapping", "pathname");
        script.setAttribute("data-strict", "1");
        script.setAttribute("data-reactions-enabled", "1");
        script.setAttribute("data-emit-metadata", "0");
        script.setAttribute("data-input-position", "top");
        // 테스트: 기본 테마로 임시 변경
        script.setAttribute("data-theme", "light");
        script.setAttribute("data-lang", "ko");
        script.setAttribute("data-loading", "lazy");
        script.setAttribute("crossorigin", "anonymous");
        script.async = true;

        containerRef.current?.appendChild(script);

        return () => {
            script.remove();
        };
    }, [pathname]);

    return (
        <div className="mt-16">
            {/* 섹션 헤더 */}
            <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-t-2xl px-8 py-5 shadow-[0_-2px_16px_0_rgba(31,38,135,0.08)] border-b border-white/40">
                <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <MessageCircle size={20} className="text-blue-600" />
                    댓글 및 반응
                </h3>
                <p className="text-sm text-gray-600 mt-0.5">
                    GitHub 계정으로 댓글을 남기거나 반응을 남길 수 있습니다
                </p>
            </div>

            {/* Giscus 컨테이너 */}
            <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-b-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)] overflow-hidden">
                <div ref={containerRef} className="giscus-container" />
            </div>
        </div>
    );
}
