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
                    // 1단계: 줄 번호와 diff 기호만 먼저 처리
                    lines.forEach((line) => {
                        const lineElement = line as HTMLElement;

                        // 이미 처리되었는지 확인
                        if (lineElement.hasAttribute("data-num-processed"))
                            return;
                        lineElement.setAttribute("data-num-processed", "true");

                        // 이미 줄 번호가 있는지 확인
                        let existingLineNumber =
                            lineElement.querySelector(".line-number");

                        // diff 스타일 감지
                        const textContent = lineElement.textContent || "";
                        let lineClass = "";
                        let diffSymbol = "";

                        if (/^\+( |$)/.test(textContent)) {
                            lineClass = "line-added";
                            diffSymbol = "+";
                            lineElement.classList.add(lineClass);

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
                            (existingLineNumber as HTMLElement).style.cssText =
                                "display: inline-block !important; position: absolute !important; left: 0.5rem !important; top: 0 !important; width: 2rem !important; text-align: right !important; color: rgb(75, 85, 99) !important; font-size: 0.875rem !important; line-height: 1.7 !important; margin: 0 !important; padding: 0 !important;";
                        } else {
                            const lineNumber = document.createElement("span");
                            lineNumber.className = "line-number";
                            lineNumber.textContent = String(actualLineNumber);
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

                    // 2단계: 단어 하이라이트 처리 (줄 하이라이트 전에!)
                    lines.forEach((line) => {
                        const lineElement = line as HTMLElement;

                        if (lineElement.hasAttribute("data-word-processed"))
                            return;
                        lineElement.setAttribute("data-word-processed", "true");

                        // 모든 span 요소를 순회하면서 백틱 패턴 처리
                        const allSpans = lineElement.querySelectorAll("span");

                        allSpans.forEach((span) => {
                            // 줄번호나 diff기호는 스킵
                            if (
                                span.classList.contains("line-number") ||
                                span.classList.contains("diff-symbol")
                            ) {
                                return;
                            }

                            // 이 span의 텍스트 노드들만 처리
                            const childNodes = Array.from(span.childNodes);
                            childNodes.forEach((node) => {
                                if (node.nodeType !== Node.TEXT_NODE) return;

                                const textNode = node as Text;
                                const text = textNode.textContent || "";
                                const regex = /`([^`]+)`/g;

                                if (regex.test(text)) {
                                    regex.lastIndex = 0;
                                    const fragment =
                                        document.createDocumentFragment();
                                    let lastIndex = 0;
                                    let match;

                                    while (
                                        (match = regex.exec(text)) !== null
                                    ) {
                                        if (match.index > lastIndex) {
                                            fragment.appendChild(
                                                document.createTextNode(
                                                    text.substring(
                                                        lastIndex,
                                                        match.index,
                                                    ),
                                                ),
                                            );
                                        }

                                        const highlight =
                                            document.createElement("mark");
                                        highlight.className =
                                            "code-word-highlight";
                                        highlight.textContent = match[1];
                                        fragment.appendChild(highlight);

                                        lastIndex =
                                            match.index + match[0].length;
                                    }

                                    if (lastIndex < text.length) {
                                        fragment.appendChild(
                                            document.createTextNode(
                                                text.substring(lastIndex),
                                            ),
                                        );
                                    }

                                    span.replaceChild(fragment, textNode);
                                }
                            });
                        });
                    });

                    // 3단계: 줄 하이라이트 처리 (앞 공백 분리)
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

                            const nextLine = lineElement.nextElementSibling;
                            const nextText = nextLine?.textContent || "";
                            if (!/^\+( |$)/.test(nextText)) {
                                currentLineNum++;
                            }
                        });

                        console.log(
                            `Group ${group}: Found ${linesToHighlight.length} lines`,
                        );

                        if (linesToHighlight.length === 1) {
                            // 단일 줄
                            const lineElement = linesToHighlight[0];

                            if (lineElement.querySelector(".highlight-block"))
                                return;

                            const lineNumber =
                                lineElement.querySelector(".line-number");
                            const diffSymbol =
                                lineElement.querySelector(".diff-symbol");

                            // 줄번호/diff기호 제외한 모든 노드 수집
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

                            // 앞 공백 노드와 실제 콘텐츠 분리
                            const whitespaceNodes: ChildNode[] = [];
                            const realContentNodes: ChildNode[] = [];
                            let foundNonWhitespace = false;

                            contentNodes.forEach((node) => {
                                if (
                                    !foundNonWhitespace &&
                                    node.nodeType === Node.TEXT_NODE
                                ) {
                                    const text = node.textContent || "";
                                    if (/^\s+$/.test(text)) {
                                        // 순수 공백만
                                        whitespaceNodes.push(node);
                                        return;
                                    } else if (/^\s/.test(text)) {
                                        // 앞에 공백이 있는 경우 분리
                                        const match = text.match(/^(\s+)(.*)$/);
                                        if (match) {
                                            const wsNode =
                                                document.createTextNode(
                                                    match[1],
                                                );
                                            whitespaceNodes.push(wsNode);
                                            const contentNode =
                                                document.createTextNode(
                                                    match[2],
                                                );
                                            realContentNodes.push(contentNode);
                                            foundNonWhitespace = true;
                                            return;
                                        }
                                    }
                                }
                                foundNonWhitespace = true;
                                realContentNodes.push(node);
                            });

                            // 하이라이트 블록 생성 (실제 콘텐츠만)
                            const highlightBlock =
                                document.createElement("span");
                            highlightBlock.className = "highlight-block";

                            // 기존 노드 제거
                            contentNodes.forEach((node) => {
                                if (node.parentNode === lineElement) {
                                    lineElement.removeChild(node);
                                }
                            });

                            // 앞 공백 먼저 추가
                            whitespaceNodes.forEach((node) =>
                                lineElement.appendChild(node),
                            );

                            // 실제 콘텐츠를 하이라이트 블록에
                            realContentNodes.forEach((node) =>
                                highlightBlock.appendChild(node),
                            );

                            // 하이라이트 블록 추가
                            lineElement.appendChild(highlightBlock);
                        } else {
                            // 여러 줄 - 그룹으로 처리
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

                                // 앞 공백 분리
                                const whitespaceNodes: ChildNode[] = [];
                                const realContentNodes: ChildNode[] = [];
                                let foundNonWhitespace = false;

                                contentNodes.forEach((node) => {
                                    if (
                                        !foundNonWhitespace &&
                                        node.nodeType === Node.TEXT_NODE
                                    ) {
                                        const text = node.textContent || "";
                                        if (/^\s+$/.test(text)) {
                                            whitespaceNodes.push(node);
                                            return;
                                        } else if (/^\s/.test(text)) {
                                            const match =
                                                text.match(/^(\s+)(.*)$/);
                                            if (match) {
                                                const wsNode =
                                                    document.createTextNode(
                                                        match[1],
                                                    );
                                                whitespaceNodes.push(wsNode);
                                                const contentNode =
                                                    document.createTextNode(
                                                        match[2],
                                                    );
                                                realContentNodes.push(
                                                    contentNode,
                                                );
                                                foundNonWhitespace = true;
                                                return;
                                            }
                                        }
                                    }
                                    foundNonWhitespace = true;
                                    realContentNodes.push(node);
                                });

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

                                // 기존 노드 제거
                                contentNodes.forEach((node) => {
                                    if (node.parentNode === lineElement) {
                                        lineElement.removeChild(node);
                                    }
                                });

                                // 앞 공백 먼저
                                whitespaceNodes.forEach((node) =>
                                    lineElement.appendChild(node),
                                );

                                // 콘텐츠를 하이라이트 블록에
                                realContentNodes.forEach((node) =>
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

                const buttons = document.createElement("div");
                buttons.className = "mac-buttons";
                buttons.innerHTML = `
          <span class="mac-button mac-close"></span>
          <span class="mac-button mac-minimize"></span>
          <span class="mac-button mac-maximize"></span>
        `;

                header.appendChild(buttons);

                if (title) {
                    const titleDiv = document.createElement("div");
                    titleDiv.className = "code-title";
                    titleDiv.textContent = title;
                    header.appendChild(titleDiv);
                }

                // 푸터 생성
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

                figure.parentNode?.insertBefore(wrapper, figure);
                wrapper.appendChild(header);
                wrapper.appendChild(figure);
                wrapper.appendChild(footer);

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
