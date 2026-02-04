import { getProjectBySlug, getAllProjects, extractTOC } from "@/lib/projects";
import { notFound } from "next/navigation";
import {
    ArrowLeft,
    ExternalLink,
    Github,
    Play,
    Smartphone,
    Calendar,
    Users,
    Briefcase,
} from "lucide-react";
import Link from "next/link";
import Image from "next/image";
import CodeBlockEnhancer from "@/components/CodeBlock";
import TableOfContents from "@/components/TableOfContents";
import MermaidDiagram from "@/components/MermaidDiagram";
import GiscusComments from "@/components/GiscusComments";

interface ProjectPageProps {
    params: Promise<{
        slug: string;
    }>;
}

// 정적 경로 생성
export async function generateStaticParams() {
    const projects = getAllProjects();
    return projects.map((project) => ({
        slug: project.slug,
    }));
}

// 링크 타입별 아이콘
const getLinkIcon = (type: string) => {
    const icons: Record<string, any> = {
        demo: ExternalLink,
        github: Github,
        appstore: Smartphone,
        video: Play,
    };
    return icons[type] || ExternalLink;
};

export default async function ProjectDetailPage({ params }: ProjectPageProps) {
    const { slug } = await params;
    const project = await getProjectBySlug(slug);

    if (!project) {
        notFound();
    }

    // 목차 추출
    const tocItems = project.content ? extractTOC(project.content) : [];

    return (
        <div className="max-w-5xl mx-auto px-0">
            {/* 뒤로가기 버튼 */}
            <Link
                href="/project"
                className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-8 transition-colors group"
            >
                <ArrowLeft
                    size={20}
                    className="group-hover:-translate-x-1 transition-transform"
                />
                Back to Projects
            </Link>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* 메인 콘텐츠 영역 (왼쪽 2칼럼) */}
                <div className="lg:col-span-2 space-y-8">
                    {/* 프로젝트 본문 */}
                    <article>
                        <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
                            {/* 제목 */}
                            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
                                {project.title}
                            </h1>

                            {/* 설명 */}
                            <p className="text-xl text-gray-700 mb-6">
                                {project.description}
                            </p>

                            {/* 메타 정보 */}
                            <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600 mb-8 pb-8 border-b border-gray-200/50">
                                {project.period && (
                                    <div className="flex items-center gap-1">
                                        <Calendar size={16} />
                                        <span>{project.period}</span>
                                    </div>
                                )}

                                {project.team && (
                                    <div className="flex items-center gap-1">
                                        <Users size={16} />
                                        <span>{project.team}</span>
                                    </div>
                                )}

                                {project.role && (
                                    <div className="flex items-center gap-1">
                                        <Briefcase size={16} />
                                        <span>{project.role}</span>
                                    </div>
                                )}
                            </div>

                            {/* 썸네일 이미지 */}
                            {project.thumbnail && (
                                <div className="relative w-full mb-8 rounded-xl overflow-hidden">
                                    <Image
                                        src={project.thumbnail}
                                        alt={project.title}
                                        width={1200}
                                        height={630}
                                        className="w-full h-auto"
                                        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 66vw, 50vw"
                                        priority
                                    />
                                </div>
                            )}

                            {/* 프로젝트 내용 */}
                            <CodeBlockEnhancer />
                            <MermaidDiagram />
                            <div
                                className="prose prose-lg max-w-none"
                                dangerouslySetInnerHTML={{
                                    __html: project.content || "",
                                }}
                            />
                        </div>
                    </article>

                    {/* 댓글 및 리액션 (Giscus) */}
                    <GiscusComments />
                </div>

                {/* 사이드바 */}
                <aside className="lg:col-span-1">
                    <div className="sticky top-24 space-y-6">
                        {/* 목차 */}
                        {tocItems.length > 0 && (
                            <TableOfContents items={tocItems} />
                        )}

                        {/* 링크 */}
                        {project.links && project.links.length > 0 && (
                            <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    Links
                                </h3>
                                <div className="space-y-2">
                                    {project.links.map((link, index) => {
                                        const Icon = getLinkIcon(link.type);
                                        return (
                                            <a
                                                key={index}
                                                href={link.url}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="flex items-center gap-2 p-3 backdrop-blur-xl bg-white/30 hover:bg-white/50 border border-white/50 rounded-lg transition-all group"
                                            >
                                                <Icon
                                                    size={18}
                                                    className="text-gray-600 group-hover:text-blue-600 transition-colors"
                                                />
                                                <span className="text-sm font-medium text-gray-900">
                                                    {link.label}
                                                </span>
                                            </a>
                                        );
                                    })}
                                </div>
                            </div>
                        )}

                        {/* 기술 스택 */}
                        {project.tags && project.tags.length > 0 && (
                            <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl p-6 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
                                <h3 className="text-lg font-bold text-gray-900 mb-4">
                                    Tech Stack
                                </h3>
                                <div className="flex flex-wrap gap-2">
                                    {project.tags.map((tag) => (
                                        <span
                                            key={tag}
                                            className="px-3 py-1 backdrop-blur-xl bg-blue-500/20 border border-blue-400/40 rounded-lg text-sm text-blue-700 font-medium"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                </aside>
            </div>
        </div>
    );
}
