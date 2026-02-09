import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { remark } from "remark";
import html from "remark-html";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { getReadingTimeFromMarkdown } from "./reading-time";

const postsDirectory = path.join(process.cwd(), "posts");

export interface PostData {
    slug: string;
    title: string;
    createdDate: string;
    modifiedDate?: string;
    category?: string;
    tags?: string[];
    series?: string;
    seriesOrder?: number;
    description?: string;
    thumbnail?: string;
    content?: string;
    readingTime?: string;
    readingMinutes?: number;
}

// 날짜 포맷 파싱
function parseDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString().split("T")[0];
    const match = dateStr.match(/(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : dateStr;
}

// 정렬용 날짜 가져오기
function getSortDate(post: PostData): string {
    return post.modifiedDate || post.createdDate;
}

// 옵션 파싱 헬퍼 함수
function parseOptions(options: string): {
    caption: string;
    width: string;
    height: string;
} {
    let caption = "";
    let width = "";
    let height = "";

    let i = 0;
    const optionPairs: string[] = [];
    let currentPair = "";

    while (i < options.length) {
        const char = options[i];

        // 백슬래시 처리
        if (char === "\\" && i + 1 < options.length) {
            const nextChar = options[i + 1];
            if (nextChar === ",") {
                currentPair += ",";
                i += 2;
                continue;
            } else if (nextChar === "\\") {
                currentPair += "\\";
                i += 2;
                continue;
            }
        }

        // 일반 쉼표
        if (char === ",") {
            if (currentPair.trim()) {
                optionPairs.push(currentPair.trim());
            }
            currentPair = "";
            i++;
            continue;
        }

        // 일반 문자
        currentPair += char;
        i++;
    }

    if (currentPair.trim()) {
        optionPairs.push(currentPair.trim());
    }

    optionPairs.forEach((pair: string) => {
        const eqIndex = pair.indexOf("=");
        if (eqIndex > 0) {
            const key = pair.substring(0, eqIndex).trim();
            const value = pair.substring(eqIndex + 1).trim();
            if (key === "caption") caption = value;
            else if (key === "width") width = value;
            else if (key === "height") height = value;
        }
    });

    return { caption, width, height };
}

// Caption 내부의 마크다운 링크를 HTML로 변환
function convertCaptionMarkdownToHtml(caption: string): string {
    // [텍스트](url) 패턴을 <a href="url">텍스트</a>로 변환
    return caption.replace(
        /\[([^\]]+)\]\(([^)]+)\)/g,
        '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
    );
}

// `[` `]` 괄호 매칭으로 올바른 닫는 ] 찾기
function findClosingBracket(str: string, startIdx: number): number {
    let depth = 1; // ![ 또는 !![ 에서 [ 하나 시작

    for (let i = startIdx; i < str.length; i++) {
        if (str[i] === "\\" && i + 1 < str.length) {
            i++; // 이스케이프 건너뛰기
            continue;
        }

        if (str[i] === "[") {
            depth++;
        } else if (str[i] === "]") {
            depth--;
            if (depth === 0) {
                return i;
            }
        }
    }

    return -1;
}

// 미디어 라인 파싱 (이미지/비디오)
function parseMediaLine(
    line: string,
    isVideo: boolean,
): { altAndOptions: string; url: string } | null {
    const prefix = isVideo ? "!![" : "![";
    if (!line.startsWith(prefix)) return null;

    const startIdx = prefix.length;

    // `![`와 매칭되는 `]` 찾기 (괄호 매칭)
    const bracketEnd = findClosingBracket(line, startIdx);

    if (
        bracketEnd === -1 ||
        bracketEnd + 1 >= line.length ||
        line[bracketEnd + 1] !== "("
    ) {
        return null;
    }

    const altAndOptions = line.substring(startIdx, bracketEnd);
    const afterBracket = line.substring(bracketEnd + 2); // ]( 다음부터

    // afterBracket은 순수하게 이미지/비디오 URL
    const lastParen = afterBracket.lastIndexOf(")");
    if (lastParen === -1) return null;

    const url = afterBracket.substring(0, lastParen);

    return {
        altAndOptions,
        url,
    };
}

// 비디오 처리 헬퍼 함수
function processVideoSyntax(altAndOptions: string, url: string): string {
    let alt = "";
    let caption = "";
    let width = "";
    let height = "";

    if (altAndOptions.includes("\\|")) {
        alt = altAndOptions.replace(/\\\|/g, "|").replace(/\\\\/g, "\\");
    } else if (altAndOptions.includes("|")) {
        const pipeParts = altAndOptions.split("|");
        alt = pipeParts[0].trim().replace(/\\\\/g, "\\");
        const options = pipeParts[1] || "";
        const parsed = parseOptions(options);
        caption = parsed.caption;
        width = parsed.width;
        height = parsed.height;
    } else {
        alt = altAndOptions.replace(/\\\\/g, "\\");
    }

    const style = [];
    if (width) style.push(`width: ${width}${width.match(/\d$/) ? "px" : ""}`);
    if (height)
        style.push(`height: ${height}${height.match(/\d$/) ? "px" : ""}`);

    let html = '<figure class="markdown-media">\n';
    html += `<video${style.length > 0 ? ` style="${style.join("; ")}"` : ""} controls>\n`;
    html += `  <source src="${url}" />\n`;
    html += `  ${alt}\n`;
    html += "</video>\n";
    if (caption) {
        // Caption 내부의 마크다운 링크를 HTML로 변환
        const captionHtml = convertCaptionMarkdownToHtml(caption);
        html += `<figcaption class="markdown-caption">${captionHtml}</figcaption>\n`;
    }
    html += "</figure>";

    return html;
}

// 이미지 처리 헬퍼 함수
function processImageSyntax(altAndOptions: string, url: string): string {
    let alt = "";
    let caption = "";
    let width = "";
    let height = "";

    if (altAndOptions.includes("\\|")) {
        alt = altAndOptions.replace(/\\\|/g, "|").replace(/\\\\/g, "\\");
    } else if (altAndOptions.includes("|")) {
        const pipeParts = altAndOptions.split("|");
        alt = pipeParts[0].trim().replace(/\\\\/g, "\\");
        const options = pipeParts[1] || "";
        const parsed = parseOptions(options);
        caption = parsed.caption;
        width = parsed.width;
        height = parsed.height;
    } else {
        alt = altAndOptions.replace(/\\\\/g, "\\");
    }

    const style = [];
    if (width) style.push(`width: ${width}${width.match(/\d$/) ? "px" : ""}`);
    if (height)
        style.push(`height: ${height}${height.match(/\d$/) ? "px" : ""}`);

    let html = '<figure class="markdown-media">\n';
    html += `<img src="${url}" alt="${alt}"${style.length > 0 ? ` style="${style.join("; ")}"` : ""} />\n`;
    if (caption) {
        // Caption 내부의 마크다운 링크를 HTML로 변환
        const captionHtml = convertCaptionMarkdownToHtml(caption);
        html += `<figcaption class="markdown-caption">${captionHtml}</figcaption>\n`;
    }
    html += "</figure>";

    return html;
}

// 커스텀 마크다운 문법 처리
function processCustomSyntax(content: string): string {
    let processed = content;

    // 0. 비디오 삽입: !![alt|options](url)
    // 한 줄씩 처리
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
            // 내부의 마크다운 링크를 HTML로 변환
            const htmlContent = content.replace(
                /\[([^\]]+)\]\(([^)]+)\)/g,
                '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>',
            );
            return `<sup>${htmlContent}</sup>`;
        },
    );

    // 3. 아랫첨자: ,,내용,, -> <sub>내용</sub> (링크 지원)
    processed = processed.replace(/(?<!\\),,([^,]+),,/g, (match, content) => {
        // 내부의 마크다운 링크를 HTML로 변환
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

// 테이블 셀 병합 처리 함수
function processTableMerge(content: string): string {
    // 마크다운 테이블 패턴 찾기
    const tablePattern = /(\|[^\n]+\|\n)(\|[\s:|-]+\|\n)((?:\|[^\n]+\|\n?)+)/g;

    return content.replace(tablePattern, (match, header, separator, body) => {
        // 병합 태그가 없으면 원본 반환
        if (!match.includes("<-") && !match.includes("<!")) {
            return match;
        }

        console.log("Processing table:", { header, body });

        // 헤더 파싱
        const headerCells = header
            .trim()
            .split("|")
            .slice(1, -1)
            .map((c: string) => c.trim());

        // 본문 라인 파싱
        const bodyLines = body
            .trim()
            .split("\n")
            .map((line: string) => {
                return line
                    .split("|")
                    .slice(1, -1)
                    .map((c: string) => c.trim());
            });

        console.log("Parsed header:", headerCells);
        console.log("Parsed body:", bodyLines);

        // HTML 테이블 생성
        let html = '\n<table class="markdown-table-merged">\n';

        // 헤더 생성
        html += "<thead>\n<tr>\n";
        let skipCols = 0;
        headerCells.forEach((cell: string, idx: number) => {
            if (skipCols > 0) {
                skipCols--;
                return;
            }

            const {
                content: cellContent,
                colspan,
                rowspan,
            } = parseCellMerge(cell);
            console.log(`Header cell ${idx}:`, {
                cellContent,
                colspan,
                rowspan,
            });

            const attrs = [];
            if (colspan > 1) attrs.push(`colspan="${colspan}"`);
            if (rowspan > 1) attrs.push(`rowspan="${rowspan}"`);

            html += `  <th${attrs.length > 0 ? " " + attrs.join(" ") : ""}>${cellContent}</th>\n`;
            skipCols = colspan - 1;
        });
        html += "</tr>\n</thead>\n";

        // 본문 생성
        html += "<tbody>\n";
        const skipCells = new Map<string, boolean>();

        bodyLines.forEach((cells: string[], rowIdx: number) => {
            html += "<tr>\n";

            let colIdx = 0;
            let cellIdx = 0;

            while (cellIdx < cells.length || colIdx < 10) {
                // 최대 10칸까지
                // 병합으로 건너뛸 셀인지 확인
                if (skipCells.get(`${rowIdx}-${colIdx}`)) {
                    colIdx++;
                    continue;
                }

                // 더 이상 셀이 없으면 종료
                if (cellIdx >= cells.length) break;

                const cell = cells[cellIdx];
                const {
                    content: cellContent,
                    colspan,
                    rowspan,
                } = parseCellMerge(cell);

                console.log(`Body cell [${rowIdx}][${colIdx}]:`, {
                    cellContent,
                    colspan,
                    rowspan,
                });

                const attrs = [];
                if (colspan > 1) attrs.push(`colspan="${colspan}"`);
                if (rowspan > 1) attrs.push(`rowspan="${rowspan}"`);

                html += `  <td${attrs.length > 0 ? " " + attrs.join(" ") : ""}>${cellContent}</td>\n`;

                // 병합된 셀의 위치 기록
                for (let r = 0; r < rowspan; r++) {
                    for (let c = 0; c < colspan; c++) {
                        if (r === 0 && c === 0) continue;
                        skipCells.set(`${rowIdx + r}-${colIdx + c}`, true);
                    }
                }

                colIdx += colspan;
                cellIdx++;
            }

            html += "</tr>\n";
        });

        html += "</tbody>\n</table>\n";
        return html;
    });
}

function parseCellMerge(cell: string): {
    content: string;
    colspan: number;
    rowspan: number;
} {
    let content = cell.trim();
    let colspan = 1;
    let rowspan = 1;

    // <-n> 패턴 (가로 병합) - n칸 차지
    const colspanMatch = content.match(/<-(\d+)>/);
    if (colspanMatch) {
        colspan = parseInt(colspanMatch[1]);
        content = content.replace(/<-\d+>/g, "").trim();
    }

    // <!n> 패턴 (세로 병합) - n칸 차지
    const rowspanMatch = content.match(/<!(\d+)>/);
    if (rowspanMatch) {
        rowspan = parseInt(rowspanMatch[1]);
        content = content.replace(/<!(\d+)>/g, "").trim();
    }

    return { content, colspan, rowspan };
}

// 모든 포스트 가져오기
export function getAllPosts(): PostData[] {
    try {
        if (!fs.existsSync(postsDirectory)) {
            console.error("Posts directory does not exist!");
            return [];
        }

        const fileNames = fs.readdirSync(postsDirectory);

        const allPostsData = fileNames
            .filter((fileName) => fileName.endsWith(".md"))
            .map((fileName) => {
                const slug = fileName.replace(/\.md$/, "");
                const fullPath = path.join(postsDirectory, fileName);
                const fileContents = fs.readFileSync(fullPath, "utf8");
                const { data, content } = matter(fileContents);

                const readingTimeResult = getReadingTimeFromMarkdown(content);

                return {
                    slug,
                    title: data.title || "Untitled",
                    createdDate: parseDate(data["created-date"] || data.date),
                    modifiedDate: data["modified-date"]
                        ? parseDate(data["modified-date"])
                        : undefined,
                    category: data.category,
                    tags: data.tags || [],
                    series: data.series,
                    seriesOrder: data.seriesOrder,
                    description: data.description || "",
                    thumbnail: data.thumbnail,
                    readingTime: readingTimeResult.text,
                    readingMinutes: readingTimeResult.minutes,
                } as PostData;
            });

        return allPostsData.sort((a, b) =>
            getSortDate(a) < getSortDate(b) ? 1 : -1,
        );
    } catch (error) {
        console.error("Error in getAllPosts:", error);
        return [];
    }
}

// 특정 포스트 가져오기
export async function getPostBySlug(slug: string): Promise<PostData | null> {
    try {
        const fullPath = path.join(postsDirectory, `${slug}.md`);
        const fileContents = fs.readFileSync(fullPath, "utf8");
        const { data, content } = matter(fileContents);

        const readingTimeResult = getReadingTimeFromMarkdown(content);

        // 커스텀 문법 처리
        const processedContent = processCustomSyntax(content);

        // 이스케이프된 백틱 마커
        const ESCAPED_BACKTICK_MARKER = "___ESC_BT___";

        // 코드 블록 내 이스케이프된 백틱을 마커로 변환
        let preprocessedContent = processedContent.replace(
            /```[\s\S]*?```/g,
            (match) => {
                return match.replace(/\\`/g, ESCAPED_BACKTICK_MARKER);
            },
        );

        let blockId = 0;
        const blockMeta = new Map<string, string>();
        const backtickMap = new Map<string, string>();

        // 코드 블록 감지 및 백틱 보호 (개선된 정규식 - 더 정확한 매칭)
        const contentWithProtectedBackticks = preprocessedContent.replace(
            /( *)```(\w+)(?: ([^\n]+))?\n([\s\S]*?)\n\1```/g,
            (match, indent, lang, meta, codeContent) => {
                const blockIdentifier = `cb${blockId++}`;

                // Mermaid 블록은 백틱 처리하지 않음
                if (lang === "mermaid" || lang === "mermaidc") {
                    return match;
                }

                // 메타 정보 파싱 (title="..." 과 {1,3-5} 형태 모두 지원)
                let blockTitle = "";
                let blockHighlight = "";

                if (meta) {
                    // title 추출
                    const titleMatch = meta.match(/title="([^"]+)"/);
                    if (titleMatch) {
                        blockTitle = titleMatch[1];
                    }

                    // 하이라이트 추출 {1,3-5} 형태
                    const highlightMatch = meta.match(/\{([^}]+)\}/);
                    if (highlightMatch) {
                        blockHighlight = highlightMatch[1];
                        blockMeta.set(blockIdentifier, blockHighlight);
                    }
                }

                let markerIndex = 0;
                const protectedCode = codeContent.replace(
                    /`([^`]+)`/g,
                    (backtickMatch: string, backtickContent: string) => {
                        const marker = `__BACKTICK_${blockIdentifier}_${markerIndex++}__`;
                        backtickMap.set(marker, backtickContent);
                        return marker;
                    },
                );

                // title이 있으면 주석으로 추가
                const titleComment = blockTitle
                    ? `<!-- title:${blockTitle} -->`
                    : "";
                return `${indent}${titleComment}<!-- ${blockIdentifier} -->\n${indent}\`\`\`${lang}\n${protectedCode}\n${indent}\`\`\``;
            },
        );

        // 마크다운 -> HTML 변환
        // @ts-ignore
        const processedContentHtml = await unified()
            .use(remarkParse)
            .use(remarkGfm)
            // @ts-ignore
            .use(remarkRehype, { allowDangerousHtml: true })
            // @ts-ignore
            .use(rehypePrettyCode, {
                theme: "github-dark",
                keepBackground: false,
            })
            // 링크를 새 탭에서 열도록 처리
            .use(() => {
                return (tree: any) => {
                    const visit = (node: any) => {
                        if (node.type === "element" && node.tagName === "a") {
                            node.properties = node.properties || {};
                            node.properties.target = "_blank";
                            node.properties.rel = "noopener noreferrer";
                        }
                        if (node.children) {
                            node.children.forEach(visit);
                        }
                    };
                    visit(tree);
                };
            })
            // @ts-ignore
            .use(rehypeStringify, { allowDangerousHtml: true })
            .process(contentWithProtectedBackticks);

        let contentHtml = processedContentHtml.toString();

        // 메타 정보 추가
        contentHtml = contentHtml.replace(
            /(?:<!--\s*title:([^>]+)\s*-->)?<!--\s*(cb\d+)\s*-->\s*<figure[^>]*>[\s\S]*?<pre/g,
            (match, titleFromComment, blockIdentifier) => {
                const meta = blockMeta.get(blockIdentifier);
                let result = match;

                // 하이라이트 메타 추가
                if (meta) {
                    result = result.replace(
                        /<pre/,
                        `<pre data-highlight-meta="${meta}"`,
                    );
                }

                // 타이틀 추가
                if (titleFromComment) {
                    result = result.replace(
                        /<pre/,
                        `<pre data-title="${titleFromComment}"`,
                    );
                }

                return result;
            },
        );

        // 백틱 마커 복원
        backtickMap.forEach((backtickContent, marker) => {
            if (!contentHtml.includes(marker)) {
                return;
            }

            let extractedColor = null;

            const escapedWord = backtickContent.replace(
                /[.*+?^${}()|[\]\\]/g,
                "\\$&",
            );
            const exactMatchRegex = new RegExp(
                `<span[^>]*style="[^"]*color:\\s*(#[A-Fa-f0-9]{6}|rgb\\([^)]+\\))[^"]*"[^>]*>${escapedWord}<\\/span>`,
                "g",
            );

            const exactMatch = contentHtml.match(exactMatchRegex);
            if (exactMatch && exactMatch.length > 0) {
                const colorMatch = exactMatch[0].match(
                    /color:\s*(#[A-Fa-f0-9]{6}|rgb\([^)]+\))/,
                );
                if (colorMatch) {
                    extractedColor = colorMatch[1];
                }
            }

            if (!extractedColor) {
                const partialMatchRegex = new RegExp(
                    `<span[^>]*style="[^"]*color:\\s*(#[A-Fa-f0-9]{6}|rgb\\([^)]+\\))[^"]*"[^>]*>[^<]*${escapedWord}[^<]*<\\/span>`,
                    "g",
                );

                const partialMatch = contentHtml.match(partialMatchRegex);
                if (partialMatch && partialMatch.length > 0) {
                    const colorMatch = partialMatch[0].match(
                        /color:\s*(#[A-Fa-f0-9]{6}|rgb\([^)]+\))/,
                    );
                    if (colorMatch) {
                        extractedColor = colorMatch[1];
                    }
                }
            }

            const escapedMarker = marker.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const markTag = extractedColor
                ? `<mark class="code-word-highlight" style="color:${extractedColor}">${backtickContent}</mark>`
                : `<mark class="code-word-highlight">${backtickContent}</mark>`;

            contentHtml = contentHtml.replace(
                new RegExp(escapedMarker, "g"),
                markTag,
            );
        });

        // 이스케이프된 백틱 마커를 그레이브 악센트로 교체
        contentHtml = contentHtml.replace(/___ESC_BT___/g, "ˋ");

        return {
            slug,
            title: data.title || "Untitled",
            createdDate: parseDate(data["created-date"] || data.date),
            modifiedDate: data["modified-date"]
                ? parseDate(data["modified-date"])
                : undefined,
            category: data.category,
            tags: data.tags || [],
            series: data.series,
            seriesOrder: data.seriesOrder,
            description: data.description || "",
            thumbnail: data.thumbnail,
            content: contentHtml,
            readingTime: readingTimeResult.text,
            readingMinutes: readingTimeResult.minutes,
        };
    } catch (error) {
        console.error("Error processing post:", error);
        return null;
    }
}

// 카테고리별 포스트 가져오기
export function getPostsByCategory(category: string): PostData[] {
    const allPosts = getAllPosts();
    return allPosts.filter((post) => post.category === category);
}

// 태그별 포스트 가져오기
export function getPostsByTag(tag: string): PostData[] {
    const allPosts = getAllPosts();
    return allPosts.filter((post) => post.tags?.includes(tag));
}

// 시리즈별 포스트 가져오기
export function getPostsBySeries(series: string): PostData[] {
    const allPosts = getAllPosts();
    return allPosts
        .filter((post) => post.series === series)
        .sort((a, b) => (a.seriesOrder || 0) - (b.seriesOrder || 0));
}

// 모든 카테고리 가져오기
export function getAllCategories(): string[] {
    const allPosts = getAllPosts();
    const categories = new Set<string>();
    allPosts.forEach((post) => {
        if (post.category) categories.add(post.category);
    });
    return Array.from(categories);
}

// 모든 태그 가져오기
export function getAllTags(): { tag: string; count: number }[] {
    const allPosts = getAllPosts();
    const tagCount = new Map<string, number>();

    allPosts.forEach((post) => {
        post.tags?.forEach((tag) => {
            tagCount.set(tag, (tagCount.get(tag) || 0) + 1);
        });
    });

    return Array.from(tagCount.entries())
        .map(([tag, count]) => ({ tag, count }))
        .sort((a, b) => b.count - a.count);
}

// 모든 시리즈 가져오기
export function getAllSeries(): { series: string; count: number }[] {
    const allPosts = getAllPosts();
    const seriesCount = new Map<string, number>();

    allPosts.forEach((post) => {
        if (post.series) {
            seriesCount.set(
                post.series,
                (seriesCount.get(post.series) || 0) + 1,
            );
        }
    });

    return Array.from(seriesCount.entries())
        .map(([series, count]) => ({ series, count }))
        .sort((a, b) => b.count - a.count);
}

// HTML에서 목차 추출
export function extractTOC(htmlContent: string): {
    id: string;
    text: string;
    level: number;
}[] {
    const headingRegex = /<h([1-2])[^>]*>(.*?)<\/h\1>/g;
    const toc: { id: string; text: string; level: number }[] = [];
    let match;

    while ((match = headingRegex.exec(htmlContent)) !== null) {
        const level = parseInt(match[1]);
        const text = match[2].replace(/<[^>]*>/g, "");
        const id = text
            .toLowerCase()
            .replace(/\s+/g, "-")
            .replace(/[^\w가-힣-]/g, "");

        toc.push({ id, text, level });
    }

    return toc;
}
