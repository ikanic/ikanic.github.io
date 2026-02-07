"use client";

import { useEffect } from "react";

export default function CodeBlockEnhancer() {
    useEffect(() => {
        const timer = setTimeout(() => {
            const figures = document.querySelectorAll(
                "figure[data-rehype-pretty-code-figure]",
            );

            figures.forEach((figure, figIndex) => {
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

                // 타이틀 읽기 (pre의 data-title 속성 또는 figcaption)
                let title = pre.getAttribute("data-title") || "";
                if (!title) {
                    const figcaption = figure.querySelector("figcaption");
                    if (figcaption) {
                        title = figcaption.textContent || "";
                        figcaption.remove();
                    }
                }

                if (language === "mermaidc") {
                    return;
                }

                // 줄 번호 추가
                const lines = code.querySelectorAll("[data-line]");
                let actualLineNumber = 1;

                const highlightGroups: number[][] = [];
                if (highlightMeta) {
                    const parts = highlightMeta.split(",").map((s) => s.trim());
                    parts.forEach((part) => {
                        if (part.includes("-")) {
                            const [start, end] = part
                                .split("-")
                                .map((n) => parseInt(n.trim()));
                            const range = [];
                            for (let i = start; i <= end; i++) {
                                range.push(i);
                            }
                            highlightGroups.push(range);
                        } else {
                            highlightGroups.push([parseInt(part)]);
                        }
                    });
                }

                if (lines.length > 0) {
                    // 줄 번호와 diff 기호 처리
                    lines.forEach((line) => {
                        const lineElement = line as HTMLElement;

                        if (lineElement.hasAttribute("data-num-processed"))
                            return;
                        lineElement.setAttribute("data-num-processed", "true");

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

                        // 줄 번호 추가
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

                        const nextLine = lineElement.nextElementSibling;
                        const nextText = nextLine?.textContent || "";
                        if (!/^\+( |$)/.test(nextText)) {
                            actualLineNumber++;
                        }
                    });

                    // 단어 하이라이트 처리
                    lines.forEach((line) => {
                        const lineElement = line as HTMLElement;

                        if (lineElement.hasAttribute("data-word-processed"))
                            return;
                        lineElement.setAttribute("data-word-processed", "true");

                        const existingMarks = lineElement.querySelectorAll(
                            ".code-word-highlight",
                        );
                        if (existingMarks.length > 0) {
                            return;
                        }

                        const allSpans = lineElement.querySelectorAll("span");

                        allSpans.forEach((span) => {
                            if (
                                span.classList.contains("line-number") ||
                                span.classList.contains("diff-symbol")
                            ) {
                                return;
                            }

                            const childNodes = Array.from(span.childNodes);
                            childNodes.forEach((node) => {
                                if (node.nodeType !== Node.TEXT_NODE) return;

                                const textNode = node as Text;
                                const text = textNode.textContent || "";

                                const regex = /`([^`]+)`/g;
                                const matches: RegExpExecArray[] = [];
                                let match;

                                while ((match = regex.exec(text)) !== null) {
                                    matches.push(match);
                                }

                                if (matches.length === 0) return;

                                const fragment =
                                    document.createDocumentFragment();
                                let lastIndex = 0;

                                matches.forEach((match) => {
                                    const beforeMatch = text.substring(
                                        0,
                                        match.index,
                                    );
                                    const afterMatch = text.substring(
                                        match.index + match[0].length,
                                    );

                                    const isEscapedStart =
                                        beforeMatch.endsWith("\\");
                                    const isEscapedEnd =
                                        afterMatch.startsWith("\\");

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

                                    if (!isEscapedStart && !isEscapedEnd) {
                                        const highlight =
                                            document.createElement("mark");
                                        highlight.className =
                                            "code-word-highlight";
                                        highlight.textContent = match[1];
                                        fragment.appendChild(highlight);
                                    } else {
                                        fragment.appendChild(
                                            document.createTextNode(match[0]),
                                        );
                                    }

                                    lastIndex = match.index + match[0].length;
                                });

                                if (lastIndex < text.length) {
                                    fragment.appendChild(
                                        document.createTextNode(
                                            text.substring(lastIndex),
                                        ),
                                    );
                                }

                                span.replaceChild(fragment, textNode);
                            });
                        });
                    });

                    // 줄 하이라이트 처리 (빈 줄 포함)
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
                            // 단일 줄
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

                            // 빈 줄 처리 - 콘텐츠가 없거나 공백만 있으면
                            const isEmpty =
                                contentNodes.length === 0 ||
                                contentNodes.every((node) => {
                                    const text = node.textContent || "";
                                    return text.trim() === "";
                                });

                            const whitespaceNodes: ChildNode[] = [];
                            const realContentNodes: ChildNode[] = [];

                            if (isEmpty) {
                                // 빈 줄: non-breaking space 추가
                                realContentNodes.push(
                                    document.createTextNode("\u00A0"),
                                );
                            } else {
                                // 일반 줄: 공백과 콘텐츠 분리
                                let foundNonWhitespace = false;

                                contentNodes.forEach((node) => {
                                    const nodeText = node.textContent || "";

                                    if (!foundNonWhitespace) {
                                        if (/^\s*$/.test(nodeText)) {
                                            whitespaceNodes.push(
                                                node.cloneNode(
                                                    true,
                                                ) as ChildNode,
                                            );
                                            return;
                                        }

                                        if (/^\s/.test(nodeText)) {
                                            if (
                                                node.nodeType === Node.TEXT_NODE
                                            ) {
                                                const match =
                                                    nodeText.match(
                                                        /^(\s+)(.*)$/,
                                                    );
                                                if (match && match[2]) {
                                                    whitespaceNodes.push(
                                                        document.createTextNode(
                                                            match[1],
                                                        ),
                                                    );
                                                    realContentNodes.push(
                                                        document.createTextNode(
                                                            match[2],
                                                        ),
                                                    );
                                                    foundNonWhitespace = true;
                                                    return;
                                                }
                                            } else if (
                                                node.nodeType ===
                                                Node.ELEMENT_NODE
                                            ) {
                                                const element =
                                                    node as HTMLElement;
                                                const firstChild =
                                                    element.firstChild;

                                                if (
                                                    firstChild &&
                                                    firstChild.nodeType ===
                                                        Node.TEXT_NODE
                                                ) {
                                                    const text =
                                                        firstChild.textContent ||
                                                        "";
                                                    const match =
                                                        text.match(
                                                            /^(\s+)(.*)$/,
                                                        );

                                                    if (match && match[2]) {
                                                        const wsSpan =
                                                            element.cloneNode(
                                                                false,
                                                            ) as HTMLElement;
                                                        wsSpan.textContent =
                                                            match[1];
                                                        whitespaceNodes.push(
                                                            wsSpan,
                                                        );

                                                        const contentSpan =
                                                            element.cloneNode(
                                                                true,
                                                            ) as HTMLElement;
                                                        if (
                                                            contentSpan.firstChild
                                                        ) {
                                                            contentSpan.firstChild.textContent =
                                                                match[2];
                                                        }
                                                        realContentNodes.push(
                                                            contentSpan,
                                                        );
                                                        foundNonWhitespace = true;
                                                        return;
                                                    }
                                                }
                                            }
                                        }
                                    }

                                    foundNonWhitespace = true;
                                    realContentNodes.push(
                                        node.cloneNode(true) as ChildNode,
                                    );
                                });
                            }

                            const highlightBlock =
                                document.createElement("span");
                            highlightBlock.className = "highlight-block";

                            contentNodes.forEach((node) => {
                                if (node.parentNode === lineElement) {
                                    lineElement.removeChild(node);
                                }
                            });

                            whitespaceNodes.forEach((node) =>
                                lineElement.appendChild(node),
                            );

                            realContentNodes.forEach((node) =>
                                highlightBlock.appendChild(node),
                            );

                            lineElement.appendChild(highlightBlock);
                        } else {
                            // 여러 줄 하이라이트 (기존 로직 유지)
                            let minIndent = Infinity;

                            linesToHighlight.forEach((lineElement) => {
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

                                const fullText = contentNodes
                                    .map((n) => n.textContent || "")
                                    .join("");
                                const match = fullText.match(/^(\s*)/);
                                const indent = match ? match[1].length : 0;

                                if (fullText.trim() && indent < minIndent) {
                                    minIndent = indent;
                                }
                            });

                            // minIndent가 Infinity이면 (모든 줄이 빈 줄) 0으로 설정
                            if (minIndent === Infinity) {
                                minIndent = 0;
                            }

                            let maxContentLength = 0;

                            linesToHighlight.forEach((lineElement) => {
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

                                const fullText = contentNodes
                                    .map((n) => n.textContent || "")
                                    .join("");
                                const contentAfterIndent =
                                    fullText.substring(minIndent);

                                if (
                                    contentAfterIndent.length > maxContentLength
                                ) {
                                    maxContentLength =
                                        contentAfterIndent.length;
                                }
                            });

                            // 빈 줄만 있는 경우 최소 너비 설정
                            if (maxContentLength === 0) {
                                maxContentLength = 1;
                            }

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

                                // 빈 줄 여부 확인
                                const isEmpty =
                                    contentNodes.length === 0 ||
                                    contentNodes.every((node) => {
                                        const text = node.textContent || "";
                                        return text.trim() === "";
                                    });

                                if (isEmpty) {
                                    // 빈 줄: non-breaking space로 교체
                                    contentNodes.length = 0;
                                    contentNodes.push(
                                        document.createTextNode("\u00A0"),
                                    );
                                }

                                const whitespaceNodes: ChildNode[] = [];
                                const boxContentNodes: ChildNode[] = [];
                                let removedCount = 0;

                                for (const node of contentNodes) {
                                    if (removedCount >= minIndent) {
                                        boxContentNodes.push(
                                            node.cloneNode(true) as ChildNode,
                                        );
                                        continue;
                                    }

                                    const nodeText = node.textContent || "";

                                    if (/^\s*$/.test(nodeText)) {
                                        const len = nodeText.length;
                                        if (removedCount + len <= minIndent) {
                                            whitespaceNodes.push(
                                                node.cloneNode(
                                                    true,
                                                ) as ChildNode,
                                            );
                                            removedCount += len;
                                        } else {
                                            const wsLen =
                                                minIndent - removedCount;
                                            const boxLen = len - wsLen;

                                            if (
                                                node.nodeType === Node.TEXT_NODE
                                            ) {
                                                whitespaceNodes.push(
                                                    document.createTextNode(
                                                        " ".repeat(wsLen),
                                                    ),
                                                );
                                                boxContentNodes.push(
                                                    document.createTextNode(
                                                        " ".repeat(boxLen),
                                                    ),
                                                );
                                            } else {
                                                const wsSpan = (
                                                    node as HTMLElement
                                                ).cloneNode(
                                                    false,
                                                ) as HTMLElement;
                                                wsSpan.textContent = " ".repeat(
                                                    wsLen,
                                                );
                                                whitespaceNodes.push(wsSpan);

                                                const boxSpan = (
                                                    node as HTMLElement
                                                ).cloneNode(
                                                    false,
                                                ) as HTMLElement;
                                                boxSpan.textContent =
                                                    " ".repeat(boxLen);
                                                boxContentNodes.push(boxSpan);
                                            }
                                            removedCount = minIndent;
                                        }
                                    } else if (/^\s/.test(nodeText)) {
                                        const match =
                                            nodeText.match(/^(\s+)(.*)$/);
                                        if (match) {
                                            const spaceLen = match[1].length;
                                            const content = match[2];

                                            if (
                                                removedCount + spaceLen <=
                                                minIndent
                                            ) {
                                                if (
                                                    node.nodeType ===
                                                    Node.TEXT_NODE
                                                ) {
                                                    whitespaceNodes.push(
                                                        document.createTextNode(
                                                            match[1],
                                                        ),
                                                    );
                                                    boxContentNodes.push(
                                                        document.createTextNode(
                                                            content,
                                                        ),
                                                    );
                                                } else {
                                                    const wsSpan = (
                                                        node as HTMLElement
                                                    ).cloneNode(
                                                        false,
                                                    ) as HTMLElement;
                                                    wsSpan.textContent =
                                                        match[1];
                                                    whitespaceNodes.push(
                                                        wsSpan,
                                                    );

                                                    const boxSpan = (
                                                        node as HTMLElement
                                                    ).cloneNode(
                                                        true,
                                                    ) as HTMLElement;
                                                    if (boxSpan.firstChild)
                                                        boxSpan.firstChild.textContent =
                                                            content;
                                                    boxContentNodes.push(
                                                        boxSpan,
                                                    );
                                                }
                                                removedCount += spaceLen;
                                            } else {
                                                const wsLen =
                                                    minIndent - removedCount;
                                                const keepSpace =
                                                    match[1].substring(wsLen);

                                                if (
                                                    node.nodeType ===
                                                    Node.TEXT_NODE
                                                ) {
                                                    whitespaceNodes.push(
                                                        document.createTextNode(
                                                            match[1].substring(
                                                                0,
                                                                wsLen,
                                                            ),
                                                        ),
                                                    );
                                                    boxContentNodes.push(
                                                        document.createTextNode(
                                                            keepSpace + content,
                                                        ),
                                                    );
                                                } else {
                                                    const wsSpan = (
                                                        node as HTMLElement
                                                    ).cloneNode(
                                                        false,
                                                    ) as HTMLElement;
                                                    wsSpan.textContent =
                                                        match[1].substring(
                                                            0,
                                                            wsLen,
                                                        );
                                                    whitespaceNodes.push(
                                                        wsSpan,
                                                    );

                                                    const boxSpan = (
                                                        node as HTMLElement
                                                    ).cloneNode(
                                                        true,
                                                    ) as HTMLElement;
                                                    if (boxSpan.firstChild)
                                                        boxSpan.firstChild.textContent =
                                                            keepSpace + content;
                                                    boxContentNodes.push(
                                                        boxSpan,
                                                    );
                                                }
                                                removedCount = minIndent;
                                            }
                                        }
                                    } else {
                                        boxContentNodes.push(
                                            node.cloneNode(true) as ChildNode,
                                        );
                                    }
                                }

                                const highlightBlock =
                                    document.createElement("span");
                                highlightBlock.className =
                                    "highlight-block highlight-block-group";

                                (
                                    highlightBlock as HTMLElement
                                ).style.setProperty(
                                    "--box-width",
                                    `${maxContentLength}ch`,
                                );

                                if (idx === 0)
                                    highlightBlock.classList.add(
                                        "highlight-block-first",
                                    );
                                if (idx === linesToHighlight.length - 1)
                                    highlightBlock.classList.add(
                                        "highlight-block-last",
                                    );

                                contentNodes.forEach((node) => {
                                    if (node.parentNode === lineElement) {
                                        lineElement.removeChild(node);
                                    }
                                });

                                whitespaceNodes.forEach((node) =>
                                    lineElement.appendChild(node),
                                );

                                boxContentNodes.forEach((node) =>
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
                        // Silent fail
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
