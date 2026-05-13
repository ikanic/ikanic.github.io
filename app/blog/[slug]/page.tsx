import {
    getPostBySlug,
    getAllPosts,
    getPostsBySeries,
    extractTOC,
} from "@/lib/posts";
import { notFound } from "next/navigation";
import { format } from "date-fns";
import { Calendar, Folder, Tag, ArrowLeft, Clock } from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import SeriesNav from "@/components/SeriesNav";
import CodeBlockEnhancer from "@/components/CodeBlock";
import TableOfContents from "@/components/TableOfContents";
import MermaidDiagram from "@/components/MermaidDiagram";
import GiscusComments from "@/components/GiscusComments";
import { Metadata } from "next";

interface PostPageProps {
    params: Promise<{
        slug: string;
    }>;
}

// 정적 경로 생성
export async function generateStaticParams() {
    const posts = getAllPosts();

    if (posts.length === 0) {
        console.warn("No posts found in generateStaticParams!");
        return [];
    }

    return posts.map((post) => ({
        slug: post.slug,
    }));
}

// SEO 메타데이터 생성
export async function generateMetadata({
    params,
}: PostPageProps): Promise<Metadata> {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        return {
            title: "Post Not Found",
        };
    }

    const displayDate = post.modifiedDate || post.createdDate;

    return {
        title: post.title,
        description: post.description || `${post.title} - DevIan`,
        keywords: post.tags?.join(", "),
        authors: [{ name: "Ian Kim" }],
        openGraph: {
            title: post.title,
            description: post.description || `${post.title} - DevIan`,
            type: "article",
            publishedTime: post.createdDate,
            modifiedTime: post.modifiedDate || post.createdDate,
            authors: ["Ian Kim"],
            tags: post.tags,
            images: post.thumbnail
                ? [
                      {
                          url: post.thumbnail,
                          width: 1200,
                          height: 630,
                          alt: post.title,
                      },
                  ]
                : [],
        },
        twitter: {
            card: "summary_large_image",
            title: post.title,
            description: post.description || `${post.title} - DevIan`,
            images: post.thumbnail ? [post.thumbnail] : [],
        },
    };
}

export default async function PostPage({ params }: PostPageProps) {
    const { slug } = await params;
    const post = await getPostBySlug(slug);

    if (!post) {
        notFound();
    }

    // 시리즈 포스트 가져오기
    const seriesPosts = post.series ? getPostsBySeries(post.series) : [];

    // 목차 추출
    const tocItems = post.content ? extractTOC(post.content) : [];

    // 표시할 날짜 결정
    const displayDate = post.modifiedDate || post.createdDate;
    // createdDate와 modifiedDate가 다를 때만 수정됨 표시
    const isModified =
        post.modifiedDate && post.modifiedDate !== post.createdDate;

    return (
        <>
            {/* JSON-LD 구조화 데이터 */}
            <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                    __html: JSON.stringify({
                        "@context": "https://schema.org",
                        "@type": "BlogPosting",
                        headline: post.title,
                        description: post.description,
                        image: post.thumbnail,
                        datePublished: post.createdDate,
                        dateModified: post.modifiedDate || post.createdDate,
                        author: {
                            "@type": "Person",
                            name: "Ian Kim",
                            url: "https://ikanic.github.io",
                        },
                        publisher: {
                            "@type": "Person",
                            name: "Ian Kim",
                        },
                        keywords: post.tags?.join(", "),
                    }),
                }}
            />

            <div className="max-w-5xl mx-auto px-0">
                {/* 뒤로가기 버튼 */}
                <Link
                    href="/blog"
                    className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors group"
                >
                    <ArrowLeft
                        size={20}
                        className="group-hover:-translate-x-1 transition-transform"
                    />
                    Back to Blog
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {/* 메인 콘텐츠 */}
                    <div className="lg:col-span-2 space-y-8">
                        <article className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
                            {/* 시리즈 배지 */}
                            {post.series && (
                                <div className="inline-block mb-4 px-3 py-1 rounded-full backdrop-blur-xl bg-gradient-to-r from-blue-500/20 to-purple-500/20 border border-blue-400/40">
                                    <span className="text-xs text-blue-700 font-medium">
                                        📚 {post.series}
                                        {post.seriesOrder &&
                                            ` - Part ${post.seriesOrder}`}
                                    </span>
                                </div>
                            )}

                            {/* 제목 */}
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                {post.title}
                            </h1>

                            {/* 메타 정보 */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-8 pb-8 border-b border-gray-200/50">
                                <div className="flex items-center gap-1 relative group">
                                    <Calendar size={16} />
                                    <span>
                                        {format(
                                            new Date(displayDate),
                                            "yyyy년 MM월 dd일",
                                        )}
                                        {isModified && (
                                            <>
                                                <span className="ml-1 text-xs text-gray-500">
                                                    (수정됨)
                                                </span>
                                                {/* 툴팁 - 아래로 */}
                                                <div className="absolute top-full left-0 mt-2 px-3 py-2 bg-gray-900 text-white text-xs rounded-lg whitespace-nowrap opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-10 pointer-events-none">
                                                    최초 작성:{" "}
                                                    {format(
                                                        new Date(
                                                            post.createdDate,
                                                        ),
                                                        "yyyy년 MM월 dd일",
                                                    )}
                                                    <div className="absolute bottom-full left-4 w-0 h-0 border-4 border-transparent border-b-gray-900"></div>
                                                </div>
                                            </>
                                        )}
                                    </span>
                                </div>

                                {/* 독서 시간 */}
                                {post.readingTime && (
                                    <div className="flex items-center gap-1">
                                        <Clock size={16} />
                                        <span>{post.readingTime}</span>
                                    </div>
                                )}

                                {post.category && (
                                    <div className="flex items-center gap-1">
                                        <Folder size={16} />
                                        <span>{post.category}</span>
                                    </div>
                                )}

                                {post.tags && post.tags.length > 0 && (
                                    <div className="flex items-center gap-1">
                                        <Tag size={16} />
                                        <span>{post.tags.join(", ")}</span>
                                    </div>
                                )}
                            </div>

                            {/* 썸네일 이미지 */}
                            {post.thumbnail && (
                                <div className="relative w-full mb-8 rounded-xl overflow-hidden">
                                    <Image
                                        src={post.thumbnail}
                                        alt={post.title}
                                        width={1200}
                                        height={630}
                                        className="w-full h-auto"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                                        priority
                                    />
                                </div>
                            )}

                            {/* 포스트 내용 */}
                            <CodeBlockEnhancer />
                            <MermaidDiagram />
                            <div
                                className="prose prose-lg max-w-none"
                                dangerouslySetInnerHTML={{
                                    __html: post.content || "",
                                }}
                            />
                        </article>

                        {/* Giscus 댓글 */}
                        <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
                            <GiscusComments />
                        </div>
                    </div>

                    {/* 사이드바 */}
                    <aside className="lg:col-span-1">
                        <div className="sticky top-24 space-y-6">
                            {/* 목차 */}
                            {tocItems.length > 0 && (
                                <TableOfContents items={tocItems} />
                            )}

                            {/* 시리즈 네비게이션 */}
                            {post.series && seriesPosts.length > 0 && (
                                <SeriesNav
                                    currentPost={post}
                                    seriesPosts={seriesPosts}
                                />
                            )}

                            {/* 태그 목록 */}
                            {post.tags && post.tags.length > 0 && (
                                <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
                                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                                        <Tag size={20} />
                                        Tags
                                    </h3>
                                    <div className="flex flex-wrap gap-2">
                                        {post.tags.map((tag) => (
                                            <Link
                                                key={tag}
                                                href={`/blog?tag=${encodeURIComponent(tag)}`}
                                                className="px-3 py-1 backdrop-blur-xl bg-white/50 border border-white/60 rounded-full text-sm text-gray-700 hover:bg-white/70 transition-all"
                                            >
                                                #{tag}
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>
            </div>
        </>
    );
}
