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
}

// 날짜 포맷 파싱 (2026-01-08(목) 00:01:32.000 -> 2026-01-08)
function parseDate(dateStr: string): string {
    if (!dateStr) return new Date().toISOString().split("T")[0];
    const match = dateStr.match(/(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : dateStr;
}

// 정렬용 날짜 가져오기
function getSortDate(post: PostData): string {
    return post.modifiedDate || post.createdDate;
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
                const { data } = matter(fileContents);

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

        // 1단계: 마크다운에서 각 코드 블록에 고유 ID 부여
        let blockId = 0;
        const blockMeta = new Map<string, string>(); // block-id -> highlight meta

        const contentWithIds = content.replace(
            /```(\w+)(?:\s+\{([^}]+)\})?/g,
            (match, lang, highlight) => {
                const id = `cb${blockId++}`;
                if (highlight) {
                    blockMeta.set(id, highlight);
                }
                // 주석으로 ID 삽입 (HTML 주석은 rehype에서 유지됨)
                return `<!-- ${id} -->\n\`\`\`${lang}`;
            },
        );

        console.log(
            `[${slug}] Blocks: ${blockId}, Highlights: ${blockMeta.size}`,
        );

        // 2단계: 마크다운 -> HTML 변환
        // @ts-ignore
        const processedContent = await unified()
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
            .process(contentWithIds);

        let contentHtml = processedContent.toString();

        // 3단계: HTML에서 주석 찾아서 해당 <pre>에 메타 정보 추가
        contentHtml = contentHtml.replace(
            /<!--\s*(cb\d+)\s*-->\s*<figure[^>]*>[\s\S]*?<pre/g,
            (match, id) => {
                const meta = blockMeta.get(id);
                if (meta) {
                    console.log(`  Matched ${id} -> highlight: ${meta}`);
                    // <pre에 data-highlight-meta 추가
                    return match.replace(
                        /<pre/,
                        `<pre data-highlight-meta="${meta}"`,
                    );
                }
                return match;
            },
        );

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
