import fs from "fs";
import path from "path";
import matter from "gray-matter";
import remarkGfm from "remark-gfm";
import rehypePrettyCode from "rehype-pretty-code";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkRehype from "remark-rehype";
import rehypeStringify from "rehype-stringify";
import { getReadingTimeFromMarkdown } from "./reading-time";
import { processCustomSyntax } from "./markdown/customSyntax";
import { parseDate, getSortDate } from "./posts/parseHelpers";
import { PostData } from "./posts/types";

const postsDirectory = path.join(process.cwd(), "posts");

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

        // 코드 블록 감지 및 백틱 보호
        const contentWithProtectedBackticks = preprocessedContent.replace(
            /( *)```(\w+)(?: ([^\n]+))?\n([\s\S]*?)\n\1```/g,
            (match, indent, lang, meta, codeContent) => {
                const blockIdentifier = `cb${blockId++}`;

                if (lang === "mermaid" || lang === "mermaidc") {
                    return match;
                }

                let blockTitle = "";
                let blockHighlight = "";

                if (meta) {
                    const titleMatch = meta.match(/title="([^"]+)"/);
                    if (titleMatch) {
                        blockTitle = titleMatch[1];
                    }

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

                if (meta) {
                    result = result.replace(
                        /<pre/,
                        `<pre data-highlight-meta="${meta}"`,
                    );
                }

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

// 타입 재export
export type { PostData };
