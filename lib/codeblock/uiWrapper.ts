// 코드 블록 헤더 생성
export function createCodeBlockHeader(title?: string): HTMLDivElement {
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

    return header;
}

// 코드 블록 푸터 생성 (언어 표시 및 복사 버튼)
export function createCodeBlockFooter(
    language: string,
    code: HTMLElement,
): HTMLDivElement {
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
        const lines = code.querySelectorAll("[data-line], .code-line");
        let codeText = "";

        if (lines.length > 0) {
            codeText = Array.from(lines)
                .map((line) => {
                    const clone = line.cloneNode(true) as HTMLElement;
                    const lineNum = clone.querySelector(".line-number");
                    const diffSym = clone.querySelector(".diff-symbol");
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

    return footer;
}

// 코드 블록 래퍼 생성 및 조립
export function wrapCodeBlock(
    figure: Element,
    language: string,
    title: string,
    code: HTMLElement,
): void {
    const header = createCodeBlockHeader(title);
    const footer = createCodeBlockFooter(language, code);

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
}
