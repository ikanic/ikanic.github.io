import { ExternalLink, Github, Play, Smartphone, FileText } from "lucide-react";
import { projectConfig, contactInfo } from "@/config/config";
import Link from "next/link";

// 링크 타입별 아이콘과 스타일
const getLinkConfig = (type: string) => {
    const configs: Record<string, { icon: any; color: string }> = {
        project: {
            icon: FileText,
            color: "bg-indigo-500/20 hover:bg-indigo-500/30 border-indigo-400/40 text-indigo-700",
        },
        demo: {
            icon: ExternalLink,
            color: "bg-blue-500/20 hover:bg-blue-500/30 border-blue-400/40 text-blue-700",
        },
        github: {
            icon: Github,
            color: "bg-gray-500/20 hover:bg-gray-500/30 border-gray-400/40 text-gray-700",
        },
        appstore: {
            icon: Smartphone,
            color: "bg-purple-500/20 hover:bg-purple-500/30 border-purple-400/40 text-purple-700",
        },
        video: {
            icon: Play,
            color: "bg-red-500/20 hover:bg-red-500/30 border-red-400/40 text-red-700",
        },
    };
    return configs[type] || configs.demo;
};

export default function ProjectPage() {
    return (
        <div className="max-w-7xl mx-auto px-0">
            {/* 헤더 */}
            <div className="mb-12 text-center">
                <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-3xl p-12 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        {projectConfig.header.title}
                    </h1>
                    <p className="text-xl text-gray-700">
                        {projectConfig.header.description}
                    </p>
                </div>
            </div>

            {/* 프로젝트 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projectConfig.projects.map((project) => (
                    <div
                        key={project.id}
                        className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl p-6 hover:bg-white/60 hover:shadow-[0_8px_32px_0_rgba(31,38,135,0.2)] transition-all duration-300 hover:scale-[1.02] group"
                    >
                        {/* 프로젝트 아이콘 */}
                        <div className="text-6xl mb-4">{project.image}</div>

                        {/* 제목과 기간 */}
                        <div className="mb-3">
                            <h2 className="text-2xl font-bold text-gray-900 mb-1 group-hover:text-blue-600 transition-colors">
                                {project.title}
                            </h2>
                            <p className="text-sm text-gray-500">
                                {project.period}
                            </p>
                        </div>

                        {/* 설명 */}
                        <p className="text-gray-700 mb-4 line-clamp-3">
                            {project.description}
                        </p>

                        {/* 기술 스택 태그 */}
                        <div className="flex flex-wrap gap-2 mb-4">
                            {project.tags.map((tag) => (
                                <span
                                    key={tag}
                                    className="px-2 py-1 backdrop-blur-xl bg-white/50 border border-white/60 rounded-lg text-xs text-gray-700"
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>

                        {/* 링크 - 있는 것만 표시 */}
                        {project.links.length > 0 && (
                            <div className="flex flex-wrap gap-2">
                                {project.links.map((link, index) => {
                                    const config = getLinkConfig(link.type);
                                    const Icon = config.icon;

                                    // project 타입은 내부 링크
                                    if (link.type === "project") {
                                        return (
                                            <Link
                                                key={index}
                                                href={link.url}
                                                className={`flex items-center gap-1 px-3 py-2 backdrop-blur-xl border rounded-lg text-sm font-medium transition-all ${config.color}`}
                                            >
                                                <Icon size={16} />
                                                {link.label}
                                            </Link>
                                        );
                                    }

                                    // 나머지는 외부 링크
                                    return (
                                        <a
                                            key={index}
                                            href={link.url}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className={`flex items-center gap-1 px-3 py-2 backdrop-blur-xl border rounded-lg text-sm font-medium transition-all ${config.color}`}
                                        >
                                            <Icon size={16} />
                                            {link.label}
                                        </a>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                ))}
            </div>

            {/* 더 많은 프로젝트 안내 */}
            <div className="mt-12 text-center">
                <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
                    <p className="text-gray-700 mb-4">
                        {projectConfig.footerMessage}
                    </p>
                    <a
                        href={contactInfo.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-3 backdrop-blur-xl bg-gray-900/80 hover:bg-gray-900 text-white rounded-xl font-medium transition-all hover:scale-105"
                    >
                        <Github size={20} />
                        Visit GitHub
                    </a>
                </div>
            </div>
        </div>
    );
}
