import { ExternalLink, Github } from "lucide-react";

// 프로젝트 데이터 (나중에 별도 파일로 분리 가능)
const projects = [
    {
        id: 1,
        title: "GitHub Pages Blog",
        description:
            "Next.js와 Tailwind CSS를 사용한 정적 블로그. 글래스모피즘 디자인과 시리즈 기능을 구현했습니다.",
        tags: ["Next.js", "Tailwind CSS", "GitHub Pages"],
        image: "🌐",
        links: {
            demo: "#",
            github: "#",
        },
        period: "2024.01",
    },
    {
        id: 2,
        title: "Sample Project 1",
        description:
            "프로젝트 설명이 들어갈 자리입니다. 프로젝트의 주요 기능과 사용한 기술 스택을 간단히 소개합니다.",
        tags: ["React", "TypeScript", "Node.js"],
        image: "🚀",
        links: {
            demo: "#",
            github: "#",
        },
        period: "2023.12",
    },
    {
        id: 3,
        title: "Sample Project 2",
        description:
            "또 다른 프로젝트 설명입니다. 여러분의 멋진 프로젝트를 소개해보세요!",
        tags: ["Vue.js", "Firebase", "Vuetify"],
        image: "💡",
        links: {
            demo: "#",
            github: "#",
        },
        period: "2023.11",
    },
];

export default function ProjectPage() {
    return (
        <div className="max-w-7xl mx-auto px-0">
            {/* 헤더 */}
            <div className="mb-12 text-center">
                <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-3xl p-12 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
                    <h1 className="text-5xl font-bold mb-4 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                        Projects
                    </h1>
                    <p className="text-xl text-gray-700">
                        지금까지 진행한 프로젝트들을 소개합니다
                    </p>
                </div>
            </div>

            {/* 프로젝트 그리드 */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {projects.map((project) => (
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

                        {/* 링크 */}
                        <div className="flex gap-3">
                            <a
                                href={project.links.demo}
                                className="flex items-center gap-1 px-4 py-2 backdrop-blur-xl bg-blue-500/20 hover:bg-blue-500/30 border border-blue-400/40 rounded-lg text-sm text-blue-700 font-medium transition-all"
                            >
                                <ExternalLink size={16} />
                                Demo
                            </a>
                            <a
                                href={project.links.github}
                                className="flex items-center gap-1 px-4 py-2 backdrop-blur-xl bg-gray-500/20 hover:bg-gray-500/30 border border-gray-400/40 rounded-lg text-sm text-gray-700 font-medium transition-all"
                            >
                                <Github size={16} />
                                Code
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {/* 더 많은 프로젝트 안내 */}
            <div className="mt-12 text-center">
                <div className="backdrop-blur-2xl bg-white/40 border border-white/60 rounded-2xl p-8 shadow-[0_8px_32px_0_rgba(31,38,135,0.15)]">
                    <p className="text-gray-700 mb-4">
                        더 많은 프로젝트는 GitHub에서 확인하실 수 있습니다
                    </p>
                    <a
                        href="https://github.com"
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
