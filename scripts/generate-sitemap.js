const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const postsDirectory = path.join(process.cwd(), "posts");
const projectsDirectory = path.join(process.cwd(), "projects");
const outputPath = path.join(process.cwd(), "public", "sitemap.xml");

const siteUrl = "https://ikanic.github.io";

function parseDate(dateStr) {
    if (!dateStr) return new Date().toISOString().split("T")[0];
    const match = dateStr.match(/(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : dateStr;
}

function generateSitemap() {
    console.log("🔍 Generating sitemap...");

    const urls = [];

    // 정적 페이지
    const staticPages = [
        { url: "", priority: "1.0" },
        { url: "/blog", priority: "0.9" },
        { url: "/project", priority: "0.9" },
        { url: "/about", priority: "0.8" },
    ];

    staticPages.forEach((page) => {
        urls.push({
            loc: `${siteUrl}${page.url}`,
            lastmod: new Date().toISOString().split("T")[0],
            changefreq: "weekly",
            priority: page.priority,
        });
    });

    // 블로그 포스트
    if (fs.existsSync(postsDirectory)) {
        const postFiles = fs
            .readdirSync(postsDirectory)
            .filter((f) => f.endsWith(".md"));
        postFiles.forEach((fileName) => {
            const slug = fileName.replace(/\.md$/, "");
            const fullPath = path.join(postsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, "utf8");
            const { data } = matter(fileContents);

            const modifiedDate = data["modified-date"]
                ? parseDate(data["modified-date"])
                : parseDate(data["created-date"] || data.date);

            urls.push({
                loc: `${siteUrl}/blog/${slug}`,
                lastmod: modifiedDate,
                changefreq: "monthly",
                priority: "0.7",
            });
        });
        console.log(`✅ Added ${postFiles.length} blog posts`);
    }

    // 프로젝트
    if (fs.existsSync(projectsDirectory)) {
        const projectFiles = fs
            .readdirSync(projectsDirectory)
            .filter((f) => f.endsWith(".md"));
        projectFiles.forEach((fileName) => {
            const slug = fileName.replace(/\.md$/, "");
            urls.push({
                loc: `${siteUrl}/project/${slug}`,
                lastmod: new Date().toISOString().split("T")[0],
                changefreq: "monthly",
                priority: "0.7",
            });
        });
        console.log(`✅ Added ${projectFiles.length} projects`);
    }

    // XML 생성
    const urlElements = urls
        .map(
            (url) => `
  <url>
    <loc>${url.loc}</loc>
    <lastmod>${url.lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
        )
        .join("");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urlElements}
</urlset>`;

    // public 디렉토리가 없으면 생성
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir);
    }

    fs.writeFileSync(outputPath, sitemap);
    console.log(`✅ Generated sitemap with ${urls.length} URLs`);
    console.log(`📍 Output path: ${outputPath}`);
}

try {
    generateSitemap();
} catch (error) {
    console.error("❌ Error generating sitemap:", error);
    process.exit(1);
}
