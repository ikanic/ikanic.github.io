import {
    parseMediaLine,
    processVideoSyntax,
    processImageSyntax,
} from "./mediaProcessing";
import { processTableMerge } from "./tableMerge";

// 커스텀 마크다운 문법 처리
export function processCustomSyntax(content: string): string {
    let processed = content;

    // 0. 비디오 & 이미지 삽입 처리
    const lines = processed.split("\n");
    const processedLines: string[] = [];

    for (const line of lines) {
        // 비디오 패턴 확인
        if (line.trim().startsWith("!![")) {
            const parsed = parseMediaLine(line.trim(), true);
            if (parsed) {
                processedLines.push(
                    processVideoSyntax(parsed.altAndOptions, parsed.url),
                );
                continue;
            }
        }

        // 이미지 패턴 확인
        if (line.trim().startsWith("![") && !line.trim().startsWith("!![")) {
            const parsed = parseMediaLine(line.trim(), false);
            if (parsed) {
                processedLines.push(
                    processImageSyntax(parsed.altAndOptions, parsed.url),
                );
                continue;
            }
        }

        processedLines.push(line);
    }

    processed = processedLines.join("\n");

    // 2. 윗첨자: ^^내용^^ -> <sup>내용</sup> (링크 지원)
    processed = processed.replace(
        /(?<!\\)\^\^([^\^]+)\^\^/g,
        (match, content) => {
            const htmlContent = content.replace(
                /\[([^\]]+)\]\(([^)]+)\)/g,
                '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
            );
            return `<sup>${htmlContent}</sup>`;
        },
    );

    // 3. 아랫첨자: ,,내용,, -> <sub>내용</sub> (링크 지원)
    processed = processed.replace(/(?<!\\),,([^,]+),,/g, (match, content) => {
        const htmlContent = content.replace(
            /\[([^\]]+)\]\(([^)]+)\)/g,
            '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
        );
        return `<sub>${htmlContent}</sub>`;
    });

    // 4. 이스케이프 처리 제거
    processed = processed.replace(/\\\^\^/g, "^^");
    processed = processed.replace(/\\,,/g, ",,");

    // 5. 문구 인용: :::quote\n내용\n::: -> 큰따옴표 스타일
    processed = processed.replace(
        /:::quote\s*\n([\s\S]+?)\n:::/g,
        (match, content) => {
            return `<blockquote class="markdown-quote">
${content.trim()}
</blockquote>`;
        },
    );

    // 6. 경고 블록: :::warning 제목\n내용\n:::
    processed = processed.replace(
        /:::warning\s+(.+?)\n([\s\S]+?)\n:::/g,
        (match, title, content) => {
            return `<div class="markdown-callout markdown-warning">
<div class="markdown-callout-title">⚠️ ${title.trim()}</div>
<div class="markdown-callout-content">

${content.trim()}

</div>
</div>`;
        },
    );

    // 7. 에러 블록: :::error 제목\n내용\n:::
    processed = processed.replace(
        /:::error\s+(.+?)\n([\s\S]+?)\n:::/g,
        (match, title, content) => {
            return `<div class="markdown-callout markdown-error">
<div class="markdown-callout-title">❌ ${title.trim()}</div>
<div class="markdown-callout-content">

${content.trim()}

</div>
</div>`;
        },
    );

    // 8. 정보 블록: :::info 제목\n내용\n:::
    processed = processed.replace(
        /:::info\s+(.+?)\n([\s\S]+?)\n:::/g,
        (match, title, content) => {
            return `<div class="markdown-callout markdown-info">
<div class="markdown-callout-title">ℹ️ ${title.trim()}</div>
<div class="markdown-callout-content">

${content.trim()}

</div>
</div>`;
        },
    );

    // 9. 성공 블록: :::success 제목\n내용\n:::
    processed = processed.replace(
        /:::success\s+(.+?)\n([\s\S]+?)\n:::/g,
        (match, title, content) => {
            return `<div class="markdown-callout markdown-success">
<div class="markdown-callout-title">✅ ${title.trim()}</div>
<div class="markdown-callout-content">

${content.trim()}

</div>
</div>`;
        },
    );

    // 10. 토글: :::toggle 제목\n내용\n:::
    processed = processed.replace(
        /:::toggle\s+(.+?)\n([\s\S]+?)\n:::/g,
        (match, title, content) => {
            return `<details class="markdown-toggle">
<summary class="markdown-toggle-title">${title.trim()}</summary>
<div class="markdown-toggle-content">

${content.trim()}

</div>
</details>`;
        },
    );

    // 11. 테이블 셀 병합 처리
    processed = processTableMerge(processed);

    return processed;
}
