"use client";

import { useEffect } from "react";

export default function CodeBlockEnhancer() {
    useEffect(() => {
        // 약간의 지연을 두고 한 번만 실행
        const timer = setTimeout(() => {
            // 모든 figure 요소 찾기 (rehype-pretty-code가 생성)
            const figures = document.querySelectorAll(
                "figure[data-rehype-pretty-code-figure]",
            );

            figures.forEach((figure) => {
                // 이미 처리된 블록은 스킵
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

                // 하이라이트 메타 정보 읽기
                const highlightMeta =
                    pre.getAttribute("data-highlight-meta") || "";

                console.log(
                    "Language:",
                    language,
                    "Highlight meta:",
                    highlightMeta,
                );

                // Mermaid는 별도로 처리 (MermaidDiagram 컴포넌트가 처리)
                if (language === "mermaidc") {
                    return;
                }

                // 타이틀 감지 (figure의 data-title 또는 figcaption)
                let title = "";
                const figcaption = figure.querySelector("figcaption");
                if (figcaption) {
                    title = figcaption.textContent || "";
                    figcaption.remove();
                }

                // 줄 번호 추가 (이미 있는지 확인)
                const lines = code.querySelectorAll("[data-line]");
                let actualLineNumber = 1;

                // 하이라이트 정보 파싱
                const highlightGroups: number[][] = [];
                if (highlightMeta) {
                    const parts = highlightMeta.split(",").map((s) => s.trim());
                    parts.forEach((part) => {
                        if (part.includes("-")) {
                            // 범위 (예: 3-5)
                            const [start, end] = part
                                .split("-")
                                .map((n) => parseInt(n.trim()));
                            const range = [];
                            for (let i = start; i <= end; i++) {
                                range.push(i);
                            }
                            highlightGroups.push(range);
                        } else {
                            // 단일 줄 (예: 1)
                            highlightGroups.push([parseInt(part)]);
                        }
                    });
                }

                console.log("Highlight groups:", highlightGroups);

                if (lines.length > 0) {
                    lines.forEach((line) => {
                        const lineElement = line as HTMLElement;

                        // 이미 처리되었는지 확인
                        if (lineElement.hasAttribute("data-processed")) return;
                        lineElement.setAttribute("data-processed", "true");

                        // rehype-pretty-code가 추가한 data-highlighted-line을 클래스로 변환
                        if (lineElement.hasAttribute("data-highlighted-line")) {
                            lineElement.classList.add("line-highlight");
                        }

                        // 단어 하이라이트 처리 (`word` 형식, \` 이스케이프 지원)
                        const walker = document.createTreeWalker(
                            lineElement,
                            NodeFilter.SHOW_TEXT,
                            null,
                        );

                        const textNodes: Text[] = [];
                        let node;
                        while ((node = walker.nextNode())) {
                            textNodes.push(node as Text);
                        }

                        textNodes.forEach((textNode) => {
                            const text = textNode.textContent || "";
                            // `word` 패턴 찾기, \` 이스케이프 제외
                            const regex = /(?<!\\)`([^`]+)`/g;

                            if (regex.test(text)) {
                                regex.lastIndex = 0;
                                const fragment =
                                    document.createDocumentFragment();
                                let lastIndex = 0;
                                let match;

                                // 먼저 \` 이스케이프 처리
                                let processedText = text;
                                const escapedBackticks: {
                                    index: number;
                                    char: string;
                                }[] = [];

                                // \` 위치 저장
                                for (
                                    let i = 0;
                                    i < processedText.length - 1;
                                    i++
                                ) {
                                    if (
                                        processedText[i] === "\\" &&
                                        processedText[i + 1] === "`"
                                    ) {
                                        escapedBackticks.push({
                                            index: lastIndex + i,
                                            char: "`",
                                        });
                                    }
                                }

                                while ((match = regex.exec(text)) !== null) {
                                    // 하이라이트 전 텍스트
                                    if (match.index > lastIndex) {
                                        let beforeText = text.substring(
                                            lastIndex,
                                            match.index,
                                        );
                                        beforeText = beforeText.replace(
                                            /\\`/g,
                                            "`",
                                        );
                                        fragment.appendChild(
                                            document.createTextNode(beforeText),
                                        );
                                    }

                                    // 하이라이트된 단어
                                    const highlight =
                                        document.createElement("mark");
                                    highlight.className = "code-word-highlight";
                                    highlight.textContent = match[1];
                                    fragment.appendChild(highlight);

                                    lastIndex = match.index + match[0].length;
                                }

                                // 나머지 텍스트
                                if (lastIndex < text.length) {
                                    let afterText = text.substring(lastIndex);
                                    afterText = afterText.replace(/\\`/g, "`");
                                    fragment.appendChild(
                                        document.createTextNode(afterText),
                                    );
                                }

                                textNode.parentNode?.replaceChild(
                                    fragment,
                                    textNode,
                                );
                            } else {
                                // \` 이스케이프만 처리
                                if (text.includes("\\`")) {
                                    const newText = text.replace(/\\`/g, "`");
                                    textNode.textContent = newText;
                                }
                            }
                        });

                        // 이미 줄 번호가 있는지 확인
                        let existingLineNumber =
                            lineElement.querySelector(".line-number");

                        // diff 스타일 감지 (+ 또는 - 로 시작하고 그 뒤에 공백이 있거나 아무것도 없음)
                        const textContent = lineElement.textContent || "";
                        let lineClass = "";
                        let diffSymbol = "";

                        // + 또는 - 뒤에 공백이 있거나 바로 끝나는 경우만 diff로 인식
                        if (/^\+( |$)/.test(textContent)) {
                            lineClass = "line-added";
                            diffSymbol = "+";
                            lineElement.classList.add(lineClass);

                            // 첫 번째 텍스트 노드 찾아서 + 제거
                            const walker = document.createTreeWalker(
                                lineElement,
                                NodeFilter.SHOW_TEXT,
                                null,
                            );
                            const firstTextNode = walker.nextNode();
                            if (
                                firstTextNode &&
                                firstTextNode.textContent?.startsWith("+")
                            ) {
                                firstTextNode.textContent =
                                    firstTextNode.textContent.substring(1);
                            }
                        } else if (/^-( |$)/.test(textContent)) {
                            lineClass = "line-removed";
                            diffSymbol = "-";
                            lineElement.classList.add(lineClass);

                            // 첫 번째 텍스트 노드 찾아서 - 제거
                            const walker = document.createTreeWalker(
                                lineElement,
                                NodeFilter.SHOW_TEXT,
                                null,
                            );
                            const firstTextNode = walker.nextNode();
                            if (
                                firstTextNode &&
                                firstTextNode.textContent?.startsWith("-")
                            ) {
                                firstTextNode.textContent =
                                    firstTextNode.textContent.substring(1);
                            }
                        }

                        // 줄 번호 업데이트 또는 생성
                        if (existingLineNumber) {
                            existingLineNumber.textContent =
                                String(actualLineNumber);
                            // 인라인 스타일 강제 적용
                            (existingLineNumber as HTMLElement).style.cssText =
                                "display: inline-block !important; position: absolute !important; left: 0.5rem !important; top: 0 !important; width: 2rem !important; text-align: right !important; color: rgb(75, 85, 99) !important; font-size: 0.875rem !important; line-height: 1.7 !important; margin: 0 !important; padding: 0 !important;";
                        } else {
                            const lineNumber = document.createElement("span");
                            lineNumber.className = "line-number";
                            lineNumber.textContent = String(actualLineNumber);
                            // 인라인 스타일 강제 적용
                            lineNumber.style.cssText =
                                "display: inline-block !important; position: absolute !important; left: 0.5rem !important; top: 0 !important; width: 2rem !important; text-align: right !important; color: rgb(75, 85, 99) !important; font-size: 0.875rem !important; line-height: 1.7 !important; margin: 0 !important; padding: 0 !important;";
                            lineElement.insertBefore(
                                lineNumber,
                                lineElement.firstChild,
                            );
                        }

                        // diff 기호 추가
                        if (diffSymbol) {
                            const diffSpan = document.createElement("span");
                            diffSpan.className = "diff-symbol";
                            diffSpan.textContent = diffSymbol;

                            const lineNum =
                                lineElement.querySelector(".line-number");
                            if (lineNum && lineNum.nextSibling) {
                                lineElement.insertBefore(
                                    diffSpan,
                                    lineNum.nextSibling,
                                );
                            }
                        }

                        // 다음 줄이 +가 아니면 줄 번호 증가
                        const nextLine = lineElement.nextElementSibling;
                        const nextText = nextLine?.textContent || "";
                        if (!/^\+( |$)/.test(nextText)) {
                            actualLineNumber++;
                        }
                    });

                    // 줄 하이라이트 처리
                    console.log(
                        "Processing highlight groups:",
                        highlightGroups.length,
                    );

                    highlightGroups.forEach((group) => {
                        console.log("Processing group:", group);

                        const linesToHighlight: HTMLElement[] = [];
                        let currentLineNum = 1;

                        lines.forEach((line) => {
                            const lineElement = line as HTMLElement;

                            if (group.includes(currentLineNum)) {
                                linesToHighlight.push(lineElement);
                            }

                            // 다음 줄 번호 계산
                            const nextLine = lineElement.nextElementSibling;
                            const nextText = nextLine?.textContent || "";
                            if (!/^\+( |$)/.test(nextText)) {
                                currentLineNum++;
                            }
                        });

                        console.log(
                            `Group ${group}: Found ${linesToHighlight.length} lines`,
                        );

                        // 그룹이 1개 줄이면 개별적으로 처리
                        if (linesToHighlight.length === 1) {
                            const lineElement = linesToHighlight[0];

                            if (lineElement.querySelector(".highlight-block"))
                                return;

                            const lineNumber =
                                lineElement.querySelector(".line-number");
                            const diffSymbol =
                                lineElement.querySelector(".diff-symbol");

                            const contentNodes: ChildNode[] = [];
                            Array.from(lineElement.childNodes).forEach(
                                (node) => {
                                    if (
                                        node === lineNumber ||
                                        node === diffSymbol
                                    )
                                        return;
                                    contentNodes.push(node);
                                },
                            );

                            if (contentNodes.length === 0) return;

                            const highlightBlock =
                                document.createElement("span");
                            highlightBlock.className = "highlight-block";
                            contentNodes.forEach((node) =>
                                highlightBlock.appendChild(node),
                            );
                            lineElement.appendChild(highlightBlock);
                        } else {
                            // 그룹이 여러 줄이면 하나의 큰 블록으로 처리
                            linesToHighlight.forEach((lineElement, idx) => {
                                if (
                                    lineElement.querySelector(
                                        ".highlight-block",
                                    )
                                )
                                    return;

                                const lineNumber =
                                    lineElement.querySelector(".line-number");
                                const diffSymbol =
                                    lineElement.querySelector(".diff-symbol");

                                const contentNodes: ChildNode[] = [];
                                Array.from(lineElement.childNodes).forEach(
                                    (node) => {
                                        if (
                                            node === lineNumber ||
                                            node === diffSymbol
                                        )
                                            return;
                                        contentNodes.push(node);
                                    },
                                );

                                if (contentNodes.length === 0) return;

                                const highlightBlock =
                                    document.createElement("span");
                                highlightBlock.className =
                                    "highlight-block highlight-block-group";

                                if (idx === 0)
                                    highlightBlock.classList.add(
                                        "highlight-block-first",
                                    );
                                if (idx === linesToHighlight.length - 1)
                                    highlightBlock.classList.add(
                                        "highlight-block-last",
                                    );

                                contentNodes.forEach((node) =>
                                    highlightBlock.appendChild(node),
                                );
                                lineElement.appendChild(highlightBlock);
                            });
                        }
                    });
                }

                // 헤더 생성
                const header = document.createElement("div");
                header.className = "code-block-header";

                // 맥북 버튼들
                const buttons = document.createElement("div");
                buttons.className = "mac-buttons";
                buttons.innerHTML = `
          <span class="mac-button mac-close"></span>
          <span class="mac-button mac-minimize"></span>
          <span class="mac-button mac-maximize"></span>
        `;

                header.appendChild(buttons);

                // 타이틀 (있을 경우)
                if (title) {
                    const titleDiv = document.createElement("div");
                    titleDiv.className = "code-title";
                    titleDiv.textContent = title;
                    header.appendChild(titleDiv);
                }

                // 푸터 생성 (언어 + 복사 버튼)
                const footer = document.createElement("div");
                footer.className = "code-block-footer";

                const langSpan = document.createElement("span");
                langSpan.className = "code-language";
                langSpan.textContent = language.toUpperCase();

                const copyBtn = document.createElement("button");
                copyBtn.className = "code-copy-button";
                copyBtn.innerHTML = `
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          <span>Copy</span>
        `;

                copyBtn.addEventListener("click", async () => {
                    // 줄 번호와 diff 기호 제외하고 텍스트만 복사
                    const lines = code.querySelectorAll(
                        "[data-line], .code-line",
                    );
                    let codeText = "";

                    if (lines.length > 0) {
                        codeText = Array.from(lines)
                            .map((line) => {
                                const clone = line.cloneNode(
                                    true,
                                ) as HTMLElement;
                                const lineNum =
                                    clone.querySelector(".line-number");
                                const diffSym =
                                    clone.querySelector(".diff-symbol");
                                if (lineNum) lineNum.remove();
                                if (diffSym) diffSym.remove();
                                return clone.textContent || "";
                            })
                            .join("\n");
                    } else {
                        codeText = code.textContent || "";
                    }

                    try {
                        await navigator.clipboard.writeText(codeText);

                        copyBtn.innerHTML = `
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"></polyline>
              </svg>
              <span>Copied!</span>
            `;

                        setTimeout(() => {
                            copyBtn.innerHTML = `
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                </svg>
                <span>Copy</span>
              `;
                        }, 2000);
                    } catch (err) {
                        console.error("Failed to copy:", err);
                    }
                });

                footer.appendChild(langSpan);
                footer.appendChild(copyBtn);

                // 래퍼 생성
                const wrapper = document.createElement("div");
                wrapper.className = "code-block-wrapper";

                // figure를 wrapper로 감싸기
                figure.parentNode?.insertBefore(wrapper, figure);
                wrapper.appendChild(header);
                wrapper.appendChild(figure);
                wrapper.appendChild(footer);

                // figure 스타일 정리
                if (figure instanceof HTMLElement) {
                    figure.style.margin = "0";
                    figure.style.padding = "0";
                }
            });
        }, 100);

        return () => clearTimeout(timer);
    }, []);

    return null;
}
