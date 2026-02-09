"use client";

import { useEffect } from "react";
import { processLineNumbersAndDiff } from "@/lib/codeblock/lineProcessing";
import { processWordHighlights } from "@/lib/codeblock/wordHighlight";
import {
    processSingleLineHighlight,
    collectLineContentInfo,
    processMultiLineHighlight,
} from "@/lib/codeblock/highlightProcessing";
import { wrapCodeBlock } from "@/lib/codeblock/uiWrapper";

export default function CodeBlockEnhancer() {
    useEffect(() => {
        const timer = setTimeout(() => {
            const figures = document.querySelectorAll(
                "figure[data-rehype-pretty-code-figure]",
            );

            figures.forEach((figure) => {
                if (figure.hasAttribute("data-enhanced")) return;
                figure.setAttribute("data-enhanced", "true");

                const pre = figure.querySelector("pre");
                const code = pre?.querySelector("code");
                if (!pre || !code) return;

                // 언어 감지
                const language =
                    pre.getAttribute("data-language") ||
                    code.getAttribute("data-language") ||
                    "text";

                // Mermaid 블록은 건너뛰기
                if (language === "mermaid" || language === "mermaidc") {
                    return;
                }

                // 하이라이트 메타 정보 읽기
                const highlightMeta =
                    pre.getAttribute("data-highlight-meta") || "";

                // 타이틀 읽기
                let title = pre.getAttribute("data-title") || "";
                if (!title) {
                    const figcaption = figure.querySelector("figcaption");
                    if (figcaption) {
                        title = figcaption.textContent || "";
                        figcaption.remove();
                    }
                }

                const lines = code.querySelectorAll("[data-line]");

                if (lines.length > 0) {
                    // 1. 줄 번호와 diff 기호 처리
                    processLineNumbersAndDiff(lines);

                    // 2. 단어 하이라이트 처리
                    processWordHighlights(lines);

                    // 3. 줄 하이라이트 처리
                    if (highlightMeta) {
                        const highlightGroups =
                            parseHighlightMeta(highlightMeta);
                        processHighlightGroups(highlightGroups, lines);
                    }
                }

                // 4. UI 래퍼 생성
                wrapCodeBlock(figure, language, title, code);
            });
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return null;
}

// 하이라이트 메타 파싱
function parseHighlightMeta(meta: string): number[][] {
    const highlightGroups: number[][] = [];
    const parts = meta.split(",").map((s) => s.trim());

    parts.forEach((part) => {
        if (part.includes("-")) {
            const [start, end] = part.split("-").map((n) => parseInt(n.trim()));
            const range = [];
            for (let i = start; i <= end; i++) {
                range.push(i);
            }
            highlightGroups.push(range);
        } else {
            highlightGroups.push([parseInt(part)]);
        }
    });

    return highlightGroups;
}

// 하이라이트 그룹 처리
function processHighlightGroups(
    highlightGroups: number[][],
    lines: NodeListOf<Element>,
): void {
    highlightGroups.forEach((group) => {
        const linesToHighlight: HTMLElement[] = [];
        let currentLineNum = 1;

        lines.forEach((line) => {
            const lineElement = line as HTMLElement;

            if (group.includes(currentLineNum)) {
                linesToHighlight.push(lineElement);
            }

            const nextLine = lineElement.nextElementSibling;
            const nextText = nextLine?.textContent || "";
            if (!/^\+( |$)/.test(nextText)) {
                currentLineNum++;
            }
        });

        if (linesToHighlight.length === 1) {
            // 단일 줄 하이라이트
            processSingleLineHighlight(linesToHighlight[0]);
        } else if (linesToHighlight.length > 1) {
            // 여러 줄 하이라이트
            const lineContentInfo = collectLineContentInfo(linesToHighlight);

            // 빈 줄이 아닌 줄들 중에서 최소 인덴트와 최대 길이 찾기
            const nonEmptyLines = lineContentInfo.filter(
                (info) => !info.isEmpty,
            );

            let minIndent = Infinity;
            let maxContentLength = 0;

            nonEmptyLines.forEach((info) => {
                if (info.leadingSpaces < minIndent) {
                    minIndent = info.leadingSpaces;
                }
                const adjustedLength = info.contentLength;
                if (adjustedLength > maxContentLength) {
                    maxContentLength = adjustedLength;
                }
            });

            // 빈 줄만 있는 경우 기본값 설정
            if (minIndent === Infinity) minIndent = 0;
            if (maxContentLength === 0) maxContentLength = 1;

            processMultiLineHighlight(
                lineContentInfo,
                minIndent,
                maxContentLength,
            );
        }
    });
}
