// 단어 하이라이트 (백틱으로 감싼 단어) 처리
export function processWordHighlights(lines: NodeListOf<Element>): void {
    lines.forEach((line) => {
        const lineElement = line as HTMLElement;

        if (lineElement.hasAttribute("data-word-processed")) return;
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

                const fragment = document.createDocumentFragment();
                let lastIndex = 0;

                matches.forEach((match) => {
                    const beforeMatch = text.substring(0, match.index);
                    const afterMatch = text.substring(
                        match.index + match[0].length,
                    );

                    const isEscapedStart = beforeMatch.endsWith("\\");
                    const isEscapedEnd = afterMatch.startsWith("\\");

                    if (match.index > lastIndex) {
                        fragment.appendChild(
                            document.createTextNode(
                                text.substring(lastIndex, match.index),
                            ),
                        );
                    }

                    if (!isEscapedStart && !isEscapedEnd) {
                        const highlight = document.createElement("mark");
                        highlight.className = "code-word-highlight";
                        highlight.textContent = match[1];
                        fragment.appendChild(highlight);
                    } else {
                        fragment.appendChild(document.createTextNode(match[0]));
                    }

                    lastIndex = match.index + match[0].length;
                });

                if (lastIndex < text.length) {
                    fragment.appendChild(
                        document.createTextNode(text.substring(lastIndex)),
                    );
                }

                span.replaceChild(fragment, textNode);
            });
        });
    });
}
