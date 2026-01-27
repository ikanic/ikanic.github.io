"use client";

import { useEffect } from "react";

export default function MermaidDiagram() {
    useEffect(() => {
        let mermaid: any;

        const initMermaid = async () => {
            try {
                // 동적으로 mermaid 불러오기
                const mermaidModule = await import("mermaid");
                mermaid = mermaidModule.default;

                // Mermaid 초기화
                mermaid.initialize({
                    startOnLoad: false,
                    theme: "default",
                    securityLevel: "loose",
                    fontFamily: "Pretendard, sans-serif",
                    themeVariables: {
                        primaryColor: "#dbeafe",
                        primaryTextColor: "#1e40af",
                        primaryBorderColor: "#3b82f6",
                        lineColor: "#6b7280",
                        secondaryColor: "#e9d5ff",
                        tertiaryColor: "#fce7f3",
                        background: "#ffffff",
                        mainBkg: "#dbeafe",
                        secondBkg: "#e9d5ff",
                        tertiaryBkg: "#fce7f3",
                    },
                });

                // Mermaid 블록 찾기 (mermaidc 언어)
                const processBlocks = () => {
                    const mermaidBlocks = document.querySelectorAll(
                        'figure[data-rehype-pretty-code-figure] pre[data-language="mermaidc"] code',
                    );

                    console.log("Found mermaid blocks:", mermaidBlocks.length);

                    mermaidBlocks.forEach((block, index) => {
                        if (block.hasAttribute("data-mermaid-processed"))
                            return;
                        block.setAttribute("data-mermaid-processed", "true");

                        const code = block.textContent || "";
                        const pre = block.closest("pre");
                        const figure = pre?.closest("figure");
                        if (!figure) return;

                        // 컨테이너 생성
                        const wrapper = document.createElement("div");
                        wrapper.className = "mermaid-wrapper";
                        wrapper.style.cssText =
                            "margin: 1.5rem 0; padding: 2rem; background: white; border-radius: 1rem; border: 1px solid rgba(59, 130, 246, 0.2); overflow-x: auto;";

                        const mermaidDiv = document.createElement("div");
                        mermaidDiv.className = "mermaid";
                        mermaidDiv.textContent = code;
                        mermaidDiv.style.cssText =
                            "display: flex; justify-content: center;";

                        wrapper.appendChild(mermaidDiv);

                        // figure 교체
                        if (figure.parentNode) {
                            figure.parentNode.replaceChild(wrapper, figure);
                        }
                    });

                    // Mermaid 렌더링
                    if (mermaidBlocks.length > 0) {
                        mermaid.run({
                            querySelector: ".mermaid:not([data-processed])",
                        });
                    }
                };

                // 약간의 지연 후 처리
                setTimeout(processBlocks, 100);
            } catch (error) {
                console.error("Failed to load Mermaid:", error);
            }
        };

        initMermaid();
    }, []);

    return null;
}
