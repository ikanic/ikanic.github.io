import { getAllPosts } from "@/lib/posts";
import PostCard from "@/components/PostCard";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { siteConfig, homeConfig } from "@/config/config";

export default function Home() {
    const allPosts = getAllPosts();
    const recentPosts = allPosts.slice(0, 6);

    return (
        <div className="max-w-7xl mx-auto px-0">
            {/* 히어로 섹션 */}
            <section className="mb-16 text-center">
                <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-3xl p-12 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
                    <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent">
                        {homeConfig.hero.title}
                    </h1>
                    <p className="text-xl text-gray-700 max-w-2xl mx-auto">
                        {homeConfig.hero.description}
                    </p>
                </div>
            </section>

            {/* 최근 포스트 섹션 */}
            <section>
                <div className="flex items-center justify-between mb-8">
                    <h2 className="text-3xl font-bold text-gray-900">
                        Recent Posts
                    </h2>
                    <Link
                        href="/blog"
                        className="flex items-center gap-2 text-blue-600 hover:text-blue-700 transition-colors group font-medium"
                    >
                        View All
                        <ArrowRight
                            size={20}
                            className="group-hover:translate-x-1 transition-transform"
                        />
                    </Link>
                </div>

                {recentPosts.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {recentPosts.map((post) => (
                            <PostCard key={post.slug} post={post} />
                        ))}
                    </div>
                ) : (
                    <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl p-12 text-center shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
                        <p className="text-gray-700 text-lg">
                            아직 작성된 포스트가 없습니다.
                        </p>
                        <p className="text-gray-600 text-sm mt-2">
                            posts/ 폴더에 마크다운 파일을 추가해주세요.
                        </p>
                    </div>
                )}
            </section>

            {/* 소개 섹션 */}
            <section className="mt-16">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {homeConfig.sections.map((section) => (
                        <Link
                            key={section.link}
                            href={section.link}
                            className={`backdrop-blur-2xl bg-gradient-to-br ${section.gradient} border border-white/60 rounded-2xl p-8 hover:shadow-[0_8px_32px_0_rgba(59,130,246,0.3)] transition-all duration-300 group`}
                        >
                            <div className="text-4xl mb-4">{section.icon}</div>
                            <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
                                {section.title}
                            </h3>
                            <p className="text-gray-700">
                                {section.description}
                            </p>
                        </Link>
                    ))}
                </div>
            </section>
        </div>
    );
}
