const fs = require("fs");
const path = require("path");
const matter = require("gray-matter");

const postsDirectory = path.join(process.cwd(), "posts");
const outputPath = path.join(process.cwd(), "public", "posts.json");

function parseDate(dateStr) {
    if (!dateStr) return new Date().toISOString().split("T")[0];
    const match = dateStr.match(/(\d{4}-\d{2}-\d{2})/);
    return match ? match[1] : dateStr;
}

function getSortDate(post) {
    return post.modifiedDate || post.createdDate;
}

function generatePostsJson() {
    console.log("🔍 Generating posts.json...");
    console.log("📁 Posts directory:", postsDirectory);

    if (!fs.existsSync(postsDirectory)) {
        console.error("❌ Posts directory does not exist!");
        process.exit(1);
    }

    const fileNames = fs.readdirSync(postsDirectory);
    console.log(`📄 Found ${fileNames.length} files in posts directory`);

    const allPosts = fileNames
        .filter((fileName) => {
            const isMarkdown = fileName.endsWith(".md");
            if (!isMarkdown) {
                console.log(`⏭️  Skipping non-markdown file: ${fileName}`);
            }
            return isMarkdown;
        })
        .map((fileName) => {
            const slug = fileName.replace(/\.md$/, "");
            const fullPath = path.join(postsDirectory, fileName);
            const fileContents = fs.readFileSync(fullPath, "utf8");
            const { data } = matter(fileContents);

            const post = {
                slug,
                title: data.title || "Untitled",
                description: data.description || "",
                category: data.category,
                tags: data.tags || [],
                createdDate: parseDate(data["created-date"] || data.date),
                modifiedDate: data["modified-date"]
                    ? parseDate(data["modified-date"])
                    : undefined,
            };

            console.log(`✅ Processed: ${post.title} (${slug})`);
            return post;
        })
        .sort((a, b) => (getSortDate(a) < getSortDate(b) ? 1 : -1));

    // public 디렉토리가 없으면 생성
    const publicDir = path.join(process.cwd(), "public");
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir);
        console.log("📁 Created public directory");
    }

    // JSON 파일 생성
    fs.writeFileSync(outputPath, JSON.stringify(allPosts, null, 2));
    console.log(`✅ Generated posts.json with ${allPosts.length} posts`);
    console.log(`📍 Output path: ${outputPath}`);
}

try {
    generatePostsJson();
} catch (error) {
    console.error("❌ Error generating posts.json:", error);
    process.exit(1);
}
