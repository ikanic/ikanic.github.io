// 줄 번호와 diff 기호를 처리하는 함수
export function processLineNumbersAndDiff(lines: NodeListOf<Element>): void {
    let actualLineNumber = 1;

    lines.forEach((line) => {
        const lineElement = line as HTMLElement;

        if (lineElement.hasAttribute("data-num-processed")) return;
        lineElement.setAttribute("data-num-processed", "true");

        let existingLineNumber = lineElement.querySelector(".line-number");
        const textContent = lineElement.textContent || "";
        let lineClass = "";
        let diffSymbol = "";

        // diff 스타일 감지
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
            if (firstTextNode && firstTextNode.textContent?.startsWith("+")) {
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
            if (firstTextNode && firstTextNode.textContent?.startsWith("-")) {
                firstTextNode.textContent =
                    firstTextNode.textContent.substring(1);
            }
        }

        // 줄 번호 추가
        if (existingLineNumber) {
            existingLineNumber.textContent = String(actualLineNumber);
            (existingLineNumber as HTMLElement).style.cssText =
                "display: inline-block !important; position: absolute !important; left: 0.5rem !important; top: 0 !important; width: 2rem !important; text-align: right !important; color: rgb(75, 85, 99) !important; font-size: 0.875rem !important; line-height: 1.7 !important; margin: 0 !important; padding: 0 !important;";
        } else {
            const lineNumber = document.createElement("span");
            lineNumber.className = "line-number";
            lineNumber.textContent = String(actualLineNumber);
            lineNumber.style.cssText =
                "display: inline-block !important; position: absolute !important; left: 0.5rem !important; top: 0 !important; width: 2rem !important; text-align: right !important; color: rgb(75, 85, 99) !important; font-size: 0.875rem !important; line-height: 1.7 !important; margin: 0 !important; padding: 0 !important;";
            lineElement.insertBefore(lineNumber, lineElement.firstChild);
        }

        // diff 기호 추가
        if (diffSymbol) {
            const diffSpan = document.createElement("span");
            diffSpan.className = "diff-symbol";
            diffSpan.textContent = diffSymbol;

            const lineNum = lineElement.querySelector(".line-number");
            if (lineNum && lineNum.nextSibling) {
                lineElement.insertBefore(diffSpan, lineNum.nextSibling);
            }
        }

        const nextLine = lineElement.nextElementSibling;
        const nextText = nextLine?.textContent || "";
        if (!/^\+( |$)/.test(nextText)) {
            actualLineNumber++;
        }
    });
}
