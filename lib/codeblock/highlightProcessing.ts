// 줄 하이라이트 처리 (단일 줄)
export function processSingleLineHighlight(lineElement: HTMLElement): void {
    if (lineElement.querySelector(".highlight-block")) return;

    const lineNumber = lineElement.querySelector(".line-number");
    const diffSymbol = lineElement.querySelector(".diff-symbol");

    const contentNodes: ChildNode[] = [];
    Array.from(lineElement.childNodes).forEach((node) => {
        if (node === lineNumber || node === diffSymbol) return;
        contentNodes.push(node);
    });

    // 빈 줄 처리
    const isEmpty =
        contentNodes.length === 0 ||
        contentNodes.every((node) => {
            const text = node.textContent || "";
            return text.trim() === "";
        });

    const whitespaceNodes: ChildNode[] = [];
    const realContentNodes: ChildNode[] = [];

    if (isEmpty) {
        realContentNodes.push(document.createTextNode("\u00A0"));
    } else {
        let foundNonWhitespace = false;

        contentNodes.forEach((node) => {
            const nodeText = node.textContent || "";

            if (!foundNonWhitespace) {
                if (/^\s*$/.test(nodeText)) {
                    whitespaceNodes.push(node.cloneNode(true) as ChildNode);
                    return;
                }

                if (/^\s/.test(nodeText)) {
                    if (node.nodeType === Node.TEXT_NODE) {
                        const match = nodeText.match(/^(\s+)(.*)$/);
                        if (match && match[2]) {
                            whitespaceNodes.push(
                                document.createTextNode(match[1]),
                            );
                            realContentNodes.push(
                                document.createTextNode(match[2]),
                            );
                            foundNonWhitespace = true;
                            return;
                        }
                    } else if (node.nodeType === Node.ELEMENT_NODE) {
                        const element = node as HTMLElement;
                        const firstChild = element.firstChild;

                        if (
                            firstChild &&
                            firstChild.nodeType === Node.TEXT_NODE
                        ) {
                            const text = firstChild.textContent || "";
                            const match = text.match(/^(\s+)(.*)$/);

                            if (match && match[2]) {
                                const wsSpan = element.cloneNode(
                                    false,
                                ) as HTMLElement;
                                wsSpan.textContent = match[1];
                                whitespaceNodes.push(wsSpan);

                                const contentSpan = element.cloneNode(
                                    true,
                                ) as HTMLElement;
                                if (contentSpan.firstChild) {
                                    contentSpan.firstChild.textContent =
                                        match[2];
                                }
                                realContentNodes.push(contentSpan);
                                foundNonWhitespace = true;
                                return;
                            }
                        }
                    }
                }
            }

            foundNonWhitespace = true;
            realContentNodes.push(node.cloneNode(true) as ChildNode);
        });
    }

    const highlightBlock = document.createElement("span");
    highlightBlock.className = "highlight-block";

    contentNodes.forEach((node) => {
        if (node.parentNode === lineElement) {
            lineElement.removeChild(node);
        }
    });

    whitespaceNodes.forEach((node) => lineElement.appendChild(node));

    realContentNodes.forEach((node) => highlightBlock.appendChild(node));

    lineElement.appendChild(highlightBlock);
}

// 여러 줄 하이라이트 처리를 위한 정보 수집
interface LineContentInfo {
    element: HTMLElement;
    isEmpty: boolean;
    leadingSpaces: number;
    contentLength: number;
    contentText: string;
}

export function collectLineContentInfo(
    linesToHighlight: HTMLElement[],
): LineContentInfo[] {
    const lineContentInfo: LineContentInfo[] = [];

    linesToHighlight.forEach((lineElement) => {
        const lineNumber = lineElement.querySelector(".line-number");
        const diffSymbol = lineElement.querySelector(".diff-symbol");

        const contentNodes: ChildNode[] = [];
        Array.from(lineElement.childNodes).forEach((node) => {
            if (node === lineNumber || node === diffSymbol) return;
            contentNodes.push(node);
        });

        const fullText = contentNodes.map((n) => n.textContent || "").join("");

        const isEmpty = fullText.trim() === "";
        const leadingMatch = fullText.match(/^(\s*)/);
        const leadingSpaces = leadingMatch ? leadingMatch[1].length : 0;
        const contentText = fullText.substring(leadingSpaces);
        const contentLength = contentText.length;

        lineContentInfo.push({
            element: lineElement,
            isEmpty,
            leadingSpaces,
            contentLength,
            contentText,
        });
    });

    return lineContentInfo;
}

// 여러 줄 하이라이트 처리
export function processMultiLineHighlight(
    lineContentInfo: LineContentInfo[],
    minIndent: number,
    maxContentLength: number,
): void {
    lineContentInfo.forEach((info, idx) => {
        const lineElement = info.element;

        if (lineElement.querySelector(".highlight-block")) return;

        const lineNumber = lineElement.querySelector(".line-number");
        const diffSymbol = lineElement.querySelector(".diff-symbol");

        const contentNodes: ChildNode[] = [];
        Array.from(lineElement.childNodes).forEach((node) => {
            if (node === lineNumber || node === diffSymbol) return;
            contentNodes.push(node);
        });

        // 빈 줄 처리
        if (info.isEmpty) {
            const highlightBlock = document.createElement("span");
            highlightBlock.className = "highlight-block highlight-block-group";

            (highlightBlock as HTMLElement).style.setProperty(
                "--box-width",
                `${maxContentLength}ch`,
            );

            if (idx === 0)
                highlightBlock.classList.add("highlight-block-first");
            if (idx === lineContentInfo.length - 1)
                highlightBlock.classList.add("highlight-block-last");

            const leadingSpace = " ".repeat(minIndent);

            contentNodes.forEach((node) => {
                if (node.parentNode === lineElement) {
                    lineElement.removeChild(node);
                }
            });

            if (minIndent > 0) {
                lineElement.appendChild(document.createTextNode(leadingSpace));
            }

            highlightBlock.appendChild(document.createTextNode("\u00A0"));

            lineElement.appendChild(highlightBlock);
            return;
        }

        // 일반 줄 처리
        const whitespaceNodes: ChildNode[] = [];
        const boxContentNodes: ChildNode[] = [];
        let removedCount = 0;

        for (const node of contentNodes) {
            if (removedCount >= minIndent) {
                boxContentNodes.push(node.cloneNode(true) as ChildNode);
                continue;
            }

            const nodeText = node.textContent || "";

            if (/^\s*$/.test(nodeText)) {
                const len = nodeText.length;
                if (removedCount + len <= minIndent) {
                    whitespaceNodes.push(node.cloneNode(true) as ChildNode);
                    removedCount += len;
                } else {
                    const wsLen = minIndent - removedCount;
                    const boxLen = len - wsLen;

                    if (node.nodeType === Node.TEXT_NODE) {
                        whitespaceNodes.push(
                            document.createTextNode(" ".repeat(wsLen)),
                        );
                        boxContentNodes.push(
                            document.createTextNode(" ".repeat(boxLen)),
                        );
                    } else {
                        const wsSpan = (node as HTMLElement).cloneNode(
                            false,
                        ) as HTMLElement;
                        wsSpan.textContent = " ".repeat(wsLen);
                        whitespaceNodes.push(wsSpan);

                        const boxSpan = (node as HTMLElement).cloneNode(
                            false,
                        ) as HTMLElement;
                        boxSpan.textContent = " ".repeat(boxLen);
                        boxContentNodes.push(boxSpan);
                    }
                    removedCount = minIndent;
                }
            } else if (/^\s/.test(nodeText)) {
                const match = nodeText.match(/^(\s+)(.*)$/);
                if (match) {
                    const spaceLen = match[1].length;
                    const content = match[2];

                    if (removedCount + spaceLen <= minIndent) {
                        if (node.nodeType === Node.TEXT_NODE) {
                            whitespaceNodes.push(
                                document.createTextNode(match[1]),
                            );
                            boxContentNodes.push(
                                document.createTextNode(content),
                            );
                        } else {
                            const wsSpan = (node as HTMLElement).cloneNode(
                                false,
                            ) as HTMLElement;
                            wsSpan.textContent = match[1];
                            whitespaceNodes.push(wsSpan);

                            const boxSpan = (node as HTMLElement).cloneNode(
                                true,
                            ) as HTMLElement;
                            if (boxSpan.firstChild)
                                boxSpan.firstChild.textContent = content;
                            boxContentNodes.push(boxSpan);
                        }
                        removedCount += spaceLen;
                    } else {
                        const wsLen = minIndent - removedCount;
                        const keepSpace = match[1].substring(wsLen);

                        if (node.nodeType === Node.TEXT_NODE) {
                            whitespaceNodes.push(
                                document.createTextNode(
                                    match[1].substring(0, wsLen),
                                ),
                            );
                            boxContentNodes.push(
                                document.createTextNode(keepSpace + content),
                            );
                        } else {
                            const wsSpan = (node as HTMLElement).cloneNode(
                                false,
                            ) as HTMLElement;
                            wsSpan.textContent = match[1].substring(0, wsLen);
                            whitespaceNodes.push(wsSpan);

                            const boxSpan = (node as HTMLElement).cloneNode(
                                true,
                            ) as HTMLElement;
                            if (boxSpan.firstChild)
                                boxSpan.firstChild.textContent =
                                    keepSpace + content;
                            boxContentNodes.push(boxSpan);
                        }
                        removedCount = minIndent;
                    }
                }
            } else {
                boxContentNodes.push(node.cloneNode(true) as ChildNode);
            }
        }

        const highlightBlock = document.createElement("span");
        highlightBlock.className = "highlight-block highlight-block-group";

        (highlightBlock as HTMLElement).style.setProperty(
            "--box-width",
            `${maxContentLength}ch`,
        );

        if (idx === 0) highlightBlock.classList.add("highlight-block-first");
        if (idx === lineContentInfo.length - 1)
            highlightBlock.classList.add("highlight-block-last");

        contentNodes.forEach((node) => {
            if (node.parentNode === lineElement) {
                lineElement.removeChild(node);
            }
        });

        whitespaceNodes.forEach((node) => lineElement.appendChild(node));

        boxContentNodes.forEach((node) => highlightBlock.appendChild(node));

        lineElement.appendChild(highlightBlock);
    });
}
