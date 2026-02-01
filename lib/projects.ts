import fs from "fs";
import path from "path";
import matter from "gray-matter";
import { unified } from "unified";
import remarkParse from "remark-parse";
import remarkGfm from "remark-gfm";
import remarkRehype from "remark-rehype";
import rehypePrettyCode from "rehype-pretty-code";
import rehypeStringify from "rehype-stringify";

const projectsDirectory = path.join(process.cwd(), "projects");

export interface ProjectDetailData {
    slug: string;
    title: string;
    description: string;
    category?: string;
    tags?: string[];
    thumbnail?: string;
    period?: string;
    team?: string;
    role?: string;
    links?: Array<{ type: string; url: string; label: string }>;
    content?: string;
}

// 모든 프로젝트 상세 페이지 가져오기
export function getAllProjects(): ProjectDetailData[] {
    try {
        if (!fs.existsSync(projectsDirectory)) {
            console.warn("Projects directory does not exist!");
            return [];
        }

        const fileNames = fs.readdirSync(projectsDirectory);

        const allProjectsData = fileNames
            .filter((fileName) => fileName.endsWith(".md"))
            .map((fileName) => {
                const slug = fileName.replace(/\.md$/, "");
                const fullPath = path.join(projectsDirectory, fileName);
                const fileContents = fs.readFileSync(fullPath, "utf8");
                const { data } = matter(fileContents);

                return {
                    slug,
                    title: data.title || "Untitled",
                    description: data.description || "",
                    category: data.category,
                    tags: data.tags || [],
                    thumbnail: data.thumbnail,
                    period: data.period,
                    team: data.team,
                    role: data.role,
                    links: data.links || [],
                } as ProjectDetailData;
            });

        return allProjectsData;
    } catch (error) {
        console.error("Error in getAllProjects:", error);
        return [];
    }
}

// 특정 프로젝트 상세 페이지 가져오기
export async function getProjectBySlug(
    slug: string,
): Promise<ProjectDetailData | null> {
    try {
        const fullPath = path.join(projectsDirectory, `${slug}.md`);
        const fileContents = fs.readFileSync(fullPath, "utf8");
        const { data, content } = matter(fileContents);

        let blockId = 0;
        const blockMeta = new Map<string, string>();
        const backtickMap = new Map<string, string>();

        // 1단계: 코드 블록 감지 및 백틱 보호
        const contentWithProtectedBackticks = content.replace(
            /^( *)```(\w+)(?:\s+\{([^}]+)\})?\n([\s\S]*?)\n\1```/gm,
            (match, indent, lang, highlight, codeContent) => {
                const id = `cb${blockId++}`;
                if (highlight) {
                    blockMeta.set(id, highlight);
                }

                // 백틱 패턴을 마커로 치환
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
            .process(contentWithProtectedBackticks);

        let contentHtml = processedContent.toString();

        // 3단계: HTML에서 주석 찾아서 해당 <pre>에 메타 정보 추가
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

        // 4단계: 백틱 마커 복원
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

            if (extractedColor) {
                const replacement = `<mark class="code-word-highlight" style="color: ${extractedColor}; border-color: ${extractedColor}; font-family: 'D2Coding', monospace;">${backtickContent}</mark>`;
                contentHtml = contentHtml.replace(
                    new RegExp(marker, "g"),
                    replacement,
                );
            } else {
                const fallbackReplacement = `<mark class="code-word-highlight" style="font-family: 'D2Coding', monospace;">${backtickContent}</mark>`;
                contentHtml = contentHtml.replace(
                    new RegExp(marker, "g"),
                    fallbackReplacement,
                );
            }
        });

        return {
            slug,
            title: data.title || "Untitled",
            description: data.description || "",
            category: data.category,
            tags: data.tags || [],
            thumbnail: data.thumbnail,
            period: data.period,
            team: data.team,
            role: data.role,
            links: data.links || [],
            content: contentHtml,
        };
    } catch (error) {
        console.error("Error processing project:", error);
        return null;
    }
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
