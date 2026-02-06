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

// 커스텀 마크다운 문법 처리
function processCustomSyntax(content: string): string {
    let processed = content;

    // 1. 윗첨자: ^^내용^^ -> <sup>내용</sup>
    processed = processed.replace(/(?<!\\)\^\^([^\^]+)\^\^/g, "<sup>$1</sup>");

    // 2. 아랫첨자: ,,내용,, -> <sub>내용</sub>
    processed = processed.replace(/(?<!\\),,([^,]+),,/g, "<sub>$1</sub>");

    // 3. 이스케이프 처리 제거
    processed = processed.replace(/\\\^\^/g, "^^");
    processed = processed.replace(/\\,,/g, ",,");

    // 4. 문구 인용: :::quote\n내용\n::: -> 큰따옴표 스타일
    processed = processed.replace(
        /:::quote\s*\n([\s\S]+?)\n:::/g,
        (match, content) => {
            return `<blockquote class="markdown-quote">
${content.trim()}
</blockquote>`;
        },
    );

    // 5. 경고 블록: :::warning 제목\n내용\n:::
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

    // 6. 에러 블록: :::error 제목\n내용\n:::
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

    // 7. 정보 블록: :::info 제목\n내용\n:::
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

    // 8. 성공 블록: :::success 제목\n내용\n:::
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

    // 9. 토글: :::toggle 제목\n내용\n:::
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

    // 10. 테이블 셀 병합 처리
    processed = processTableMerge(processed);

    return processed;
}

// 테이블 셀 병합 처리 함수
function processTableMerge(content: string): string {
    // 테이블 전체를 찾아서 처리
    return content.replace(/(\|[^\n]+\|\n)+/g, (tableMatch) => {
        const lines = tableMatch.trim().split("\n");
        if (lines.length < 2) return tableMatch;

        // 테이블 헤더와 구분선 확인
        const hasHeader = lines[1].match(/^\|[\s:-]+\|$/);
        if (!hasHeader) return tableMatch;

        const headerLine = lines[0];
        const separatorLine = lines[1];
        const bodyLines = lines.slice(2);

        // HTML 테이블로 변환
        let html = '<table class="markdown-table-merged">\n';

        // 헤더 처리
        const headerCells = parseTableRow(headerLine);
        html += "<thead><tr>\n";
        let skipCols = 0;
        for (let i = 0; i < headerCells.length; i++) {
            if (skipCols > 0) {
                skipCols--;
                continue;
            }
            const { content, colspan, rowspan } = parseCellMerge(
                headerCells[i],
            );
            html += `<th${colspan > 1 ? ` colspan="${colspan}"` : ""}${rowspan > 1 ? ` rowspan="${rowspan}"` : ""}>${content}</th>\n`;
            skipCols = colspan - 1;
        }
        html += "</tr></thead>\n";

        // 바디 처리
        html += "<tbody>\n";
        const skipRows: Set<string> = new Set(); // "row-col" 형식으로 저장

        for (let rowIdx = 0; rowIdx < bodyLines.length; rowIdx++) {
            const cells = parseTableRow(bodyLines[rowIdx]);
            html += "<tr>\n";
            let skipCols = 0;

            for (let colIdx = 0; colIdx < cells.length; colIdx++) {
                const key = `${rowIdx}-${colIdx}`;
                if (skipRows.has(key) || skipCols > 0) {
                    if (skipCols > 0) skipCols--;
                    continue;
                }

                const { content, colspan, rowspan } = parseCellMerge(
                    cells[colIdx],
                );
                html += `<td${colspan > 1 ? ` colspan="${colspan}"` : ""}${rowspan > 1 ? ` rowspan="${rowspan}"` : ""}>${content}</td>\n`;

                // 병합된 셀의 위치 기록
                for (let r = 0; r < rowspan; r++) {
                    for (let c = 0; c < colspan; c++) {
                        if (r === 0 && c === 0) continue;
                        skipRows.add(`${rowIdx + r}-${colIdx + c}`);
                    }
                }

                skipCols = colspan - 1;
            }
            html += "</tr>\n";
        }
        html += "</tbody>\n</table>\n";

        return html;
    });
}

function parseTableRow(row: string): string[] {
    return row
        .split("|")
        .slice(1, -1)
        .map((cell) => cell.trim());
}

function parseCellMerge(cell: string): {
    content: string;
    colspan: number;
    rowspan: number;
} {
    let colspan = 1;
    let rowspan = 1;
    let content = cell;

    // <-n> 형태 찾기 (오른쪽 병합)
    const colspanMatch = content.match(/<-(\d+)>/);
    if (colspanMatch) {
        colspan = parseInt(colspanMatch[1]) + 1; // n개 병합 = 자신 포함 n+1
        content = content.replace(/<-\d+>/, "").trim();
    }

    // <|n> 형태 찾기 (아래쪽 병합)
    const rowspanMatch = content.match(/<\|(\d+)>/);
    if (rowspanMatch) {
        rowspan = parseInt(rowspanMatch[1]) + 1; // n개 병합 = 자신 포함 n+1
        content = content.replace(/<\|\d+>/, "").trim();
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
        let preprocessedContent = processedContent;

        // 코드 블록 내 이스케이프된 백틱 처리
        preprocessedContent = preprocessedContent.replace(
            /^( *)```(\w+)(?:\s+\{([^}]+)\})?\n([\s\S]*?)\n\1```/gm,
            (match, indent, lang, highlight, codeContent) => {
                const markedCode = codeContent.replace(
                    /\\`/g,
                    ESCAPED_BACKTICK_MARKER,
                );
                const highlightPart = highlight ? ` {${highlight}}` : "";
                return `${indent}\`\`\`${lang}${highlightPart}\n${markedCode}\n${indent}\`\`\``;
            },
        );

        let blockId = 0;
        const blockMeta = new Map<string, string>();
        const backtickMap = new Map<string, string>();

        // 코드 블록 감지 및 백틱 보호
        const contentWithProtectedBackticks = preprocessedContent.replace(
            /^( *)```(\w+)(?:\s+([^\n]+))?\n([\s\S]*?)\n\1```/gm,
            (match, indent, lang, meta, codeContent) => {
                const id = `cb${blockId++}`;

                // 메타 정보 파싱 (title="..." 과 {1,3-5} 형태 모두 지원)
                let title = "";
                let highlight = "";

                if (meta) {
                    // title 추출
                    const titleMatch = meta.match(/title="([^"]+)"/);
                    if (titleMatch) {
                        title = titleMatch[1];
                    }

                    // 하이라이트 추출 {1,3-5} 형태
                    const highlightMatch = meta.match(/\{([^}]+)\}/);
                    if (highlightMatch) {
                        highlight = highlightMatch[1];
                        blockMeta.set(id, highlight);
                    }
                }

                let markerIndex = 0;
                const protectedCode = codeContent.replace(
                    /`([^`]+)`/g,
                    (backtickMatch: string, backtickContent: string) => {
                        const marker = `__BACKTICK_${id}_${markerIndex++}__`;
                        backtickMap.set(marker, backtickContent);
                        return marker;
                    },
                );

                // title이 있으면 주석으로 추가
                const titleComment = title ? `<!-- title:${title} -->` : "";
                return `${indent}${titleComment}<!-- ${id} -->\n${indent}\`\`\`${lang}\n${protectedCode}\n${indent}\`\`\``;
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
            (match, title, id) => {
                const meta = blockMeta.get(id);
                let result = match;

                // 하이라이트 메타 추가
                if (meta) {
                    result = result.replace(
                        /<pre/,
                        `<pre data-highlight-meta="${meta}"`,
                    );
                }

                // 타이틀 추가
                if (title) {
                    result = result.replace(
                        /<pre/,
                        `<pre data-title="${title}"`,
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
