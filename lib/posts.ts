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
    // 이스케이프된 경우(\^\^)는 제외
    processed = processed.replace(/(?<!\\)\^\^([^\^]+)\^\^/g, "<sup>$1</sup>");

    // 2. 아랫첨자: ,,내용,, -> <sub>내용</sub>
    // 이스케이프된 경우(\,\,)는 제외
    processed = processed.replace(/(?<!\\),,([^,]+),,/g, "<sub>$1</sub>");

    // 3. 이스케이프 처리 제거
    processed = processed.replace(/\\\^\^/g, "^^");
    processed = processed.replace(/\\,,/g, ",,");

    // 4. 토글 문법: :::toggle 제목\n내용\n:::
    processed = processed.replace(
        /:::toggle\s+(.+?)\n([\s\S]+?)\n:::/g,
        (match, title, content) => {
            const toggleId = `toggle-${Math.random().toString(36).substr(2, 9)}`;
            return `<details class="markdown-toggle">
<summary class="markdown-toggle-title">${title.trim()}</summary>
<div class="markdown-toggle-content">

${content.trim()}

</div>
</details>`;
        },
    );

    return processed;
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
            /^( *)```(\w+)(?:\s+\{([^}]+)\})?\n([\s\S]*?)\n\1```/gm,
            (match, indent, lang, highlight, codeContent) => {
                const id = `cb${blockId++}`;
                if (highlight) {
                    blockMeta.set(id, highlight);
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

                return `${indent}<!-- ${id} -->\n${indent}\`\`\`${lang}\n${protectedCode}\n${indent}\`\`\``;
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
            // @ts-ignore
            .use(rehypeStringify, { allowDangerousHtml: true })
            .process(contentWithProtectedBackticks);

        let contentHtml = processedContentHtml.toString();

        // 메타 정보 추가
        contentHtml = contentHtml.replace(
            /<!--\s*(cb\d+)\s*-->\s*<figure[^>]*>[\s\S]*?<pre/g,
            (match, id) => {
                const meta = blockMeta.get(id);
                if (meta) {
                    return match.replace(
                        /<pre/,
                        `<pre data-highlight-meta="${meta}"`,
                    );
                }
                return match;
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
