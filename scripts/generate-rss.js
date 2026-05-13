const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const postsDirectory = path.join(process.cwd(), "posts");
const outputPath = path.join(process.cwd(), "public", "rss.xml");

const siteUrl = "https://ikanic.github.io";
const siteTitle = "DevIan";
const siteDescription = "개발, 디자인, 그리고 일상의 이야기를 공유합니다";
const author = "Ian Kim";

function parseDate(dateStr) {
    if (!dateStr) return new Date().toISOString();
    const match = dateStr.match(/(\d{4}-\d{2}-\d{2})/);
    if (match) {
        return new Date(match[1]).toISOString();
    }
    return new Date(dateStr).toISOString();
}

function escapeXml(unsafe) {
    if (!unsafe) return "";
    return unsafe.replace(/[<>&'"]/g, (c) => {
        switch (c) {
            case "<":
                return "&lt;";
            case ">":
                return "&gt;";
            case "&":
                return "&amp;";
            case "'":
                return "&apos;";
            case '"':
                return "&quot;";
            default:
                return c;
        }
    });
}

function generateRssFeed() {
    console.log("🔍 Generating RSS feed...");

    if (!fs.existsSync(postsDirectory)) {
        console.error("❌ Posts directory does not exist!");
        process.exit(1);
    }

    const fileNames = fs.readdirSync(postsDirectory);
    const posts = fileNames
        .filter((fileName) => fileName.endsWith(".md"))
        .map((fileName) => {
            const slug = fileName.replace(/\.md$/, "");
            const fullPath = path.join(postsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, "utf8");
            const { data, content } = matter(fileContents);

            // HTML 태그 제거하여 plain text 추출
            const plainText = content
                .replace(/```[\s\S]*?```/g, "") // 코드 블록 제거
                .replace(/`[^`]+`/g, "") // 인라인 코드 제거
                .replace(/#{1,6}\s/g, "") // 헤더 제거
                .replace(/\[([^\]]+)\]\([^\)]+\)/g, "$1") // 링크 제거
                .replace(/[*_~]/g, "") // 마크다운 강조 제거
                .substring(0, 300); // 첫 300자만

            return {
                slug,
                title: data.title || "Untitled",
                description: data.description || plainText || "",
                category: data.category,
                tags: data.tags || [],
                thumbnail: data.thumbnail,
                createdDate: parseDate(data["created-date"] || data.date),
                modifiedDate: data["modified-date"]
                    ? parseDate(data["modified-date"])
                    : undefined,
            };
        })
        .sort((a, b) => {
            const dateA = a.modifiedDate || a.createdDate;
            const dateB = b.modifiedDate || b.createdDate;
            return dateB.localeCompare(dateA);
        });

    const rssItems = posts
        .map((post) => {
            const postUrl = `${siteUrl}/blog/${post.slug}`;
            const pubDate = new Date(
                post.modifiedDate || post.createdDate,
            ).toUTCString();

            return `
    <item>
      <title>${escapeXml(post.title)}</title>
      <link>${postUrl}</link>
      <guid>${postUrl}</guid>
      <pubDate>${pubDate}</pubDate>
      <description>${escapeXml(post.description)}</description>
      ${post.category ? `<category>${escapeXml(post.category)}</category>` : ""}
      ${post.tags.map((tag) => `<category>${escapeXml(tag)}</category>`).join("\n      ")}
      ${post.thumbnail ? `<enclosure url="${escapeXml(post.thumbnail)}" type="image/jpeg" />` : ""}
    </item>`;
        })
        .join("\n");

    const rssFeed = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(siteTitle)}</title>
    <link>${siteUrl}</link>
    <description>${escapeXml(siteDescription)}</description>
    <language>ko</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
    <atom:link href="${siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
    ${rssItems}
  </channel>
</rss>`;

    // public 디렉토리가 없으면 생성
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir);
    }

    fs.writeFileSync(outputPath, rssFeed);
    console.log(`✅ Generated RSS feed with ${posts.length} posts`);
    console.log(`📍 Output path: ${outputPath}`);
}

try {
    generateRssFeed();
} catch (error) {
    console.error("❌ Error generating RSS feed:", error);
    process.exit(1);
}
